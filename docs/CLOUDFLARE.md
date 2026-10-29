# Publicação na Cloudflare Pages

O projeto já está pronto para a Cloudflare Pages:

- `npm run build` gera os arquivos de produção em `dist/`.
- `public/_redirects` envia todas as rotas para `index.html` (sem erro 404 ao atualizar páginas internas como `/painel/chamados/12`).
- `public/_headers` adiciona cabeçalhos de segurança e cache longo para os arquivos com hash.

## 1. Conectar o repositório

1. Acesse https://dash.cloudflare.com › **Workers & Pages** › **Create** › aba **Pages** › **Connect to Git**.
2. Autorize o GitHub e selecione `yuriguimaa/central-suporte-ti`.
3. Configurações de build:

| Campo | Valor |
|---|---|
| Project name | `central-suporte` (vira `central-suporte.pages.dev`, se disponível) |
| Production branch | `main` |
| Framework preset | `React (Vite)` ou `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (vazio) |

4. Em **Environment variables (advanced)** adicione, para **Production** e **Preview**:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | chave anon/publishable |
| `NODE_VERSION` | `22` |
| `VITE_APP_NAME` | `Central de Suporte TI` (opcional) |

5. **Save and Deploy**. Ao terminar, o site fica em `https://<nome-do-projeto>.pages.dev`.

As variáveis `VITE_` são lidas durante o build: depois de alterá-las, faça um novo deploy
(**Deployments › … › Retry deployment**).

## 2. Ajustar o Supabase para o endereço publicado

Em **Supabase › Authentication › URL Configuration**:

- **Site URL**: `https://central-suporte.pages.dev`
- **Redirect URLs**: inclua `https://central-suporte.pages.dev/**` e `https://*.central-suporte.pages.dev/**`.

Sem isso, os links de confirmação de e-mail e recuperação de senha apontam para o endereço errado.

## 3. Deploys automáticos

Cada `git push` na branch `main` publica em produção. Pushes em outras branches geram
endereços de pré-visualização (`https://<branch>.central-suporte.pages.dev`).

## 4. Validar a publicação

- Abra o endereço, atualize a página em `/entrar` e em `/painel`: não pode aparecer 404.
- Cadastre uma conta de teste, confirme o e-mail e abra um chamado com anexo.
- Siga o [checklist de testes](CHECKLIST-TESTES.md).

Para o domínio próprio, veja [DOMINIO.md](DOMINIO.md).
