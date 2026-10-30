import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { SecretButton } from '@/components/ui/SecretButton'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { NotificationBell } from './NotificationBell'
import { initials } from '@/lib/format'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface NavGroup {
  title?: string
  items: NavItem[]
}

export function AppShell({ nav, home, areaLabel }: { nav: NavGroup[]; home: string; areaLabel: string }) {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirmOut, setConfirmOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => setOpen(false), [location.pathname, location.search])

  const handleSignOut = async () => {
    await signOut()
    navigate('/entrar', { replace: true })
  }

  const isActive = (to: string, end?: boolean) => {
    const [path, query] = to.split('?')
    if (query) return location.pathname === path && location.search === `?${query}`
    if (end) return location.pathname === path && (path !== '/admin/chamados' || !location.search)
    return location.pathname.startsWith(path!) && (path !== '/admin/chamados' || !location.search)
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to={home} aria-label="Início do painel">
          <Logo />
        </Link>
        <button className="flex size-9 items-center justify-center rounded-lg text-muted hover:text-ink lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X className="size-5" />
        </button>
      </div>
      <p className="px-4 pb-1 text-xs text-muted">{areaLabel}</p>
      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-3" aria-label="Menu principal">
        {nav.map((g, gi) => (
          <div key={gi}>
            {g.title && <p className="px-2.5 pb-1.5 text-xs text-muted">{g.title}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.to, item.end)
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      aria-current={active ? 'page' : undefined}
                      className={`flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors ${
                        active ? 'bg-nav-active font-medium text-ink' : 'text-muted hover:bg-nav-active/60 hover:text-ink'
                      }`}
                    >
                      <item.icon className={`size-4 ${active ? 'text-primary' : ''}`} strokeWidth={1.75} aria-hidden />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="px-2 pb-3">
        <button
          onClick={() => setConfirmOut(true)}
          className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted hover:bg-nav-active/60 hover:text-ink"
        >
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          Sair
        </button>
        <div className="mt-2 flex justify-center">
          <SecretButton />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-bg-app">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>

      {/* Moldura em L: barra lateral e barra do topo no mesmo tom, sem linha entre elas. */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-60 bg-bg-app lg:block">{sidebar}</aside>

      {open && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setOpen(false)} aria-hidden />
          <aside className="animate-fade-in absolute inset-y-0 left-0 w-72 max-w-[85vw] overscroll-contain bg-bg-app shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-h-dvh flex-col lg:pl-60">
        <header className="no-print sticky top-0 z-30 flex h-12 shrink-0 items-center gap-1 bg-bg-app px-3 sm:px-4 lg:pr-4 lg:pl-0">
          <button className="flex size-9 items-center justify-center rounded-lg text-ink lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <Link to={home} className="lg:hidden" aria-label="Início do painel">
            <Logo compact />
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
          <NotificationBell />
          <Link
            to={home === '/admin' ? '/admin/configuracoes' : '/painel/perfil'}
            className="ml-1 flex items-center gap-2 rounded-lg py-1 pr-1 pl-1 hover:bg-nav-active/60 sm:pr-2.5"
            aria-label="Meu perfil"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-sky-wash text-[11px] font-semibold text-primary">
              {initials(profile?.full_name ?? '?')}
            </span>
            <span className="hidden max-w-40 truncate text-sm text-ink sm:block">{profile?.full_name}</span>
          </Link>
        </header>

        {/* A folha: inset de 8px à direita e embaixo, borda de 1px, cantos de 16px, sem sombra. */}
        <main
          id="conteudo"
          className="flex-1 bg-surface lg:mr-2 lg:mb-2 lg:rounded-2xl lg:border lg:border-line"
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmOut}
        title="Sair da sua conta?"
        confirmLabel="Sair"
        onConfirm={handleSignOut}
        onCancel={() => setConfirmOut(false)}
      >
        Você precisará entrar novamente para acompanhar seus chamados.
      </ConfirmDialog>
    </div>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
