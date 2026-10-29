import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** false quando as variáveis de ambiente ainda não foram configuradas. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// Usa apenas a chave pública (anon). Toda a proteção dos dados é feita
// pelas políticas RLS no banco. Nunca use a chave service_role aqui.
export const supabase = createClient(url || 'http://localhost', anonKey || 'missing-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export const ATTACHMENTS_BUCKET = 'ticket-attachments'
