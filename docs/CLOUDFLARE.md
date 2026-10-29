# Publicação na Cloudflare (Workers com arquivos estáticos)

O projeto já está pronto para a Cloudflare:

- `npm run build` gera os arquivos de produção em `dist/`.
- `wrangler.jsonc` publica a pasta `dist/` e envia rotas desconhecidas para `index.html`
  (`not_found_handling: single-page-application`), sem 404 ao atualizar páginas internas
  como `/painel/chamados/12`.
- `public/_headers` adiciona cabeçalhos de segurança e cache longo para os arquivos com hash.

## 1. Conectar o repositório

1. Acesse https://dash.cloudflare.com › **Workers & Pages** › **Create** › **Import a repository**.
2. Autorize o GitHub e selecione `yuriguimaa/central-suporte-ti`.
3. Configurações:

| Campo | Valor |
|---|---|
| Project name | `central-suporte-ti` (igual ao `name` do `wrangler.jsonc`) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler versions upload` (padrão) |

4. Em **Advanced settings › Build variables**, adicione:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | chave publishable (`sb_publishable_...`) ou anon |
| `NODE_VERSION` | `22` |
| `VITE_APP_NAME` | `Central de Suporte TI` (opcional) |

5. **Deploy**. O site fica em `https://central-suporte-ti.<sua-conta>.workers.dev`.

As variáveis `VITE_` são lidas **durante o build** (não em tempo de execução). Para alterá-las:
**Settings › Build › Variables and secrets**, depois um novo deploy.

## 2. Ajustar o Supabase para o endereço publicado

Em **Supabase › Authentication › URL Configuration**:

- **Site URL**: o endereço publicado (ex.: `https://central-suporte-ti.<sua-conta>.workers.dev`)
- **Redirect URLs**: o mesmo endereço com `/**` no final.

Sem isso, os links de confirmação de e-mail e recuperação de senha apontam para o endereço errado.

## 3. Deploys automáticos

Cada `git push` na branch `main` publica em produção. Outras branches geram versões de pré-visualização.

## 4. Validar a publicação

- Abra o endereço, atualize a página em `/entrar` e em `/painel`: não pode aparecer 404.
- Cadastre uma conta de teste, confirme o e-mail e abra um chamado com anexo.
- Siga o [checklist de testes](CHECKLIST-TESTES.md).

Para o domínio próprio, veja [DOMINIO.md](DOMINIO.md).
