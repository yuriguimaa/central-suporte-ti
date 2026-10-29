import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useNotifications } from '@/lib/useNotifications'
import { timeAgo } from '@/lib/format'

export function NotificationBell() {
  const { profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { items, unread, markRead, markAllRead, loading } = useNotifications(profile?.id, (n) => toast('info', n.title))
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
        aria-label={unread ? `Notificações, ${unread} não lidas` : 'Notificações'}
        aria-expanded={open}
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="tabular absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-sky px-1 text-[10px] font-semibold text-white ring-2 ring-surface">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-fade-in absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold">Notificações</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-brand-sky hover:underline">
                <CheckCheck className="size-3.5" /> Marcar todas como lidas
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {loading ? (
              <li className="px-4 py-8 text-center text-sm text-muted">Carregando…</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">Nenhuma notificação por enquanto.</li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      if (!n.is_read) markRead(n.id)
                      setOpen(false)
                      if (n.link) navigate(n.link)
                    }}
                    className={`flex w-full gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-surface-2 ${n.is_read ? '' : 'bg-sky-wash/60'}`}
                  >
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-brand-sky'}`} aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{n.title}</span>
                      <span className="mt-0.5 block text-sm text-muted">{n.message}</span>
                      <span className="mt-1 block text-xs text-muted">{timeAgo(n.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
