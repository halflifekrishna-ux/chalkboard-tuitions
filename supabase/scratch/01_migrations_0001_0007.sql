-- SCRATCH BUNDLE 1 of 4 — migrations 0001 through 0007
-- Paste-and-run FIRST. Contents are byte-identical to supabase/migrations/.
-- Only inert SQL comment separators were added between files.


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0001_chalkboard_os_foundation.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0001: Foundation
-- Multi-branch, multi-role schema. Only Super Admin is active today;
-- every future portal (teacher/parent/student) reads from these same tables.
-- Run this in the Supabase SQL Editor (or `supabase db push`).
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type admin_role as enum ('super_admin', 'branch_admin', 'teacher', 'reception', 'parent', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type board_type as enum ('cbse', 'icse', 'state_board');
exception when duplicate_object then null; end $$;

do $$ begin
  create type student_status as enum ('active', 'trial', 'paused', 'alumni', 'dropped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status as enum ('present', 'absent', 'late', 'excused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type session_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type fee_status as enum ('draft', 'due', 'partially_paid', 'paid', 'overdue', 'waived', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_status as enum ('queued', 'sent', 'delivered', 'read', 'failed');
exception when duplicate_object then null; end $$;

-- ── updated_at trigger helper ────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- CORE: branches, admins (staff/users), feature flags, settings
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.branches (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  address      text,
  city         text default 'Bangalore',
  phone        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- Staff/user accounts. Only super_admin rows are usable today; the role enum
-- already covers every future portal.
create table if not exists public.admins (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  branch_id     uuid references public.branches (id),
  full_name     text not null,
  email         text not null unique,
  phone         text,
  role          admin_role not null default 'super_admin',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists idx_admins_email on public.admins (lower(email));
create index if not exists idx_admins_auth_user on public.admins (auth_user_id);

create table if not exists public.feature_flags (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  label        text not null,
  description  text,
  enabled      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.system_settings (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  value        jsonb not null default '{}'::jsonb,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PEOPLE: teachers, parents, students
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.teachers (
  id            uuid primary key default gen_random_uuid(),
  branch_id     uuid not null references public.branches (id),
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  full_name     text not null,
  phone         text,
  email         text,
  subjects_note text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists idx_teachers_branch on public.teachers (branch_id);

create table if not exists public.parents (
  id               uuid primary key default gen_random_uuid(),
  auth_user_id     uuid unique references auth.users (id) on delete set null,
  full_name        text not null,
  phone            text not null,
  whatsapp_number  text,
  alternate_phone  text,
  email            text,
  relationship     text default 'parent',   -- father / mother / guardian
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);
create unique index if not exists idx_parents_phone on public.parents (phone) where deleted_at is null;

-- Human-friendly student codes (CBT-0001…) — stable, printable, QR-ready.
create sequence if not exists public.student_code_seq start 1;

create table if not exists public.students (
  id                 uuid primary key default gen_random_uuid(),
  student_code       text not null unique
                     default ('CBT-' || lpad(nextval('public.student_code_seq')::text, 4, '0')),
  branch_id          uuid not null references public.branches (id),
  parent_id          uuid not null references public.parents (id),
  auth_user_id       uuid unique references auth.users (id) on delete set null,
  full_name          text not null,
  grade              smallint not null check (grade between 1 and 12),
  board              board_type not null,
  school_name        text,
  date_of_birth      date,
  gender             text,
  status             student_status not null default 'active',
  joined_on          date not null default current_date,
  emergency_contact  text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create index if not exists idx_students_branch  on public.students (branch_id) where deleted_at is null;
create index if not exists idx_students_parent  on public.students (parent_id);
create index if not exists idx_students_status  on public.students (status) where deleted_at is null;
create index if not exists idx_students_name    on public.students using gin (to_tsvector('simple', full_name));

-- ═══════════════════════════════════════════════════════════════════════════
-- ACADEMICS: subjects, enrolment, classes, sessions
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  short_code  text unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.student_subjects (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students (id) on delete cascade,
  subject_id  uuid not null references public.subjects (id),
  created_at  timestamptz not null default now(),
  unique (student_id, subject_id)
);

-- A "class" is a recurring batch (Grade 6 Maths @ 5 PM); sessions are instances.
create table if not exists public.classes (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references public.branches (id),
  subject_id     uuid references public.subjects (id),
  teacher_id     uuid references public.teachers (id),
  name           text not null,
  grade          smallint check (grade between 1 and 12),
  board          board_type,
  room           text,
  schedule_note  text,                      -- "Mon–Fri 5:00–6:00 PM"
  start_time     time,
  duration_mins  smallint default 60,
  is_online      boolean not null default false,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index if not exists idx_classes_branch on public.classes (branch_id) where deleted_at is null;

create table if not exists public.class_students (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists public.class_sessions (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes (id),
  session_date  date not null,
  start_time    time,
  status        session_status not null default 'scheduled',
  topic_covered text,
  started_at    timestamptz,
  completed_at  timestamptz,
  completed_by  uuid references public.admins (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (class_id, session_date, start_time)
);
create index if not exists idx_sessions_date on public.class_sessions (session_date);

-- ═══════════════════════════════════════════════════════════════════════════
-- ATTENDANCE
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.attendance (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.class_sessions (id) on delete cascade,
  student_id   uuid not null references public.students (id),
  status       attendance_status not null,
  marked_by    uuid references public.admins (id),
  marked_at    timestamptz not null default now(),
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (session_id, student_id)
);
create index if not exists idx_attendance_student on public.attendance (student_id);
create index if not exists idx_attendance_session on public.attendance (session_id);

-- Immutable change history (who flipped whom from absent→present, etc.)
create table if not exists public.attendance_logs (
  id             uuid primary key default gen_random_uuid(),
  attendance_id  uuid not null references public.attendance (id) on delete cascade,
  old_status     attendance_status,
  new_status     attendance_status not null,
  changed_by     uuid references public.admins (id),
  created_at     timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUTURE MODULES (schema-ready, feature-flagged off)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.homework (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.classes (id),
  session_id   uuid references public.class_sessions (id),
  title        text not null,
  description  text,
  due_date     date,
  assigned_by  uuid references public.admins (id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table if not exists public.weekly_reports (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students (id),
  week_start       date not null,
  attendance_pct   numeric(5,2),
  topics_covered   text,
  homework_summary text,
  teacher_remarks  text,
  performance      jsonb default '{}'::jsonb,
  generated_by     text default 'manual',   -- manual | ai
  sent_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (student_id, week_start)
);

create table if not exists public.fees (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students (id),
  title        text not null,
  amount       numeric(10,2) not null,
  currency     text not null default 'INR',
  due_date     date,
  status       fee_status not null default 'due',
  period_start date,
  period_end   date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index if not exists idx_fees_student on public.fees (student_id);

create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  fee_id       uuid not null references public.fees (id),
  amount       numeric(10,2) not null,
  method       text default 'upi',          -- cash | upi | bank_transfer
  reference    text,
  received_by  uuid references public.admins (id),
  received_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references public.students (id) on delete cascade,
  parent_id     uuid references public.parents (id) on delete cascade,
  storage_path  text not null,               -- Supabase Storage object path
  file_name     text not null,
  mime_type     text,
  size_bytes    bigint,
  kind          text default 'other',        -- id_proof | report_card | photo | other
  uploaded_by   uuid references public.admins (id),
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_role admin_role not null default 'super_admin',
  recipient_id uuid,
  title        text not null,
  body         text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.whatsapp_logs (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references public.parents (id),
  student_id    uuid references public.students (id),
  to_number     text not null,
  template_key  text,                        -- attendance_present | attendance_absent | …
  body          text not null,
  status        message_status not null default 'queued',
  provider_id   text,                        -- Meta message id
  error         text,
  sent_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_wa_logs_student on public.whatsapp_logs (student_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITY / AUDIT
-- ═══════════════════════════════════════════════════════════════════════════

-- Powers the per-student timeline and the dashboard "Recent Activity" feed.
create table if not exists public.activity_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.admins (id),
  student_id   uuid references public.students (id),
  entity_type  text not null,                -- student | attendance | fee | whatsapp | …
  entity_id    uuid,
  action       text not null,                -- created | updated | marked_present | …
  summary      text not null,                -- human-readable: "Aarav marked present"
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists idx_activity_student on public.activity_logs (student_id, created_at desc);
create index if not exists idx_activity_recent  on public.activity_logs (created_at desc);

-- ── updated_at triggers ──────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'branches','admins','feature_flags','system_settings','teachers','parents',
    'students','subjects','classes','class_sessions','attendance','homework',
    'weekly_reports','fees','whatsapp_logs'
  ] loop
    execute format(
      'drop trigger if exists trg_%s_updated_at on public.%I;
       create trigger trg_%s_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t, t, t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Active admins (matched by auth user id OR email) get full access.
-- Future portals will add narrower policies per role — no schema change needed.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.is_active_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where a.is_active
      and a.deleted_at is null
      and (a.auth_user_id = auth.uid() or lower(a.email) = lower(auth.jwt() ->> 'email'))
  );
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'branches','admins','feature_flags','system_settings','teachers','parents',
    'students','subjects','student_subjects','classes','class_students',
    'class_sessions','attendance','attendance_logs','homework','weekly_reports',
    'fees','payments','documents','notifications','whatsapp_logs','activity_logs'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists admin_all on public.%I;', t);
    execute format(
      'create policy admin_all on public.%I for all to authenticated
       using (public.is_active_admin()) with check (public.is_active_admin());', t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.branches (name, slug, address, phone)
values ('Kammanahalli', 'kammanahalli', 'Kammanahalli, Bangalore', '+917411446381')
on conflict (slug) do nothing;

-- Super Admin. IMPORTANT: also create this user in Supabase Dashboard →
-- Authentication → Users (email + password). Login matches on email.
insert into public.admins (full_name, email, role, branch_id)
select 'Nanditha', 'nanditha@chalkboardtuitions.in', 'super_admin', b.id
from public.branches b where b.slug = 'kammanahalli'
on conflict (email) do nothing;

insert into public.subjects (name, short_code) values
  ('Mathematics','MAT'), ('Science','SCI'), ('English','ENG'),
  ('Social Studies','SST'), ('Hindi','HIN'), ('Kannada','KAN'), ('EVS','EVS')
on conflict (name) do nothing;

insert into public.feature_flags (key, label, enabled, description) values
  ('dashboard',      'Dashboard',        true,  'Admin dashboard'),
  ('students',       'Students',         true,  'Student management'),
  ('attendance',     'Attendance',       true,  'Class attendance marking'),
  ('whatsapp',       'WhatsApp',         true,  'Parent WhatsApp notifications'),
  ('classes',        'Classes',          true,  'Class & batch management'),
  ('homework',       'Homework',         false, 'Homework assignment'),
  ('fees',           'Fees',             false, 'Fee invoices'),
  ('payments',       'Payments',         false, 'Payment collection'),
  ('teacher_portal', 'Teacher Portal',   false, 'Teacher logins'),
  ('parent_portal',  'Parent Portal',    false, 'Parent logins'),
  ('student_portal', 'Student Portal',   false, 'Student logins'),
  ('ai_reports',     'AI Reports',       false, 'AI-generated weekly summaries'),
  ('analytics',      'Analytics',        false, 'Advanced analytics'),
  ('qr_attendance',  'QR Attendance',    false, 'QR-code based attendance')
on conflict (key) do nothing;

insert into public.system_settings (key, value, description) values
  ('org', '{"name":"Chalkboard Tuitions","city":"Bangalore","phone":"+917411446381"}', 'Organisation profile')
on conflict (key) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0002_phase1_improvements.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0002: Phase 1 improvements
-- Photos, admission numbers, expanded status, communications timeline,
-- class schedule fields, storage buckets, richer settings, parent portal tokens.
-- Idempotent; run after 0001.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 3. Expanded student status ───────────────────────────────────────────────
-- Enum values can only be added, never removed; legacy values stay valid.
do $$ begin alter type student_status add value if not exists 'inactive';    end $$;
do $$ begin alter type student_status add value if not exists 'graduated';   end $$;
do $$ begin alter type student_status add value if not exists 'transferred'; end $$;
do $$ begin alter type student_status add value if not exists 'archived';    end $$;

-- ── Communication enums ──────────────────────────────────────────────────────
do $$ begin
  create type communication_type as enum ('whatsapp', 'sms', 'phone_call', 'email', 'note');
exception when duplicate_object then null; end $$;

do $$ begin
  create type communication_direction as enum ('incoming', 'outgoing');
exception when duplicate_object then null; end $$;

-- ── 1 + 2 + 11. Student columns: photo, admission number, portal token ──────
alter table public.students add column if not exists photo_path text;
alter table public.students add column if not exists admission_number text;
alter table public.students add column if not exists parent_portal_token uuid not null default gen_random_uuid();

create unique index if not exists idx_students_admission on public.students (admission_number);
create unique index if not exists idx_students_portal_token on public.students (parent_portal_token);

-- Admission numbers: CB-<year>-<3-digit counter>, per academic year, immutable.
create table if not exists public.admission_counters (
  year    int primary key,
  counter int not null default 0
);

create or replace function public.next_admission_number(p_year int default extract(year from now())::int)
returns text language plpgsql as $$
declare n int;
begin
  insert into public.admission_counters (year, counter) values (p_year, 1)
  on conflict (year) do update set counter = admission_counters.counter + 1
  returning counter into n;
  return 'CB-' || p_year || '-' || lpad(n::text, 3, '0');
end $$;

create or replace function public.assign_admission_number()
returns trigger language plpgsql as $$
begin
  if new.admission_number is null then
    new.admission_number := public.next_admission_number(extract(year from coalesce(new.joined_on, current_date))::int);
  end if;
  return new;
end $$;

drop trigger if exists trg_students_admission on public.students;
create trigger trg_students_admission before insert on public.students
for each row execute function public.assign_admission_number();

-- Admission numbers never change once set.
create or replace function public.protect_admission_number()
returns trigger language plpgsql as $$
begin
  if old.admission_number is not null and new.admission_number is distinct from old.admission_number then
    raise exception 'admission_number is immutable';
  end if;
  return new;
end $$;

drop trigger if exists trg_students_admission_lock on public.students;
create trigger trg_students_admission_lock before update on public.students
for each row execute function public.protect_admission_number();

-- Backfill existing students (ordered by join date for sensible numbering).
do $$
declare r record;
begin
  for r in
    select id, joined_on from public.students
    where admission_number is null order by joined_on, created_at
  loop
    update public.students
    set admission_number = public.next_admission_number(extract(year from r.joined_on)::int)
    where id = r.id;
  end loop;
end $$;

-- ── 4. Communications timeline ───────────────────────────────────────────────
create table if not exists public.communications (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references public.students (id) on delete cascade,
  parent_id   uuid references public.parents (id),
  type        communication_type not null,
  direction   communication_direction not null default 'outgoing',
  status      message_status not null default 'sent',
  subject     text,
  message     text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_by  uuid references public.admins (id),
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index if not exists idx_comms_student on public.communications (student_id, occurred_at desc);

-- ── 6. Class schedule fields ─────────────────────────────────────────────────
alter table public.classes add column if not exists end_time time;
alter table public.classes add column if not exists days text[] not null default '{}';  -- {mon,tue,wed,thu,fri}
alter table public.classes add column if not exists capacity smallint not null default 8;
alter table public.classes add column if not exists online_link text;

-- ── 7. Document kinds (kind column already exists; document the vocabulary) ─
comment on column public.documents.kind is 'report_card | id_proof | admission_form | medical_note | photo | other';

-- ── 8. Settings: richer org profile ─────────────────────────────────────────
insert into public.system_settings (key, value, description) values
  ('org', jsonb_build_object(
    'business_name', 'Chalkboard Tuitions',
    'logo_path', '',
    'phone', '+917411446381',
    'whatsapp', '+917411446381',
    'email', 'chalkboardtuitions@gmail.com',
    'address', 'Kammanahalli, Bangalore, Karnataka',
    'timezone', 'Asia/Kolkata',
    'academic_year', '2026-27'
  ), 'Organisation profile — integrations read from here, never hardcode')
on conflict (key) do update set value = excluded.value
  where public.system_settings.value ->> 'business_name' is null;

-- ── RLS for new tables ───────────────────────────────────────────────────────
alter table public.communications enable row level security;
drop policy if exists admin_all on public.communications;
create policy admin_all on public.communications for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());

alter table public.admission_counters enable row level security;
drop policy if exists admin_all on public.admission_counters;
create policy admin_all on public.admission_counters for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());

-- ── 1 + 7. Storage buckets (private; admins only via RLS) ───────────────────
insert into storage.buckets (id, name, public) values ('student-photos', 'student-photos', false)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('student-documents', 'student-documents', false)
on conflict (id) do nothing;

do $$ begin
  create policy "admins manage student photos" on storage.objects for all to authenticated
    using (bucket_id = 'student-photos' and public.is_active_admin())
    with check (bucket_id = 'student-photos' and public.is_active_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admins manage student documents" on storage.objects for all to authenticated
    using (bucket_id = 'student-documents' and public.is_active_admin())
    with check (bucket_id = 'student-documents' and public.is_active_admin());
exception when duplicate_object then null; end $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0003_class_session_notes.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0003: Class session notes
-- Captured on "Finish Class": topic, homework, teacher notes.
-- Feeds future weekly reports and AI-generated summaries. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- topic_covered already exists from 0001; add the other two.
alter table public.class_sessions add column if not exists homework_assigned text;
alter table public.class_sessions add column if not exists teacher_notes text;

comment on column public.class_sessions.topic_covered     is 'Today''s topic, e.g. "Force and Motion" — shown in weekly reports';
comment on column public.class_sessions.homework_assigned is 'Homework given at end of session, e.g. "Exercise 5"';
comment on column public.class_sessions.teacher_notes     is 'Free-form teacher remarks, e.g. "Excellent participation today." — input for AI summaries';


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0004_communication_queue.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0004: Communication queue (Phase 2)
-- Attendance saves first; notifications are queued rows a worker processes.
-- WhatsApp being down can never lose attendance. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin
  create type queue_status as enum ('pending', 'processing', 'sent', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.communication_queue (
  id            uuid primary key default gen_random_uuid(),
  status        queue_status not null default 'pending',
  channel       text not null default 'whatsapp',
  template_key  text not null,             -- attendance_present | attendance_absent | …
  to_number     text not null,
  payload       jsonb not null default '{}'::jsonb,  -- template variables
  student_id    uuid references public.students (id),
  parent_id     uuid references public.parents (id),
  session_id    uuid references public.class_sessions (id),
  retry_count   int not null default 0,
  last_error    text,
  provider_id   text,                      -- Meta message id once sent (webhook correlation)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  processed_at  timestamptz
);

create index if not exists idx_queue_pending on public.communication_queue (status, created_at)
  where status in ('pending', 'failed');
create index if not exists idx_queue_session on public.communication_queue (session_id);
create index if not exists idx_queue_provider on public.communication_queue (provider_id)
  where provider_id is not null;

drop trigger if exists trg_communication_queue_updated_at on public.communication_queue;
create trigger trg_communication_queue_updated_at before update on public.communication_queue
for each row execute function public.set_updated_at();

alter table public.communication_queue enable row level security;
drop policy if exists admin_all on public.communication_queue;
create policy admin_all on public.communication_queue for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0005_batches_refactor.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

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


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0006_polish.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

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


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0007_system_stats.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0007: System stats RPC for the Developer panel
-- Database size, storage usage, queue size and key counts in one call.
-- SECURITY DEFINER so it can read pg_database_size + storage.objects, but it
-- refuses anyone who is not an active admin. Idempotent; run after 0006.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.get_system_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_admin() then
    raise exception 'forbidden';
  end if;

  return jsonb_build_object(
    'db_size_bytes',    pg_database_size(current_database()),
    'storage_bytes',    coalesce((select sum((metadata->>'size')::bigint)
                                  from storage.objects
                                  where bucket_id in ('student-photos', 'student-documents')), 0),
    'storage_objects',  (select count(*) from storage.objects
                         where bucket_id in ('student-photos', 'student-documents')),
    'queue_total',      (select count(*) from public.communication_queue),
    'queue_pending',    (select count(*) from public.communication_queue where status in ('pending','processing')),
    'queue_failed',     (select count(*) from public.communication_queue where status = 'failed'),
    'students',         (select count(*) from public.students where deleted_at is null),
    'batches',          (select count(*) from public.batches where deleted_at is null),
    'sessions',         (select count(*) from public.sessions),
    'attendance_rows',  (select count(*) from public.attendance)
  );
end;
$$;

grant execute on function public.get_system_stats() to authenticated;

insert into public.schema_migrations (version) values ('0007_system_stats')
on conflict (version) do nothing;
