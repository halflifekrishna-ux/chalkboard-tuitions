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
