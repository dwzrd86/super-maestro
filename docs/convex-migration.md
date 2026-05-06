# Convex database migration

Super Maestro now treats Convex as the cloud database for teams, users, agents, playbooks, runs, and messages.

CozoDB remains the optional local embedded memory store for per-agent graph memory. Convex replaces the previous Supabase/PostgreSQL application database layer.

## What moved to Convex

The Convex schema in `convex/schema.ts` mirrors the former application tables:

- `teams`
- `user_profiles`
- `team_members`
- `agents`
- `agent_sessions`
- `playbooks`
- `playbook_tasks`
- `playbook_runs`
- `messages`

Convex automatically provides `_id` and `_creationTime` on each document. Existing `created_at` fields should be read from `_creationTime`; mutable timestamp fields such as `updated_at`, `started_at`, and `completed_at` are stored as epoch milliseconds.

## Development commands

```bash
npm run convex:dev      # Start Convex dev and generate Convex types
npm run convex:deploy   # Deploy Convex functions/schema
npm run convex:codegen  # Generate Convex client types without starting dev
```

Set `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local` after creating a Convex deployment.

## Migration notes

- Convex document IDs replace UUID primary keys.
- Convex indexes replace SQL indexes; uniqueness such as team slug uniqueness should be enforced in mutations.
- Supabase row-level security policies become authorization checks inside Convex queries and mutations.
- SQL triggers for `updated_at` become explicit mutation logic that sets `Date.now()`.
