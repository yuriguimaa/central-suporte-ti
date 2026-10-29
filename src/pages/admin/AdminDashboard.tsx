import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, CircleDot, Flame, Hourglass, Inbox, Lock, MessageCircleQuestion, Timer, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CATEGORY, CATEGORY_ORDER, PRIORITY, PRIORITY_ORDER, STATUS, STATUS_ORDER } from '@/lib/constants'
import { fetchTickets } from '@/lib/tickets'
import { ticketCode, timeAgo } from '@/lib/format'
import { friendlyError } from '@/lib/validation'
import { PageHeader } from '@/components/layout/AppShell'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Alert, Spinner } from '@/components/ui/Feedback'
import { ColumnChart, HBarList } from '@/components/ui/Charts'
import { StatusBadge } from '@/components/ui/Badges'
import { TicketTable } from '@/components/tickets/TicketTable'
import type { DashboardStats, TicketWithOwner } from '@/types/database'

const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const monthLong = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

// Sequência de um único tom (claro → escuro) para a prioridade, que é ordinal.
const priorityShade = { baixa: 'bg-sky-200 dark:bg-sky-900', media: 'bg-sky-400 dark:bg-sky-700', alta: 'bg-sky-600 dark:bg-sky-500', urgente: 'bg-navy-900 dark:bg-sky-300' }

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
        fetchTickets({ pageSize: 8, withOwner: true }),
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

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral do atendimento, atualizada em tempo real." />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      {urgent.length > 0 && (
        <Card className="mb-6 overflow-hidden border-red-200 dark:border-red-500/30">
          <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-3 dark:border-red-500/20 dark:bg-red-500/10">
            <p className="flex items-center gap-2 font-display text-sm font-semibold text-red-800 dark:text-red-300">
              <Flame className="size-4" /> {urgent.length} {urgent.length === 1 ? 'chamado urgente aguardando' : 'chamados urgentes aguardando'}
            </p>
            <Link to="/admin/chamados?prioridade=urgente" className="text-sm font-medium text-red-700 hover:underline dark:text-red-300">Ver todos</Link>
          </div>
          <ul className="divide-y divide-line">
            {urgent.map((t) => (
              <li key={t.id}>
                <Link to={`/admin/chamados/${t.ticket_number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-surface-2">
                  <span className="tabular text-sm font-semibold">{ticketCode(t.ticket_number)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{t.title}</span>
                  <span className="text-xs text-muted">{t.owner?.full_name} · aberto {timeAgo(t.created_at)}</span>
                  <StatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total de chamados" value={stats?.total ?? null} icon={Inbox} to="/admin/chamados" />
        <StatCard label="Abertos" value={stats ? s.aberto ?? 0 : null} icon={CircleDot} to="/admin/chamados?status=aberto" tone="bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" />
        <StatCard label="Em andamento" value={stats ? s.em_andamento ?? 0 : null} icon={Hourglass} to="/admin/chamados?status=em_andamento" tone="bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" />
        <StatCard label="Aguardando usuário" value={stats ? s.aguardando_usuario ?? 0 : null} icon={MessageCircleQuestion} to="/admin/chamados?status=aguardando_usuario" tone="bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" />
        <StatCard label="Resolvidos" value={stats ? s.resolvido ?? 0 : null} icon={CheckCircle2} to="/admin/chamados?status=resolvido" tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" />
        <StatCard label="Encerrados" value={stats ? s.encerrado ?? 0 : null} icon={Lock} to="/admin/chamados?status=encerrado" tone="bg-slate-100 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300" />
        <StatCard label="Usuários cadastrados" value={stats?.users ?? null} icon={Users} to="/admin/usuarios" />
        <StatCard
          label="Tempo médio de solução"
          value={stats ? (stats.avg_resolution_hours != null ? `${stats.avg_resolution_hours} h` : '—') : null}
          icon={Timer}
        />
      </div>

      {loading && !stats ? (
        <Spinner />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader title="Chamados por mês" description="Últimos 12 meses" />
            <div className="p-5"><ColumnChart data={months} /></div>
          </Card>
          <Card>
            <CardHeader title="Chamados por categoria" />
            <div className="p-5">
              <HBarList
                data={CATEGORY_ORDER.map((c) => ({ key: c, label: CATEGORY[c], value: stats?.by_category?.[c] ?? 0 }))
                  .sort((a, b) => b.value - a.value)}
              />
            </div>
          </Card>
          <div className="grid gap-6">
            <Card>
              <CardHeader title="Chamados por prioridade" />
              <div className="p-5">
                <HBarList data={PRIORITY_ORDER.map((p) => ({ key: p, label: PRIORITY[p].label, value: stats?.by_priority?.[p] ?? 0, color: priorityShade[p] }))} />
              </div>
            </Card>
            <Card>
              <CardHeader title="Chamados por status" />
              <div className="p-5">
                <HBarList data={STATUS_ORDER.map((st) => ({ key: st, label: STATUS[st].label, value: s[st] ?? 0, color: STATUS[st].dot }))} />
              </div>
            </Card>
          </div>
        </div>
      )}

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Chamados recentes" action={<ButtonLink to="/admin/chamados" variant="secondary" size="sm">Ver todos</ButtonLink>} />
        <TicketTable rows={recent} loading={loading} basePath="/admin/chamados" showOwner empty={{ title: 'Nenhum chamado registrado ainda' }} />
      </Card>
    </>
  )
}
