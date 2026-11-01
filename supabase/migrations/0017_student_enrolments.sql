-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0017: Student records (joined, exited, why)
--
--   1. student_enrolments: one row per stint, so a student who leaves and comes
--      back keeps both. Readable by all staff (a teacher may see someone left).
--   2. student_exit_details: the reason and note, in their own table, readable
--      only by the roles that record exits. Teachers, BD and marketing get no
--      rows however they query. Never copy these into activity_logs.
--   3. Triggers: every new student gets an open stint however they're created,
--      and students.status can't disagree with the stints.
--   4. RPCs: the only write path. Each exit, rejoin or correction is one
--      transaction. There are no INSERT/UPDATE/DELETE policies on either table.
--   5. Existing students are backfilled and marked unconfirmed. Nothing is
--      invented: an old exit has no date and the reason "unknown".
--
-- Exited students also leave batch_students (registers, pickers and head counts
-- all read it). classes_at_exit keeps the names, and attendance is untouched.
--
-- Idempotent. Run after 0016.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Stints ───────────────────────────────────────────────────────────────
create table if not exists public.student_enrolments (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students (id) on delete cascade,
  joined_on        date not null,
  exit_type        text check (exit_type in ('dropped', 'transferred', 'graduated')),  -- null = still here
  exited_on        date,                                  -- null on a closed stint only for old records
  classes_at_exit  text[] not null default '{}',
  date_confirmed   boolean not null default true,         -- false until someone checks a backfilled row
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint enrolment_exit_date_requires_type check (exited_on is null or exit_type is not null),
  constraint enrolment_exit_after_join check (exited_on is null or exited_on >= joined_on)
);

create unique index if not exists idx_enrolment_one_open
  on public.student_enrolments (student_id) where exit_type is null;
create index if not exists idx_enrolment_student on public.student_enrolments (student_id, joined_on);

drop trigger if exists trg_student_enrolments_updated_at on public.student_enrolments;
create trigger trg_student_enrolments_updated_at before update on public.student_enrolments
  for each row execute function public.set_updated_at();

-- ── 2. Reason and note (restricted) ─────────────────────────────────────────
create table if not exists public.student_exit_details (
  enrolment_id  uuid primary key references public.student_enrolments (id) on delete cascade,
  reason        text not null check (reason in (
    'fees', 'moved_away', 'results', 'timing', 'other_tuition',
    'finished', 'health_family', 'stopped_coming', 'other', 'unknown'
  )),
  note          text,
  recorded_by   uuid references public.admins (id),
  recorded_at   timestamptz not null default now(),
  constraint exit_other_needs_note check (reason <> 'other' or coalesce(btrim(note), '') <> '')
);

create or replace function public.can_manage_students()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_admin_role()::text in ('super_admin', 'admin', 'reception'), false);
$$;
revoke all on function public.can_manage_students() from public, anon;
grant execute on function public.can_manage_students() to authenticated;

alter table public.student_enrolments enable row level security;
alter table public.student_exit_details enable row level security;

drop policy if exists enrolments_read on public.student_enrolments;
create policy enrolments_read on public.student_enrolments
  for select to authenticated using (public.is_active_admin());

drop policy if exists exit_details_read on public.student_exit_details;
create policy exit_details_read on public.student_exit_details
  for select to authenticated using (public.can_manage_students());

revoke all on public.student_enrolments, public.student_exit_details from anon;
revoke insert, update, delete, truncate on public.student_enrolments, public.student_exit_details from authenticated;
grant select on public.student_enrolments, public.student_exit_details to authenticated;

-- ── 3. Backfill (before the triggers exist) ─────────────────────────────────
insert into public.student_enrolments (student_id, joined_on, exit_type, classes_at_exit, date_confirmed)
select s.id, s.joined_on,
  case s.status::text
    when 'dropped' then 'dropped' when 'transferred' then 'transferred'
    when 'graduated' then 'graduated' when 'alumni' then 'graduated'
  end,
  case when s.status::text in ('dropped', 'transferred', 'graduated', 'alumni') then array(
    select b.name from public.batches b
    where (b.student_id = s.id or exists (
      select 1 from public.batch_students bs where bs.batch_id = b.id and bs.student_id = s.id
    )) and b.deleted_at is null order by b.name
  ) else '{}'::text[] end,
  false
