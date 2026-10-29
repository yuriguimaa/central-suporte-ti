import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { brand } from '@/config/brand'
import { friendlyError, isValidEmail } from '@/lib/validation'
import { PageHeader } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { LogoMark } from '@/components/ui/Logo'
import ProfilePage from '@/pages/user/ProfilePage'
import type { AppSettings } from '@/types/database'

export default function AdminSettings() {
  const toast = useToast()
  const [tab, setTab] = useState<'sistema' | 'conta'>('sistema')
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('app_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => setSettings(data as AppSettings))
  }, [])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!settings) return
    if (settings.support_email && !isValidEmail(settings.support_email)) return toast('error', 'Informe um e-mail de suporte válido.')
    setSaving(true)
    const { error } = await supabase
      .from('app_settings')
      .update({
        support_email: settings.support_email || null,
        support_phone: settings.support_phone || null,
        business_hours: settings.business_hours || null,
        email_notifications_enabled: settings.email_notifications_enabled,
      })
      .eq('id', 1)
    setSaving(false)
    if (error) return toast('error', friendlyError(error))
    toast('success', 'Configurações salvas.')
  }

  const set = (k: keyof AppSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((s) => (s ? { ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } : s))

  return (
    <>
      <PageHeader title="Configurações" />
      <div className="mb-6 inline-flex rounded-lg border border-line bg-surface p-1 text-sm" role="tablist">
        {(['sistema', 'conta'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 ${tab === t ? 'bg-primary font-medium text-primary-fg' : 'text-muted hover:text-ink'}`}
          >
            {t === 'sistema' ? 'Plataforma' : 'Minha conta'}
          </button>
        ))}
      </div>

      {tab === 'conta' ? (
        <ProfilePage />
      ) : !settings ? (
        <Spinner />
      ) : (
        <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_20rem]">
          <Card>
            <CardHeader title="Contato do suporte" description="Informações usadas na plataforma e, no futuro, nos e-mails." />
            <form onSubmit={save} className="space-y-4 p-5">
              <Input label="E-mail de suporte" type="email" optional value={settings.support_email ?? ''} onChange={set('support_email')} />
              <Input label="Telefone / WhatsApp" optional value={settings.support_phone ?? ''} onChange={set('support_phone')} />
              <Input label="Horário de atendimento" optional value={settings.business_hours ?? ''} onChange={set('business_hours')} />
              <label className="flex items-start gap-3 rounded-lg border border-line p-3 text-sm">
                <input type="checkbox" className="mt-1 size-4 accent-[var(--sky)]" checked={settings.email_notifications_enabled} onChange={set('email_notifications_enabled')} />
                <span>
                  <span className="font-medium text-ink">Notificações por e-mail</span>
                  <span className="mt-0.5 block text-muted">
                    Deixa a plataforma pronta para enviar e-mails. Exige configurar o envio no Supabase (veja docs/NOTIFICACOES-EMAIL.md).
                  </span>
                </span>
              </label>
              <Button type="submit" loading={saving}>Salvar configurações</Button>
            </form>
          </Card>
          <Card className="h-fit">
            <CardHeader title="Identidade" />
            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center gap-3">
                <LogoMark className="size-12" />
                <div>
                  <p className="font-display font-semibold">{brand.name}</p>
                  <p className="text-muted">{brand.shortName}</p>
                </div>
              </div>
              <p className="text-muted">
                Para mudar nome e logomarca, altere <code className="rounded bg-surface-2 px-1">VITE_APP_NAME</code> nas variáveis de ambiente
                e o arquivo <code className="rounded bg-surface-2 px-1">src/components/ui/Logo.tsx</code>.
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
