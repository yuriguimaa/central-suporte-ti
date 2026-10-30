import type { TicketCategory, TicketPriority, TicketStatus } from '@/types/database'

export const STATUS: Record<TicketStatus, { label: string; dot: string; badge: string }> = {
  aberto: { label: 'Aberto', dot: 'bg-blue-600 dark:bg-blue-400', badge: 'bg-blue-50 text-blue-900 dark:bg-blue-400/10 dark:text-blue-200' },
  em_andamento: { label: 'Em andamento', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-900 dark:bg-amber-400/10 dark:text-amber-200' },
  aguardando_usuario: { label: 'Aguardando usuário', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-900 dark:bg-orange-500/10 dark:text-orange-200' },
  resolvido: { label: 'Resolvido', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200' },
  encerrado: { label: 'Encerrado', dot: 'bg-slate-800 dark:bg-slate-300', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-400/10 dark:text-slate-200' },
}

export const STATUS_ORDER: TicketStatus[] = ['aberto', 'em_andamento', 'aguardando_usuario', 'resolvido', 'encerrado']

export const PRIORITY: Record<TicketPriority, { label: string; badge: string; weight: number }> = {
  baixa: { label: 'Baixa', badge: 'text-slate-600 dark:text-slate-300', weight: 1 },
  media: { label: 'Média', badge: 'text-slate-700 dark:text-slate-200', weight: 2 },
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
