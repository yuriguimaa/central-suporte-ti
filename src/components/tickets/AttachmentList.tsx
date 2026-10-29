import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { formatBytes } from '@/lib/format'
import { openAttachment } from '@/lib/tickets'
import { friendlyError } from '@/lib/validation'
import { FileIcon } from '@/components/ui/FilePicker'
import type { TicketAttachment } from '@/types/database'

export function AttachmentList({ items, tone = 'default' }: { items: TicketAttachment[]; tone?: 'default' | 'inverted' }) {
  const toast = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  if (!items.length) return null

  const open = async (a: TicketAttachment) => {
    // Abre a aba imediatamente (evita bloqueio de pop-up) e depois aponta para a URL assinada.
    const win = window.open('', '_blank')
    setBusy(a.id)
    try {
      const url = await openAttachment(a)
      if (win) {
        win.opener = null
        win.location.href = url
      } else window.location.href = url
    } catch (e) {
      win?.close()
      toast('error', friendlyError(e))
    } finally {
      setBusy(null)
    }
  }

  const cls =
    tone === 'inverted'
      ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
      : 'border-line bg-surface text-ink hover:border-brand-sky'

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((a) => (
        <li key={a.id}>
          <button
            onClick={() => open(a)}
            className={`flex max-w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${cls}`}
            title={`Abrir ${a.file_name}`}
          >
            {busy === a.id ? <Loader2 className="size-3.5 animate-spin" /> : <FileIcon type={a.file_type} className="size-3.5 shrink-0" />}
            <span className="max-w-48 truncate">{a.file_name}</span>
            <span className="opacity-70">{formatBytes(a.file_size)}</span>
            <Download className="size-3.5 opacity-60" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  )
}
