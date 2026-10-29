import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/AppShell'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatStrip } from '@/components/ui/StatStrip'
import { STATUS, STATUS_ORDER } from '@/lib/constants'
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
      <StatStrip
        items={STATUS_ORDER.map((st) => ({
          label: st === 'aguardando_usuario' ? 'Aguardando você' : STATUS[st].label,
          value: counts ? counts[st] : null,
          dot: STATUS[st].dot,
          to: `/painel/chamados?status=${st}`,
        }))}
      />

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
