# Notificações por e-mail (preparação)

Hoje as notificações aparecem dentro da plataforma (sino), em tempo real. A estrutura para e-mail já existe:

- Toda notificação é uma linha na tabela `notifications` (`user_id`, `title`, `message`, `link`).
- A coluna `email_sent_at` fica `null` até o e-mail ser enviado.
- `app_settings.email_notifications_enabled` liga/desliga o envio (tela **Configurações** do admin).

## Como ativar no futuro

1. Crie uma conta num serviço de e-mail transacional (ex.: Resend) e guarde a chave de API.
2. Crie uma **Edge Function** no Supabase (`supabase functions new notify-email`) que:
   - receba o payload de um *Database Webhook* de `INSERT` em `notifications`;
   - verifique `app_settings.email_notifications_enabled`;
   - busque o e-mail do usuário em `profiles` (com a `service_role`, disponível só no servidor);
   - envie o e-mail e atualize `email_sent_at`.
3. Guarde a chave do serviço de e-mail como *secret* da função (`supabase secrets set RESEND_API_KEY=...`).
4. Em **Database › Webhooks**, crie um webhook em `public.notifications` (evento INSERT) apontando para a função.

Assim nenhuma credencial secreta passa pelo navegador.
