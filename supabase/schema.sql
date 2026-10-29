-- =============================================================================
-- Central de Suporte TI — Estrutura completa do banco de dados (Supabase)
-- -----------------------------------------------------------------------------
-- Como usar: Supabase > SQL Editor > New query > cole TODO este arquivo > Run.
-- O script é idempotente na medida do possível (pode ser executado novamente).
-- Inclui: tipos, tabelas, índices, chaves estrangeiras, triggers, funções,
-- Row Level Security (RLS), permissões por coluna, Storage e Realtime.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. Tipos enumerados
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ticket_status as enum ('aberto', 'em_andamento', 'aguardando_usuario', 'resolvido', 'encerrado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ticket_priority as enum ('baixa', 'media', 'alta', 'urgente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ticket_category as enum (
    'computadores', 'impressoras', 'internet_rede', 'wifi', 'sistemas',
    'email', 'instalacao_software', 'hardware', 'acesso_senhas', 'outros'
  );
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- 2. Tabelas
-- -----------------------------------------------------------------------------

-- Perfis: 1:1 com auth.users. Criado automaticamente por trigger no cadastro.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(full_name) between 3 and 120),
  email       text not null,
  phone       text check (phone is null or char_length(phone) <= 20),
  role        public.user_role not null default 'user',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Chamados. ticket_number é uma IDENTITY: sequencial, gerado pelo banco e único.
create table if not exists public.tickets (
  id             uuid primary key default gen_random_uuid(),
  ticket_number  bigint generated always as identity (start with 1) unique,
  user_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title          text not null check (char_length(title) between 5 and 150),
  description    text not null check (char_length(description) between 10 and 5000),
  category       public.ticket_category not null,
  priority       public.ticket_priority not null default 'media',
  status         public.ticket_status not null default 'aberto',
  solution       text check (solution is null or char_length(solution) <= 5000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  resolved_at    timestamptz,
  closed_at      timestamptz
);

-- Mensagens do chamado. sender_name/sender_role são copiados do perfil por
-- trigger, para que o usuário veja o nome do técnico sem ter acesso ao perfil dele.
create table if not exists public.ticket_messages (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.tickets (id) on delete cascade,
  sender_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  sender_name  text not null default '',
  sender_role  public.user_role not null default 'user',
  message      text not null check (char_length(message) between 1 and 5000),
  is_internal  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Anexos (metadados). O arquivo fica no bucket privado "ticket-attachments".
create table if not exists public.ticket_attachments (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references public.tickets (id) on delete cascade,
  message_id    uuid references public.ticket_messages (id) on delete cascade,
  uploaded_by   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  storage_path  text not null unique,
  file_name     text not null check (char_length(file_name) between 1 and 255),
  file_type     text not null check (file_type in ('image/png', 'image/jpeg', 'application/pdf')),
  file_size     integer not null check (file_size > 0 and file_size <= 10485760),
  created_at    timestamptz not null default now()
);

-- Histórico de alterações (gravado apenas por triggers).
create table if not exists public.ticket_history (
  id               uuid primary key default gen_random_uuid(),
  ticket_id        uuid not null references public.tickets (id) on delete cascade,
  changed_by       uuid references public.profiles (id) on delete set null,
  changed_by_name  text,
  action           text not null,
  old_value        text,
  new_value        text,
  created_at       timestamptz not null default now()
);

-- Notificações dentro da plataforma. email_sent_at prepara o envio futuro
-- por e-mail (ex.: Database Webhook + Edge Function lendo linhas com null).
create table if not exists public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  ticket_id      uuid references public.tickets (id) on delete cascade,
  title          text not null,
  message        text not null,
  link           text,
  is_read        boolean not null default false,
  email_sent_at  timestamptz,
  created_at     timestamptz not null default now()
);

-- Configurações gerais (linha única, id = 1).
create table if not exists public.app_settings (
  id               smallint primary key default 1 check (id = 1),
  support_email    text,
  support_phone    text,
  business_hours   text default 'Segunda a sexta, das 8h às 18h',
  email_notifications_enabled boolean not null default false,
  updated_at       timestamptz not null default now()
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 3. Índices
-- -----------------------------------------------------------------------------
create index if not exists tickets_user_id_idx        on public.tickets (user_id);
create index if not exists tickets_status_idx         on public.tickets (status);
create index if not exists tickets_priority_idx       on public.tickets (priority);
create index if not exists tickets_category_idx       on public.tickets (category);
create index if not exists tickets_created_at_idx     on public.tickets (created_at desc);
create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);
create index if not exists ticket_attach_ticket_idx   on public.ticket_attachments (ticket_id);
create index if not exists ticket_attach_message_idx  on public.ticket_attachments (message_id);
create index if not exists ticket_history_ticket_idx  on public.ticket_history (ticket_id, created_at);
create index if not exists notifications_user_idx     on public.notifications (user_id, is_read, created_at desc);
create index if not exists profiles_role_idx          on public.profiles (role);
create index if not exists notifications_ticket_idx   on public.notifications (ticket_id);
create index if not exists ticket_attach_uploader_idx on public.ticket_attachments (uploaded_by);
create index if not exists ticket_history_changed_idx on public.ticket_history (changed_by);
create index if not exists ticket_messages_sender_idx on public.ticket_messages (sender_id);

-- -----------------------------------------------------------------------------
-- 4. Funções auxiliares (SECURITY DEFINER com search_path fixo)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active);
$$;

