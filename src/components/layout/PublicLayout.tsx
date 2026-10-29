import { Link, Outlet } from 'react-router-dom'
import { brand } from '@/config/brand'
import { useAuth } from '@/contexts/AuthContext'
import { ButtonLink } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function PublicHeader() {
  const { session, isAdmin } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" aria-label={`${brand.name}, página inicial`}>
          <span className="sm:hidden"><Logo compact /></span>
          <span className="hidden sm:block"><Logo /></span>
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {session ? (
            <ButtonLink to={isAdmin ? '/admin' : '/painel'} size="sm">
              Ir para o painel
            </ButtonLink>
          ) : (
            <>
              <ButtonLink to="/entrar" variant="ghost" size="sm">
                Entrar
              </ButtonLink>
              <ButtonLink to="/cadastro" size="sm">
                Criar conta
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            Suporte técnico de informática: computadores, rede, impressoras, sistemas e acessos.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-white">Atendimento</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-white" to="/painel/novo">Abrir chamado</Link></li>
            <li><Link className="hover:text-white" to="/painel/chamados">Meus chamados</Link></li>
            <li><Link className="hover:text-white" to="/esqueci-senha">Recuperar senha</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium text-white">Conta</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-white" to="/entrar">Entrar</Link></li>
            <li><Link className="hover:text-white" to="/cadastro">Criar conta</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} {brand.name}. Seus dados são protegidos e acessíveis somente por você e pela equipe de suporte.
        </p>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
