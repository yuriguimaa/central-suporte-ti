# Configuração do Supabase

Siga na ordem. Tempo estimado: 15 minutos.

## 1. Criar o projeto

1. Acesse https://supabase.com e entre na sua conta.
2. **New project**: escolha um nome (ex.: `central-suporte-ti`), uma senha forte para o banco
   (guarde em local seguro) e a região **South America (São Paulo)**.
3. Aguarde o projeto ficar pronto.

## 2. Executar o SQL das tabelas

1. Menu **SQL Editor** › **New query**.
2. Cole todo o conteúdo de [`supabase/schema.sql`](../supabase/schema.sql) e clique em **Run**.
3. Deve aparecer *Success. No rows returned*. O script pode ser executado novamente sem perder dados.

O script cria: tipos, as tabelas `profiles`, `tickets`, `ticket_messages`, `ticket_attachments`,
`ticket_history`, `notifications` e `app_settings`, índices, chaves estrangeiras, triggers
(criação de perfil, datas, histórico, notificações), funções, **RLS**, **políticas de segurança**,
permissões por coluna, o bucket de **Storage** e o **Realtime**.

## 3. Configurar a autenticação

Em **Authentication**:

1. **Sign In / Providers › Email**: mantenha *Enable Email provider* ligado.
   - **Confirm email**: ligado (recomendado em produção). O usuário só entra depois de clicar no link.
   - **Secure email change**: ligado.
   - Em **Password requirements**, defina no mínimo 8 caracteres (a tela de cadastro já exige letras e números).
2. **URL Configuration**:
   - **Site URL**: o endereço de produção, ex.: `https://central-suporte.pages.dev`
     (depois troque pelo domínio próprio, ex.: `https://suporte.meudominio.com.br`).
   - **Redirect URLs**: adicione
     - `http://localhost:5173/**`
     - `https://central-suporte.pages.dev/**`
     - `https://*.central-suporte.pages.dev/**` (pré-visualizações da Cloudflare)
     - `https://suporte.meudominio.com.br/**` (quando o domínio estiver ativo)
3. **Emails** (opcional, recomendado): traduza os modelos. Sugestão para *Confirm signup*:
   - Assunto: `Confirme seu cadastro na Central de Suporte TI`
   - Corpo: `<p>Olá! Clique no link para ativar sua conta:</p><p><a href="{{ .ConfirmationURL }}">Confirmar e-mail</a></p>`
   - *Reset password*: assunto `Redefinição de senha`, corpo com `<a href="{{ .ConfirmationURL }}">Criar nova senha</a>`.
4. **SMTP**: o servidor de e-mail padrão do Supabase envia poucos e-mails por hora e serve só para testes.
   Para uso real, configure um SMTP próprio em **Project Settings › Authentication › SMTP Settings**
   (Resend, Brevo, Amazon SES, Google Workspace etc.).

## 4. Habilitar RLS

Já feito pelo script. Para conferir: **Database › Tables**: todas as tabelas do schema `public`
devem mostrar **RLS enabled**.

## 5. Políticas de segurança

Também criadas pelo script. Confira em **Authentication › Policies**. Resumo:

| Tabela | Usuário | Administrador |
|---|---|---|
| profiles | vê e edita nome e telefone do próprio perfil | vê todos; ativa e desativa contas pela função `admin_set_user_active` |
| tickets | vê os próprios; abre chamados (status sempre "Aberto") | vê e altera todos |
| ticket_messages | vê mensagens não internas dos próprios chamados; envia se o chamado não estiver encerrado | vê e envia todas, inclusive notas internas |
| ticket_attachments | vê anexos não internos dos próprios chamados; envia nos próprios | tudo |
| ticket_history | lê o histórico dos próprios chamados (escrita só por trigger) | lê tudo |
| notifications | vê, marca como lida e apaga as próprias | idem |

## 6. Configurar o Storage

O script cria o bucket **privado** `ticket-attachments` (limite de 10 MB; PNG, JPG e PDF) e as políticas:

- envio: somente na pasta de um chamado do próprio usuário (ou admin);
- leitura: somente arquivos registrados em `ticket_attachments` que o usuário tem permissão de ver;
- exclusão: admin, ou o próprio autor (limpeza de envio com falha).

Confira em **Storage**: o bucket deve aparecer com o cadeado (privado).

## 7. Variáveis de ambiente

Em **Project Settings › API** (ou **API Keys**) copie:

- **Project URL** › `VITE_SUPABASE_URL`
- **anon public** (ou *publishable key*) › `VITE_SUPABASE_ANON_KEY`

Localmente, crie `.env.local` a partir de `.env.example`. Na Cloudflare, veja [CLOUDFLARE.md](CLOUDFLARE.md).

> Nunca use a chave **service_role** / *secret key* no frontend nem em variáveis `VITE_`.
> Tudo que começa com `VITE_` fica visível no navegador.

## 8. Testar cadastro e login

1. `npm run dev` e abra http://localhost:5173.
2. **Criar conta** com seu e-mail. Confirme pelo link recebido (se *Confirm email* estiver ligado).
3. Entre: você deve cair no **Painel do usuário**.
4. Em **Database › Table editor › profiles** sua conta aparece com `role = user`.

## 9. Criar o primeiro administrador

1. Com a conta já cadastrada, abra **SQL Editor › New query**.
2. Cole [`supabase/promote-admin.sql`](../supabase/promote-admin.sql), troque o e-mail pelo seu e clique **Run**:

```sql
select public.promote_to_admin('seu-email@exemplo.com');
```

3. Saia e entre de novo no site: agora você cai no **Painel administrativo**.

A função só funciona no SQL Editor. Se alguém tentar chamá-la pelo site ou pela API, recebe
"permission denied". Para remover o acesso: `select public.demote_admin('email@exemplo.com');`.

## Plano gratuito

Projetos gratuitos do Supabase são pausados após 7 dias sem uso. Para uso real e contínuo, considere o plano Pro
ou acesse o sistema regularmente.
