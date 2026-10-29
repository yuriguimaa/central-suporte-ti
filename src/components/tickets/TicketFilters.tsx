import { Search, X } from 'lucide-react'
import { CATEGORY, CATEGORY_ORDER, PRIORITY, PRIORITY_ORDER, STATUS, STATUS_ORDER } from '@/lib/constants'
import { controlClass } from '@/components/ui/Field'
import type { TicketQuery } from '@/lib/tickets'
import type { Profile } from '@/types/database'

interface Props {
  value: TicketQuery
  onChange: (next: TicketQuery) => void
  users?: Pick<Profile, 'id' | 'full_name' | 'email'>[]
  hideStatus?: boolean
}

export function TicketFilters({ value, onChange, users, hideStatus }: Props) {
  const set = (patch: Partial<TicketQuery>) => onChange({ ...value, ...patch, page: 1 })
  const hasFilters = !!(value.search || value.status || value.priority || value.category || value.userId || value.sort === 'asc')
  const sel = `${controlClass} h-10 cursor-pointer text-sm`

  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 xl:flex-row xl:items-center">
      <label className="relative block flex-1 xl:max-w-xs">
        <span className="sr-only">Buscar por número ou título</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          name="busca"
          autoComplete="off"
          value={value.search ?? ''}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Buscar protocolo ou título…"
          className={`${controlClass} h-10 pl-9 text-sm`}
        />
      </label>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {!hideStatus && (
          <select aria-label="Filtrar por status" className={`${sel} sm:w-44`} value={value.status ?? ''} onChange={(e) => set({ status: e.target.value as TicketQuery['status'] })}>
            <option value="">Todos os status</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS[s].label}</option>
            ))}
          </select>
        )}
        <select aria-label="Filtrar por prioridade" className={`${sel} sm:w-40`} value={value.priority ?? ''} onChange={(e) => set({ priority: e.target.value as TicketQuery['priority'] })}>
          <option value="">Todas as prioridades</option>
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>{PRIORITY[p].label}</option>
          ))}
        </select>
        <select aria-label="Filtrar por categoria" className={`${sel} sm:w-48`} value={value.category ?? ''} onChange={(e) => set({ category: e.target.value as TicketQuery['category'] })}>
          <option value="">Todas as categorias</option>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>{CATEGORY[c]}</option>
          ))}
        </select>
        {users && (
          <select aria-label="Filtrar por usuário" className={`${sel} sm:w-48`} value={value.userId ?? ''} onChange={(e) => set({ userId: e.target.value || undefined })}>
            <option value="">Todos os usuários</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </select>
        )}
        <select aria-label="Ordenar por data" className={`${sel} sm:w-40`} value={value.sort ?? 'desc'} onChange={(e) => set({ sort: e.target.value as 'asc' | 'desc' })}>
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => onChange({ page: 1, status: hideStatus ? value.status : '' })}
            className="flex h-10 items-center justify-center gap-1 rounded-lg px-3 text-sm text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4" /> Limpar
          </button>
        )}
      </div>
    </div>
  )
}
