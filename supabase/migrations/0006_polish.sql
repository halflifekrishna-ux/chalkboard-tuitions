-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0006: Product polish
-- Optional session rating, per-subject default colour, and a migrations
-- registry that powers the Developer panel. Idempotent; run after 0005.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Optional class rating captured on Finish Session (1–5) ──────────────────
alter table public.sessions add column if not exists rating smallint check (rating between 1 and 5);

-- ── Per-subject default colour (seeds a batch subject's colour) ─────────────
alter table public.subjects add column if not exists colour text not null default '#c9a227';

-- ── Migrations registry (Developer panel reads this) ────────────────────────
create table if not exists public.schema_migrations (
  version     text primary key,
  applied_at  timestamptz not null default now()
);

-- Backfill every migration up to and including this one (safe if re-run).
insert into public.schema_migrations (version) values
  ('0001_chalkboard_os_foundation'),
  ('0002_phase1_improvements'),
  ('0003_class_session_notes'),
  ('0004_communication_queue'),
  ('0005_batches_refactor'),
  ('0006_polish')
on conflict (version) do nothing;

alter table public.schema_migrations enable row level security;
drop policy if exists admin_all on public.schema_migrations;
create policy admin_all on public.schema_migrations for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());

-- ── Relabel the legacy "classes" flag → "Batches" (nav + Developer panel) ───
update public.feature_flags set label = 'Batches', description = 'Batch & subject management'
where key = 'classes';
