export type UserRole = 'user' | 'admin'
export type TicketStatus = 'aberto' | 'em_andamento' | 'aguardando_usuario' | 'resolvido' | 'encerrado'
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente'
export type TicketCategory =
  | 'computadores'
  | 'impressoras'
  | 'internet_rede'
  | 'wifi'
  | 'sistemas'
  | 'email'
  | 'instalacao_software'
  | 'hardware'
  | 'acesso_senhas'
  | 'outros'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  ticket_number: number
  user_id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  solution: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  closed_at: string | null
}

export interface TicketWithOwner extends Ticket {
  owner?: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'> | null
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_name: string
  sender_role: UserRole
  message: string
  is_internal: boolean
  created_at: string
}

export interface TicketAttachment {
  id: string
  ticket_id: string
  message_id: string | null
  uploaded_by: string
  storage_path: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
}

export interface TicketHistory {
  id: string
  ticket_id: string
  changed_by: string | null
  changed_by_name: string | null
  action: 'criado' | 'status' | 'reaberto' | 'prioridade' | 'categoria' | 'solucao' | string
  old_value: string | null
  new_value: string | null
  created_at: string
}

export interface AppNotification {
  id: string
  user_id: string
  ticket_id: string | null
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface AppSettings {
  id: number
  support_email: string | null
  support_phone: string | null
  business_hours: string | null
  email_notifications_enabled: boolean
  updated_at: string
}

export interface DashboardStats {
  total: number
  users: number
  by_status: Partial<Record<TicketStatus, number>>
  by_priority: Partial<Record<TicketPriority, number>>
  by_category: Partial<Record<TicketCategory, number>>
  by_month: { month: string; count: number }[]
  avg_resolution_hours: number | null
}
