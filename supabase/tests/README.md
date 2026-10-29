# Testes de permissão (SQL)

Simulam o ambiente do Supabase (papéis `anon`/`authenticated`, `auth.uid()`, Storage) em um PostgreSQL 15+ local:

```bash
createdb suporte_teste
psql -d suporte_teste -f supabase/tests/00-mock-supabase.sql
psql -d suporte_teste -f supabase/schema.sql
psql -d suporte_teste -f supabase/tests/01-security-tests.sql
```

Cada linha numerada indica o resultado esperado; as marcadas "(deve falhar)" precisam terminar em erro de permissão.
**Não execute estes arquivos no projeto real do Supabase.**
