import { useEffect, useRef, useState } from 'react'
import { Camera, FileText, ImageIcon, Paperclip, X } from 'lucide-react'
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

/** Prints colados vêm todos como "image.png": dá um nome único e legível. */
function namePasted(f: File, i: number): File {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const ext = f.type === 'image/jpeg' ? 'jpg' : 'png'
  return new File([f], `print-${stamp}${i ? `-${i + 1}` : ''}.${ext}`, { type: f.type })
}

/** Miniatura de imagem (URL temporária liberada ao desmontar). */
function Thumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  return url ? <img src={url} alt="" className="size-8 shrink-0 rounded object-cover" /> : <ImageIcon className="size-3.5 shrink-0 text-muted" aria-hidden />
}

/**
 * Seleção de anexos com validação de tipo, tamanho e quantidade.
 * Aceita clique, arrastar e soltar, e colar um print com Ctrl+V em qualquer lugar da página.
 */
export function FilePicker({ files, onChange, onError, compact, disabled }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const add = (list: FileList | File[] | null) => {
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

  // Ctrl+V de um print: só intercepta quando a área de transferência tem imagem,
  // então colar texto na descrição continua funcionando normalmente.
  const addRef = useRef(add)
  addRef.current = add
  useEffect(() => {
    if (disabled) return
    const onPaste = (e: ClipboardEvent) => {
      const images = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'))
      if (!images.length) return
      e.preventDefault()
      addRef.current(images.map(namePasted))
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [disabled])

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
          {f.type.startsWith('image/') ? <Thumb file={f} /> : <FileIcon type={f.type} className="size-3.5 shrink-0 text-muted" />}
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
          title="Anexar PNG, JPG ou PDF (ou cole um print com Ctrl+V)"
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
        <span className="flex items-center gap-2 text-brand-sky" aria-hidden>
          <Camera className="size-5" />
          <Paperclip className="size-5" />
        </span>
        <span className="mt-2 text-sm font-medium text-ink">Anexe um print ou arquivo: clique aqui ou arraste</span>
        <span className="mt-1 text-sm text-ink">
          Tirou um print? Cole com <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd>+<kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs">V</kbd>
        </span>
        <span className="mt-1 text-xs text-muted">
          PNG, JPG ou PDF, até {formatBytes(ATTACHMENT_RULES.maxSize)} cada, no máximo {ATTACHMENT_RULES.maxFiles} arquivos
        </span>
      </button>
      {list}
    </div>
  )
}
