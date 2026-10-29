import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { CATEGORY, CATEGORY_ORDER, PRIORITY, PRIORITY_ORDER } from '@/lib/constants'
import { ticketCode } from '@/lib/format'
import { uploadAttachments } from '@/lib/tickets'
import { focusFirstInvalid, friendlyError } from '@/lib/validation'
import { PageHeader } from '@/components/layout/AppShell'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { FilePicker } from '@/components/ui/FilePicker'
import { Alert } from '@/components/ui/Feedback'
import type { TicketCategory, TicketPriority } from '@/types/database'

type Errors = Partial<Record<'title' | 'category' | 'priority' | 'description', string>>

const priorityHints: Record<TicketPriority, string> = {
  baixa: 'Dúvidas ou ajustes que podem esperar.',
  media: 'Atrapalha o trabalho, mas há alternativa.',
  alta: 'Impede uma tarefa importante.',
  urgente: 'Parou tudo ou afeta várias pessoas.',
}

export default function NewTicket() {
  const toast = useToast()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TicketCategory | ''>('')
  const [priority, setPriority] = useState<TicketPriority>('media')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<{ number: number; failed: string[] } | null>(null)

  const validate = () => {
    const e: Errors = {}
    if (title.trim().length < 5) e.title = 'Descreva o problema em pelo menos 5 caracteres.'
    if (title.trim().length > 150) e.title = 'O título pode ter no máximo 150 caracteres.'
    if (!category) e.category = 'Escolha uma categoria.'
    if (description.trim().length < 10) e.description = 'Explique o problema com um pouco mais de detalhe (mínimo de 10 caracteres).'
    if (description.length > 5000) e.description = 'A descrição pode ter no máximo 5.000 caracteres.'
    return e
  }

  // Avisa antes de sair da página com o formulário preenchido.
  const dirty = !created && !saving && !!(title || description || files.length)
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const form = ev.currentTarget
    const e = validate()
    setErrors(e)
    setFormError(null)
    if (Object.keys(e).length) return focusFirstInvalid(form)

    setSaving(true)
    const { data, error } = await supabase
      .from('tickets')
      .insert({ title: title.trim(), category, priority, description: description.trim() })
      .select('id, ticket_number')
      .single()

    if (error || !data) {
      setSaving(false)
      return setFormError(friendlyError(error))
    }

    const failed = files.length ? await uploadAttachments(data.id, files) : []
    setSaving(false)
    setCreated({ number: data.ticket_number, failed })
    toast('success', `Chamado ${ticketCode(data.ticket_number)} aberto com sucesso!`)
  }

  if (created) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold">Chamado {ticketCode(created.number)} aberto com sucesso!</h1>
        <p className="mt-2 text-muted">
          Guarde o número do protocolo. Você será notificado aqui na plataforma a cada atualização.
        </p>
        {created.failed.length > 0 && (
          <div className="mt-4 text-left">
            <Alert>
              Não foi possível enviar: {created.failed.join(', ')}. Você pode anexá-los pela conversa do chamado.
            </Alert>
          </div>
        )}
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink to={`/painel/chamados/${created.number}`}>Ver chamado</ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              setCreated(null)
              setTitle('')
              setCategory('')
              setPriority('media')
              setDescription('')
              setFiles([])
            }}
          >
            Abrir outro chamado
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <PageHeader title="Abrir chamado" description="Quanto mais detalhes você der, mais rápido o técnico consegue ajudar." />
      <Card className="max-w-3xl">
        <form onSubmit={submit} noValidate className="space-y-5 p-5 sm:p-6">
          {formError && <Alert>{formError}</Alert>}
          <Input
            label="Título do chamado"
            placeholder="Ex.: Computador não liga…"
            name="titulo"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            maxLength={150}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Categoria" value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} error={errors.category}>
              <option value="" disabled>Selecione…</option>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>{CATEGORY[c]}</option>
              ))}
            </Select>
            <Select
              label="Prioridade"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              hint={priorityHints[priority]}
            >
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>{PRIORITY[p].label}</option>
              ))}
            </Select>
          </div>
          <Textarea
            label="Descrição do problema"
            placeholder="O que aconteceu, desde quando, se aparece alguma mensagem de erro…"
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            maxLength={5000}
            hint={`${description.length}/5000`}
          />
          <div>
            <p className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
              Print ou anexos <span className="text-xs font-normal text-muted">opcional</span>
            </p>
            <FilePicker files={files} onChange={setFiles} onError={(m) => toast('error', m)} disabled={saving} />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving}>{saving ? 'Abrindo chamado…' : 'Abrir chamado'}</Button>
          </div>
        </form>
      </Card>
      <p className="mt-4 text-sm text-muted">
        Já abriu um chamado parecido? <Link to="/painel/chamados" className="text-brand-sky hover:underline">Confira seus chamados</Link> antes de abrir outro.
      </p>
    </>
  )
}