create or replace function public.owns_ticket(p_ticket_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tickets where id = p_ticket_id and user_id = auth.uid());
$$;

create or replace function public.status_label(s public.ticket_status)
returns text language sql immutable set search_path = public as $$
  select case s
    when 'aberto' then 'Aberto'
    when 'em_andamento' then 'Em andamento'
    when 'aguardando_usuario' then 'Aguardando usuário'
    when 'resolvido' then 'Resolvido'
    when 'encerrado' then 'Encerrado'
  end;
$$;

create or replace function public.ticket_code(n bigint)
returns text language sql immutable set search_path = public as $$
  select '#' || lpad(n::text, 6, '0');
$$;

-- -----------------------------------------------------------------------------
-- 5. Triggers
-- -----------------------------------------------------------------------------

-- 5.1 Cria o perfil automaticamente no cadastro. O papel é SEMPRE 'user':
-- qualquer "role" enviado nos metadados do cadastro é ignorado.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), new.email);
begin
  if char_length(v_name) < 3 then
    v_name := new.email;
  end if;
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    left(v_name, 120),
    new.email,
    left(nullif(trim(new.raw_user_meta_data ->> 'phone'), ''), 20),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém o e-mail do perfil sincronizado quando o usuário troca de e-mail.
create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- 5.2 Proteção do perfil: papel só muda pelo SQL Editor; is_active só por admin.
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    if new.role is distinct from old.role then
      raise exception 'Alteração de perfil de acesso não permitida.';
    end if;
    if new.is_active is distinct from old.is_active and not public.is_admin() then
      raise exception 'Somente administradores podem ativar ou desativar contas.';
    end if;
    if new.id = auth.uid() and new.is_active = false then
      raise exception 'Você não pode desativar a própria conta.';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile();

-- 5.3 Chamado: valores iniciais seguros na criação.
create or replace function public.ticket_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    new.user_id := auth.uid();
  end if;
  new.status := 'aberto';
  new.solution := null;
  new.resolved_at := null;
  new.closed_at := null;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tickets_before_insert on public.tickets;
create trigger tickets_before_insert
  before insert on public.tickets
  for each row execute function public.ticket_before_insert();

-- 5.4 Chamado: datas automáticas na atualização.
create or replace function public.ticket_before_update()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    if new.status = 'resolvido' then
      new.resolved_at := coalesce(new.resolved_at, now());
    elsif new.status = 'encerrado' then
      new.closed_at := now();
      new.resolved_at := coalesce(new.resolved_at, old.resolved_at, now());
    else
      -- reabertura ou retorno ao atendimento
      new.resolved_at := null;
      new.closed_at := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tickets_before_update on public.tickets;
create trigger tickets_before_update
  before update on public.tickets
  for each row execute function public.ticket_before_update();

