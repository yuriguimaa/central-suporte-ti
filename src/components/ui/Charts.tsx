import { useState } from 'react'

export interface BarDatum {
  key: string
  label: string
  value: number
  color?: string // classe Tailwind de fundo
}

/**
 * Lista ordenada com uma barra fina sob cada rótulo. As barras ficam em cinza e só o primeiro
 * item leva a cor da marca, para que "o que mais pesa" seja visto e não só lido.
 */
export function HBarList({ data, emptyText = 'Sem dados ainda.', highlightFirst = true, gap = 'space-y-2.5' }: { data: BarDatum[]; emptyText?: string; highlightFirst?: boolean; gap?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return <p className="py-6 text-sm text-muted">{emptyText}</p>
  return (
    <ul className={gap}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / total) * 100)
        const fill = d.color ?? (highlightFirst && i === 0 ? 'bg-primary' : 'bg-ink/25')
        return (
          <li key={d.key} title={`${d.label}: ${d.value} (${pct}%)`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-ink">{d.label}</span>
              <span className="tabular shrink-0 text-right">
                <span className="text-ink">{d.value}</span>
                <span className="inline-block w-11 text-xs text-muted">{pct}%</span>
              </span>
            </div>
            <div className="mt-1 h-[3px] rounded-full bg-surface-2">
              <div className={`h-full rounded-full ${fill}`} style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Passo "redondo" para o eixo: 1, 2, 5, 10, 20, 50… com 3 a 5 marcas acima do máximo. */
function niceTicks(max: number) {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]
  const step = steps.find((s) => Math.ceil(max / s) <= 4) ?? Math.ceil(max / 4)
  const top = Math.max(step, Math.ceil(max / step) * step)
  const ticks: number[] = []
  for (let v = top; v >= 0; v -= step) ticks.push(v)
  return { top, ticks }
}

/**
 * Colunas por mês. Os meses fechados ficam em cinza; o mês corrente (o último) leva a cor da marca,
 * porque é o número que o técnico acompanha.
 */
export function ColumnChart({ data, height = 168 }: { data: { key: string; label: string; full: string; value: number }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const { top, ticks } = niceTicks(Math.max(1, ...data.map((d) => d.value)))
  const plot = height - 24
  return (
    <div className="flex gap-3">
      <div className="tabular relative w-6 text-right text-xs text-muted" style={{ height: plot }} aria-hidden>
        {ticks.map((t) => (
          <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - t / top) * 100}%` }}>{t}</span>
        ))}
      </div>
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: plot }} aria-hidden>
          {ticks.map((t) => (
            <span key={t} className={`absolute inset-x-0 border-t ${t === 0 ? 'border-ink/30' : 'border-line'}`} style={{ top: `${(1 - t / top) * 100}%` }} />
          ))}
        </div>
        <ol className="relative flex items-end gap-2 sm:gap-4" style={{ height }} aria-label="Chamados por mês">
          {data.map((d, i) => {
            const current = i === data.length - 1
            return (
              <li
                key={d.key}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
                tabIndex={0}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${d.full}: ${d.value} chamados`}
              >
                {hover === i && (
                  <span className="tabular absolute z-10 rounded-md border border-line bg-surface px-2 py-1 text-xs whitespace-nowrap text-ink shadow-md" style={{ bottom: `calc(${(d.value / top) * plot}px + 30px)` }}>
                    {d.full}: <span className="font-semibold">{d.value}</span>
                  </span>
                )}
                <span
                  className={`w-full max-w-12 ${current ? 'bg-primary' : hover === i ? 'bg-ink/35' : 'bg-ink/15'}`}
                  style={{ height: `${(d.value / top) * plot}px` }}
                />
                <span className={`mt-1.5 h-[18px] text-xs ${current ? 'font-medium text-ink' : 'text-muted'}`}>{d.label}</span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
