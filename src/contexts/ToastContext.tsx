import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
interface Toast { id: number; kind: ToastKind; text: string }

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-3), { id, kind, text }])
    setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4500)
  }, [])

  const icon = { success: CheckCircle2, error: AlertCircle, info: Info }
  const tone = {
    success: 'border-emerald-300 dark:border-emerald-500/40',
    error: 'border-red-300 dark:border-red-500/40',
    info: 'border-sky-300 dark:border-sky-500/40',
  }
  const iconTone = { success: 'text-emerald-600', error: 'text-red-600', info: 'text-brand-sky' }

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="no-print pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {toasts.map((t) => {
          const Icon = icon[t.kind]
          return (
            <div
              key={t.id}
              role={t.kind === 'error' ? 'alert' : 'status'}
              className={`animate-fade-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lg ${tone[t.kind]}`}
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${iconTone[t.kind]}`} aria-hidden />
              <p className="flex-1 text-sm text-ink">{t.text}</p>
              <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Fechar aviso">
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
