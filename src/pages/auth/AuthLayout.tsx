import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { brand } from '@/config/brand'

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-navy-900 p-10 text-white lg:flex lg:flex-col">
        <Link to="/" aria-label="Página inicial">
          <Logo light />
        </Link>
        <div className="mt-auto max-w-md">
          <p className="wide font-display text-[2rem] leading-[1.08] font-bold">
            Cada chamado tem protocolo, histórico e conversa direta com o técnico.
          </p>
          <p className="mt-4 text-sm text-sky-100/70">{brand.tagline}</p>
          <div className="barcode mt-10 h-10 w-48 text-white/30" aria-hidden />
        </div>
        {/* borda picotada: o painel é o canhoto da página */}
        <span className="perf-y absolute inset-y-0 right-0 text-white/20" aria-hidden />
      </aside>

      <main className="flex flex-col bg-bg px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> Início
          </Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
