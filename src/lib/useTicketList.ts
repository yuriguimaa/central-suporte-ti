import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchTickets, type TicketQuery } from './tickets'
import { friendlyError } from './validation'
import type { TicketWithOwner } from '@/types/database'
import { PAGE_SIZE } from './constants'

/** Lista de chamados com filtros sincronizados com a URL. */
export function useTicketList(fixed: Partial<TicketQuery> = {}) {
  const [params, setParams] = useSearchParams()
  const query: TicketQuery = {
    search: params.get('q') ?? '',
    status: (params.get('status') as TicketQuery['status']) ?? '',
    priority: (params.get('prioridade') as TicketQuery['priority']) ?? '',
    category: (params.get('categoria') as TicketQuery['category']) ?? '',
    userId: params.get('usuario') ?? undefined,
    sort: params.get('ordem') === 'asc' ? 'asc' : 'desc',
    page: Number(params.get('pagina') ?? 1) || 1,
    pageSize: PAGE_SIZE,
    ...fixed,
  }
  const [rows, setRows] = useState<TicketWithOwner[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setQuery = useCallback(
    (q: TicketQuery) => {
      const p = new URLSearchParams()
      if (q.search) p.set('q', q.search)
      if (q.status) p.set('status', q.status)
      if (q.priority) p.set('prioridade', q.priority)
      if (q.category) p.set('categoria', q.category)
      if (q.userId) p.set('usuario', q.userId)
      if (q.sort === 'asc') p.set('ordem', 'asc')
      if (q.page && q.page > 1) p.set('pagina', String(q.page))
      setParams(p, { replace: true })
    },
    [setParams],
  )

  const key = JSON.stringify(query)
  useEffect(() => {
    let cancel = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetchTickets(JSON.parse(key))
        if (!cancel) {
          setRows(res.rows)
          setTotal(res.total)
          setError(null)
        }
      } catch (e) {
        if (!cancel) setError(friendlyError(e))
      } finally {
        if (!cancel) setLoading(false)
      }
    }, query.search ? 300 : 0)
    return () => {
      cancel = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { query, setQuery, rows, total, loading, error }
}
