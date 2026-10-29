import type { TicketCategory, TicketPriority, TicketStatus } from '@/types/database'

export const STATUS: Record<TicketStatus, { label: string; dot: string; badge: string }> = {
  aberto: { label: 'Aberto', dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30' },
  em_andamento: { label: 'Em andamento', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30' },
  aguardando_usuario: { label: 'Aguardando usuário', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-800 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30' },
  resolvido: { label: 'Resolvido', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' },
  encerrado: { label: 'Encerrado', dot: 'bg-slate-800 dark:bg-slate-300', badge: 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/30' },
}

export const STATUS_ORDER: TicketStatus[] = ['aberto', 'em_andamento', 'aguardando_usuario', 'resolvido', 'encerrado']

export const PRIORITY: Record<TicketPriority, { label: string; badge: string; weight: number }> = {
  baixa: { label: 'Baixa', badge: 'text-slate-600 dark:text-slate-300', weight: 1 },
  media: { label: 'Média', badge: 'text-sky-700 dark:text-sky-300', weight: 2 },
  alta: { label: 'Alta', badge: 'text-orange-700 dark:text-orange-300', weight: 3 },
  urgente: { label: 'Urgente', badge: 'text-red-700 dark:text-red-300', weight: 4 },
}

export const PRIORITY_ORDER: TicketPriority[] = ['baixa', 'media', 'alta', 'urgente']

export const CATEGORY: Record<TicketCategory, string> = {
  computadores: 'Computadores e notebooks',
  impressoras: 'Impressoras',
  internet_rede: 'Internet e rede',
  wifi: 'Wi-Fi',
  sistemas: 'Sistemas e programas',
  email: 'E-mail',
  instalacao_software: 'Instalação de software',
  hardware: 'Hardware',
  acesso_senhas: 'Acesso e senhas',
  outros: 'Outros',
}

export const CATEGORY_ORDER = Object.keys(CATEGORY) as TicketCategory[]

export const ATTACHMENT_RULES = {
  maxSize: 10 * 1024 * 1024, // 10 MB (mesmo limite do bucket no Supabase)
  maxFiles: 5,
  types: ['image/png', 'image/jpeg', 'application/pdf'],
  accept: '.png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf',
}

export const PAGE_SIZE = 10
