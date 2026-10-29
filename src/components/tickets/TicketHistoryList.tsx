import { ArrowRightLeft, CircleCheck, Flag, FolderInput, PlusCircle, RotateCcw } from 'lucide-react'
import { CATEGORY, PRIORITY, STATUS } from '@/lib/constants'
import { formatDate, formatTime } from '@/lib/format'
import type { TicketCategory, TicketHistory, TicketPriority, TicketStatus } from '@/types/database'

const st = (v: string | null) => (v ? STATUS[v as TicketStatus]?.label ?? v : '—')
const pr = (v: string | null) => (v ? PRIORITY[v as TicketPriority]?.label ?? v : '—')
const ct = (v: string | null) => (v ? CATEGORY[v as TicketCategory] ?? v : '—')

export function describeHistory(h: TicketHistory) {
  const when = `em ${formatDate(h.created_at)} às ${formatTime(h.created_at)}`
  switch (h.action) {
    case 'criado':
      return { icon: PlusCircle, text: `Chamado aberto ${when}.` }
    case 'status':
      return { icon: ArrowRightLeft, text: `Chamado alterado de ${st(h.old_value)} para ${st(h.new_value)} ${when}.` }
    case 'reaberto':
      return { icon: RotateCcw, text: `Chamado reaberto (${st(h.old_value)} → ${st(h.new_value)}) ${when}.` }
    case 'prioridade':
      return { icon: Flag, text: `Prioridade alterada de ${pr(h.old_value)} para ${pr(h.new_value)} ${when}.` }
    case 'categoria':
      return { icon: FolderInput, text: `Categoria alterada de ${ct(h.old_value)} para ${ct(h.new_value)} ${when}.` }
    case 'solucao':
      return { icon: CircleCheck, text: `Solução registrada ${when}.` }
    default:
      return { icon: ArrowRightLeft, text: `${h.action} ${when}.` }
  }
}

export function TicketHistoryList({ items }: { items: TicketHistory[] }) {
  if (!items.length) return <p className="px-5 py-6 text-sm text-muted">Sem registros ainda.</p>
  return (
    <ol className="relative space-y-4 px-5 py-5">
      {items.map((h, i) => {
        const d = describeHistory(h)
        return (
          <li key={h.id} className="relative flex gap-3">
            {i < items.length - 1 && <span className="absolute top-7 bottom-[-1rem] left-[13px] w-px bg-line" aria-hidden />}
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-wash text-primary">
              <d.icon className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5 text-sm">
              <p className="text-ink">{d.text}</p>
              {/* Guarda o texto de cada solução registrada, mesmo depois de reabrir ou trocar a solução. */}
              {h.action === 'solucao' && h.new_value && (
                <p className="mt-1 rounded-lg border-l-2 border-emerald-400 bg-emerald-50 px-2.5 py-1.5 text-xs whitespace-pre-wrap text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100">
                  {h.new_value}
                </p>
              )}
              {h.changed_by_name && <p className="text-xs text-muted">por {h.changed_by_name}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
