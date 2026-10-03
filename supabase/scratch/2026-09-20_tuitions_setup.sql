-- ═══════════════════════════════════════════════════════════════════════════
-- Chalkboard OS — Tuitions data setup, 20 Sep 2026
--
-- Run in the Supabase SQL Editor on PRODUCTION. Each part is separate on
-- purpose — run them one at a time and check the output before continuing.
--
-- Current state this was written against (verified 20 Sep 2026):
--   students   : Abigail Stanley (G2), Bavesh (G10), Laksh (G7), Uma (inactive)
--   attendance : 0 rows · attendance_logs: 0 rows
--   sessions   : 2 stale 'in_progress' rows, no attendance attached
--   batches    : "Grade 2 focused sessions" exists TWICE (double-submit bug)
-- ═══════════════════════════════════════════════════════════════════════════


-- ── PART 1 · Clear the stale sessions ───────────────────────────────────────
-- Both are in_progress with zero attendance, so nothing is lost.
delete from public.sessions
where id in ('dc4b92d7-e87b-4195-a590-0361f8e2119f',
             '1ad2eafb-3610-4843-9123-5414e228f24f');


-- ── PART 2 · De-duplicate the Grade 2 class ─────────────────────────────────
-- Archives the copy that carries no subjects. Reversible: set deleted_at = null.
update public.batches
set status = 'archived', deleted_at = now()
where id = 'a093e83f-f158-4264-8747-a21bbe27f7c0'
  and deleted_at is null;


-- ── PART 3 · The three students who already exist ───────────────────────────
-- Abigail — Mon to Fri, 6:00–7:00 PM
update public.batches
set days = array['mon','tue','wed','thu','fri'], start_time = '18:00', end_time = '19:00'
where id = 'e9363e2d-c23d-410f-92a4-a834c6e86ee8';

-- Bavesh — Mon to Fri (+ Saturday sometimes), 5:00–6:30 PM
update public.batches
set days = array['mon','tue','wed','thu','fri','sat'], start_time = '17:00', end_time = '18:30'
where id = 'cf5a0af1-fda9-4fcb-867c-546534b08266';

-- Laksh — Mon to Fri, 5:00–7:00 PM (he had no class at all)
with newb as (
  insert into public.batches (branch_id, academic_year_id, name, grade, capacity, status, days, start_time, end_time)
  select (select id from public.branches where is_active and deleted_at is null order by created_at limit 1),
         (select id from public.academic_years order by created_at limit 1),
         'Laksh — Grade 7', 7, 1, 'active', array['mon','tue','wed','thu','fri'], '17:00', '19:00'
  where not exists (select 1 from public.batches where name = 'Laksh — Grade 7' and deleted_at is null)
  returning id
)
insert into public.batch_students (batch_id, student_id)
select newb.id, '17e5dbf7-3f35-4d20-b223-f132da7b33d8' from newb
on conflict (batch_id, student_id) do nothing;


-- ── PART 4 · Harshith and Karthich ──────────────────────────────────────────
-- ⚠️ These two do NOT exist yet. `students` requires a parent, a grade and a
-- board, and I don't have those. FILL IN the four placeholders below before
-- running this part — or add them through /admin/students/new instead, which
-- is the safer route.
/*
do $$
declare
  v_branch uuid := (select id from public.branches where is_active and deleted_at is null order by created_at limit 1);
  v_parent uuid;
  v_student uuid;
  v_batch uuid;
begin
  -- ---- Harshith · Mon to Fri, 11:00 AM – 1:00 PM ----
  insert into public.parents (full_name, phone)
  values ('Harshith''s parent', 'FILL_IN_PHONE_1')          -- ← phone must be unique
  on conflict do nothing
  returning id into v_parent;
  if v_parent is null then select id into v_parent from public.parents where phone = 'FILL_IN_PHONE_1'; end if;

  insert into public.students (branch_id, parent_id, full_name, grade, board, status)
  values (v_branch, v_parent, 'Harshith', 8 /* ← grade */, 'cbse' /* ← board */, 'active')
  returning id into v_student;

  insert into public.batches (branch_id, name, grade, capacity, status, days, start_time, end_time)
  values (v_branch, 'Harshith — Grade 8', 8, 1, 'active', array['mon','tue','wed','thu','fri'], '11:00', '13:00')
  returning id into v_batch;
  insert into public.batch_students (batch_id, student_id) values (v_batch, v_student);

  -- ---- Karthich · Mon to Fri, 5:00 – 6:30 PM ----
  v_parent := null;
  insert into public.parents (full_name, phone)
  values ('Karthich''s parent', 'FILL_IN_PHONE_2')
  on conflict do nothing
  returning id into v_parent;
  if v_parent is null then select id into v_parent from public.parents where phone = 'FILL_IN_PHONE_2'; end if;

  insert into public.students (branch_id, parent_id, full_name, grade, board, status)
  values (v_branch, v_parent, 'Karthich', 8 /* ← grade */, 'cbse' /* ← board */, 'active')
  returning id into v_student;

  insert into public.batches (branch_id, name, grade, capacity, status, days, start_time, end_time)
  values (v_branch, 'Karthich — Grade 8', 8, 1, 'active', array['mon','tue','wed','thu','fri'], '17:00', '18:30')
  returning id into v_batch;
  insert into public.batch_students (batch_id, student_id) values (v_batch, v_student);
