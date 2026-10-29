import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number | string | null
  icon: LucideIcon
  tone?: string
  to?: string
}

export function StatCard({ label, value, icon: Icon, tone = 'text-primary bg-sky-wash', to }: Props) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="tabular mt-3 font-display text-3xl font-semibold text-ink">{value ?? '–'}</p>
    </>
  )
  const cls = 'block rounded-2xl border border-line bg-surface p-4 sm:p-5'
  return to ? (
    <Link to={to} className={`${cls} transition-colors hover:border-brand-sky/60`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
