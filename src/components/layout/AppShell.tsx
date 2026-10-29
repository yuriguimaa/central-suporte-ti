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
      <div className="flex h-16 items-center justify-between px-5">
        <Link to={home} aria-label="Início do painel">
          <Logo light />
        </Link>
        <button className="text-slate-300 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X className="size-5" />
        </button>
      </div>
      <p className="mx-5 mb-2 border-t border-dashed border-white/15 pt-3 text-xs text-slate-400">{areaLabel}</p>
      <nav className="flex-1 space-y-5 overflow-y-auto py-3 pl-3" aria-label="Menu principal">
        {nav.map((g, gi) => (
          <div key={gi}>
            {g.title && <p className="wide px-3 pb-1.5 font-display text-[11px] font-semibold tracking-wide text-slate-400">{g.title}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.to, item.end)
                return (
                  <li key={item.to} className="relative">
                    {active && (
                      <>
                        {/* cantos invertidos: a aba ativa se encaixa na área de conteúdo */}
                        <span className="pointer-events-none absolute -top-3 right-0 size-3 bg-[radial-gradient(circle_at_0_0,transparent_11.5px,var(--bg-app)_12px)] max-lg:hidden" aria-hidden />
                        <span className="pointer-events-none absolute right-0 -bottom-3 size-3 bg-[radial-gradient(circle_at_0_100%,transparent_11.5px,var(--bg-app)_12px)] max-lg:hidden" aria-hidden />
                      </>
                    )}
                    <NavLink
                      to={item.to}
                      end={item.end}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-l-xl py-2.5 pr-4 pl-3 text-sm transition-colors max-lg:mr-3 max-lg:rounded-xl ${
                        active
                          ? 'bg-bg-app font-semibold text-ink max-lg:bg-white/10 max-lg:text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`size-[18px] ${active ? 'text-navy-700 dark:text-primary max-lg:text-brand-sky-light' : 'text-slate-400 group-hover:text-slate-200'}`}
                        aria-hidden
                      />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => setConfirmOut(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-[18px] text-slate-400" aria-hidden />
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

      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-900 dark:bg-[#0a1c44] lg:block">{sidebar}</aside>

      {open && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} aria-hidden />
          <aside className="animate-fade-in absolute inset-y-0 left-0 w-72 max-w-[85vw] overscroll-contain bg-navy-900 shadow-2xl dark:bg-[#0a1c44]">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button className="-ml-1 flex size-9 items-center justify-center rounded-lg text-ink lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <div className="flex-1" />
          <ThemeToggle />
          <NotificationBell />
          <Link
            to={home === '/admin' ? '/admin/configuracoes' : '/painel/perfil'}
            className="ml-1 flex items-center gap-2.5 rounded-lg py-1 pr-1 pl-1 hover:bg-surface-2 sm:pr-3"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white dark:bg-primary dark:text-primary-fg">
              {initials(profile?.full_name ?? '?')}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-40 truncate text-sm font-medium text-ink">{profile?.full_name}</span>
              <span className="block text-xs text-muted">{profile?.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
            </span>
          </Link>
        </header>

        <main id="conteudo" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
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
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
