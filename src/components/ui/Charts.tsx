import { useState } from 'react'

export interface BarDatum {
  key: string
  label: string
  value: number
  color?: string // classe Tailwind de fundo
}

/** Barras horizontais com rótulo e valor diretos (uma série, sem legenda). */
export function HBarList({ data, color = 'bg-navy-700 dark:bg-brand-sky', emptyText = 'Sem dados ainda.' }: { data: BarDatum[]; color?: string; emptyText?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return <p className="py-6 text-center text-sm text-muted">{emptyText}</p>
  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const pct = total ? Math.round((d.value / total) * 100) : 0
        return (
          <li key={d.key} className="group" title={`${d.label}: ${d.value} (${pct}%)`}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-ink">{d.label}</span>
              <span className="tabular shrink-0 text-muted">
                <span className="font-medium text-ink">{d.value}</span> · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2">
              <div
                className={`h-2 rounded-full transition-[width] duration-500 group-hover:opacity-80 ${d.color ?? color}`}
                style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value ? 4 : 0 }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Colunas verticais (ex.: chamados por mês) com tooltip ao passar o mouse ou focar. */
export function ColumnChart({ data, height = 180 }: { data: { key: string; label: string; full: string; value: number }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  const ticks = [max, Math.round(max / 2), 0]
  return (
    <div>
      <div className="flex gap-2">
        <div className="tabular flex flex-col justify-between pb-6 text-right text-[11px] text-muted" style={{ height }} aria-hidden>
          {ticks.map((t, i) => (
            <span key={i} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{t}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden>
            <span className="border-t border-dashed border-line" />
            <span className="border-t border-dashed border-line" />
            <span className="border-t border-line" />
          </div>
          <ol className="relative flex items-end gap-1 sm:gap-2" style={{ height }} aria-label="Chamados por mês">
            {data.map((d, i) => (
              <li
                key={d.key}
                className="relative flex h-full flex-1 flex-col items-center justify-end outline-none"
                tabIndex={0}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${d.full}: ${d.value} chamados`}
              >
                {hover === i && (
                  <span className="tabular absolute z-10 mb-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-ink shadow-lg" style={{ bottom: `calc(${(d.value / max) * (height - 24)}px + 30px)` }}>
                    <span className="block text-muted">{d.full}</span>
                    <span className="font-semibold">{d.value}</span> chamados
                  </span>
                )}
                <span
                  className={`w-full max-w-9 rounded-t-[4px] ${hover === i ? 'bg-navy-700 dark:bg-brand-sky-light' : 'bg-brand-sky'}`}
                  style={{ height: `${(d.value / max) * (height - 24)}px`, minHeight: d.value ? 3 : 0 }}
                />
                <span className="mt-1.5 h-[18px] text-[11px] text-muted">{d.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
