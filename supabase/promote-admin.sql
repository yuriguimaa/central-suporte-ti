-- =============================================================================
-- Promover a sua conta a ADMINISTRADOR
-- -----------------------------------------------------------------------------
-- 1. Cadastre-se normalmente no site (página "Criar conta") e confirme o e-mail.
-- 2. No Supabase, abra SQL Editor > New query.
-- 3. Troque o e-mail abaixo pelo SEU e-mail e clique em Run.
--
-- Esta função só funciona no SQL Editor: ela recusa chamadas feitas pelo site
-- ou pela API, então nenhum usuário consegue se promover sozinho.
-- =============================================================================

select public.promote_to_admin('seu-email@exemplo.com');

-- Para conferir:
-- select full_name, email, role, is_active from public.profiles where role = 'admin';

-- Para remover o acesso de administrador de alguém:
-- select public.demote_admin('email@exemplo.com');
