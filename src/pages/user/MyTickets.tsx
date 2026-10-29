import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/AppShell'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Feedback'
import { Pagination } from '@/components/ui/Pagination'
import { TicketFilters } from '@/components/tickets/TicketFilters'
import { TicketTable } from '@/components/tickets/TicketTable'
import { useAuth } from '@/contexts/AuthContext'
import { useTicketList } from '@/lib/useTicketList'
import { PAGE_SIZE } from '@/lib/constants'

export default function MyTickets() {
  const { profile } = useAuth()
  const { query, setQuery, rows, total, loading, error } = useTicketList({ userId: profile?.id })
  const filtered = !!(query.search || query.status || query.priority || query.category)

  return (
    <>
      <PageHeader
        title="Meus chamados"
        description="Todos os chamados que você abriu, do mais recente ao mais antigo."
        actions={<ButtonLink to="/painel/novo" icon={<Plus className="size-4" />}>Abrir chamado</ButtonLink>}
      />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      <Card className="overflow-hidden">
        <TicketFilters value={query} onChange={setQuery} />
        <TicketTable
          rows={rows}
          loading={loading}
          basePath="/painel/chamados"
          empty={
            filtered
              ? { title: 'Nenhum chamado com esses filtros', text: 'Tente outro termo ou limpe os filtros.' }
              : {
                  title: 'Você ainda não abriu nenhum chamado',
                  action: <ButtonLink to="/painel/novo">Abrir chamado</ButtonLink>,
                }
          }
        />
        <Pagination page={query.page ?? 1} pageSize={PAGE_SIZE} total={total} onChange={(p) => setQuery({ ...query, page: p })} />
      </Card>
    </>
  )
}
