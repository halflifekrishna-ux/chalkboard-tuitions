-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0013: Batch-level slot (drop the subject-wise
-- schedule rule)
--
-- Reality on the ground: a batch meets at ONE dedicated slot (e.g. Grade 8,
-- Mon–Fri and sometimes Sat, 5–7 PM) and the teacher mixes subjects freely
-- inside that slot — there is no fixed "Maths is always Monday" rule. The old
-- model forced a separate days/start_time/end_time schedule onto every
-- `batch_subjects` row, which is the "slot-wise subject-wise rule" this
-- migration removes.
--
-- New model: the slot (days[], start_time, end_time, room) lives on `batches`
-- itself. `batch_subjects` becomes a plain list of subjects taught in that
-- batch (subject + teacher + colour tag) with no schedule of its own.
-- `sessions` re-points from batch_subject_id to batch_id, and gains
-- `subject_ids` — the free, day-by-day choice of which subjects were actually
-- covered, picked when the session is marked/finished.
--
-- Nothing is dropped: batch_subjects.days/start_time/end_time/room stay in
-- place (unused going forward) so this is trivially reversible; attendance
-- history is untouched.
--
-- Idempotent. Run after 0012.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── The batch's own slot ─────────────────────────────────────────────────────
alter table public.batches add column if not exists days text[] not null default '{}';
alter table public.batches add column if not exists start_time time;
alter table public.batches add column if not exists end_time time;
alter table public.batches add column if not exists room text;

-- Backfill from each batch's earliest active subject-slot (best-effort — most
-- batches were migrated 1:1 from a single `classes` row in 0005 and already
-- share one schedule across their subjects).
update public.batches b
set days = coalesce(bs.days, '{}'),
    start_time = bs.start_time,
    end_time = bs.end_time,
    room = bs.room
from (
  select distinct on (batch_id) batch_id, days, start_time, end_time, room
  from public.batch_subjects
  where deleted_at is null
  order by batch_id, created_at asc
) bs
where bs.batch_id = b.id
  and b.days = '{}';

-- Any batch still without a schedule (no subjects yet) defaults to weekdays —
-- matches "Monday to Friday, sometimes Saturday" as the common case.
update public.batches set days = '{mon,tue,wed,thu,fri}' where days = '{}';

-- ── Sessions re-pointed to the batch, not the subject-slot ──────────────────
alter table public.sessions add column if not exists batch_id uuid references public.batches (id);
alter table public.sessions add column if not exists subject_ids uuid[] not null default '{}';

update public.sessions s
set batch_id = bs.batch_id
from public.batch_subjects bs
where bs.id = s.batch_subject_id
  and s.batch_id is null;

update public.sessions s
set subject_ids = array[bs.subject_id]
from public.batch_subjects bs
where bs.id = s.batch_subject_id
  and s.subject_ids = '{}';

-- New uniqueness on the batch axis (lazy upsert per batch/day/time). The old
-- batch_subject-keyed index is left in place for historical rows / rollback.
create unique index if not exists idx_sessions_batch_date_time
  on public.sessions (batch_id, session_date, start_time) where batch_id is not null;
