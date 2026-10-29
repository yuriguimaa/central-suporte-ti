import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AppNotification } from '@/types/database'

/** Notificações do usuário logado, com atualização em tempo real. */
export function useNotifications(userId: string | undefined, onNew?: (n: AppNotification) => void) {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    setItems((data as AppNotification[]) ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    load()
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as AppNotification
          setItems((prev) => [n, ...prev.filter((p) => p.id !== n.id)].slice(0, 30))
          onNew?.(n)
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, load])

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase.rpc('mark_all_notifications_read')
  }

  return { items, loading, unread: items.filter((n) => !n.is_read).length, markRead, markAllRead, reload: load }
}
