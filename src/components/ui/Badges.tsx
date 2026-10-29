import { Flame } from 'lucide-react'
import { PRIORITY, STATUS } from '@/lib/constants'
import { ticketCode } from '@/lib/format'
import type { TicketPriority, TicketStatus } from '@/types/database'

/** Status: quadradinho de cor + rótulo (a cor nunca aparece sozinha). */
export function StatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 text-xs font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`size-2 rounded-[2px] ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  )
}

const bars: Record<TicketPriority, number> = { baixa: 1, media: 2, alta: 3, urgente: 4 }

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const p = PRIORITY[priority]
  if (priority === 'urgente') {
    return (
      <span className="inline-flex items-center gap-1 rounded-[5px] bg-red-600 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white">
        <Flame className="size-3" aria-hidden />
        Urgente
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${p.badge}`}>
      <span className="flex items-end gap-px" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`w-[3px] rounded-[1px] bg-current ${i <= bars[priority] ? '' : 'opacity-20'}`} style={{ height: 4 + i * 2 }} />
        ))}
      </span>
      {p.label}
    </span>
  )
}

/** Etiqueta do número de protocolo, no formato de canhoto. */
export function ProtocolTag({ number, size = 'sm' }: { number: number; size?: 'sm' | 'lg' }) {
  return (
    <span className={`proto-tag ${size === 'lg' ? 'text-base' : 'text-[13px]'}`} translate="no">
      {ticketCode(number)}
    </span>
  )
}
