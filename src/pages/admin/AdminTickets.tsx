import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Feedback'
import { Pagination } from '@/components/ui/Pagination'
import { TicketFilters } from '@/components/tickets/TicketFilters'
import { TicketTable } from '@/components/tickets/TicketTable'
import { STATUS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { useTicketList } from '@/lib/useTicketList'
import { PAGE_SIZE } from '@/lib/constants'
import type { Profile } from '@/types/database'

export default function AdminTickets() {
  const { query, setQuery, rows, total, loading, error } = useTicketList({ withOwner: true })
  const [users, setUsers] = useState<Pick<Profile, 'id' | 'full_name' | 'email'>[]>([])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name')
      .limit(1000)
      .then(({ data }) => setUsers(data ?? []))
  }, [])

  const title = query.status ? `Chamados: ${STATUS[query.status].label.toLowerCase()}` : 'Todos os chamados'

  return (
    <>
      <PageHeader title={title} description={`${total} ${total === 1 ? 'chamado encontrado' : 'chamados encontrados'}`} />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      <Card className="overflow-hidden">
        <TicketFilters value={query} onChange={setQuery} users={users} />
        <TicketTable rows={rows} loading={loading} basePath="/admin/chamados" showOwner empty={{ title: 'Nenhum chamado encontrado', text: 'Ajuste os filtros ou a busca.' }} />
        <Pagination page={query.page ?? 1} pageSize={PAGE_SIZE} total={total} onChange={(p) => setQuery({ ...query, page: p })} />
      </Card>
    </>
  )
}
