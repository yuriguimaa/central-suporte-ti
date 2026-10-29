import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const controlClass =
  'block w-full rounded-lg border border-line bg-surface px-3 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus:border-brand-sky focus:outline-none focus:ring-3 focus:ring-brand-sky/20 disabled:opacity-60 aria-[invalid=true]:border-red-500'

interface WrapProps {
  label?: string
  hint?: ReactNode
  error?: string | null
  optional?: boolean
  id: string
  children: ReactNode
  className?: string
}

function Wrap({ label, hint, error, optional, id, children, className = '' }: WrapProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink">
          {label}
          {optional && <span className="text-xs font-normal text-muted">opcional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type FieldExtras = { label?: string; hint?: ReactNode; error?: string | null; optional?: boolean; wrapClassName?: string }

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldExtras>(function Input(
  { label, hint, error, optional, wrapClassName, className = '', id, type, ...rest },
  ref,
) {
  const autoId = useId()
  const fid = id ?? autoId
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <Wrap label={label} hint={hint} error={error} optional={optional} id={fid} className={wrapClassName}>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={`${controlClass} h-11 ${isPassword ? 'pr-11' : ''} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </Wrap>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldExtras>(
  function Textarea({ label, hint, error, optional, wrapClassName, className = '', id, ...rest }, ref) {
    const autoId = useId()
    const fid = id ?? autoId
    return (
      <Wrap label={label} hint={hint} error={error} optional={optional} id={fid} className={wrapClassName}>
        <textarea
          ref={ref}
          id={fid}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={`${controlClass} min-h-28 py-2.5 leading-relaxed ${className}`}
          {...rest}
        />
      </Wrap>
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldExtras>(function Select(
  { label, hint, error, optional, wrapClassName, className = '', id, children, ...rest },
  ref,
) {
  const autoId = useId()
  const fid = id ?? autoId
  return (
    <Wrap label={label} hint={hint} error={error} optional={optional} id={fid} className={wrapClassName}>
      <select
        ref={ref}
        id={fid}
        aria-invalid={!!error || undefined}
        className={`${controlClass} h-11 cursor-pointer pr-8 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </Wrap>
  )
})
