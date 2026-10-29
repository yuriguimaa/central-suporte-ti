# Central de Suporte TI

Sistema web de abertura e gerenciamento de chamados de suporte técnico (Help Desk).
Usuários se cadastram, abrem chamados com anexos e conversam com o técnico; o administrador
gerencia todos os chamados, usuários, relatórios e configurações.

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS 4, Lucide React, React Router, Supabase
(PostgreSQL, Auth, Storage, Realtime) e Cloudflare (Workers com arquivos estáticos).

## Funcionalidades

- Página inicial, cadastro, login, recuperação e redefinição de senha (Supabase Auth).
- Perfis **Usuário** e **Administrador**, com redirecionamento automático e rotas protegidas.
- Painel do usuário: indicadores, chamados recentes, abertura de chamado com anexos (PNG, JPG, PDF até 10 MB),
  lista com busca por protocolo, filtros por status, prioridade e categoria, ordenação e paginação.
- Detalhe do chamado: protocolo, dados, tempo decorrido, histórico de alterações, anexos, conversa em tempo real
  e impressão.
- Painel administrativo: dashboard com indicadores e gráficos, acesso rápido a urgentes, todos os chamados com
  filtro por usuário, alteração de status, prioridade e categoria, notas internas, registro de solução,
  encerramento e reabertura.
- Gestão de usuários: busca, histórico de chamados, ativar e desativar acesso.
- Notificações dentro da plataforma (sino com contador, tempo real, marcar como lidas), com estrutura pronta para e-mail.
- Relatórios por período com exportação CSV.
- Modo claro e escuro, layout responsivo, estados de carregamento, vazios e de erro, confirmações.

## Segurança

Toda a proteção dos dados está no banco (não no navegador):

- Row Level Security em todas as tabelas: usuário comum só acessa os próprios chamados, mensagens,
  anexos, histórico e notificações; administradores acessam tudo.
- Permissões por coluna: o usuário só consegue alterar nome e telefone; não consegue mudar papel,
  status de chamado, número de protocolo ou datas.
- Todo cadastro recebe o papel `user` por trigger; o papel `admin` só pode ser dado pelo SQL Editor
  do Supabase (`promote_to_admin`), nunca pela API.
- Notas internas e seus anexos ficam invisíveis para o usuário, inclusive via Realtime e Storage.
- Bucket de anexos privado, com tipos e tamanho limitados e políticas RLS; arquivos abertos por URL assinada de 5 minutos.
- O frontend usa somente a chave pública `anon`. A chave `service_role` nunca é usada.

O script `supabase/tests/01-security-tests.sql` contém os testes de permissão executados durante o desenvolvimento.

## Estrutura

```
central-suporte-ti/
├── public/                 favicon e _headers (segurança) da Cloudflare; rotas SPA em wrangler.jsonc
├── supabase/
│   ├── schema.sql          estrutura completa do banco, RLS, Storage e Realtime
│   ├── promote-admin.sql   cria o primeiro administrador
│   └── tests/              testes de permissões em PostgreSQL
├── docs/                   guias de Supabase, Cloudflare, domínio, e-mail e checklist de testes
└── src/
    ├── config/brand.ts     nome da plataforma (personalizável)
    ├── lib/                cliente Supabase, consultas, validação, formatação, CSV
    ├── contexts/           autenticação, tema e avisos (toasts)
    ├── routes/             proteção de rotas
    ├── components/
    │   ├── ui/             botões, campos, cards, badges, gráficos, diálogos, paginação
    │   ├── layout/         cabeçalho público, rodapé, menu lateral, sino de notificações
    │   └── tickets/        tabela, filtros, detalhe com chat, histórico e anexos
    └── pages/              páginas públicas, auth, usuário e admin
```

## Instalação local

Requisitos: Node.js 20 ou superior e um projeto no Supabase.

```bash
git clone https://github.com/yuriguimaa/central-suporte-ti.git
cd central-suporte-ti
npm install
cp .env.example .env.local   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev                  # http://localhost:5173
```

Comandos: `npm run dev` (desenvolvimento), `npm run build` (gera `dist/`), `npm run preview` (testa o build).

## Guias

1. [Configurar o Supabase](docs/SUPABASE.md) (banco, autenticação, Storage, variáveis, primeiro administrador)
2. [Publicar na Cloudflare Pages](docs/CLOUDFLARE.md)
3. [Configurar domínio próprio](docs/DOMINIO.md)
4. [Notificações por e-mail (futuro)](docs/NOTIFICACOES-EMAIL.md)
5. [Checklist de testes](docs/CHECKLIST-TESTES.md)

## Personalização

- **Nome:** `VITE_APP_NAME` e `VITE_APP_SHORT_NAME` nas variáveis de ambiente (ou `src/config/brand.ts`).
  Altere também o `<title>` em `index.html`.
- **Logomarca:** `src/components/ui/Logo.tsx` e `public/favicon.svg`.
- **Cores:** tokens no início de `src/index.css` (modo claro e escuro).