-- 5.5 Chamado criado: histórico + notificação para os administradores.
create or replace function public.ticket_after_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text;
begin
  select full_name into v_name from public.profiles where id = new.user_id;

  insert into public.ticket_history (ticket_id, changed_by, changed_by_name, action, new_value)
  values (new.id, new.user_id, v_name, 'criado', 'aberto');

  insert into public.notifications (user_id, ticket_id, title, message, link)
  select p.id, new.id,
         'Novo chamado recebido: ' || public.ticket_code(new.ticket_number),
         coalesce(v_name, 'Um usuário') || ' abriu o chamado "' || new.title || '".',
         '/admin/chamados/' || new.ticket_number
  from public.profiles p
  where p.role = 'admin' and p.is_active and p.id <> new.user_id;

  return new;
end;
$$;

drop trigger if exists tickets_after_insert on public.tickets;
create trigger tickets_after_insert
  after insert on public.tickets
  for each row execute function public.ticket_after_insert();

-- 5.6 Chamado alterado: histórico + notificação para o dono do chamado.
create or replace function public.ticket_after_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_code text := public.ticket_code(new.ticket_number);
  v_link text := '/painel/chamados/' || new.ticket_number;
  v_msg  text;
begin
  select full_name into v_name from public.profiles where id = auth.uid();

  if new.status is distinct from old.status then
    insert into public.ticket_history (ticket_id, changed_by, changed_by_name, action, old_value, new_value)
    values (
      new.id, auth.uid(), v_name,
      case when old.status in ('resolvido', 'encerrado') and new.status not in ('resolvido', 'encerrado')
           then 'reaberto' else 'status' end,
      old.status::text, new.status::text
    );

    if auth.uid() is distinct from new.user_id then
      v_msg := case new.status
        when 'em_andamento'       then 'Seu chamado ' || v_code || ' está em andamento.'
        when 'aguardando_usuario' then 'O suporte precisa de uma resposta sua no chamado ' || v_code || '.'
        when 'resolvido'          then 'Seu chamado ' || v_code || ' foi resolvido.'
        when 'encerrado'          then 'Seu chamado ' || v_code || ' foi encerrado.'
        when 'aberto'             then 'Seu chamado ' || v_code || ' foi reaberto.'
      end;
      insert into public.notifications (user_id, ticket_id, title, message, link)
      values (new.user_id, new.id, 'Chamado ' || v_code || ': ' || public.status_label(new.status), v_msg, v_link);
    end if;
  end if;

  if new.priority is distinct from old.priority then
    insert into public.ticket_history (ticket_id, changed_by, changed_by_name, action, old_value, new_value)
    values (new.id, auth.uid(), v_name, 'prioridade', old.priority::text, new.priority::text);
  end if;

  if new.category is distinct from old.category then
    insert into public.ticket_history (ticket_id, changed_by, changed_by_name, action, old_value, new_value)
    values (new.id, auth.uid(), v_name, 'categoria', old.category::text, new.category::text);
  end if;

  if new.solution is distinct from old.solution and new.solution is not null then
    insert into public.ticket_history (ticket_id, changed_by, changed_by_name, action, new_value)
    values (new.id, auth.uid(), v_name, 'solucao', left(new.solution, 500));
  end if;

  return new;
end;
$$;

drop trigger if exists tickets_after_update on public.tickets;
create trigger tickets_after_update
  after update on public.tickets
  for each row execute function public.ticket_after_update();

-- 5.7 Mensagem: preenche remetente e valida regras de negócio.
create or replace function public.message_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_profile public.profiles;
begin
  if auth.uid() is not null then
    new.sender_id := auth.uid();
  end if;
  select * into v_profile from public.profiles where id = new.sender_id;
  new.sender_name := v_profile.full_name;
  new.sender_role := v_profile.role;
  if v_profile.role <> 'admin' then
    new.is_internal := false;
  end if;
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists messages_before_insert on public.ticket_messages;
create trigger messages_before_insert
  before insert on public.ticket_messages
  for each row execute function public.message_before_insert();

-- 5.8 Mensagem enviada: atualiza o chamado e notifica a outra parte.
create or replace function public.message_after_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ticket public.tickets;
  v_code   text;
