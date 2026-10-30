import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import type { TicketWithOwner } from '@/types/database'
import { CATEGORY } from '@/lib/constants'
import { formatDate, timeAgo } from '@/lib/format'
import { PriorityBadge, ProtocolTag, StatusBadge } from '@/components/ui/Badges'
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
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Nº</th>
              <th scope="col" className="px-3 py-3 font-medium">Assunto</th>
              {showOwner && <th scope="col" className="px-3 py-3 font-medium">Usuário</th>}
              <th scope="col" className="px-3 py-3 font-medium">Categoria</th>
              <th scope="col" className="px-3 py-3 font-medium">Prioridade</th>
              <th scope="col" className="px-3 py-3 font-medium">Status</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Abertura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((t) => (
              // A linha inteira abre o chamado: o link do assunto se estende sobre ela.
              <tr key={t.id} className="relative hover:bg-surface-2 focus-within:bg-surface-2">
                <td className={`border-l-[3px] py-3 pr-3 pl-[17px] ${t.priority === 'urgente' && !['resolvido', 'encerrado'].includes(t.status) ? 'border-red-600' : 'border-transparent'}`}>
                  <ProtocolTag number={t.ticket_number} />
                </td>
                <td className="max-w-xs px-3 py-3">
                  <Link
                    to={`${basePath}/${t.ticket_number}`}
                    className="line-clamp-1 font-medium text-ink after:absolute after:inset-0"
                  >
                    {t.title}
                  </Link>
                </td>
                {showOwner && <td className="max-w-40 truncate px-3 py-3 text-muted">{t.owner?.full_name ?? '—'}</td>}
                <td className="px-3 py-3 text-muted">{CATEGORY[t.category]}</td>
                <td className="px-3 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <span className="tabular block text-ink">{formatDate(t.created_at)}</span>
                  <span className="text-xs text-muted">{timeAgo(t.created_at)}</span>
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
                <ProtocolTag number={t.ticket_number} />
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
