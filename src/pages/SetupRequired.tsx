import { Database } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

/** Exibida quando VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não foram configuradas. */
export default function SetupRequired() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-app p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-8">
        <Logo />
        <Database className="mt-8 size-8 text-brand-sky" aria-hidden />
        <h1 className="mt-3 text-xl font-semibold">Conecte o Supabase para começar</h1>
        <p className="mt-2 text-sm text-muted">
          As variáveis <code className="rounded bg-surface-2 px-1">VITE_SUPABASE_URL</code> e{' '}
          <code className="rounded bg-surface-2 px-1">VITE_SUPABASE_ANON_KEY</code> não foram definidas.
        </p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-ink">
          <li>Copie <code>.env.example</code> para <code>.env.local</code>.</li>
          <li>Preencha com a URL e a chave anon do seu projeto (Supabase › Project Settings › API).</li>
          <li>Reinicie o servidor com <code>npm run dev</code>.</li>
        </ol>
        <p className="mt-4 text-sm text-muted">Na Cloudflare, cadastre as mesmas variáveis em Settings › Build › Variables and secrets e publique novamente.</p>
      </div>
    </div>
  )
}
