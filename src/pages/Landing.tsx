import {
  Cable, ClipboardList, Cpu, CircleEllipsis, KeyRound, Mail, MessagesSquare, MonitorSmartphone, Package,
  Printer, Search, Shapes, UserPlus, Wifi, type LucideIcon,
} from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { brand } from '@/config/brand'

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: UserPlus, title: 'Crie sua conta', text: 'Cadastre-se com nome e e-mail. Leva menos de um minuto.' },
  { icon: ClipboardList, title: 'Abra um chamado', text: 'Descreva o problema, escolha a categoria e anexe prints ou PDFs.' },
  { icon: MessagesSquare, title: 'Aguarde o atendimento', text: 'O técnico recebe o chamado na hora e responde pela própria plataforma.' },
  { icon: Search, title: 'Acompanhe a solução', text: 'Veja o status, converse com o suporte e consulte o histórico completo.' },
]

const areas: { icon: LucideIcon; label: string }[] = [
  { icon: MonitorSmartphone, label: 'Computadores e notebooks' },
  { icon: Printer, label: 'Impressoras' },
  { icon: Cable, label: 'Internet e rede' },
  { icon: Wifi, label: 'Wi-Fi' },
  { icon: Shapes, label: 'Sistemas e programas' },
  { icon: Mail, label: 'E-mail' },
  { icon: Package, label: 'Instalação de software' },
  { icon: Cpu, label: 'Hardware' },
  { icon: KeyRound, label: 'Acesso e senhas' },
  { icon: CircleEllipsis, label: 'Outros' },
]

/** O elemento de destaque da página: um chamado real, com picote e trilha de status. */
function TicketStub() {
  const track = [
    { label: 'Aberto', time: '09:12' },
    { label: 'Em andamento', time: '09:20' },
    { label: 'Resolvido', time: '10:05' },
  ]
  return (
    <div className="relative mx-auto w-full max-w-md select-none" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-sky-wash dark:bg-navy-800/40" />
      <div className="relative overflow-hidden rounded-2xl bg-navy-900 text-white shadow-[0_24px_60px_-20px_rgba(11,37,69,0.55)]">
        <div className="flex flex-wrap items-start justify-between gap-2 px-6 pt-6">
          <div>
            <p className="text-xs text-sky-200/80">Protocolo</p>
            <p className="tabular font-display text-3xl font-semibold tracking-tight">#000125</p>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-sky-100">Computadores e notebooks</span>
        </div>
        <p className="px-6 pt-4 pr-32 font-display text-lg">Computador não liga</p>
        <p className="px-6 pt-1 text-sm text-sky-100/75">
          Desde hoje cedo o PC da recepção não dá sinal. A luz do botão pisca e apaga.
        </p>

        {/* picote */}
        <div className="relative my-6 flex items-center">
          <span className="absolute -left-3 size-6 rounded-full bg-sky-wash dark:bg-[#0d2442]" />
          <span className="mx-5 h-px flex-1 border-t-2 border-dashed border-white/20" />
          <span className="absolute -right-3 size-6 rounded-full bg-sky-wash dark:bg-[#0d2442]" />
        </div>

        <div className="px-6 pb-6">
          <div className="relative mb-3 h-1 rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-brand-sky-light"
              style={{ animation: 'track-fill 1.6s cubic-bezier(.6,.05,.3,1) .4s both' }}
            />
          </div>
          <ol className="grid grid-cols-3 text-xs">
            {track.map((t, i) => (
              <li key={t.label} className={i === 1 ? 'text-center' : i === 2 ? 'text-right' : ''}>
                <span className="block font-medium text-white">{t.label}</span>
                <span className="tabular text-sky-100/60">{t.time}</span>
              </li>
            ))}
          </ol>
        </div>

        <span
          className="absolute top-[6.4rem] right-6 rounded-md border-2 border-emerald-300 px-2 py-0.5 font-display text-sm font-semibold text-emerald-300"
          style={{ animation: 'stamp .5s ease-out 2s both' }}
        >
          Resolvido
        </span>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-28">
          <div>
            <h1 className="max-w-xl text-[2.25rem] font-semibold leading-[1.08] text-navy-900 sm:text-5xl dark:text-white">
              Bem-vindo à {brand.name}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Precisa de ajuda com seu computador, sistema ou equipamento? Abra um chamado e acompanhe seu atendimento de
              forma simples e rápida.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/painel/novo" size="lg">
                Abrir chamado
              </ButtonLink>
              <ButtonLink to="/painel/chamados" size="lg" variant="secondary">
                Acompanhar meus chamados
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm text-muted">Você recebe um número de protocolo assim que o chamado é aberto.</p>
          </div>
          <TicketStub />
        </div>
      </section>

      <section className="border-y border-line bg-surface-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">Como funciona</h2>
          <p className="mt-2 max-w-xl text-muted">Do primeiro contato até a solução, tudo fica registrado no seu chamado.</p>
          <ol className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="tabular flex size-9 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white dark:bg-brand-sky">
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-line lg:block" aria-hidden />}
                </div>
                <h3 className="mt-4 flex items-center gap-2 text-base font-semibold">
                  <s.icon className="size-4 text-brand-sky" aria-hidden />
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">O que atendemos</h2>
            <p className="mt-2 text-muted">
              Escolha a categoria ao abrir o chamado para que ele chegue ao técnico já organizado.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {areas.map((a) => (
              <li key={a.label} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                <a.icon className="size-[18px] shrink-0 text-navy-700 dark:text-brand-sky-light" aria-hidden />
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy-900 dark:bg-navy-950">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">Algo parou de funcionar?</h2>
            <p className="mt-1 text-sky-100/80">Registre agora e acompanhe cada etapa do atendimento.</p>
          </div>
          <ButtonLink to="/cadastro" size="lg" variant="accent">
            Criar conta
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
