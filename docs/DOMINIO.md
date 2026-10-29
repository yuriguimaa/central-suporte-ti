# Domínio próprio (ex.: suporte.meudominio.com.br)

O domínio só deve ser considerado publicado depois que todas as etapas abaixo estiverem concluídas e validadas.

## Opção A: domínio já gerenciado pela Cloudflare (recomendado)

1. Cloudflare › **Workers & Pages** › projeto `central-suporte-ti` › **Custom domains** › **Set up a custom domain**.
2. Digite `suporte.meudominio.com.br` › **Continue** › **Activate domain**.
3. A Cloudflare cria sozinha o registro DNS `CNAME suporte › central-suporte.pages.dev` (com proxy laranja ligado)
   e emite o certificado SSL. Em poucos minutos o status muda para **Active**.

## Opção B: domínio em outro provedor (Registro.br, GoDaddy, Hostinger…)

Escolha um dos caminhos:

- **Mover o DNS para a Cloudflare** (recomendado): Cloudflare › **Add a domain** › plano Free › a Cloudflare
  mostra dois nameservers › no Registro.br (ou outro provedor), troque os servidores DNS do domínio por esses dois.
  A propagação leva de minutos a 24 h. Depois siga a Opção A.
- **Somente um subdomínio, mantendo o DNS atual**: no painel do seu provedor crie
  `CNAME` com nome `suporte` e valor `central-suporte.pages.dev`. Depois adicione o domínio em
  **Domains & Routes** na Cloudflare e aguarde a validação.
  (Para o domínio raiz, sem subdomínio, o DNS precisa estar na Cloudflare.)

## HTTPS e SSL

Na zona do domínio na Cloudflare:

- **SSL/TLS › Overview**: modo **Full (strict)**.
- **SSL/TLS › Edge Certificates**: ligue **Always Use HTTPS** e **Automatic HTTPS Rewrites**.
  Opcional: **HSTS** (só depois de confirmar que tudo funciona em HTTPS).

O certificado do domínio personalizado é emitido e renovado automaticamente.

## Redirecionamentos

- O `wrangler.jsonc` já cuida das rotas internas do React Router.
- Para que o endereço `*.pages.dev` redirecione para o domínio próprio, crie em
  **Rules › Redirect Rules** (na zona do domínio) ou mantenha os dois endereços ativos.
  Se quiser redirecionar `www.suporte…` ou o domínio raiz, use uma regra *Single Redirect* com status 301.

## Variáveis de produção

Se mudar algo (por exemplo `VITE_APP_NAME`), altere em **Settings › Build › Variables and secrets** do projeto e faça novo deploy.

## Supabase Auth com o novo domínio

Em **Supabase › Authentication › URL Configuration**:

- **Site URL**: `https://suporte.meudominio.com.br`
- **Redirect URLs**: adicione `https://suporte.meudominio.com.br/**` (mantenha as do `pages.dev` se ele continuar ativo).

Se usar SMTP próprio, configure SPF/DKIM do domínio de envio conforme o provedor de e-mail.

## Validação final

- [ ] `https://suporte.meudominio.com.br` abre com cadeado (certificado válido).
- [ ] `http://` redireciona para `https://`.
- [ ] Atualizar `/painel/chamados` não dá 404.
- [ ] Cadastro: o link de confirmação abre no domínio novo.
- [ ] "Esqueci minha senha": o link abre `/redefinir-senha` no domínio novo e a troca funciona.
- [ ] Login de administrador cai no painel administrativo.
