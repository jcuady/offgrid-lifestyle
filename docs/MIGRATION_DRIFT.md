# Migration history drift

Local `supabase/migrations/` and remote `supabase_migrations.schema_migrations` are **not** 1:1.

## Rules

1. **Never** run `supabase db push` until this drift is reconciled — it can re-apply or conflict with remote-only history.
2. Prefer applying new SQL with `npx supabase db query --linked -f <file.sql>`, then mark it applied:
   ```bash
   npx supabase migration repair --status applied <timestamp>
   ```
3. Remote-only timestamps (empty local) are historical dashboard/CLI applies — leave them; do not invent matching local files unless you pull schema intentionally.

## Applied via query (session 2026-08-01)

| Timestamp | Notes |
|-----------|--------|
| `20260801054139` | catalog terms |
| `20260801065719` | event registrations |
| `20260801070932` | plan board |
| `20260801134500` | advisor security hygiene |

Mark those with `migration repair --status applied` after confirming objects exist on the linked project.
