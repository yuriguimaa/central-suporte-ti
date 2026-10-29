import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageSpinner } from '@/components/ui/Feedback'

/** Exige login. Com role="admin", exige também o perfil administrador. */
export function ProtectedRoute({ role }: { role?: 'admin' | 'user' }) {
  const { session, profile, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session || !profile) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname + location.search }} />
  }
  if (role === 'admin' && !isAdmin) return <Navigate to="/painel" replace />
  if (role === 'user' && isAdmin) {
    // O administrador usa o painel administrativo; links de usuário são redirecionados.
    const m = location.pathname.match(/^\/painel\/chamados\/(\d+)/)
    return <Navigate to={m ? `/admin/chamados/${m[1]}` : '/admin'} replace />
  }
  return <Outlet />
}

/** Páginas de login/cadastro: quem já está logado vai direto para o painel. */
export function GuestRoute() {
  const { session, profile, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (session && profile) {
    const from = (location.state as { from?: string } | null)?.from
    const target = from && (isAdmin ? from.startsWith('/admin') : from.startsWith('/painel')) ? from : isAdmin ? '/admin' : '/painel'
    return <Navigate to={target} replace />
  }
  return <Outlet />
}
