# Chalkboard OS — Internal Admin Portal

Tuition management system living alongside the marketing site at `/admin`.
Phase 1 ships: authentication, database foundation, feature flags, dashboard, student CRUD.

## Architecture

| Layer | Choice | Why |
|---|---|---|
| Auth | Supabase Auth (cookie sessions via `@supabase/ssr`) + `admins` allowlist table | No new infra; roles enum already covers teacher/parent/student portals |
| Authorization | RLS on every table via `is_active_admin()` | Future portals add narrower policies — zero schema change |
| Data access | Server Components + Server Actions, RLS-scoped client | No client-side keys beyond the anon key; no API routes needed for CRUD |
| Validation | Zod schema shared between client (react-hook-form) and server action | One source of truth |
| Flags | `feature_flags` table read server-side per request | Toggle modules from the DB, nav updates instantly |
| Student IDs | `CBT-0001` from a Postgres sequence | Stable, printable, QR-ready (flag `qr_attendance` exists, off) |

### Folder map
```
supabase/migrations/0001_chalkboard_os_foundation.sql   ← full schema + seed
middleware.ts                                            ← /admin session guard
src/lib/os/          supabase-server.ts · auth.ts · flags.ts · types.ts
src/app/admin/login/                                     ← login page + actions
src/app/admin/(portal)/                                  ← auth-guarded shell
  layout.tsx (sidebar/bottom-nav) · page.tsx (dashboard)
  students/  page · new · [id] · [id]/edit · actions.ts · schema.ts
  attendance/ classes/ whatsapp/                         ← Phase 2 placeholders
src/components/admin/  AdminNav · StudentForm · ComingSoon
```

## One-time setup

1. **Run the migration** — paste `supabase/migrations/0001_chalkboard_os_foundation.sql`
   into Supabase Dashboard → SQL Editor → Run. Idempotent; safe to re-run.
2. **Create Nanditha's login** — Supabase Dashboard → Authentication → Users →
   *Add user* → email `nanditha@chalkboardtuitions.in` + a strong password
   (tick "auto-confirm"). The seed already added her to `admins`; the row binds
   to her auth user on first login.
   To use a different email, update it in the `admins` table too.
3. Deploy — no new env vars needed (uses the existing `NEXT_PUBLIC_SUPABASE_*`).

## Day-to-day

- `/admin/login` → sign in → dashboard.
- Add students at `/admin/students/new`. Parents are deduplicated by phone
  number — two siblings entered with the same parent phone share one parent record.
- Archive (soft delete) from the student detail page; data is retained,
  `deleted_at` is set.
- Toggle features: flip `enabled` in the `feature_flags` table.

## Roadmap
- **Phase 2** — Classes + class sessions, tap-to-mark attendance, WhatsApp Cloud API notifications.
- **Phase 3** — Homework, weekly reports (AI-ready), fees & payments.
- **Phase 4** — Teacher/parent portals (roles + RLS policies already in place), QR attendance, analytics.
