\set ON_ERROR_STOP 0
\set A '''aaaaaaaa-0000-0000-0000-000000000001'''
\set B '''bbbbbbbb-0000-0000-0000-000000000002'''
\set ADM '''cccccccc-0000-0000-0000-000000000003'''
insert into auth.users values (:A, 'a@x.com', '{"full_name":"Ana Souza","phone":"(11) 91234-5678","role":"admin"}');
insert into auth.users values (:B, 'b@x.com', '{"full_name":"Bruno Lima"}');
insert into auth.users values (:ADM, 'yuri@x.com', '{"full_name":"Yuri G"}');
select '1 papel inicial (todos user):' t, string_agg(role::text, ',') from profiles;
select '2 promote:' t, promote_to_admin('yuri@x.com');

-- user A
set role authenticated; set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
select '3 promote via API (deve falhar)' t; select promote_to_admin('a@x.com');
insert into tickets (title, description, category, priority) values ('Computador não liga', 'Não liga desde cedo hoje', 'computadores', 'alta') returning '4 ticket A nº', ticket_number, status;
select '5 tentar status na criação (deve falhar)' t; insert into tickets (title, description, category, status) values ('Teste status', 'descricao longa ok', 'outros', 'resolvido');
select '6 tentar mudar role (deve falhar)' t; update profiles set role='admin' where id = auth.uid();
update profiles set full_name='Ana S. Souza' where id = auth.uid() returning '7 editar nome ok', full_name;
select '8 atualizar status do proprio ticket (0 linhas/erro)' t; update tickets set status='resolvido';
reset role;

-- user B
set role authenticated; set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002';
select '9 B vê tickets de A? (0)' t, count(*) from tickets;
select '10 B vê perfis (1)' t, count(*) from profiles;
insert into tickets (title, description, category) values ('Impressora travada', 'Papel enroscado sempre', 'impressoras') returning '11 ticket B nº', ticket_number;
select '12 B envia msg no ticket de A (deve falhar)' t;
insert into ticket_messages (ticket_id, message) select id, 'oi' from tickets where ticket_number=1;
insert into ticket_messages (ticket_id, message) values ((select id from tickets where ticket_number=1 limit 1), 'hack');
reset role;

-- admin
set role authenticated; set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000003';
select '13 admin vê todos (2)' t, count(*) from tickets;
select '14 notificações admin (2)' t, count(*), string_agg(title, ' | ') from notifications;
update tickets set status='em_andamento' where ticket_number=1 returning '15 admin altera status', status, updated_at > created_at;
insert into ticket_messages (ticket_id, message, is_internal) select id, 'nota secreta', true from tickets where ticket_number=1;
insert into ticket_messages (ticket_id, message) select id, 'Pode testar outro cabo?' from tickets where ticket_number=1 returning '16 msg admin', sender_name, sender_role;
update tickets set status='aguardando_usuario' where ticket_number=1;
select '17 stats' t, admin_dashboard_stats()->'by_status', admin_dashboard_stats()->'total';
reset role;

-- user A again
set role authenticated; set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
select '18 A vê msgs (1, sem interna)' t, count(*), bool_or(is_internal) from ticket_messages;
select '19 A notificações' t, string_agg(message, ' | ' order by created_at) from notifications;
insert into ticket_messages (ticket_id, message, is_internal) select id, 'testei, nada', true from tickets where ticket_number=1 returning '20 msg A is_internal forçado false', is_internal;
select '21 status voltou p/ em_andamento' t, status from tickets where ticket_number=1;
select '22 historico A' t, string_agg(action||':'||coalesce(old_value,'')||'>'||coalesce(new_value,''), ', ' order by created_at) from ticket_history;
select '23 A marca notificação lida' t; update notifications set is_read = true returning id is not null;
select '24 A altera titulo notif (deve falhar)' t; update notifications set title='x';
-- storage
insert into storage.objects (bucket_id, name) select 'ticket-attachments', id||'/f1-print.png' from tickets where ticket_number=1 returning '25 upload A ok', name is not null;
select '26 upload na pasta de B (deve falhar)' t;
insert into storage.objects (bucket_id, name) values ('ticket-attachments', (select id from tickets where ticket_number=2)::text || '/x.png');
insert into ticket_attachments (ticket_id, storage_path, file_name, file_type, file_size) select id, id||'/f1-print.png', 'print.png', 'image/png', 1000 from tickets where ticket_number=1 returning '27 metadata ok', id is not null;
select '28 tipo inválido (deve falhar)' t; insert into ticket_attachments (ticket_id, storage_path, file_name, file_type, file_size) select id, id||'/x.exe', 'x.exe', 'application/x-msdownload', 10 from tickets where ticket_number=1;
select '29 dashboard stats como user (deve falhar)' t; select admin_dashboard_stats();
reset role;

-- admin internal attachment
set role authenticated; set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000003';
insert into storage.objects (bucket_id, name) select 'ticket-attachments', id||'/interno.pdf' from tickets where ticket_number=1;
insert into ticket_attachments (ticket_id, message_id, storage_path, file_name, file_type, file_size)
  select t.id, m.id, t.id||'/interno.pdf', 'interno.pdf', 'application/pdf', 500 from tickets t join ticket_messages m on m.ticket_id=t.id and m.is_internal where t.ticket_number=1;
select admin_set_user_active('bbbbbbbb-0000-0000-0000-000000000002', false);
select '30 admin desativa a si mesmo (deve falhar)' t; select admin_set_user_active('cccccccc-0000-0000-0000-000000000003', false);
update tickets set status='encerrado' where ticket_number=1 returning '31 encerrar', closed_at is not null, resolved_at is not null;
reset role;

set role authenticated; set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
select '32 A vê anexos (1, sem interno)' t, count(*) from ticket_attachments;
select '33 A vê objetos storage (1)' t, count(*) from storage.objects;
select '34 A msg em encerrado (deve falhar)' t; insert into ticket_messages (ticket_id, message) select id, 'oi' from tickets where ticket_number=1;
reset role;
set role authenticated; set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002';
select '35 B desativado abre ticket (deve falhar)' t; insert into tickets (title, description, category) values ('Outro problema', 'descricao longa ok', 'outros');
reset role;
set role anon; select '36 anon tickets (erro ou 0)' t; select count(*) from tickets; select '37 anon settings' t, count(*) from app_settings; reset role;
