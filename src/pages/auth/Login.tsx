import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { friendlyError, isValidEmail } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import { AuthLayout } from './AuthLayout'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const n = sessionStorage.getItem('auth-notice')
    if (n) {
      setFormError(n)
      sessionStorage.removeItem('auth-notice')
    }
    if (new URLSearchParams(window.location.search).get('confirmado')) {
      setNotice('E-mail confirmado. Entre com sua senha.')
    }
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!isValidEmail(email)) next.email = 'Informe um e-mail válido.'
    if (!password) next.password = 'Informe sua senha.'
    setErrors(next)
    setFormError(null)
    if (Object.keys(next).length) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) setFormError(friendlyError(error))
    // Em caso de sucesso, o GuestRoute redireciona conforme o perfil.
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse seus chamados e acompanhe o atendimento."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-brand-sky hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {notice && <Alert tone="success">{notice}</Alert>}
        {formError && <Alert>{formError}</Alert>}
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoFocus
        />
        <div>
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <div className="mt-2 text-right">
            <Link to="/esqueci-senha" className="text-sm font-medium text-brand-sky hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