begin
  select * into v_ticket from public.tickets where id = new.ticket_id;
  v_code := public.ticket_code(v_ticket.ticket_number);

  if new.is_internal then
    update public.tickets set updated_at = now() where id = new.ticket_id;
    return new;
  end if;

  if new.sender_role = 'admin' and new.sender_id <> v_ticket.user_id then
    update public.tickets set updated_at = now() where id = new.ticket_id;
    insert into public.notifications (user_id, ticket_id, title, message, link)
    values (v_ticket.user_id, v_ticket.id,
            'Nova resposta no chamado ' || v_code,
            'Você recebeu uma nova resposta do suporte.',
            '/painel/chamados/' || v_ticket.ticket_number);
  else
    -- Resposta do usuário: se o suporte aguardava retorno, volta para "Em andamento".
    if v_ticket.status = 'aguardando_usuario' then
      update public.tickets set status = 'em_andamento' where id = new.ticket_id;
    else
      update public.tickets set updated_at = now() where id = new.ticket_id;
    end if;
    insert into public.notifications (user_id, ticket_id, title, message, link)
    select p.id, v_ticket.id,
           'Nova mensagem no chamado ' || v_code,
           new.sender_name || ' respondeu ao chamado "' || v_ticket.title || '".',
           '/admin/chamados/' || v_ticket.ticket_number
    from public.profiles p
    where p.role = 'admin' and p.is_active and p.id <> new.sender_id;
  end if;

  return new;
end;
$$;

drop trigger if exists messages_after_insert on public.ticket_messages;
create trigger messages_after_insert
  after insert on public.ticket_messages
  for each row execute function public.message_after_insert();

-- 5.9 Anexo: garante coerência entre chamado, mensagem e caminho do arquivo.
create or replace function public.attachment_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    new.uploaded_by := auth.uid();
  end if;
  if new.storage_path not like new.ticket_id::text || '/%' then
    raise exception 'Caminho de anexo inválido.';
  end if;
  if new.message_id is not null and not exists (
    select 1 from public.ticket_messages m
    where m.id = new.message_id and m.ticket_id = new.ticket_id and m.sender_id = new.uploaded_by
  ) then
    raise exception 'Mensagem inválida para este anexo.';
  end if;
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists attachments_before_insert on public.ticket_attachments;
create trigger attachments_before_insert
  before insert on public.ticket_attachments
  for each row execute function public.attachment_before_insert();

-- -----------------------------------------------------------------------------
-- 6. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.tickets            enable row level security;
alter table public.ticket_messages    enable row level security;
alter table public.ticket_attachments enable row level security;
alter table public.ticket_history     enable row level security;
alter table public.notifications      enable row level security;
alter table public.app_settings       enable row level security;

-- profiles
drop policy if exists "profiles: ver o próprio" on public.profiles;
create policy "profiles: ver o próprio" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "profiles: editar o próprio" on public.profiles;
create policy "profiles: editar o próprio" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- tickets
drop policy if exists "tickets: ver" on public.tickets;
create policy "tickets: ver" on public.tickets
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "tickets: abrir" on public.tickets;
create policy "tickets: abrir" on public.tickets
  for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.is_active_user()));

drop policy if exists "tickets: admin altera" on public.tickets;
create policy "tickets: admin altera" on public.tickets
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ticket_messages
drop policy if exists "mensagens: ver" on public.ticket_messages;
create policy "mensagens: ver" on public.ticket_messages
  for select to authenticated
  using ((select public.is_admin()) or (not is_internal and public.owns_ticket(ticket_id)));

drop policy if exists "mensagens: enviar" on public.ticket_messages;
create policy "mensagens: enviar" on public.ticket_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and (
      (select public.is_admin())
      or (
        not is_internal
        and (select public.is_active_user())
        and exists (
          select 1 from public.tickets t
          where t.id = ticket_id and t.user_id = (select auth.uid()) and t.status <> 'encerrado'
        )
      )
    )
  );

-- ticket_attachments
drop policy if exists "anexos: ver" on public.ticket_attachments;
create policy "anexos: ver" on public.ticket_attachments
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      public.owns_ticket(ticket_id)
      and (message_id is null or exists (
        select 1 from public.ticket_messages m where m.id = message_id and not m.is_internal
      ))
    )
  );

drop policy if exists "anexos: enviar" on public.ticket_attachments;
create policy "anexos: enviar" on public.ticket_attachments
  for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and ((select public.is_admin()) or ((select public.is_active_user()) and public.owns_ticket(ticket_id)))
  );