from public.students s
where not exists (select 1 from public.student_enrolments e where e.student_id = s.id);

insert into public.student_exit_details (enrolment_id, reason)
select e.id, 'unknown' from public.student_enrolments e
where e.exit_type is not null
on conflict (enrolment_id) do nothing;

-- Students who had already left come off rosters, as a new exit would.
delete from public.batch_students bs using public.students s
where bs.student_id = s.id and s.status::text in ('dropped', 'transferred', 'graduated', 'alumni');

update public.batches b set status = 'inactive'
from public.students s
where b.student_id = s.id and b.session_category = 'individual_attention' and b.status = 'active'
  and s.status::text in ('dropped', 'transferred', 'graduated', 'alumni');

-- "Today" for a Bangalore institute; plain CURRENT_DATE is a day behind before 05:30.
alter table public.students alter column joined_on set default ((now() at time zone 'Asia/Kolkata')::date);

-- ── 4. Triggers ─────────────────────────────────────────────────────────────
create or replace function public.open_first_enrolment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.student_enrolments (student_id, joined_on) values (new.id, new.joined_on);
  return new;
end $$;

drop trigger if exists trg_students_open_enrolment on public.students;
create trigger trg_students_open_enrolment after insert on public.students
  for each row execute function public.open_first_enrolment();

-- students.joined_on is the first join; it and the first stint move together.
create or replace function public.sync_first_enrolment_date()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.student_enrolments set joined_on = new.joined_on, date_confirmed = true
  where id = (select id from public.student_enrolments where student_id = new.id order by joined_on limit 1)
    and joined_on <> new.joined_on;
  return new;
end $$;

drop trigger if exists trg_students_sync_joined on public.students;
create trigger trg_students_sync_joined after update of joined_on on public.students
  for each row when (old.joined_on is distinct from new.joined_on)
  execute function public.sync_first_enrolment_date();

-- An exit status needs a closed stint; coming back needs an open one. Archiving
-- removes a record rather than recording a departure, so it is left alone.
create or replace function public.guard_student_exit_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  exits constant text[] := array['dropped', 'transferred', 'graduated', 'alumni'];
  was_exit boolean;
  is_exit boolean := new.status::text = any (exits);
  has_open boolean;
begin
  if tg_op = 'INSERT' then
    if is_exit then raise exception 'A new student can''t start as exited. Add them, then mark them as exited.'; end if;
    return new;
  end if;
  was_exit := old.status::text = any (exits);
  if new.status is not distinct from old.status or new.status::text = 'archived' then return new; end if;
  select exists (select 1 from public.student_enrolments e where e.student_id = new.id and e.exit_type is null) into has_open;
  if is_exit and not was_exit and has_open then
    raise exception 'Use "Mark as exited" so the exit date and reason are recorded.';
  end if;
  if was_exit and not is_exit and not has_open then
    raise exception 'Use "Rejoin" to bring this student back.';
  end if;
  return new;
end $$;

drop trigger if exists trg_students_guard_exit on public.students;
create trigger trg_students_guard_exit before insert or update of status on public.students
  for each row execute function public.guard_student_exit_status();

-- ── 5. Write path ───────────────────────────────────────────────────────────
-- Messages raised with the default code (P0001) are shown to staff as written.
-- Activity entries carry the exit type only, never the reason or note.
create or replace function public.check_exit_input(p_exited_on date, p_exit_type text, p_reason text, p_note text)
returns void language plpgsql immutable as $$
begin
  if p_exited_on is null then raise exception 'Choose the date they left.'; end if;
  if p_exit_type is null or p_exit_type not in ('dropped', 'transferred', 'graduated') then raise exception 'Choose how they left.'; end if;
  if p_reason is null or p_reason not in ('fees', 'moved_away', 'results', 'timing', 'other_tuition', 'finished', 'health_family', 'stopped_coming', 'other') then
    raise exception 'Choose why they left.';
  end if;
  if p_reason = 'other' and coalesce(btrim(p_note), '') = '' then raise exception 'Add a short note when the reason is Other.'; end if;
