import { useEffect, useMemo, useState } from 'react'
import { Download, FileBarChart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { CATEGORY, CATEGORY_ORDER, PRIORITY, PRIORITY_ORDER, STATUS, STATUS_ORDER } from '@/lib/constants'
import { downloadCsv } from '@/lib/csv'
import { elapsed, formatDateTime, ticketCode } from '@/lib/format'
import { friendlyError } from '@/lib/validation'
import { PageHeader } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback'
import { HBarList } from '@/components/ui/Charts'
import { StatStrip } from '@/components/ui/StatStrip'
import type { TicketCategory, TicketStatus, TicketWithOwner } from '@/types/database'

// Data local no formato AAAA-MM-DD (evita virar o dia por causa do fuso)
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function AdminReports() {
  const toast = useToast()
  const today = new Date()
  const [from, setFrom] = useState(iso(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [to, setTo] = useState(iso(today))
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [category, setCategory] = useState<TicketCategory | ''>('')
  const [rows, setRows] = useState<TicketWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!from || !to) return
    let cancel = false
    ;(async () => {
      setLoading(true)
      const all: TicketWithOwner[] = []
      // Busca em blocos de 1.000 (limite padrão da API do Supabase).
      for (let page = 0; page < 20; page++) {
        let q = supabase
          .from('tickets')
          .select('*, owner:profiles!tickets_user_id_fkey(id, full_name, email, phone)')
          .gte('created_at', new Date(`${from}T00:00:00`).toISOString())
          .lte('created_at', new Date(`${to}T23:59:59.999`).toISOString())
          .order('created_at', { ascending: false })
          .range(page * 1000, page * 1000 + 999)
        if (status) q = q.eq('status', status)
        if (category) q = q.eq('category', category)
        const { data, error } = await q
        if (error) {
          if (!cancel) setError(friendlyError(error))
          break
        }
        all.push(...((data as unknown as TicketWithOwner[]) ?? []))
        if (!data || data.length < 1000) break
      }
      if (!cancel) {
        setRows(all)
        setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [from, to, status, category])

  const summary = useMemo(() => {
    const resolved = rows.filter((r) => r.resolved_at)
    const avgH = resolved.length
      ? resolved.reduce((s, r) => s + (new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()), 0) / resolved.length / 3.6e6
      : null
    const count = <K extends string>(keys: K[], get: (r: TicketWithOwner) => K) =>
      keys.map((k) => ({ key: k, value: rows.filter((r) => get(r) === k).length }))
    return {
      total: rows.length,
      resolved: resolved.length,
      urgent: rows.filter((r) => r.priority === 'urgente').length,
      avgH,
      byStatus: count(STATUS_ORDER, (r) => r.status).map((x) => ({ ...x, label: STATUS[x.key].label, color: STATUS[x.key].dot })),
      byCategory: count(CATEGORY_ORDER, (r) => r.category).map((x) => ({ ...x, label: CATEGORY[x.key] })).sort((a, b) => b.value - a.value),
      byPriority: count(PRIORITY_ORDER, (r) => r.priority).map((x) => ({ ...x, label: PRIORITY[x.key].label, color: x.key === 'urgente' ? 'bg-red-600' : undefined })),
    }
  }, [rows])

  const exportCsv = () => {
    if (!rows.length) return toast('info', 'Não há chamados no período para exportar.')
    downloadCsv(
      `chamados_${from}_a_${to}.csv`,
      ['Protocolo', 'Título', 'Usuário', 'E-mail', 'Categoria', 'Prioridade', 'Status', 'Abertura', 'Última atualização', 'Resolvido em', 'Encerrado em', 'Tempo até solução', 'Solução'],
      rows.map((r) => [
        ticketCode(r.ticket_number),
        r.title,
        r.owner?.full_name,
        r.owner?.email,
        CATEGORY[r.category],
        PRIORITY[r.priority].label,
        STATUS[r.status].label,
        formatDateTime(r.created_at),
        formatDateTime(r.updated_at),
        r.resolved_at ? formatDateTime(r.resolved_at) : '',
        r.closed_at ? formatDateTime(r.closed_at) : '',
        r.resolved_at ? elapsed(r.created_at, r.resolved_at) : '',
        r.solution ?? '',
      ]),
    )
    toast('success', `${rows.length} chamados exportados.`)
  }

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Resumo do atendimento por período, com exportação em CSV."
        actions={<Button icon={<Download className="size-4" />} onClick={exportCsv} disabled={loading}>Exportar CSV</Button>}
      />
      <Card className="mb-6">
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="De" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          <Input label="Até" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as TicketStatus | '')}>
            <option value="">Todos</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </Select>
          <Select label="Categoria" value={category} onChange={(e) => setCategory(e.target.value as TicketCategory | '')}>
            <option value="">Todas</option>
            {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORY[c]}</option>)}
          </Select>
        </div>
      </Card>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      {loading ? (
        <Spinner />
      ) : !rows.length ? (
        <Card><EmptyState icon={FileBarChart} title="Nenhum chamado no período" text="Escolha outro intervalo de datas ou remova os filtros." /></Card>
      ) : (
        <>
          <div className="mb-6">
            <StatStrip
              cols="lg:grid-cols-4"
              items={[
                { label: 'Chamados no período', value: summary.total },
                { label: 'Resolvidos', value: summary.resolved },
                { label: 'Urgentes', value: summary.urgent },
                { label: 'Tempo médio de solução', value: summary.avgH != null ? `${summary.avgH.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h` : '–' },
              ]}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card><CardHeader title="Por status" /><div className="p-5"><HBarList data={summary.byStatus} highlightFirst={false} /></div></Card>
            <Card><CardHeader title="Por categoria" /><div className="p-5"><HBarList data={summary.byCategory} /></div></Card>
            <Card><CardHeader title="Por prioridade" /><div className="p-5"><HBarList data={summary.byPriority} highlightFirst={false} /></div></Card>
          </div>
        </>
      )}
    </>
  )
}