-- ticket_history (somente leitura; escrita apenas pelos triggers)
drop policy if exists "historico: ver" on public.ticket_history;
create policy "historico: ver" on public.ticket_history
  for select to authenticated
  using ((select public.is_admin()) or public.owns_ticket(ticket_id));

-- notifications
drop policy if exists "notificacoes: ver as próprias" on public.notifications;
create policy "notificacoes: ver as próprias" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "notificacoes: marcar como lida" on public.notifications;
create policy "notificacoes: marcar como lida" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "notificacoes: apagar as próprias" on public.notifications;
create policy "notificacoes: apagar as próprias" on public.notifications
  for delete to authenticated using (user_id = (select auth.uid()));

-- app_settings
drop policy if exists "config: leitura pública" on public.app_settings;
create policy "config: leitura pública" on public.app_settings
  for select to anon, authenticated using (true);

drop policy if exists "config: admin altera" on public.app_settings;
create policy "config: admin altera" on public.app_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- 7. Permissões por coluna (defesa extra além do RLS)
-- -----------------------------------------------------------------------------
revoke all on public.profiles, public.tickets, public.ticket_messages,
  public.ticket_attachments, public.ticket_history, public.notifications,
  public.app_settings from anon, authenticated;

grant select on public.app_settings to anon, authenticated;
grant update (support_email, support_phone, business_hours, email_notifications_enabled)
  on public.app_settings to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

grant select on public.tickets to authenticated;
grant insert (title, description, category, priority) on public.tickets to authenticated;
grant update (status, priority, category, solution) on public.tickets to authenticated;

grant select on public.ticket_messages to authenticated;
grant insert (ticket_id, message, is_internal) on public.ticket_messages to authenticated;

grant select on public.ticket_attachments to authenticated;
grant insert (ticket_id, message_id, storage_path, file_name, file_type, file_size)
  on public.ticket_attachments to authenticated;

grant select on public.ticket_history to authenticated;

grant select, delete on public.notifications to authenticated;
grant update (is_read) on public.notifications to authenticated;

-- -----------------------------------------------------------------------------
-- 8. Funções RPC
-- -----------------------------------------------------------------------------

