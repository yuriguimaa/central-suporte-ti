import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export interface StatItem {
  label: string
  value: number | string | null
  to?: string
  dot?: string // cor do status (classe de fundo)
  hint?: ReactNode
}

/**
 * Indicadores em uma única faixa, separados por picote, como um bloco de canhotos.
 * Substitui a grade de cards iguais.
 */
export function StatStrip({ items, cols = 'lg:grid-cols-5' }: { items: StatItem[]; cols?: string }) {
  return (
    <div className="ticket-cut overflow-hidden rounded-2xl border border-line bg-surface">
      <ul className={`-mr-0.5 -mb-0.5 grid grid-cols-2 sm:grid-cols-3 ${cols}`}>
        {items.map((it) => {
          const body = (
            <>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                {it.dot && <span className={`size-2 shrink-0 rounded-[2px] ${it.dot}`} aria-hidden />}
                <span className="truncate">{it.label}</span>
              </span>
              <span className="tabular wide mt-2 block font-display text-[2rem] leading-none font-semibold text-ink">
                {it.value ?? '–'}
              </span>
              {it.hint && <span className="mt-1.5 block text-xs text-muted">{it.hint}</span>}
            </>
          )
          const cls = 'block h-full px-5 py-4 sm:py-5'
          return (
            <li key={it.label} className="border-r-2 border-b-2 border-dashed border-line">
              {it.to ? (
                <Link to={it.to} className={`${cls} transition-colors hover:bg-surface-2 focus-visible:bg-surface-2`}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
