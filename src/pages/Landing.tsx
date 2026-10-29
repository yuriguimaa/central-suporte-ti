import {
  Cable, CircleEllipsis, Cpu, KeyRound, Mail, MonitorSmartphone, Package, Printer, Shapes, Wifi, type LucideIcon,
} from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { brand } from '@/config/brand'

// As etapas seguem o próprio ciclo de vida do chamado, com as cores de status do sistema.
const steps = [
  { title: 'Crie sua conta', text: 'Nome, e-mail e senha. Leva menos de um minuto.', dot: 'bg-slate-400' },
  { title: 'Abra um chamado', text: 'Descreva o problema, escolha a categoria e anexe prints ou PDFs.', dot: 'bg-blue-600' },
  { title: 'Aguarde o atendimento', text: 'O técnico recebe na hora e responde pela própria plataforma.', dot: 'bg-amber-400' },
  { title: 'Acompanhe a solução', text: 'Status, conversa e histórico completo em um só lugar.', dot: 'bg-emerald-500' },
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

const track = [
  { label: 'Aberto', time: '09:12' },
  { label: 'Em andamento', time: '09:20' },
  { label: 'Resolvido', time: '10:05' },
]

/** Canhoto do chamado: protocolo, trilha de status e código de barras. */
function Stub() {
  return (
    <div className="relative flex flex-col p-7 sm:p-9 lg:pl-10" aria-hidden>
      <p className="text-sm text-sky-100/70">Protocolo</p>
      <p className="tabular wide font-display text-[2.6rem] leading-none font-bold text-white">#000125</p>
      <p className="mt-3 text-sm text-sky-100/80">Computador não liga</p>

      <ol className="mt-7 space-y-3.5">
        {track.map((t, i) => (
          <li
            key={t.label}
            className="flex items-center gap-3 text-sm"
            style={{ animation: `fade-in .35s ease-out ${0.5 + i * 0.45}s both` }}
          >
            <span className={`size-2.5 rounded-[2px] ${i === 2 ? 'bg-emerald-400' : 'bg-brand-sky-light'}`} />
            <span className="flex-1 text-white">{t.label}</span>
            <span className="tabular text-sky-100/60">{t.time}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto pt-10">
        <div className="barcode h-14 text-white/85" />
        <p className="tabular mt-2 text-xs tracking-[0.3em] text-sky-100/50">0 000125 291026</p>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <>
      <section className="bg-bg-app px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[28px] bg-navy-900 text-white shadow-[0_30px_80px_-30px_rgba(10,36,99,0.6)] lg:ticket-cut-v lg:grid lg:grid-cols-[68%_32%]">
            <div className="relative p-7 sm:p-10 lg:p-14">
              <h1 className="wide max-w-2xl text-[2.35rem] leading-[1.02] font-bold text-white sm:text-[3.4rem] lg:text-[4rem]">
                Bem-vindo à {brand.name}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-sky-100/85">
                Precisa de ajuda com seu computador, sistema ou equipamento? Abra um chamado e acompanhe seu atendimento
                de forma simples e rápida.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  to="/painel/novo"
                  size="lg"
                  variant="onDark"
                >
                  Abrir chamado
                </ButtonLink>
                <ButtonLink
                  to="/painel/chamados"
                  size="lg"
                  variant="onDarkOutline"
                >
                  Acompanhar meus chamados
                </ButtonLink>
              </div>
            </div>
            <div className="relative">
              <span className="perf-x absolute inset-x-7 top-0 text-white/25 lg:hidden" aria-hidden />
              <span className="perf-y absolute inset-y-8 left-0 hidden text-white/25 lg:block" aria-hidden />
              <Stub />
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-muted">
            Todo chamado recebe um número de protocolo na hora em que é aberto.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="wide text-2xl sm:text-3xl">Como funciona</h2>
        <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <span className="perf-x absolute top-[7px] right-0 left-0 hidden text-line lg:block" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className={`relative block size-4 rounded-[4px] ring-4 ring-bg ${s.dot}`} aria-hidden />
              <p className="tabular mt-5 font-display text-sm text-muted">Etapa {i + 1}</p>
              <h3 className="mt-1 text-lg">{s.title}</h3>
              <p className="mt-2 max-w-[16rem] text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:py-24">
          <div>
            <h2 className="wide text-2xl sm:text-3xl">O que atendemos</h2>
            <p className="mt-3 max-w-sm text-muted">
              Escolha a categoria ao abrir o chamado para que ele chegue ao técnico já organizado.
            </p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {areas.map((a) => (
              <li key={a.label} className="flex items-center gap-3 border-b border-dashed border-line py-3.5 text-[15px]">
                <a.icon className="size-[18px] shrink-0 text-navy-700 dark:text-primary" aria-hidden />
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-brand-sky-light dark:bg-[#12295c]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="wide text-2xl text-navy-950 dark:text-white">Algo parou de funcionar?</h2>
            <p className="mt-1 text-navy-900/80 dark:text-sky-100/80">Registre agora e acompanhe cada etapa do atendimento.</p>
          </div>
          <ButtonLink to="/cadastro" size="lg">
            Criar conta
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
