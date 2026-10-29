-- Excluir chamado (somente admin). Rode no SQL Editor do Supabase.
create or replace function public.admin_delete_ticket(p_ticket_id uuid)
returns text[] language plpgsql security definer set search_path = public as $$
declare
  v_paths text[];
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.';
  end if;
  select coalesce(array_agg(storage_path), '{}') into v_paths
  from public.ticket_attachments where ticket_id = p_ticket_id;
  delete from public.tickets where id = p_ticket_id;
  if not found then
    raise exception 'Chamado não encontrado.';
  end if;
  return v_paths;
end;
$$;
revoke execute on function public.admin_delete_ticket(uuid) from public, anon;
grant execute on function public.admin_delete_ticket(uuid) to authenticated;
