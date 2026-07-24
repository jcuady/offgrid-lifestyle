# Auth / session domain terms

| Term | Meaning |
|---|---|
| **Auth session bootstrap** | Single module that owns URL callback consume (`detectSessionInUrl`), recovery stash, portal user hydrate, and one `onAuthStateChange` listener. |
| **Recovery intent** | `sessionStorage` flag (`og-pw-recovery`) marking an in-progress password reset; gates push/shipping side effects. |
| **Recovery token stash** | Snapshot of hash tokens before GoTrue clears the URL; used by `ensureRecoverySession` / `setSession`. |
| **Post-login side effects** | Push subscription link + customer shipping hydrate; run once per new portal identity, never during recovery. |
| **Auth callback kind** | `recovery` \| `signup_confirm` \| `session` \| `none` — from `classifyAuthCallback`. |
| **Portal user** | Row in `og_portal_users` (not `auth.users`); roles: customer, staff, admin. |
