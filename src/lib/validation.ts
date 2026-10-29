import { ATTACHMENT_RULES } from './constants'
import { formatBytes } from './format'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim())

export function validatePassword(v: string): string | null {
  if (v.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Use letras e números na senha.'
  return null
}

export function validatePhone(v: string): string | null {
  if (!v.trim()) return null
  const digits = v.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) return 'Informe um telefone com DDD, ex.: (11) 91234-5678.'
  return null
}

export function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Valida tipo, extensão e tamanho. Retorna a mensagem de erro ou null. */
export function validateAttachment(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const okExt = ['png', 'jpg', 'jpeg', 'pdf'].includes(ext)
  if (!okExt || !ATTACHMENT_RULES.types.includes(file.type)) {
    return `"${file.name}" não é PNG, JPG ou PDF.`
  }
  if (file.size > ATTACHMENT_RULES.maxSize) {
    return `"${file.name}" tem ${formatBytes(file.size)}. O limite é ${formatBytes(ATTACHMENT_RULES.maxSize)}.`
  }
  if (file.size === 0) return `"${file.name}" está vazio.`
  return null
}

/** Traduz mensagens de erro do Supabase para português. */
export function friendlyError(err: unknown): string {
  const msg = (err as { message?: string })?.message ?? String(err ?? '')
  const map: [RegExp, string][] = [
    [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
    [/email not confirmed/i, 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'],
    [/user already registered|already been registered/i, 'Já existe uma conta com este e-mail.'],
    [/password should be at least/i, 'A senha é muito curta.'],
    [/weak.?password|password is known to be weak/i, 'Essa senha é fraca ou conhecida. Escolha outra.'],
    [/rate limit|too many requests|security purposes/i, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'],
    [/new password should be different/i, 'A nova senha precisa ser diferente da atual.'],
    [/failed to fetch|network/i, 'Sem conexão com o servidor. Verifique sua internet.'],
    [/row-level security|permission denied|acesso negado/i, 'Você não tem permissão para esta ação.'],
    [/jwt expired|invalid jwt/i, 'Sua sessão expirou. Entre novamente.'],
    [/mime type|invalid_mime/i, 'Tipo de arquivo não permitido.'],
    [/exceeded the maximum allowed size|payload too large/i, 'Arquivo maior que o limite permitido.'],
  ]
  for (const [re, text] of map) if (re.test(msg)) return text
  return msg || 'Algo deu errado. Tente novamente.'
}

/** Move o foco para o primeiro campo com erro (após a renderização). */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
}
