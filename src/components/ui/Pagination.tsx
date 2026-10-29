import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  const btn = 'flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink hover:border-brand-sky disabled:opacity-40 disabled:pointer-events-none'
  return (
    <nav className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm" aria-label="Paginação">
      <p className="text-muted tabular">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button className={btn} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <ChevronLeft className="size-4" />
        </button>
        <span className="tabular min-w-16 text-center text-muted">
          {page} / {pages}
        </span>
        <button className={btn} onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Próxima página">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  )
}
