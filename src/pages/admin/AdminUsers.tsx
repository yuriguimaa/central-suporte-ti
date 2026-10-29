import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, UserCheck, UserX, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { PAGE_SIZE } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { friendlyError } from '@/lib/validation'
import { PageHeader } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { controlClass } from '@/components/ui/Field'
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Profile } from '@/types/database'

type Row = Profile & { tickets: { count: number }[] }

export function AccountStatus({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
      <span className="size-1.5 rounded-full bg-emerald-500" /> Ativa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-300">
      <span className="size-1.5 rounded-full bg-red-500" /> Desativada
    </span>
  )
}

export function useToggleActive(onDone: () => void) {
  const toast = useToast()
  const [target, setTarget] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const confirm = async () => {
    if (!target) return
    setSaving(true)
    const { error } = await supabase.rpc('admin_set_user_active', { p_user_id: target.id, p_active: !target.is_active })
    setSaving(false)
    if (error) toast('error', friendlyError(error))
    else toast('success', target.is_active ? 'Acesso desativado.' : 'Acesso reativado.')
    setTarget(null)
    onDone()
  }
  const dialog = (
    <ConfirmDialog
      open={!!target}
      title={target?.is_active ? `Desativar o acesso de ${target?.full_name}?` : `Reativar o acesso de ${target?.full_name}?`}
      confirmLabel={target?.is_active ? 'Desativar acesso' : 'Reativar acesso'}
      tone={target?.is_active ? 'danger' : 'primary'}
      loading={saving}
      onCancel={() => setTarget(null)}
      onConfirm={confirm}
    >
      {target?.is_active
        ? 'A pessoa será desconectada e não poderá abrir chamados nem enviar mensagens. Os chamados existentes são mantidos.'
        : 'A pessoa poderá voltar a entrar e abrir chamados.'}
    </ConfirmDialog>
  )
  return { ask: setTarget, dialog }
}

export default function AdminUsers() {
  const { profile: me } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | 'ativos' | 'inativos'>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const { ask, dialog } = useToggleActive(() => setReload((r) => r + 1))

  useEffect(() => {
    let cancel = false
    setLoading(true)
    const t = setTimeout(async () => {
      let q = supabase.from('profiles').select('*, tickets(count)', { count: 'exact' })
      const s = search.trim().replace(/[%_,()]/g, ' ')
      if (s) q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`)
      if (status) q = q.eq('is_active', status === 'ativos')
      const { data, count, error } = await q.order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (cancel) return
      if (error) setError(friendlyError(error))
      else {
        setRows((data as Row[]) ?? [])
        setTotal(count ?? 0)
        setError(null)
      }
      setLoading(false)
    }, search ? 300 : 0)
    return () => {
      cancel = true
      clearTimeout(t)
    }
  }, [search, status, page, reload])

  return (
    <>
      <PageHeader title="Usuários cadastrados" description={`${total} ${total === 1 ? 'conta' : 'contas'}`} />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <label className="relative block flex-1 sm:max-w-sm">
            <span className="sr-only">Buscar por nome ou e-mail</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar por nome ou e-mail"
              className={`${controlClass} h-10 pl-9 text-sm`}
            />
          </label>
          <select
            aria-label="Filtrar por situação"
            className={`${controlClass} h-10 cursor-pointer text-sm sm:w-48`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status)
              setPage(1)
            }}
          >
            <option value="">Todas as contas</option>
            <option value="ativos">Ativas</option>
            <option value="inativos">Desativadas</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum usuário encontrado" text={search ? 'Tente outro nome ou e-mail.' : 'Os usuários aparecem aqui assim que se cadastram.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-surface-2 text-xs text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Nome</th>
                  <th scope="col" className="px-3 py-3 font-medium">E-mail</th>
                  <th scope="col" className="px-3 py-3 font-medium">Telefone</th>
                  <th scope="col" className="px-3 py-3 font-medium">Cadastro</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Chamados</th>
                  <th scope="col" className="px-3 py-3 font-medium">Conta</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-2/70">
                    <td className="px-5 py-3">
                      <Link to={`/admin/usuarios/${u.id}`} className="font-medium text-ink hover:text-brand-sky">{u.full_name}</Link>
                      {u.role === 'admin' && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sky-wash px-2 py-0.5 text-[11px] font-medium text-primary">
                          <ShieldCheck className="size-3" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted">{u.email}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted">{u.phone || '—'}</td>
                    <td className="tabular px-3 py-3 text-muted">{formatDate(u.created_at)}</td>
                    <td className="tabular px-3 py-3 text-right font-medium">{u.tickets?.[0]?.count ?? 0}</td>
                    <td className="px-3 py-3"><AccountStatus active={u.is_active} /></td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {u.id !== me?.id && (
                        <button
                          onClick={() => ask(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:border-brand-sky"
                        >
                          {u.is_active ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                          {u.is_active ? 'Desativar' : 'Reativar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </Card>
      {dialog}
    </>
  )
}
