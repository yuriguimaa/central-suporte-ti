import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, FileSearch, Lock, Mail, MessageSquare, Phone, Printer, RotateCcw, Send, ShieldCheck, StickyNote, User,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { CATEGORY, CATEGORY_ORDER, PRIORITY, PRIORITY_ORDER, STATUS, STATUS_ORDER } from '@/lib/constants'
import { elapsed, formatDate, formatDateTime, formatTime, initials, ticketCode } from '@/lib/format'
import { uploadAttachments } from '@/lib/tickets'
import { friendlyError } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Field'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badges'
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback'
import { FilePicker } from '@/components/ui/FilePicker'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AttachmentList } from './AttachmentList'
import { TicketHistoryList } from './TicketHistoryList'
import type {
  Profile, Ticket, TicketAttachment, TicketCategory, TicketHistory, TicketMessage, TicketPriority, TicketStatus,
} from '@/types/database'

type Owner = Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'created_at'>
type PendingChange = { field: 'status'; value: TicketStatus; title: string; text: string; label: string; danger?: boolean }

export function TicketDetail({ number, admin }: { number: number; admin: boolean }) {
  const { profile } = useAuth()
  const toast = useToast()
  const backPath = admin ? '/admin/chamados' : '/painel/chamados'

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const [history, setHistory] = useState<TicketHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // composer
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [internal, setInternal] = useState(false)
  const [sending, setSending] = useState(false)

  // admin
  const [solution, setSolution] = useState('')
  const [savingField, setSavingField] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingChange | null>(null)

  const chatBox = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const { data: t, error } = await supabase.from('tickets').select('*').eq('ticket_number', number).maybeSingle()
    if (error || !t) {
      setNotFound(true)
      setLoading(false)
      return
    }
    const tk = t as Ticket
    const [m, a, h, o] = await Promise.all([
      supabase.from('ticket_messages').select('*').eq('ticket_id', tk.id).order('created_at'),
      supabase.from('ticket_attachments').select('*').eq('ticket_id', tk.id).order('created_at'),
      supabase.from('ticket_history').select('*').eq('ticket_id', tk.id).order('created_at', { ascending: false }),
      admin
        ? supabase.from('profiles').select('id, full_name, email, phone, created_at').eq('id', tk.user_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    setTicket(tk)
    setSolution(tk.solution ?? '')
    setMessages((m.data as TicketMessage[]) ?? [])
    setAttachments((a.data as TicketAttachment[]) ?? [])
    setHistory((h.data as TicketHistory[]) ?? [])
    setOwner((o.data as Owner | null) ?? null)
    setLoading(false)
  }, [number, admin])

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    load()
  }, [load])

  // Tempo real: mensagens, anexos, histórico e mudanças no próprio chamado.
  useEffect(() => {
    if (!ticket?.id) return
    const id = ticket.id
    const ch = supabase
      .channel(`ticket:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` }, (p) => {
        const msg = p.new as TicketMessage
        if (msg.is_internal && !admin) return
        setMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_attachments', filter: `ticket_id=eq.${id}` }, (p) => {
        const att = p.new as TicketAttachment
        setAttachments((prev) => (prev.some((x) => x.id === att.id) ? prev : [...prev, att]))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_history', filter: `ticket_id=eq.${id}` }, (p) => {
        const h = p.new as TicketHistory
        setHistory((prev) => (prev.some((x) => x.id === h.id) ? prev : [h, ...prev]))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${id}` }, (p) => {
        setTicket((prev) => (prev ? { ...prev, ...(p.new as Ticket) } : prev))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [ticket?.id, admin])

  useEffect(() => {
    // Rola somente a área da conversa (não a página inteira).
    const box = chatBox.current
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const byMessage = useMemo(() => {
    const map = new Map<string, TicketAttachment[]>()
    for (const a of attachments) {
      if (!a.message_id) continue
      map.set(a.message_id, [...(map.get(a.message_id) ?? []), a])
    }
    return map
  }, [attachments])
  const initialAttachments = attachments.filter((a) => !a.message_id)

  if (loading) return <Spinner label="Carregando chamado…" />
  if (notFound || !ticket) {
    return (
      <Card>
        <EmptyState
          icon={FileSearch}
          title={`Chamado ${ticketCode(number)} não encontrado`}
          text="Ele pode não existir ou não pertencer à sua conta."
          action={<Link to={backPath} className="text-sm font-medium text-brand-sky hover:underline">Voltar para a lista</Link>}
        />
      </Card>
    )
  }

  const closed = ticket.status === 'encerrado'
  const finished = ticket.status === 'resolvido' || ticket.status === 'encerrado'
  const canWrite = admin || !closed

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim() || (files.length ? 'Enviou anexo(s).' : '')
    if (!body) return
    setSending(true)
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({ ticket_id: ticket.id, message: body.slice(0, 5000), is_internal: admin && internal })
      .select('*')
      .single()
    if (error || !data) {
      setSending(false)
      return toast('error', friendlyError(error))
    }
    setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as TicketMessage]))
    if (files.length) {
      const failed = await uploadAttachments(ticket.id, files, data.id)
      if (failed.length) toast('error', `Não foi possível enviar: ${failed.join(', ')}`)
      const { data: atts } = await supabase.from('ticket_attachments').select('*').eq('ticket_id', ticket.id).order('created_at')
      setAttachments((atts as TicketAttachment[]) ?? [])
    }
    setText('')
    setFiles([])
    setInternal(false)
    setSending(false)
  }

  const update = async (patch: Partial<Pick<Ticket, 'status' | 'priority' | 'category' | 'solution'>>, field: string, okMsg: string) => {
    setSavingField(field)
    const { data, error } = await supabase.from('tickets').update(patch).eq('id', ticket.id).select('*').single()
    setSavingField(null)
    setPending(null)
    if (error) return toast('error', friendlyError(error))
    setTicket(data as Ticket)
    toast('success', okMsg)
  }

  const requestStatus = (value: TicketStatus) => {
    if (value === ticket.status) return
    if (value === 'encerrado') {
      return setPending({
        field: 'status', value, label: 'Encerrar atendimento', danger: true,
        title: `Encerrar o chamado ${ticketCode(ticket.ticket_number)}?`,
        text: 'O usuário não poderá mais enviar mensagens. Você pode reabrir o chamado depois, se necessário.',
      })
    }
    if (finished && !['resolvido', 'encerrado'].includes(value)) {
      return setPending({
        field: 'status', value, label: 'Reabrir chamado',
        title: `Reabrir o chamado ${ticketCode(ticket.ticket_number)}?`,
        text: `O status passará para "${STATUS[value].label}" e o usuário será notificado.`,
      })
    }
    update({ status: value }, 'status', `Status alterado para ${STATUS[value].label}.`)
  }

  const saveSolution = async () => {
    if (solution.trim().length < 5) return toast('error', 'Descreva a solução com pelo menos 5 caracteres.')
    const patch: Partial<Ticket> = { solution: solution.trim() }
    if (!finished) patch.status = 'resolvido'
    await update(patch, 'solution', finished ? 'Solução atualizada.' : 'Solução registrada e chamado marcado como resolvido.')
  }

  const meta = [
    { label: 'Categoria', value: CATEGORY[ticket.category] },
    { label: 'Abertura', value: formatDateTime(ticket.created_at) },
    { label: 'Última atualização', value: formatDateTime(ticket.updated_at) },
    {
      label: finished ? 'Tempo até a solução' : 'Tempo decorrido',
      value: elapsed(ticket.created_at, ticket.resolved_at ?? ticket.closed_at),
    },
    ...(ticket.resolved_at ? [{ label: 'Resolvido em', value: formatDateTime(ticket.resolved_at) }] : []),
    ...(ticket.closed_at ? [{ label: 'Encerrado em', value: formatDateTime(ticket.closed_at) }] : []),
  ]

  return (
    <div className="print-area">
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Link to={backPath} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <Button variant="secondary" size="sm" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          Imprimir
        </Button>
      </div>

      {/* Cabeçalho do chamado, no formato de ticket com canhoto */}
      <div className="print-area mb-6 overflow-hidden rounded-2xl border border-line bg-surface lg:ticket-cut-v lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:[--cut-x:calc(100%-18rem)]">
        <div className="min-w-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="wide mt-3 text-[1.45rem] break-words sm:text-[1.8rem]">{ticket.title}</h1>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            {meta.filter((m) => !m.label.startsWith('Tempo')).map((m) => (
              <div key={m.label} className="min-w-0">
                <dt className="text-xs text-muted">{m.label}</dt>
                <dd className="tabular mt-0.5 text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={`relative flex flex-col justify-between gap-4 p-5 text-white sm:p-7 ${ticket.priority === 'urgente' && !finished ? 'bg-red-700' : 'bg-navy-900 dark:bg-[#12295c]'}`}>
          <div>
            <p className="text-xs text-sky-100/70">Protocolo</p>
            <p className="tabular wide font-display text-[2.1rem] leading-none font-bold" translate="no">{ticketCode(ticket.ticket_number)}</p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-sky-100/70">{finished ? 'Tempo até a solução' : 'Aberto há'}</p>
              <p className="tabular font-display text-lg font-semibold">{elapsed(ticket.created_at, ticket.resolved_at ?? ticket.closed_at)}</p>
            </div>
            <div className="barcode h-9 w-20 text-white/40" aria-hidden />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Descrição do problema" />
            <div className="space-y-4 p-5">
              <p className="leading-relaxed whitespace-pre-wrap text-ink">{ticket.description}</p>
              {initialAttachments.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted">Anexos enviados na abertura</p>
                  <AttachmentList items={initialAttachments} />
                </div>
              )}
            </div>
          </Card>

          {ticket.solution && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="flex items-center gap-2 font-display text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="size-4" /> Solução registrada
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-900 dark:text-emerald-100">{ticket.solution}</p>
            </div>
          )}

          {/* Conversa */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Conversa com o suporte"
              description={admin ? 'Notas internas ficam visíveis somente para administradores.' : 'Responda perguntas do técnico e envie prints por aqui.'}
            />
            <div ref={chatBox} className="max-h-[36rem] space-y-4 overflow-y-auto bg-surface-2/60 px-4 py-5 sm:px-5" aria-live="polite">
              {messages.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Nenhuma mensagem ainda" text={admin ? 'Envie a primeira resposta ao usuário.' : 'O técnico responderá por aqui.'} />
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === profile?.id
                  const fromSupport = m.sender_role === 'admin'
                  return (
                    <div key={m.id} className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                          fromSupport ? 'bg-navy-900 text-white dark:bg-brand-sky dark:text-navy-950' : 'bg-sky-wash text-primary'
                        }`}
                        aria-hidden
                      >
                        {initials(m.sender_name || '?')}
                      </span>
                      <div className={`max-w-[85%] sm:max-w-[75%] ${mine ? 'items-end text-right' : ''} flex flex-col`}>
                        <p className="mb-1 text-xs text-muted">
                          <span className="font-medium text-ink">{m.sender_name}</span>
                          {fromSupport && !m.is_internal && <span> · Suporte</span>}
                          <span className="tabular"> · {formatDate(m.created_at)} às {formatTime(m.created_at)}</span>
                        </p>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            m.is_internal
                              ? 'border border-dashed border-amber-400 bg-amber-50 text-amber-950 dark:bg-amber-400/10 dark:text-amber-100'
                              : mine
                                ? 'bg-navy-900 text-white dark:bg-brand-sky dark:text-navy-950'
                                : 'border border-line bg-surface text-ink'
                          }`}
                        >
                          {m.is_internal && (
                            <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                              <Lock className="size-3" /> Nota interna
                            </span>
                          )}
                          {m.message}
                          {byMessage.get(m.id) && (
                            <div className="mt-2">
                              <AttachmentList items={byMessage.get(m.id)!} tone={mine && !m.is_internal ? 'inverted' : 'default'} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {canWrite ? (
              <form onSubmit={send} className="no-print border-t border-line p-3 sm:p-4">
                {admin && (
                  <div className="mb-2 flex gap-1 rounded-lg bg-surface-2 p-1 text-sm" role="radiogroup" aria-label="Tipo de mensagem">
                    {[
                      { v: false, label: 'Responder ao usuário', icon: Send },
                      { v: true, label: 'Nota interna', icon: StickyNote },
                    ].map((o) => (
                      <button
                        key={o.label}
                        type="button"
                        role="radio"
                        aria-checked={internal === o.v}
                        onClick={() => setInternal(o.v)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 ${
                          internal === o.v ? 'bg-surface font-medium text-ink shadow-sm' : 'text-muted hover:text-ink'
                        }`}
                      >
                        <o.icon className="size-3.5" /> {o.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className={`flex items-end gap-2 rounded-xl border p-1.5 ${internal ? 'border-amber-400' : 'border-line'} bg-surface focus-within:border-brand-sky`}>
                  <FilePicker compact files={[]} onChange={(f) => setFiles((prev) => [...prev, ...f].slice(0, 5))} onError={(m) => toast('error', m)} disabled={sending} />
                  <label className="sr-only" htmlFor="chat-input">Mensagem</label>
                  <textarea
                    id="chat-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(e)
                    }}
                    rows={2}
                    maxLength={5000}
                    placeholder={internal ? 'Anotação visível só para administradores…' : 'Escreva sua mensagem…'}
                    className="max-h-40 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
                  />
                  <Button type="submit" size="md" loading={sending} disabled={!text.trim() && !files.length} aria-label="Enviar mensagem" icon={!sending ? <Send className="size-4" /> : undefined}>
                    <span className="hidden sm:inline">Enviar</span>
                  </Button>
                </div>
                {files.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2 py-1 text-xs">
                        <span className="max-w-40 truncate">{f.name}</span>
                        <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted hover:text-red-600" aria-label={`Remover ${f.name}`}>
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-1.5 text-xs text-muted">Ctrl + Enter envia. Anexos: PNG, JPG ou PDF até 10 MB.</p>
              </form>
            ) : (
              <div className="border-t border-line p-4">
                <Alert tone="info">Este chamado foi encerrado. Se o problema voltar, abra um novo chamado citando o protocolo {ticketCode(ticket.ticket_number)}.</Alert>
              </div>
            )}
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {admin && (
            <Card className="no-print">
              <CardHeader title="Atendimento" />
              <div className="space-y-4 p-5">
                <Select
                  label="Status"
                  value={ticket.status}
                  onChange={(e) => requestStatus(e.target.value as TicketStatus)}
                  disabled={savingField === 'status'}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{STATUS[s].label}</option>
                  ))}
                </Select>
                <Select
                  label="Prioridade"
                  value={ticket.priority}
                  onChange={(e) => update({ priority: e.target.value as TicketPriority }, 'priority', 'Prioridade alterada.')}
                  disabled={savingField === 'priority'}
                >
                  {PRIORITY_ORDER.map((p) => (
                    <option key={p} value={p}>{PRIORITY[p].label}</option>
                  ))}
                </Select>
                <Select
                  label="Categoria"
                  value={ticket.category}
                  onChange={(e) => update({ category: e.target.value as TicketCategory }, 'category', 'Categoria alterada.')}
                  disabled={savingField === 'category'}
                >
                  {CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>{CATEGORY[c]}</option>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {ticket.status === 'aberto' && (
                    <Button size="sm" className="col-span-2" onClick={() => requestStatus('em_andamento')} loading={savingField === 'status'}>
                      Iniciar atendimento
                    </Button>
                  )}
                  {!finished && ticket.status !== 'aguardando_usuario' && (
                    <Button size="sm" variant="secondary" className="col-span-2" onClick={() => requestStatus('aguardando_usuario')}>
                      Aguardar resposta do usuário
                    </Button>
                  )}
                  {!closed && (
                    <Button size="sm" variant="secondary" className="col-span-2" icon={<Lock className="size-3.5" />} onClick={() => requestStatus('encerrado')}>
                      Encerrar atendimento
                    </Button>
                  )}
                  {finished && (
                    <Button size="sm" variant="secondary" className="col-span-2" icon={<RotateCcw className="size-3.5" />} onClick={() => requestStatus('em_andamento')}>
                      Reabrir chamado
                    </Button>
                  )}
                </div>

                <div className="border-t border-line pt-4">
                  <Textarea
                    label="Solução"
                    rows={4}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    maxLength={5000}
                    placeholder="Ex.: troquei a fonte do computador…"
                    hint={finished ? undefined : 'Ao registrar, o chamado passa para Resolvido.'}
                  />
                  <Button size="sm" variant="accent" className="mt-3 w-full" onClick={saveSolution} loading={savingField === 'solution'}>
                    Registrar solução
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {admin && owner && (
            <Card>
              <CardHeader title="Solicitante" />
              <div className="space-y-2.5 p-5 text-sm">
                <p className="flex items-center gap-2 font-medium text-ink"><User className="size-4 text-muted" /> {owner.full_name}</p>
                <p className="flex items-center gap-2 break-all text-muted"><Mail className="size-4 shrink-0" /> <a href={`mailto:${owner.email}`} className="hover:text-brand-sky">{owner.email}</a></p>
                {owner.phone && <p className="flex items-center gap-2 text-muted"><Phone className="size-4" /> {owner.phone}</p>}
                <p className="flex items-center gap-2 text-muted"><Clock className="size-4" /> Cliente desde {formatDate(owner.created_at)}</p>
                <Link to={`/admin/usuarios/${owner.id}`} className="no-print inline-block pt-1 text-sm font-medium text-brand-sky hover:underline">
                  Ver histórico de chamados
                </Link>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Histórico de atendimento" />
            <TicketHistoryList items={history} />
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        title={pending?.title ?? ''}
        confirmLabel={pending?.label ?? 'Confirmar'}
        tone={pending?.danger ? 'danger' : 'primary'}
        loading={savingField === 'status'}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && update({ status: pending.value }, 'status', `Status alterado para ${STATUS[pending.value].label}.`)}
      >
        {pending?.text}
      </ConfirmDialog>
    </div>
  )
}

