import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { friendlyError, validatePassword } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert, Spinner } from '@/components/ui/Feedback'
import { AuthLayout } from './AuthLayout'

/** Página aberta pelo link do e-mail de recuperação. */
export default function ResetPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [ready, setReady] = useState<'checking' | 'ok' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) setReady('ok')
    })
    // Dá tempo ao supabase-js de trocar o código do link pela sessão.
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      setReady((r) => (r === 'ok' || data.session ? 'ok' : 'invalid'))
    }, 1500)
    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(t)
    }
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    const pErr = validatePassword(password)
    if (pErr) next.password = pErr
    if (confirm !== password) next.confirm = 'As senhas não conferem.'
    setErrors(next)
    if (Object.keys(next).length) return
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return setFormError(friendlyError(error))
    toast('success', 'Senha alterada. Você já está conectado.')
    navigate('/painel', { replace: true })
  }

  return (
    <AuthLayout title="Criar nova senha">
      {ready === 'checking' && <Spinner label="Validando link…" />}
      {ready === 'invalid' && (
        <div className="space-y-4">
          <Alert>Este link de recuperação é inválido ou expirou.</Alert>
          <Link to="/esqueci-senha" className="text-sm font-medium text-brand-sky hover:underline">
            Solicitar um novo link
          </Link>
        </div>
      )}
      {ready === 'ok' && (
        <form onSubmit={submit} noValidate className="space-y-5">
          {formError && <Alert>{formError}</Alert>}
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint="Mínimo de 8 caracteres, com letras e números."
            autoFocus
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Salvar nova senha
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
