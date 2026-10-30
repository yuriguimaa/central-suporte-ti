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
 * Indicadores numa única faixa, separados por linhas de 1px: o número é texto, não um cartão.
 * Cada célula com `to` filtra a lista correspondente.
 */
export function StatStrip({ items, cols = 'md:grid-cols-5' }: { items: StatItem[]; cols?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <ul className={`-mr-px -mb-px grid grid-cols-2 ${cols}`}>
        {items.map((it) => {
          const body = (
            <>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                {it.dot && <span className={`size-2 shrink-0 rounded-full ${it.dot}`} aria-hidden />}
                <span className="truncate">{it.label}</span>
              </span>
              <span className="tabular mt-1.5 block text-[1.625rem] leading-none font-medium text-ink">
                {it.value ?? '–'}
              </span>
              {it.hint && <span className="mt-1.5 block text-xs text-muted">{it.hint}</span>}
            </>
          )
          const cls = 'block h-full px-5 py-4'
          return (
            <li key={it.label} className="border-r border-b border-line max-md:last:odd:col-span-2">
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
