import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, UserCheck, UserX } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { fetchTickets } from '@/lib/tickets'
import { formatDate } from '@/lib/format'
import { PAGE_SIZE } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Feedback'
import { Pagination } from '@/components/ui/Pagination'
import { TicketTable } from '@/components/tickets/TicketTable'
import { AccountStatus, useToggleActive } from './AdminUsers'
import type { Profile, TicketWithOwner } from '@/types/database'

export default function AdminUserDetail() {
  const { id } = useParams()
  const { profile: me } = useAuth()
  const [user, setUser] = useState<Profile | null>(null)
  const [tickets, setTickets] = useState<TicketWithOwner[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    const [{ data }, list] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      fetchTickets({ userId: id, page, pageSize: PAGE_SIZE }),
    ])
    setUser(data as Profile | null)
    setTickets(list.rows)
    setTotal(list.total)
    setLoading(false)
  }, [id, page])

  useEffect(() => {
    load()
  }, [load])

  const { ask, dialog } = useToggleActive(load)

  if (loading) return <Spinner />
  if (!user) return <p className="text-muted">Usuário não encontrado.</p>

  return (
    <>
      <Link to="/admin/usuarios" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Usuários
      </Link>
      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{user.full_name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 hover:text-brand-sky"><Mail className="size-4" /> {user.email}</a>
              {user.phone && <span className="flex items-center gap-1.5"><Phone className="size-4" /> {user.phone}</span>}
              <span>Cadastro em {formatDate(user.created_at)}</span>
              <span>{user.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
              <AccountStatus active={user.is_active} />
            </div>
          </div>
          {user.id !== me?.id && (
            <Button
              variant={user.is_active ? 'secondary' : 'primary'}
              icon={user.is_active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
              onClick={() => ask(user)}
            >
              {user.is_active ? 'Desativar acesso' : 'Reativar acesso'}
            </Button>
          )}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader title="Histórico de chamados" description={`${total} ${total === 1 ? 'chamado' : 'chamados'}`} />
        <TicketTable rows={tickets} basePath="/admin/chamados" empty={{ title: 'Este usuário ainda não abriu chamados' }} />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </Card>
      {dialog}
    </>
  )
}
