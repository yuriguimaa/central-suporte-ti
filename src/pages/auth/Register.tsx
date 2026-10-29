import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { friendlyError, isValidEmail, maskPhone, validatePassword, validatePhone } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import { AuthLayout } from './AuthLayout'

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'confirm', string>>

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'phone' ? maskPhone(e.target.value) : e.target.value }))

  const validate = (): Errors => {
    const e: Errors = {}
    const name = form.name.trim().replace(/\s+/g, ' ')
    if (name.length < 3 || !name.includes(' ')) e.name = 'Informe seu nome completo (nome e sobrenome).'
    else if (name.length > 120) e.name = 'O nome pode ter no máximo 120 caracteres.'
    if (!isValidEmail(form.email)) e.email = 'Informe um e-mail válido, ex.: nome@empresa.com.br.'
    const phoneErr = validatePhone(form.phone)
    if (phoneErr) e.phone = phoneErr
    const pwdErr = validatePassword(form.password)
    if (pwdErr) e.password = pwdErr
    if (form.confirm !== form.password) e.confirm = 'As senhas não conferem.'
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    setFormError(null)
    if (Object.keys(e).length) return

    setLoading(true)
    const email = form.email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        // O perfil é criado no banco por trigger, sempre com o papel "Usuário".
        data: { full_name: form.name.trim().replace(/\s+/g, ' '), phone: form.phone || null },
        emailRedirectTo: `${window.location.origin}/entrar?confirmado=1`,
      },
    })
    setLoading(false)

    if (error) return setFormError(friendlyError(error))
    // Com "Confirm email" ligado, o Supabase devolve um usuário sem identidades se o e-mail já existir.
    if (data.user && data.user.identities?.length === 0) {
      return setFormError('Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.')
    }
    if (data.session) {
      navigate('/painel', { replace: true })
    } else {
      setSentTo(email)
    }
  }

  if (sentTo) {
    return (
      <AuthLayout title="Confirme seu e-mail">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <MailCheck className="size-8 text-brand-sky" aria-hidden />
          <p className="mt-4 text-ink">
            Enviamos um link de confirmação para <strong>{sentTo}</strong>.
          </p>
          <p className="mt-2 text-sm text-muted">
            Abra o e-mail e clique no link para ativar sua conta. Se não encontrar, confira a caixa de spam.
          </p>
          <Link to="/entrar" className="mt-5 inline-block text-sm font-medium text-brand-sky hover:underline">
            Ir para o login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para abrir e acompanhar seus chamados."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/entrar" className="font-medium text-brand-sky hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <Alert>{formError}</Alert>}
        <Input label="Nome completo" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} maxLength={120} autoFocus />
        <Input label="E-mail" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input
          label="Telefone"
          optional
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 91234-5678"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint="Mínimo de 8 caracteres, com letras e números."
          />
          <Input label="Confirmar senha" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
