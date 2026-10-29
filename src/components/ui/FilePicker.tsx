import { useRef, useState } from 'react'
import { FileText, ImageIcon, Paperclip, X } from 'lucide-react'
import { ATTACHMENT_RULES } from '@/lib/constants'
import { formatBytes } from '@/lib/format'
import { validateAttachment } from '@/lib/validation'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
  onError: (msg: string) => void
  compact?: boolean
  disabled?: boolean
}

export function FileIcon({ type, className = 'size-4' }: { type: string; className?: string }) {
  return type === 'application/pdf' ? <FileText className={className} aria-hidden /> : <ImageIcon className={className} aria-hidden />
}

/** Seleção de anexos com validação de tipo, tamanho e quantidade. */
export function FilePicker({ files, onChange, onError, compact, disabled }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const add = (list: FileList | null) => {
    if (!list) return
    const next = [...files]
    for (const f of Array.from(list)) {
      const err = validateAttachment(f)
      if (err) {
        onError(err)
        continue
      }
      if (next.length >= ATTACHMENT_RULES.maxFiles) {
        onError(`Envie no máximo ${ATTACHMENT_RULES.maxFiles} arquivos por vez.`)
        break
      }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f)
    }
    onChange(next)
    if (input.current) input.current.value = ''
  }

  const hidden = (
    <input
      ref={input}
      type="file"
      multiple
      accept={ATTACHMENT_RULES.accept}
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => add(e.target.files)}
      disabled={disabled}
    />
  )

  const list = files.length > 0 && (
    <ul className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-3'}`}>
      {files.map((f, i) => (
        <li key={`${f.name}-${i}`} className="flex max-w-full items-center gap-2 rounded-lg border border-line bg-surface-2 py-1 pr-1 pl-2.5 text-xs">
          <FileIcon type={f.type} className="size-3.5 shrink-0 text-muted" />
          <span className="max-w-44 truncate">{f.name}</span>
          <span className="text-muted">{formatBytes(f.size)}</span>
          <button
            type="button"
            onClick={() => onChange(files.filter((_, j) => j !== i))}
            className="flex size-6 items-center justify-center rounded text-muted hover:bg-surface hover:text-red-600"
            aria-label={`Remover ${f.name}`}
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  )

  if (compact) {
    return (
      <>
        {hidden}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={disabled}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-50"
          aria-label="Anexar arquivo"
          title="Anexar PNG, JPG ou PDF"
        >
          <Paperclip className="size-[18px]" />
        </button>
        {list}
      </>
    )
  }

  return (
    <div>
      {hidden}
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          add(e.dataTransfer.files)
        }}
        disabled={disabled}
        className={`flex w-full flex-col items-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          drag ? 'border-brand-sky bg-sky-wash' : 'border-line hover:border-brand-sky/60'
        }`}
      >
        <Paperclip className="size-5 text-brand-sky" aria-hidden />
        <span className="mt-2 text-sm font-medium text-ink">Clique para anexar ou arraste os arquivos aqui</span>
        <span className="mt-1 text-xs text-muted">
          PNG, JPG ou PDF, até {formatBytes(ATTACHMENT_RULES.maxSize)} cada, no máximo {ATTACHMENT_RULES.maxFiles} arquivos
        </span>
      </button>
      {list}
    </div>
  )
}
