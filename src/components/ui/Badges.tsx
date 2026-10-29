import { Flame } from 'lucide-react'
import { PRIORITY, STATUS } from '@/lib/constants'
import type { TicketPriority, TicketStatus } from '@/types/database'

export function StatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.badge}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  )
}

const bars: Record<TicketPriority, number> = { baixa: 1, media: 2, alta: 3, urgente: 4 }

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const p = PRIORITY[priority]
  if (priority === 'urgente') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
        <Flame className="size-3" aria-hidden />
        Urgente
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${p.badge}`}>
      <span className="flex items-end gap-px" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-sm ${i <= bars[priority] ? 'bg-current' : 'bg-current opacity-20'}`}
            style={{ height: 4 + i * 2 }}
          />
        ))}
      </span>
      {p.label}
    </span>
  )
}
