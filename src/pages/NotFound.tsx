import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="tabular font-display text-6xl font-semibold text-navy-900 dark:text-brand-sky">404</p>
      <h1 className="mt-4 text-xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-muted">O endereço pode ter mudado ou não existe mais.</p>
      <ButtonLink to="/" className="mt-6">Voltar ao início</ButtonLink>
    </div>
  )
}
