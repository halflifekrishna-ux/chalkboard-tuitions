-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0011: Make sessions.class_id nullable
--
-- WHY: 0001 created class_sessions.class_id as NOT NULL. 0005 renamed that
-- table to `sessions` and introduced batch_subject_id as the real parent, but
-- never relaxed the old constraint. The application has not written class_id
-- since that refactor — startSession/finishSession insert only
-- (batch_subject_id, session_date, start_time, end_time, status, …) — so
-- creating a new session raises 23502 and cannot succeed.
--
-- This was invisible because startSession discards the insert result
-- (src/app/admin/(portal)/attendance/actions.ts) and redirects regardless.
--
-- SAFETY:
--   • Production verified: 0 rows in public.sessions → no backfill, no data
--     migration, nothing to lose.
--   • class_id, its FK to classes(id), and the legacy
--     unique (class_id, session_date, start_time) constraint are ALL RETAINED.
--     NULLs are distinct under a unique constraint and satisfy the FK, so the
--     retained objects stay valid and rollback-safe.
--   • Idempotent: DROP NOT NULL is a no-op if already nullable.
--
-- ROLLBACK (only valid while no NULL class_id rows exist):
--   alter table public.sessions alter column class_id set not null;
--
-- Run after 0010.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.sessions alter column class_id drop not null;

insert into public.schema_migrations (version) values ('0011_sessions_class_id_nullable')
on conflict (version) do nothing;
