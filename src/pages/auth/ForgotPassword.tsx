import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { friendlyError, isValidEmail } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import { AuthLayout } from './AuthLayout'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) return setError('Informe um e-mail válido.')
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    setLoading(false)
    if (error) return setError(friendlyError(error))
    setSent(true)
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      footer={
        <Link to="/entrar" className="font-medium text-brand-sky hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <Alert tone="success">
          Se existir uma conta com <strong>{email}</strong>, você receberá um e-mail com o link de recuperação em alguns minutos.
        </Alert>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <Input label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Enviar link de recuperação
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
