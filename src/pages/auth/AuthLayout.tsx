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
        <div className="mt-auto max-w-sm">
          <p className="font-display text-2xl leading-snug font-semibold">
            Cada chamado tem protocolo, histórico e conversa direta com o técnico.
          </p>
          <p className="mt-3 text-sm text-sky-100/70">{brand.tagline}</p>
        </div>
        {/* motivo de picote, ecoando a marca */}
        <div className="pointer-events-none absolute top-1/3 -right-16 h-64 w-64 rounded-full border-2 border-dashed border-white/10" aria-hidden />
        <div className="pointer-events-none absolute top-[38%] -right-6 h-40 w-40 rounded-full bg-brand-sky/20 blur-2xl" aria-hidden />
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
