import { Link } from 'react-router-dom'
import { Eye, Inbox } from 'lucide-react'
import type { TicketWithOwner } from '@/types/database'
import { CATEGORY } from '@/lib/constants'
import { formatDate, ticketCode, timeAgo } from '@/lib/format'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badges'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import type { ReactNode } from 'react'

interface Props {
  rows: TicketWithOwner[]
  loading?: boolean
  basePath: string
  showOwner?: boolean
  empty?: { title: string; text?: string; action?: ReactNode }
}

/** Tabela de chamados: tabela em telas largas, lista de cartões no celular. */
export function TicketTable({ rows, loading, basePath, showOwner, empty }: Props) {
  if (loading) return <Spinner />
  if (!rows.length) {
    return <EmptyState icon={Inbox} title={empty?.title ?? 'Nenhum chamado encontrado'} text={empty?.text} action={empty?.action} />
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Nº</th>
              <th scope="col" className="px-3 py-3 font-medium">Assunto</th>
              {showOwner && <th scope="col" className="px-3 py-3 font-medium">Usuário</th>}
              <th scope="col" className="px-3 py-3 font-medium">Categoria</th>
              <th scope="col" className="px-3 py-3 font-medium">Prioridade</th>
              <th scope="col" className="px-3 py-3 font-medium">Status</th>
              <th scope="col" className="px-3 py-3 font-medium">Abertura</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((t) => (
              <tr key={t.id} className={`hover:bg-surface-2/70 ${t.priority === 'urgente' && !['resolvido', 'encerrado'].includes(t.status) ? 'shadow-[inset_3px_0_0_#dc2626]' : ''}`}>
                <td className="tabular px-5 py-3 font-medium text-ink">{ticketCode(t.ticket_number)}</td>
                <td className="max-w-xs px-3 py-3">
                  <Link to={`${basePath}/${t.ticket_number}`} className="line-clamp-1 font-medium text-ink hover:text-brand-sky">
                    {t.title}
                  </Link>
                </td>
                {showOwner && <td className="max-w-40 truncate px-3 py-3 text-muted">{t.owner?.full_name ?? '—'}</td>}
                <td className="px-3 py-3 text-muted">{CATEGORY[t.category]}</td>
                <td className="px-3 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-3 py-3 whitespace-nowrap text-muted">
                  <span className="tabular block">{formatDate(t.created_at)}</span>
                  <span className="text-xs">{timeAgo(t.created_at)}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`${basePath}/${t.ticket_number}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:border-brand-sky hover:text-primary"
                  >
                    <Eye className="size-3.5" /> Visualizar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {rows.map((t) => (
          <li key={t.id}>
            <Link to={`${basePath}/${t.ticket_number}`} className="block px-4 py-4 hover:bg-surface-2">
              <div className="flex items-center justify-between gap-2">
                <span className="tabular text-sm font-semibold text-ink">{ticketCode(t.ticket_number)}</span>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 line-clamp-2 font-medium text-ink">{t.title}</p>
              {showOwner && <p className="text-sm text-muted">{t.owner?.full_name}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <PriorityBadge priority={t.priority} />
                <span>{CATEGORY[t.category]}</span>
                <span>{formatDate(t.created_at)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
