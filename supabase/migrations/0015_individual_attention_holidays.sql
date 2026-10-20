-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0015: Individual Attention, public holidays,
--                                  and sessions that didn't happen
--
-- Builds on the batch-slot model from 0013 (the slot lives on `batches`, a
-- session is one dated occurrence of a batch). Three gaps remain:
--
--   1. INDIVIDUAL ATTENTION — several of Nanditha's classes are one student
--      with their own timing (Abigail 6–7, Harshith 11–1). Today those are
--      just batches that happen to hold one student, with nothing recording
--      that the whole class belongs to that student.
--
--   2. PUBLIC HOLIDAYS — no way to say "nothing ran on 9 Sep", so a holiday
--      looks identical to a class nobody marked.
--
--   3. A SESSION THAT DIDN'T HAPPEN — status covers scheduled / in_progress /
--      completed / cancelled, with no holiday and no way to say a class moved
--      to another date.
--
-- Additive only. Nothing in 0011–0014 is modified, no column is dropped, and
-- existing rows keep working: `session_category` defaults to 'combined_class',
-- which is what every current batch and session already is.
--
-- Idempotent. Run after 0014.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Combined Class vs Individual Attention ───────────────────────────────
-- CREATE TYPE (not ALTER TYPE ADD VALUE), so the values are usable in this
-- same migration — including as a column default.
do $$ begin
  create type session_category as enum ('combined_class', 'individual_attention');
exception when duplicate_object then null; end $$;

-- On the class: this is what the class IS, and new sessions inherit it.
alter table public.batches
  add column if not exists session_category session_category not null default 'combined_class';
alter table public.batches
  add column if not exists student_id uuid references public.students (id);

-- Individual Attention belongs to exactly one student; a Combined Class to none.
alter table public.batches drop constraint if exists chk_batches_individual;
alter table public.batches add constraint chk_batches_individual check (
  (session_category = 'individual_attention' and student_id is not null)
  or (session_category = 'combined_class' and student_id is null)
);

create index if not exists idx_batches_student on public.batches (student_id)
  where student_id is not null;

-- ── 2. Sessions carry their own copy ────────────────────────────────────────
-- Copied from the class when the session is created, then independently
-- editable — a one-off change must never rewrite the recurring class.
alter table public.sessions
  add column if not exists session_category session_category not null default 'combined_class';
alter table public.sessions
  add column if not exists student_id uuid references public.students (id);

alter table public.sessions drop constraint if exists chk_sessions_individual;
alter table public.sessions add constraint chk_sessions_individual check (
  (session_category = 'individual_attention' and student_id is not null)
  or (session_category = 'combined_class' and student_id is null)
);

create index if not exists idx_sessions_student on public.sessions (student_id)
  where student_id is not null;

-- ── 3. Sessions that didn't happen ──────────────────────────────────────────
-- ALTER TYPE ... ADD VALUE. Postgres forbids USING a newly added value in the
-- transaction that added it, so this migration never writes 'holiday' or
-- 'rescheduled' — only the application does, later.
alter type session_status add value if not exists 'holiday';
alter type session_status add value if not exists 'rescheduled';

-- Why it didn't run, in Nanditha's words ("Diwali", "Abigail unwell").
alter table public.sessions
  add column if not exists state_note text;

-- A moved class keeps its original date marked 'rescheduled' and points at the
-- replacement, so nothing vanishes from the calendar and nothing shows twice.
alter table public.sessions
  add column if not exists rescheduled_to_session_id uuid references public.sessions (id) on delete set null;
create index if not exists idx_sessions_rescheduled_to on public.sessions (rescheduled_to_session_id)
  where rescheduled_to_session_id is not null;

-- ── 4. Public holidays ──────────────────────────────────────────────────────
-- Deliberately minimal: a date and a name. Not a holiday-management product.
create table if not exists public.holidays (
  id            uuid primary key default gen_random_uuid(),
  holiday_date  date not null unique,
  name          text not null,
  created_by    uuid references public.admins (id),
  created_at    timestamptz not null default now()
);
create index if not exists idx_holidays_date on public.holidays (holiday_date);

-- ── 5. Backfill: a class holding exactly one student is Individual Attention ─
-- Matches how these were actually set up (one student, their own timing).
-- Safe and reversible: set session_category back to 'combined_class' and
-- student_id to null to undo.
update public.batches b
set session_category = 'individual_attention',
    student_id = one.student_id
from (
  select batch_id, min(student_id) as student_id
  from public.batch_students
  group by batch_id
  having count(*) = 1
) one
where one.batch_id = b.id
  and b.deleted_at is null
  and b.session_category = 'combined_class'
  and b.student_id is null
  and b.capacity <= 1;

-- ── 6. RLS — same convention as every other domain table here ───────────────
-- (Broad admin access, matching 0001/0013. Tightening this is Phase 0B and is
--  deliberately NOT done here; 0012's admins hardening is untouched.)
alter table public.holidays enable row level security;
drop policy if exists admin_all on public.holidays;
create policy admin_all on public.holidays for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());

insert into public.schema_migrations (version) values ('0015_individual_attention_holidays')
on conflict (version) do nothing;
