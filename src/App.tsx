import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  BarChart3, CheckCircle2, CircleDot, FilePlus2, Hourglass, Inbox, LayoutDashboard, List, MessageCircleQuestion,
  Settings, UserRound, Users,
} from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { GuestRoute, ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppShell, type NavGroup } from '@/components/layout/AppShell'
import { FullPageSpinner, Spinner } from '@/components/ui/Feedback'
import Landing from '@/pages/Landing'
import NotFound from '@/pages/NotFound'
import SetupRequired from '@/pages/SetupRequired'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

const NewTicket = lazy(() => import('@/pages/user/NewTicket'))
const MyTickets = lazy(() => import('@/pages/user/MyTickets'))
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'))
const TicketPage = lazy(() => import('@/pages/TicketPage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminTickets = lazy(() => import('@/pages/admin/AdminTickets'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminUserDetail = lazy(() => import('@/pages/admin/AdminUserDetail'))
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))

const userNav: NavGroup[] = [
  {
    items: [
      { to: '/painel/chamados', label: 'Meus chamados', icon: List },
      { to: '/painel/novo', label: 'Abrir chamado', icon: FilePlus2 },
      { to: '/painel/perfil', label: 'Meu perfil', icon: UserRound },
    ],
  },
]

const adminNav: NavGroup[] = [
  {
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Chamados',
    items: [
      { to: '/admin/chamados', label: 'Todos os chamados', icon: Inbox },
      { to: '/admin/chamados?status=aberto', label: 'Chamados abertos', icon: CircleDot },
      { to: '/admin/chamados?status=em_andamento', label: 'Em andamento', icon: Hourglass },
      { to: '/admin/chamados?status=aguardando_usuario', label: 'Aguardando usuário', icon: MessageCircleQuestion },
      { to: '/admin/chamados?status=resolvido', label: 'Resolvidos', icon: CheckCircle2 },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/admin/usuarios', label: 'Usuários cadastrados', icon: Users },
      { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
      { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

const page = (el: React.ReactNode) => <Suspense fallback={<Spinner />}>{el}</Suspense>

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <ThemeProvider>
        <SetupRequired />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<FullPageSpinner />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<Landing />} />
                </Route>

                <Route element={<GuestRoute />}>
                  <Route path="/entrar" element={<Login />} />
                  <Route path="/cadastro" element={<Register />} />
                  <Route path="/esqueci-senha" element={<ForgotPassword />} />
                </Route>
                <Route path="/redefinir-senha" element={<ResetPassword />} />

                <Route element={<ProtectedRoute role="user" />}>
                  <Route path="/painel" element={<AppShell nav={userNav} home="/painel/chamados" areaLabel="Área do usuário" />}>
                    {/* O dashboard é exclusivo do administrador; o usuário começa em "Meus chamados". */}
                    <Route index element={<Navigate to="/painel/chamados" replace />} />
                    <Route path="novo" element={page(<NewTicket />)} />
                    <Route path="chamados" element={page(<MyTickets />)} />
                    <Route path="chamados/:number" element={page(<TicketPage />)} />
                    <Route path="perfil" element={page(<ProfilePage />)} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute role="admin" />}>
                  <Route path="/admin" element={<AppShell nav={adminNav} home="/admin" areaLabel="Painel administrativo" />}>
                    <Route index element={page(<AdminDashboard />)} />
                    <Route path="chamados" element={page(<AdminTickets />)} />
                    <Route path="chamados/:number" element={page(<TicketPage admin />)} />
                    <Route path="usuarios" element={page(<AdminUsers />)} />
                    <Route path="usuarios/:id" element={page(<AdminUserDetail />)} />
                    <Route path="relatorios" element={page(<AdminReports />)} />
                    <Route path="configuracoes" element={page(<AdminSettings />)} />
                  </Route>
                </Route>

                <Route element={<PublicLayout />}>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
