import { supabase, ATTACHMENTS_BUCKET } from '@/lib/supabase'
import type { TicketAttachment, TicketCategory, TicketPriority, TicketStatus, TicketWithOwner } from '@/types/database'

export interface TicketQuery {
  search?: string
  status?: TicketStatus | ''
  priority?: TicketPriority | ''
  category?: TicketCategory | ''
  userId?: string
  sort?: 'desc' | 'asc'
  page?: number
  pageSize?: number
  withOwner?: boolean
}

/** Busca paginada de chamados. O RLS garante que o usuário só receba os próprios. */
export async function fetchTickets(q: TicketQuery) {
  const pageSize = q.pageSize ?? 10
  const page = q.page ?? 1
  const select = q.withOwner ? '*, owner:profiles!tickets_user_id_fkey(id, full_name, email, phone)' : '*'
  let query = supabase.from('tickets').select(select, { count: 'exact' })

  if (q.status) query = query.eq('status', q.status)
  if (q.priority) query = query.eq('priority', q.priority)
  if (q.category) query = query.eq('category', q.category)
  if (q.userId) query = query.eq('user_id', q.userId)

  const s = q.search?.trim().replace(/^#/, '')
  if (s) {
    if (/^\d+$/.test(s)) query = query.eq('ticket_number', Number(s))
    else query = query.ilike('title', `%${s.replace(/[%_,()]/g, ' ')}%`)
  }

  query = query
    .order('created_at', { ascending: q.sort === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, count, error } = await query
  if (error) throw error
  return { rows: (data ?? []) as unknown as TicketWithOwner[], total: count ?? 0 }
}

function safeFileName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const base = name
    .slice(0, name.length - ext.length - 1)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'arquivo'}.${ext}`
}

/**
 * Envia arquivos ao bucket privado e registra os metadados.
 * Se o registro falhar, o arquivo enviado é removido.
 */
export async function uploadAttachments(ticketId: string, files: File[], messageId?: string | null) {
  const failures: string[] = []
  for (const file of files) {
    const path = `${ticketId}/${crypto.randomUUID()}-${safeFileName(file.name)}`
    const up = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (up.error) {
      failures.push(file.name)
      continue
    }
    const { error } = await supabase.from('ticket_attachments').insert({
      ticket_id: ticketId,
      message_id: messageId ?? null,
      storage_path: path,
      file_name: file.name.slice(0, 255),
      file_type: file.type,
      file_size: file.size,
    })
    if (error) {
      await supabase.storage.from(ATTACHMENTS_BUCKET).remove([path])
      failures.push(file.name)
    }
  }
  return failures
}

/** URL temporária (5 minutos) para abrir um anexo privado. */
export async function openAttachment(a: TicketAttachment, download = false) {
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(a.storage_path, 300, download ? { download: a.file_name } : undefined)
  if (error || !data) throw error ?? new Error('Não foi possível abrir o arquivo.')
  return data.signedUrl
}