end $$;
*/


-- ── PART 5 · Mark everyone present, for a date range ────────────────────────
-- ⚠️ This WRITES ATTENDANCE HISTORY. Set v_from to the real start date first.
-- It creates one completed session per class per scheduled day and marks every
-- enrolled student present. Safe to re-run: existing sessions/marks are kept.
/*
do $$
declare
  v_from  date := date '2026-09-01';                                   -- ← change me
  v_to    date := (now() at time zone 'Asia/Kolkata')::date;
  v_admin uuid := (select id from public.admins where lower(email) = 'nandithaskrishna2000@gmail.com' limit 1);
  b       record;
  d       date;
  v_sess  uuid;
begin
  for b in
    select id, days, start_time, end_time
    from public.batches
    where deleted_at is null and status = 'active' and start_time is not null
  loop
    d := v_from;
    while d <= v_to loop
      if trim(to_char(d, 'dy')) = any (b.days) then
        select id into v_sess from public.sessions
        where batch_id = b.id and session_date = d and start_time = b.start_time;

        if v_sess is null then
          insert into public.sessions (batch_id, session_date, start_time, end_time, status, subject_ids, completed_at, completed_by)
          values (b.id, d, b.start_time, b.end_time, 'completed', '{}', now(), v_admin)
          returning id into v_sess;
        end if;

        insert into public.attendance (session_id, student_id, status, marked_by, marked_at)
        select v_sess, bs.student_id, 'present', v_admin, now()
        from public.batch_students bs
        where bs.batch_id = b.id
        on conflict (session_id, student_id) do nothing;
      end if;
      d := d + 1;
    end loop;
  end loop;
end $$;
*/


-- ── PART 6 · Angie's login (marketing role — add leads, watch status) ───────
-- Creates the Supabase auth user and the matching admins row.
-- She must change the password on first sign-in.
do $$
declare
  v_email text := 'angiegangmei@gmail.com';
  v_pass  text := 'Angie@Chalk2026';          -- ← share this with her, once
  v_uid   uuid;
begin
  select id into v_uid from auth.users where lower(email) = v_email;

  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      v_email, crypt(v_pass, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (
      v_uid::text, v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now()
    );
  end if;

  insert into public.admins (auth_user_id, full_name, email, role, branch_id, is_active, must_change_password)
  values (
    v_uid, 'Angie Gangmei', v_email, 'marketing',
    (select id from public.branches where is_active and deleted_at is null order by created_at limit 1),
    true, true
  )
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        role = 'marketing',
        is_active = true,
        deleted_at = null;
end $$;


-- ── Check the result ────────────────────────────────────────────────────────
select json_build_object(
  'classes', (select json_agg(json_build_object('name', b.name, 'days', b.days, 'start', b.start_time, 'end', b.end_time,
                'students', (select json_agg(s.full_name) from public.batch_students bs
                             join public.students s on s.id = bs.student_id where bs.batch_id = b.id))
              order by b.start_time nulls last, b.name)
              from public.batches b where b.deleted_at is null),
  'sessions', (select count(*) from public.sessions),
  'attendance', (select count(*) from public.attendance),
  'users', (select json_agg(json_build_object('name', full_name, 'email', email, 'role', role))
            from public.admins where deleted_at is null)
) as state_after;
