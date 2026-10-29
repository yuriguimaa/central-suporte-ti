# Checklist de testes

Use duas contas: **Admin** (promovida com `promote_to_admin`) e **Usuário A**; para os testes de isolamento,
uma terceira conta **Usuário B**. Faça os testes no computador e no celular.

## Autenticação
- [ ] Cadastro com nome sem sobrenome, e-mail inválido, senha curta e senhas diferentes mostra erros claros.
- [ ] Cadastro válido envia e-mail de confirmação (ou entra direto se a confirmação estiver desligada).
- [ ] Cadastro com e-mail já existente mostra aviso.
- [ ] Login com senha errada mostra "E-mail ou senha incorretos."
- [ ] Usuário comum cai em `/painel`; administrador cai em `/admin`.
- [ ] "Esqueci minha senha" envia e-mail; o link abre `/redefinir-senha` e a nova senha funciona.
- [ ] Atualizar a página mantém a sessão; "Sair" pede confirmação e encerra a sessão.
- [ ] Sem login, abrir `/painel` ou `/admin` leva ao login; depois de entrar, volta para a página pedida.
- [ ] Usuário comum abrindo `/admin` é redirecionado para `/painel`.

## Chamados (usuário)
- [ ] Abrir chamado sem título/categoria/descrição mostra erros.
- [ ] Anexar arquivo .exe, .docx ou maior que 10 MB é recusado com mensagem.
- [ ] Abrir chamado com 2 anexos mostra "Chamado #00000N aberto com sucesso!".
- [ ] O número é sequencial e não repete (abrir dois chamados seguidos).
- [ ] Dashboard mostra os contadores corretos e o chamado nos recentes.
- [ ] Busca por número (com ou sem #), filtros de status, prioridade e categoria, ordenação e paginação funcionam.
- [ ] Detalhe mostra protocolo, datas, tempo decorrido, histórico e anexos (abrem em nova aba).
- [ ] Imprimir mostra só o conteúdo do chamado.

## Atendimento (admin)
- [ ] Admin recebe notificação "Novo chamado recebido: #…" na hora (sem recarregar).
- [ ] Dashboard mostra totais, gráficos, recentes e o quadro de urgentes.
- [ ] Filtro por usuário em "Todos os chamados".
- [ ] "Iniciar atendimento" muda para Em andamento; histórico registra "Chamado alterado de Aberto para Em andamento em …".
- [ ] Usuário recebe "Seu chamado #… está em andamento." no sino.
- [ ] Resposta do admin aparece em tempo real para o usuário e gera "Você recebeu uma nova resposta do suporte."
- [ ] **Nota interna** (e anexo nela) não aparece para o usuário.
- [ ] "Aguardar resposta do usuário"; quando o usuário responde, o status volta para Em andamento.
- [ ] Alterar prioridade e categoria registra no histórico.
- [ ] "Registrar solução" marca como Resolvido e o usuário vê a solução.
- [ ] "Encerrar atendimento" pede confirmação; o usuário não consegue mais enviar mensagens.
- [ ] "Reabrir chamado" pede confirmação e notifica o usuário.

## Usuários e relatórios (admin)
- [ ] Lista de usuários com busca, contagem de chamados e situação da conta.
- [ ] Desativar o Usuário B: ao recarregar, ele é desconectado e não consegue abrir chamados.
- [ ] Reativar o Usuário B.
- [ ] Relatórios: filtro de período, status e categoria; "Exportar CSV" abre corretamente no Excel (acentos ok).
- [ ] Configurações: salvar contato do suporte.

## Isolamento e segurança
- [ ] Usuário B não vê chamados do Usuário A (lista e URL direta `/painel/chamados/1`).
- [ ] No console do navegador, logado como usuário, `supabase.from('profiles').update({role:'admin'})` falha.
- [ ] O bucket `ticket-attachments` está privado (URL pública do arquivo não abre).
- [ ] Nenhuma chave `service_role` em `.env`, no código ou nas variáveis da Cloudflare.
- [ ] Testes SQL automatizados: veja `supabase/tests/` (executáveis em um PostgreSQL local).

## Interface
- [ ] Modo claro/escuro alterna e é lembrado.
- [ ] Menu lateral vira gaveta no celular; tabelas viram cartões.
- [ ] Navegação por teclado (Tab) mostra o foco; diálogos fecham com Esc.
