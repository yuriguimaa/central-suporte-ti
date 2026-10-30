import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CATEGORY, CATEGORY_ORDER, PRIORITY, PRIORITY_ORDER, STATUS, STATUS_ORDER } from '@/lib/constants'
import { fetchTickets } from '@/lib/tickets'
import { timeAgo } from '@/lib/format'
import { friendlyError } from '@/lib/validation'
import { PageHeader } from '@/components/layout/AppShell'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatStrip } from '@/components/ui/StatStrip'
import { Alert, Spinner } from '@/components/ui/Feedback'
import { ColumnChart, HBarList } from '@/components/ui/Charts'
import { ProtocolTag, StatusBadge } from '@/components/ui/Badges'
import { TicketTable } from '@/components/tickets/TicketTable'
import type { DashboardStats, TicketWithOwner } from '@/types/database'

const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const monthLong = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })


export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<TicketWithOwner[]>([])
  const [urgent, setUrgent] = useState<TicketWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const [s, r, u] = await Promise.all([
        supabase.rpc('admin_dashboard_stats'),
        fetchTickets({ pageSize: 6, withOwner: true }),
        supabase
          .from('tickets')
          .select('*, owner:profiles!tickets_user_id_fkey(id, full_name, email, phone)')
          .eq('priority', 'urgente')
          .not('status', 'in', '(resolvido,encerrado)')
          .order('created_at', { ascending: true })
          .limit(6),
      ])
      if (s.error) throw s.error
      setStats(s.data as DashboardStats)
      setRecent(r.rows)
      setUrgent((u.data as unknown as TicketWithOwner[]) ?? [])
      setError(null)
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Atualiza os indicadores quando chegam chamados novos ou mudanças de status.
    const ch = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [])

  const s = stats?.by_status ?? {}
  const months = (stats?.by_month ?? []).map((m) => {
    const d = new Date(`${m.month}-15T12:00:00`)
    return { key: m.month, label: monthShort.format(d).replace('.', ''), full: monthLong.format(d), value: m.count }
  })
  const queue = (s.aberto ?? 0) + (s.em_andamento ?? 0) + (s.aguardando_usuario ?? 0)
  const avg = stats?.avg_resolution_hours
  const finding = stats
    ? `${queue} ${queue === 1 ? 'chamado na fila' : 'chamados na fila'}${avg != null ? `. Tempo médio de solução: ${avg.toLocaleString('pt-BR')} h.` : '.'}`
    : undefined

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={finding}
        actions={<ButtonLink to="/admin/chamados?status=aberto">Atender chamados abertos</ButtonLink>}
      />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      {urgent.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-xl border border-red-200 dark:border-red-500/30" aria-labelledby="urgentes">
          <div className="flex items-center justify-between gap-3 bg-red-50 px-5 py-2.5 dark:bg-red-500/10">
            <h2 id="urgentes" className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
              <Flame className="size-4" aria-hidden /> {urgent.length} {urgent.length === 1 ? 'chamado urgente sem solução' : 'chamados urgentes sem solução'}
            </h2>
            <Link to="/admin/chamados?prioridade=urgente" className="text-sm font-medium text-red-700 hover:underline dark:text-red-300">Ver todos</Link>
          </div>
          <ul className="divide-y divide-line">
            {urgent.map((t) => (
              <li key={t.id}>
                <Link to={`/admin/chamados/${t.ticket_number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-surface-2">
                  <ProtocolTag number={t.ticket_number} />
                  <span className="min-w-0 flex-1 text-sm font-medium text-ink max-sm:order-1 max-sm:basis-full sm:truncate">{t.title}</span>
                  <span className="text-sm text-muted max-sm:order-2">{t.owner?.full_name}, aberto {timeAgo(t.created_at)}</span>
                  <StatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <StatStrip
        items={STATUS_ORDER.map((st) => ({
          label: STATUS[st].label,
          value: stats ? s[st] ?? 0 : null,
          dot: STATUS[st].dot,
          to: `/admin/chamados?status=${st}`,
          hint: st === 'resolvido' && stats ? `de ${stats.total} no total` : undefined,
        }))}
      />

      <Card className="mt-6 overflow-hidden">
        <CardHeader
          title="Últimos chamados"
          action={<Link to="/admin/chamados" className="text-sm font-medium text-primary hover:underline">Ver todos</Link>}
        />
        <TicketTable rows={recent} loading={loading} basePath="/admin/chamados" showOwner empty={{ title: 'Nenhum chamado registrado ainda' }} />
      </Card>

      {loading && !stats ? (
        <Spinner />
      ) : (
        // 3 colunas: o gráfico do mês e a prioridade ocupam 2, a categoria (lista mais longa) ocupa 1.
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
          <div className="grid gap-6 lg:col-span-2">
            <Card>
              <CardHeader title="Chamados por mês" description={`Últimos ${months.length} meses`} />
              <div className="px-5 pt-3 pb-5"><ColumnChart data={months} height={148} /></div>
            </Card>
            <Card>
              <CardHeader title="Chamados por prioridade" />
              <div className="px-5 pt-2 pb-5">
                <HBarList
                  highlightFirst={false}
                  data={PRIORITY_ORDER.map((p) => ({ key: p, label: PRIORITY[p].label, value: stats?.by_priority?.[p] ?? 0, color: p === 'urgente' ? 'bg-red-600' : undefined }))}
                />
              </div>
            </Card>
          </div>
          <Card>
            <CardHeader title="Chamados por categoria" />
            <div className="px-5 pt-2 pb-5">
              <HBarList
                gap="space-y-3.5"
                data={CATEGORY_ORDER.map((c) => ({ key: c, label: CATEGORY[c], value: stats?.by_category?.[c] ?? 0 }))
                  .sort((a, b) => b.value - a.value)}
              />
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
