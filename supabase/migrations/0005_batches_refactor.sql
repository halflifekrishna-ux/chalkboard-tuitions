-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0005: Batches / Batch Subjects / Sessions refactor
--
-- New domain: Organization → Branch → Academic Year → Batch → Batch Subject
--             → Session → Attendance → Communication → Reports
--
-- SAFETY: attendance.session_id references class_sessions(id). We RENAME
-- class_sessions → sessions in place, so that FK and ALL attendance history
-- survive untouched. Each old `classes` row becomes one Batch + one Batch
-- Subject; sessions re-point from class_id → batch_subject_id. The legacy
-- `classes` / `class_students` tables are kept intact (unused) for rollback.
--
-- Idempotent. Run after 0004.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type batch_status as enum ('active', 'inactive', 'archived');
exception when duplicate_object then null; end $$;

-- ── Academic years (one current per branch) ─────────────────────────────────
create table if not exists public.academic_years (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid not null references public.branches (id),
  name        text not null,               -- "2026-27"
  start_date  date,
  end_date    date,
  is_current  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (branch_id, name)
);
-- Only one current AY per branch.
create unique index if not exists idx_ay_current on public.academic_years (branch_id) where is_current;

-- ── Batches (fixed group of students) ───────────────────────────────────────
create table if not exists public.batches (
  id                uuid primary key default gen_random_uuid(),
  branch_id         uuid not null references public.branches (id),
  academic_year_id  uuid references public.academic_years (id),
  name              text not null,
  grade             smallint check (grade between 1 and 12),
  board             board_type,
  capacity          smallint not null default 8,
  status            batch_status not null default 'active',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index if not exists idx_batches_branch on public.batches (branch_id) where deleted_at is null;
create index if not exists idx_batches_ay on public.batches (academic_year_id);

-- ── Batch enrolment (students belong to a Batch, not a subject) ─────────────
create table if not exists public.batch_students (
  id          uuid primary key default gen_random_uuid(),
  batch_id    uuid not null references public.batches (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (batch_id, student_id)
);
create index if not exists idx_batch_students_batch on public.batch_students (batch_id);

-- ── Batch Subjects (one subject taught within one batch) = session template ─
-- days[] + start_time + end_time act as the recurring template: a session is
-- auto-generated for any weekday in days[] (lazily, on first Start Session).
create table if not exists public.batch_subjects (
  id           uuid primary key default gen_random_uuid(),
  batch_id     uuid not null references public.batches (id) on delete cascade,
  subject_id   uuid not null references public.subjects (id),
  teacher_id   uuid references public.teachers (id),
  days         text[] not null default '{}',   -- {mon,tue,...}
  start_time   time,
  end_time     time,
  room         text,
  colour       text not null default '#c9a227',
  online_link  text,
  status       batch_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index if not exists idx_batch_subjects_batch on public.batch_subjects (batch_id) where deleted_at is null;

-- ── Rename class_sessions → sessions (preserves attendance FK + history) ────
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='class_sessions')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='sessions') then
    alter table public.class_sessions rename to sessions;
  end if;
end $$;

alter table public.sessions add column if not exists batch_subject_id uuid references public.batch_subjects (id);
alter table public.sessions add column if not exists end_time time;
alter table public.sessions add column if not exists started_by uuid references public.admins (id);
alter table public.sessions add column if not exists started_at timestamptz;

-- ═══════════════════════════════════════════════════════════════════════════
-- DATA MIGRATION  (classes → batches + batch_subjects; sessions re-pointed)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. One current academic year per active branch (name from org settings).
insert into public.academic_years (branch_id, name, is_current)
select b.id,
       coalesce((select value->>'academic_year' from public.system_settings where key='org'), '2026-27'),
       true
from public.branches b
on conflict (branch_id, name) do nothing;

-- 2. classes → batches (temp source_class_id correlates the two).
alter table public.batches add column if not exists source_class_id uuid;
insert into public.batches (branch_id, academic_year_id, name, grade, board, capacity, status, source_class_id, deleted_at)
select c.branch_id, ay.id, c.name, c.grade, c.board, coalesce(c.capacity, 8),
       (case when c.is_active then 'active' else 'inactive' end)::batch_status,
       c.id, c.deleted_at
from public.classes c
left join public.academic_years ay on ay.branch_id = c.branch_id and ay.is_current
where not exists (select 1 from public.batches b where b.source_class_id = c.id);

-- 3. classes → batch_subjects.
alter table public.batch_subjects add column if not exists source_class_id uuid;
insert into public.batch_subjects (batch_id, subject_id, teacher_id, days, start_time, end_time, room, online_link, status, source_class_id, deleted_at)
select bt.id, c.subject_id, c.teacher_id, coalesce(c.days, '{}'), c.start_time, c.end_time, c.room, c.online_link,
       (case when c.is_active then 'active' else 'inactive' end)::batch_status,
       c.id, c.deleted_at
from public.classes c
join public.batches bt on bt.source_class_id = c.id
where c.subject_id is not null
  and not exists (select 1 from public.batch_subjects bs where bs.source_class_id = c.id);

-- 4. class_students → batch_students.
insert into public.batch_students (batch_id, student_id)
select bt.id, cs.student_id
from public.class_students cs
join public.batches bt on bt.source_class_id = cs.class_id
on conflict (batch_id, student_id) do nothing;

-- 5. sessions re-pointed from class_id → batch_subject_id (attendance untouched).
update public.sessions s
set batch_subject_id = bs.id
from public.batch_subjects bs
where bs.source_class_id = s.class_id
  and s.batch_subject_id is null;

-- 6. Drop temp correlation columns.
alter table public.batches drop column if exists source_class_id;
alter table public.batch_subjects drop column if exists source_class_id;

-- Session uniqueness on the new axis (enables lazy upsert per subject/day/time).
create unique index if not exists idx_sessions_bsub_date_time
  on public.sessions (batch_subject_id, session_date, start_time);
create index if not exists idx_sessions_date on public.sessions (session_date);

-- ── updated_at triggers ──────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['academic_years','batches','batch_subjects','sessions'] loop
    execute format(
      'drop trigger if exists trg_%s_updated_at on public.%I;
       create trigger trg_%s_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t, t, t);
  end loop;
end $$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['academic_years','batches','batch_students','batch_subjects'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists admin_all on public.%I;', t);
    execute format(
      'create policy admin_all on public.%I for all to authenticated
       using (public.is_active_admin()) with check (public.is_active_admin());', t);
  end loop;
end $$;

-- sessions already had RLS as class_sessions; ensure it persists post-rename.
alter table public.sessions enable row level security;
drop policy if exists admin_all on public.sessions;
create policy admin_all on public.sessions for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
