import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  // id do usuário cujo perfil já foi carregado (evita redirecionar antes da hora)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null)
      setLoadedFor(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (data && !data.is_active) {
      // Conta desativada pelo administrador: encerra a sessão.
      await supabase.auth.signOut()
      setProfile(null)
      sessionStorage.setItem('auth-notice', 'Sua conta está desativada. Fale com o suporte.')
      return
    }
    setProfile(data as Profile | null)
    setLoadedFor(userId)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await loadProfile(data.session?.user.id)
      if (mounted) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        // Executa fora do callback para evitar bloqueio interno do supabase-js.
        setTimeout(() => {
          loadProfile(next?.user.id).finally(() => setLoading(false))
        }, 0)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const refreshProfile = useCallback(() => loadProfile(session?.user.id), [loadProfile, session])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading: loading || (!!session && loadedFor !== session.user.id),
        isAdmin: profile?.role === 'admin' && profile.is_active,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