end $$;

create or replace function public.record_student_exit(
  p_student uuid, p_exited_on date, p_exit_type text, p_reason text, p_note text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  who text;
  stint public.student_enrolments;
  classes text[];
begin
  if not public.can_manage_students() then
    raise exception 'You don''t have permission to do that.' using errcode = '42501';
  end if;
  perform public.check_exit_input(p_exited_on, p_exit_type, p_reason, p_note);
  select full_name into who from public.students where id = p_student and deleted_at is null for update;
  if who is null then raise exception 'That student could not be found.'; end if;
  select * into stint from public.student_enrolments where student_id = p_student and exit_type is null;
  if stint.id is null then raise exception 'This student has already been marked as exited.'; end if;
  if p_exited_on < stint.joined_on then raise exception 'The exit date can''t be before they joined.'; end if;
  if p_exited_on > today then raise exception 'The exit date can''t be in the future.'; end if;

  classes := array(
    select b.name from public.batches b
    where (b.student_id = p_student or exists (
      select 1 from public.batch_students bs where bs.batch_id = b.id and bs.student_id = p_student
    )) and b.deleted_at is null order by b.name
  );
  update public.student_enrolments
  set exit_type = p_exit_type, exited_on = p_exited_on, classes_at_exit = classes
  where id = stint.id;
  insert into public.student_exit_details (enrolment_id, reason, note, recorded_by)
  values (stint.id, p_reason, nullif(btrim(p_note), ''), public.current_admin_id());

  delete from public.batch_students where student_id = p_student;
  update public.batches set status = 'inactive'
  where student_id = p_student and session_category = 'individual_attention' and status = 'active';
  update public.students set status = p_exit_type::student_status where id = p_student;

  insert into public.activity_logs (actor_id, student_id, entity_type, entity_id, action, summary, metadata)
  values (public.current_admin_id(), p_student, 'student', p_student, 'exited',
    who || ' left Chalkboard (' || initcap(p_exit_type) || ')',
    jsonb_build_object('exit_type', p_exit_type, 'exited_on', p_exited_on));
  return stint.id;
end $$;

create or replace function public.record_student_rejoin(p_student uuid, p_joined_on date)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  who text;
  last_stint public.student_enrolments;
  new_id uuid;
begin
  if not public.can_manage_students() then
    raise exception 'You don''t have permission to do that.' using errcode = '42501';
  end if;
  if p_joined_on is null then raise exception 'Choose the date they rejoined.'; end if;
  select full_name into who from public.students where id = p_student and deleted_at is null for update;
  if who is null then raise exception 'That student could not be found.'; end if;
  if exists (select 1 from public.student_enrolments where student_id = p_student and exit_type is null) then
    raise exception 'This student is already enrolled.';
  end if;
  select * into last_stint from public.student_enrolments where student_id = p_student order by joined_on desc limit 1;
  if p_joined_on < coalesce(last_stint.exited_on, last_stint.joined_on) then
    raise exception 'The rejoin date can''t be before they last left.';
  end if;

  insert into public.student_enrolments (student_id, joined_on) values (p_student, p_joined_on) returning id into new_id;
  update public.students set status = 'active' where id = p_student;
  insert into public.activity_logs (actor_id, student_id, entity_type, entity_id, action, summary, metadata)
  values (public.current_admin_id(), p_student, 'student', p_student, 'rejoined',
    who || ' rejoined Chalkboard', jsonb_build_object('joined_on', p_joined_on));
  return new_id;
end $$;

-- Fix a stint's dates and, if it is closed, how and why they left.
create or replace function public.correct_student_enrolment(
  p_enrolment uuid, p_joined_on date, p_exited_on date default null,
  p_exit_type text default null, p_reason text default null, p_note text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  stint public.student_enrolments;
  who text;
  prev_stint public.student_enrolments;
  next_stint public.student_enrolments;
begin
  if not public.can_manage_students() then
    raise exception 'You don''t have permission to do that.' using errcode = '42501';
  end if;
  if p_joined_on is null then raise exception 'Choose the date they joined.'; end if;
  select * into stint from public.student_enrolments where id = p_enrolment for update;
  if stint.id is null then raise exception 'That record could not be found.'; end if;
  select full_name into who from public.students where id = stint.student_id and deleted_at is null for update;
  if who is null then raise exception 'That student could not be found.'; end if;

  select * into prev_stint from public.student_enrolments
    where student_id = stint.student_id and joined_on < stint.joined_on order by joined_on desc limit 1;
  select * into next_stint from public.student_enrolments
    where student_id = stint.student_id and joined_on > stint.joined_on order by joined_on limit 1;
  if prev_stint.id is not null and p_joined_on < coalesce(prev_stint.exited_on, prev_stint.joined_on) then
    raise exception 'The join date can''t be before they last left.';
  end if;

  if stint.exit_type is null then
    update public.student_enrolments set joined_on = p_joined_on, date_confirmed = true where id = stint.id;
  else
    perform public.check_exit_input(p_exited_on, p_exit_type, p_reason, p_note);
    if p_exited_on < p_joined_on then raise exception 'The exit date can''t be before they joined.'; end if;
    if p_exited_on > today then raise exception 'The exit date can''t be in the future.'; end if;
    if next_stint.id is not null and p_exited_on > next_stint.joined_on then
      raise exception 'The exit date can''t be after they rejoined.';
    end if;
    update public.student_enrolments
    set joined_on = p_joined_on, exited_on = p_exited_on, exit_type = p_exit_type, date_confirmed = true
    where id = stint.id;
    insert into public.student_exit_details (enrolment_id, reason, note, recorded_by)
    values (stint.id, p_reason, nullif(btrim(p_note), ''), public.current_admin_id())
    on conflict (enrolment_id) do update
      set reason = excluded.reason, note = excluded.note, recorded_by = excluded.recorded_by, recorded_at = now();
    if next_stint.id is null then
      update public.students set status = p_exit_type::student_status
      where id = stint.student_id and status::text <> 'archived';
    end if;
  end if;

  if prev_stint.id is null then
    update public.students set joined_on = p_joined_on where id = stint.student_id;
  end if;
  insert into public.activity_logs (actor_id, student_id, entity_type, entity_id, action, summary)
  values (public.current_admin_id(), stint.student_id, 'student', stint.student_id, 'enrolment_corrected',
    who || '''s enrolment dates were corrected');
end $$;

revoke all on function public.check_exit_input(date, text, text, text) from public, anon;
revoke all on function public.record_student_exit(uuid, date, text, text, text) from public, anon;
revoke all on function public.record_student_rejoin(uuid, date) from public, anon;
revoke all on function public.correct_student_enrolment(uuid, date, date, text, text, text) from public, anon;
revoke all on function public.open_first_enrolment() from public, anon, authenticated;
revoke all on function public.sync_first_enrolment_date() from public, anon, authenticated;
revoke all on function public.guard_student_exit_status() from public, anon, authenticated;
grant execute on function public.record_student_exit(uuid, date, text, text, text) to authenticated;
grant execute on function public.record_student_rejoin(uuid, date) to authenticated;
grant execute on function public.correct_student_enrolment(uuid, date, date, text, text, text) to authenticated;

-- ── 6. Insights page in the super admin nav (analytics.view is super admin only) ──
update public.feature_flags set enabled = true where key = 'analytics';

insert into public.schema_migrations (version) values ('0017_student_enrolments')
on conflict (version) do nothing;
