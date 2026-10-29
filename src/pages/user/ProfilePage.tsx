import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { formatDate } from '@/lib/format'
import { friendlyError, maskPhone, validatePassword, validatePhone } from '@/lib/validation'
import { PageHeader } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'

export default function ProfilePage() {
  const { profile, refreshProfile, isAdmin } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [saving, setSaving] = useState(false)

  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [pwdErr, setPwdErr] = useState<{ pwd?: string; pwd2?: string }>({})
  const [savingPwd, setSavingPwd] = useState(false)

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (isAdmin && name.trim().length < 3) next.name = 'Informe seu nome completo.'
    const pe = validatePhone(phone)
    if (pe) next.phone = pe
    setErrors(next)
    if (Object.keys(next).length || !profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      // O nome é definido no cadastro; só o administrador pode alterá-lo.
      .update(isAdmin ? { full_name: name.trim().replace(/\s+/g, ' '), phone: phone || null } : { phone: phone || null })
      .eq('id', profile.id)
    setSaving(false)
    if (error) return toast('error', friendlyError(error))
    await refreshProfile()
    toast('success', 'Dados atualizados.')
  }

  const savePassword = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof pwdErr = {}
    const pe = validatePassword(pwd)
    if (pe) next.pwd = pe
    if (pwd !== pwd2) next.pwd2 = 'As senhas não conferem.'
    setPwdErr(next)
    if (Object.keys(next).length) return
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: pwd })
    setSavingPwd(false)
    if (error) return toast('error', friendlyError(error))
    setPwd('')
    setPwd2('')
    toast('success', 'Senha alterada.')
  }

  if (!profile) return null

  return (
    <>
      <PageHeader title="Meu perfil" description={`Conta criada em ${formatDate(profile.created_at)}.`} />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Dados pessoais" />
          <form onSubmit={saveProfile} noValidate className="space-y-4 p-5">
            {isAdmin ? (
              <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} maxLength={120} />
            ) : (
              <Input label="Nome completo" value={profile.full_name} disabled hint="Para corrigir o nome, fale com o suporte." />
            )}
            <Input label="E-mail" value={profile.email} disabled hint="Para trocar o e-mail, fale com o suporte." />
            <Input label="Telefone" optional type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} error={errors.phone} />
            <Button type="submit" loading={saving}>Salvar dados</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Alterar senha" />
          <form onSubmit={savePassword} noValidate className="space-y-4 p-5">
            <Input label="Nova senha" type="password" autoComplete="new-password" value={pwd} onChange={(e) => setPwd(e.target.value)} error={pwdErr.pwd} hint="Mínimo de 8 caracteres, com letras e números." />
            <Input label="Confirmar nova senha" type="password" autoComplete="new-password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} error={pwdErr.pwd2} />
            <Button type="submit" variant="secondary" loading={savingPwd}>Alterar senha</Button>
          </form>
        </Card>
      </div>
    </>
  )
}
