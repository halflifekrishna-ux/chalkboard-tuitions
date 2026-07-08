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
