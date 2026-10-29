import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, CircleDot, Hourglass, Lock, MessageCircleQuestion, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/AppShell'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Alert } from '@/components/ui/Feedback'
import { TicketTable } from '@/components/tickets/TicketTable'
import { fetchTickets } from '@/lib/tickets'
import { friendlyError } from '@/lib/validation'
import type { TicketStatus, TicketWithOwner } from '@/types/database'

export default function UserDashboard() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState<Record<TicketStatus, number> | null>(null)
  const [recent, setRecent] = useState<TicketWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    ;(async () => {
      try {
        const [{ data, error: e1 }, list] = await Promise.all([
          supabase.from('tickets').select('status').eq('user_id', profile.id),
          fetchTickets({ userId: profile.id, pageSize: 5 }),
        ])
        if (e1) throw e1
        const c = { aberto: 0, em_andamento: 0, aguardando_usuario: 0, resolvido: 0, encerrado: 0 }
        for (const r of data ?? []) c[r.status as TicketStatus]++
        setCounts(c)
        setRecent(list.rows)
      } catch (e) {
        setError(friendlyError(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [profile])

  const first = profile?.full_name.split(' ')[0]

  return (
    <>
      <PageHeader
        title={`Olá, ${first}`}
        description="Acompanhe aqui o andamento dos seus chamados."
        actions={<ButtonLink to="/painel/novo" icon={<Plus className="size-4" />}>Abrir chamado</ButtonLink>}
      />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {counts && counts.aguardando_usuario > 0 && (
        <div className="mb-4">
          <Alert tone="info">
            O suporte está aguardando sua resposta em {counts.aguardando_usuario}{' '}
            {counts.aguardando_usuario === 1 ? 'chamado' : 'chamados'}.{' '}
            <Link className="font-medium underline" to="/painel/chamados?status=aguardando_usuario">Ver agora</Link>
          </Alert>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Abertos" value={counts?.aberto ?? null} icon={CircleDot} to="/painel/chamados?status=aberto" tone="bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" />
        <StatCard label="Em andamento" value={counts?.em_andamento ?? null} icon={Hourglass} to="/painel/chamados?status=em_andamento" tone="bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" />
        <StatCard label="Aguardando resposta" value={counts?.aguardando_usuario ?? null} icon={MessageCircleQuestion} to="/painel/chamados?status=aguardando_usuario" tone="bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" />
        <StatCard label="Resolvidos" value={counts?.resolvido ?? null} icon={CheckCircle2} to="/painel/chamados?status=resolvido" tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" />
        <StatCard label="Encerrados" value={counts?.encerrado ?? null} icon={Lock} to="/painel/chamados?status=encerrado" tone="bg-slate-100 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300" />
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader
          title="Chamados recentes"
          action={<ButtonLink to="/painel/chamados" variant="secondary" size="sm">Ver todos</ButtonLink>}
        />
        <TicketTable
          rows={recent}
          loading={loading}
          basePath="/painel/chamados"
          empty={{
            title: 'Você ainda não abriu nenhum chamado',
            text: 'Quando algo não funcionar, abra um chamado e acompanhe por aqui.',
            action: <ButtonLink to="/painel/novo" icon={<Plus className="size-4" />}>Abrir chamado</ButtonLink>,
          }}
        />
      </Card>
    </>
  )
}
