# Chalkboard OS — Operations

Deployment, database migrations, backups and recovery for the production system.

## Environments

| Piece | Where |
|---|---|
| App | Vercel → `chalkboard-tuitions.vercel.app` (production alias) |
| Database + Storage + Auth | Supabase project |
| Source | GitHub `halflifekrishna-ux/chalkboard-tuitions`, branch `main` |

`main` auto-deploys to Vercel. `NEXT_PUBLIC_SUPABASE_*` are safe (client);
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_*`, and `WHATSAPP_*` are server-only.

## Deploy

```bash
# from the project root, with Node 20 on PATH
git push origin main            # triggers Vercel build + deploy
# or force a production deploy explicitly:
vercel --prod
```

Verify after deploy:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://chalkboard-tuitions.vercel.app/admin/login   # 200
curl -s -o /dev/null -w "%{http_code}\n" https://chalkboard-tuitions.vercel.app/admin         # 307 → login
```

The Developer panel (`/admin/developer`) shows the live commit hash, version,
environment health, and applied migrations — check it after every deploy.

## Database migrations

Migrations live in `supabase/migrations/` and are **run manually** in the
Supabase SQL Editor (or via `supabase db push`). Run them **in order**; each is
idempotent and safe to re-run.

| File | Adds |
|---|---|
| `0001_chalkboard_os_foundation` | Core schema, RLS, seed |
| `0002_phase1_improvements` | Photos, admission numbers, comms, storage buckets |
| `0003_class_session_notes` | Session topic / homework / teacher notes |
| `0004_communication_queue` | WhatsApp queue |
| `0005_batches_refactor` | Batches / batch subjects / sessions (data-migrating) |
| `0006_polish` | Session rating, subject colour, migrations registry |
| `0007_system_stats` | `get_system_stats()` RPC for the Developer panel |
| `0008_iam` | IAM: role helpers, auth tracking, role-gated RLS, seeds users |
| `0009_demote_nanditha` | Sets Nanditha's role to Admin (separate txn — uses the enum value 0008 added) |
| `0010_cleanup_legacy_admin` | Soft-deletes the legacy `nanditha@chalkboardtuitions.in` row (reversible) |
| `0011_sessions_class_id_nullable` | Makes `sessions.class_id` nullable so new sessions can be created (0005 left the pre-refactor NOT NULL in place) |
| `0012_admins_privilege_escalation_fix` | Closes H-1: splits the `admins` write policy per command (INSERT/DELETE → Super Admin), adds a last-Super-Admin DELETE guard, unique index on `lower(email)`, deterministic `current_admin_role()`, protects a bound `auth_user_id` |
| `0013_batch_slot_simplify` | Moves the schedule (days/start/end time/room) onto `batches` itself — one dedicated slot per batch, any mix of subjects. `sessions` re-points to `batch_id` and gains `subject_ids` (freely picked per session, not a fixed subject-day rule) |
| `0014_crm_leads` | CRM: `crm_leads` + `crm_lead_events`, the `marketing` and `bd` roles, `current_admin_id()`, and role-gated RLS (marketing inserts and reads only; BD works only leads assigned to them) |

> **Run 0008 and 0009 as two separate executions** (two clicks in the SQL
> Editor, or `supabase db push` which runs each file in its own transaction).
> They must not share a transaction: 0008 adds the `admin` enum value and
> Postgres forbids using a new enum value in the same transaction that added it.

After running, confirm in the Developer panel → **Database Migrations** that the
latest version appears.

### First-time setup

1. Run `0001` … `0008` in order.
2. Confirm the two storage buckets exist (Developer panel → Environment → Storage).

### IAM initial users (migration 0008)

The migration seeds two `admins` rows lockout-safely:

| Role | Name | Email |
|---|---|---|
| Super Admin | Sreejith P Krishna | `Sreejithpkrishna@outlook.com` |
| Admin | Nanditha | `nandithaskrishna2000@gmail.com` |

Because migrations can't create Supabase **auth** users, create the login
accounts once in Supabase → Authentication → Users (auto-confirm ON):

1. Add `Sreejithpkrishna@outlook.com` with a strong password. On first sign-in
   it binds to the seeded Super Admin row.
2. Add `nandithaskrishna2000@gmail.com` similarly (Admin).

New users created later go through **Users → Add** in the app — that mints the
auth account + temp password automatically (no dashboard step needed).

### Super Admin transfer (avoid lockout)

To hand over Super Admin: open the target user → **Transfer Super Admin** →
either "Promote (keep mine)" or "Promote & step me down". The target is promoted
first; a database trigger guarantees at least one active Super Admin always
remains, so accidental lockout is impossible. The last Super Admin can never be
disabled or removed.

## Backups

Supabase provides automated backups by plan:

- **Daily backups** (Pro plan and above) — retained per plan; restore from the
  Supabase Dashboard → Database → Backups.
- **Point-in-time recovery (PITR)** — enable on the Supabase project for
  minute-level restore (recommended before go-live).

Manual logical backup (portable, before risky changes):

```bash
# full schema + data dump (needs the DB connection string from Supabase → Settings → Database)
pg_dump "$SUPABASE_DB_URL" --no-owner --format=custom --file=chalkboard_$(date +%F).dump

# restore into a fresh database
pg_restore --no-owner --dbname="$TARGET_DB_URL" chalkboard_YYYY-MM-DD.dump
```

Storage objects (photos, documents) are backed up separately — use the Supabase
Storage API or dashboard export; they are not part of `pg_dump`.

## Recovery runbook

**Symptom triage — start at the Developer panel (`/admin/developer`):**

| What you see | Likely cause | Action |
|---|---|---|
| Supabase = **down** | DB unreachable / paused / bad keys | Check Supabase project status; verify `NEXT_PUBLIC_SUPABASE_*` in Vercel |
| WhatsApp = **warn** | Meta creds absent | Expected until go-live; messages stay queued, nothing lost |
| Storage = **warn** (missing buckets) | Migration 0002 not run | Run `0002` |
| Failed jobs > 0 | Meta API errors | Fix creds/templates, then **Retry failed** on `/admin/whatsapp` |
| Migration missing | Migration not applied | Run the missing SQL file |

**Attendance is never lost:** it commits before WhatsApp is touched. If dispatch
fails, queue rows are marked `failed` and retryable; attendance rows are intact.

**Rollback a bad deploy:** Vercel → Deployments → promote the previous
production deployment. Code rollbacks do not touch the database.

**Rollback the batches refactor (0005):** the legacy `classes` /
`class_students` tables were preserved. Data can be re-derived from them if ever
needed; no destructive drop was performed.

## Routine checks

- **Daily:** glance at the dashboard (attendance %, queued messages) and clear
  any failed WhatsApp jobs.
- **After each deploy:** Developer panel — version, commit, env all green.
- **Monthly:** confirm a recent Supabase backup exists and PITR is on.