-- 8.1 Ativar/desativar conta (somente administradores).
create or replace function public.admin_set_user_active(p_user_id uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Você não pode desativar a própria conta.';
  end if;
  update public.profiles set is_active = p_active where id = p_user_id;
end;
$$;

-- 8.2 Indicadores do dashboard administrativo.
create or replace function public.admin_dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.';
  end if;

  select jsonb_build_object(
    'total', (select count(*) from public.tickets),
    'users', (select count(*) from public.profiles where role = 'user'),
    'by_status', coalesce((select jsonb_object_agg(status, c) from (
        select status, count(*) c from public.tickets group by status) s), '{}'::jsonb),
    'by_priority', coalesce((select jsonb_object_agg(priority, c) from (
        select priority, count(*) c from public.tickets group by priority) s), '{}'::jsonb),
    'by_category', coalesce((select jsonb_object_agg(category, c) from (
        select category, count(*) c from public.tickets group by category) s), '{}'::jsonb),
    'by_month', coalesce((select jsonb_agg(jsonb_build_object('month', m, 'count', c) order by m) from (
        select to_char(date_trunc('month', gs), 'YYYY-MM') m,
               (select count(*) from public.tickets t
                 where date_trunc('month', t.created_at at time zone 'America/Sao_Paulo') = date_trunc('month', gs)) c
        from generate_series(
          date_trunc('month', now() at time zone 'America/Sao_Paulo') - interval '11 months',
          date_trunc('month', now() at time zone 'America/Sao_Paulo'),
          interval '1 month') gs) s), '[]'::jsonb),
    'avg_resolution_hours', (select round(extract(epoch from avg(resolved_at - created_at)) / 3600.0, 1)
        from public.tickets where resolved_at is not null)
  ) into result;

  return result;
end;
$$;

-- 8.3 Marcar todas as notificações como lidas.
create or replace function public.mark_all_notifications_read()
returns void language sql security definer set search_path = public as $$
  update public.notifications set is_read = true where user_id = auth.uid() and not is_read;
$$;

-- 8.4 Promover uma conta a administrador.
-- SEGURO: só pode ser executada no SQL Editor do Supabase (papel postgres).
-- Não é acessível pela API nem por usuários logados.
create or replace function public.promote_to_admin(p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if auth.uid() is not null then
    raise exception 'Esta operação só pode ser executada pelo SQL Editor do Supabase.';
  end if;
  select id into v_id from public.profiles where lower(email) = lower(trim(p_email));
  if v_id is null then
    raise exception 'Nenhuma conta encontrada com o e-mail %. Cadastre-se no site primeiro.', p_email;
  end if;
  update public.profiles set role = 'admin', is_active = true where id = v_id;
  return 'Conta ' || p_email || ' promovida a administrador.';
end;
$$;

create or replace function public.demote_admin(p_email text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    raise exception 'Esta operação só pode ser executada pelo SQL Editor do Supabase.';
  end if;
  update public.profiles set role = 'user' where lower(email) = lower(trim(p_email));
  return 'Conta ' || p_email || ' voltou a ser usuário comum.';
end;
$$;

-- Permissões de execução
revoke execute on all functions in schema public from public, anon;
grant execute on function public.is_admin()                             to authenticated;
grant execute on function public.is_active_user()                       to authenticated;
grant execute on function public.owns_ticket(uuid)                      to authenticated;
grant execute on function public.status_label(public.ticket_status)     to authenticated;
grant execute on function public.ticket_code(bigint)                    to authenticated;
grant execute on function public.admin_set_user_active(uuid, boolean)   to authenticated;
grant execute on function public.admin_dashboard_stats()                to authenticated;
grant execute on function public.mark_all_notifications_read()          to authenticated;
revoke execute on function public.promote_to_admin(text) from authenticated;
-- Funções de trigger não devem ser chamadas pela API (/rest/v1/rpc).
revoke execute on function public.handle_new_user()          from authenticated;
revoke execute on function public.handle_user_email_change() from authenticated;
revoke execute on function public.protect_profile()          from authenticated;
revoke execute on function public.ticket_before_insert()     from authenticated;
revoke execute on function public.ticket_before_update()     from authenticated;
revoke execute on function public.ticket_after_insert()      from authenticated;
revoke execute on function public.ticket_after_update()      from authenticated;
revoke execute on function public.message_before_insert()    from authenticated;
revoke execute on function public.message_after_insert()     from authenticated;
revoke execute on function public.attachment_before_insert() from authenticated;
revoke execute on function public.demote_admin(text)     from authenticated;

-- -----------------------------------------------------------------------------
-- 9. Storage: bucket privado de anexos + políticas
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ticket-attachments', 'ticket-attachments', false, 10485760,
        array['image/png', 'image/jpeg', 'application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Estrutura dos caminhos: <ticket_id>/<uuid>-<nome-do-arquivo>
drop policy if exists "anexos storage: enviar" on storage.objects;
create policy "anexos storage: enviar" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'ticket-attachments'
    and (
      public.is_admin()
      or (public.is_active_user() and public.owns_ticket(((storage.foldername(name))[1])::uuid))
    )
  );

-- Leitura: somente arquivos registrados em ticket_attachments que o usuário pode ver
-- (o RLS da tabela ticket_attachments é aplicado na subconsulta).
drop policy if exists "anexos storage: ler" on storage.objects;
create policy "anexos storage: ler" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'ticket-attachments'
    and (
      public.is_admin()
      or owner_id = (select auth.uid()::text)
      or exists (select 1 from public.ticket_attachments a where a.storage_path = name)
    )
  );

-- Exclusão: administradores, ou o próprio autor (limpeza de envio que falhou).
drop policy if exists "anexos storage: apagar" on storage.objects;
create policy "anexos storage: apagar" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'ticket-attachments'
    and (public.is_admin() or owner_id = (select auth.uid()::text))
  );

-- -----------------------------------------------------------------------------
-- 10. Realtime (o Realtime respeita as políticas RLS acima)
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['tickets', 'ticket_messages', 'notifications', 'ticket_history', 'ticket_attachments'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- =============================================================================
-- Fim. Próximo passo: cadastre-se no site e execute supabase/promote-admin.sql.
-- =============================================================================
