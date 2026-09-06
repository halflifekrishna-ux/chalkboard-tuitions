-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Security Baseline, Step 1: RLS PROBE HARNESS
--
-- Phase 0B-TEST. Establishes WHO CAN DO WHAT TO WHICH DATA RIGHT NOW, so that
-- every later Phase 0B policy change can be diffed against a recorded baseline.
--
-- ─── SAFETY MODEL ──────────────────────────────────────────────────────────
--   • The whole script runs inside ONE transaction and ends in ROLLBACK.
--   • Fixtures are seeded inside that transaction and disappear with it.
--   • No migration, policy, function, trigger or persistent row is created.
--   • The temp table and temp function vanish with the session.
--
--   Despite the rollback, DO NOT RUN THIS AGAINST PRODUCTION. It exercises a
--   live privilege-escalation path (P12/P13) and briefly materialises a
--   super_admin row. Run it only against a scratch/staging database.
--
-- ─── HOW IDENTITY IS SIMULATED ─────────────────────────────────────────────
--   Supabase's auth.uid() / auth.jwt() read the `request.jwt.claims` GUC.
--   Setting that GUC (transaction-local) and then `set local role authenticated`
--   makes RLS evaluate exactly as it would for a signed-in user — without
--   creating any auth.users row and without creating Guru.
--
--   Fixture admins rows use auth_user_id = NULL and are matched by the EMAIL
--   branch of is_active_admin(), which is the same branch production uses
--   before a user's first login binds their auth id.
--
-- ─── HOW TO READ THE RESULT ────────────────────────────────────────────────
--   actual_result   ALLOWED | DENIED   — what the DATABASE did
--   classification  EXPECTED CURRENT BEHAVIOR | KNOWN SECURITY DEFECT
--                   | REGRESSION-SENSITIVE | SANITY
--   deviation       flags any probe whose outcome the Phase 0A audit did not
--                   predict. Any '*** DEVIATES FROM AUDIT ***' row must be
--                   reported before Phase 0B proceeds.
--
--   A currently-ALLOWED operation is NOT a pass. See classification.
--
-- Prerequisite: run 00_preflight_schema_snapshot.sql first and keep its output.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ───────────────────────────────────────────────────────────────────────────
-- 0. Result collector
-- ───────────────────────────────────────────────────────────────────────────
create temp table probe_results (
  test_id           text,
  role_label        text,
  target            text,
  operation         text,
  expected_baseline text,   -- what Phase 0A predicted: ALLOWED / DENIED
  actual_result     text,   -- what actually happened
  classification    text,
  notes             text
) on commit drop;

-- anon/authenticated must be able to append their own results.
grant all on probe_results to public;

-- ...and they must be able to reach the temp schema that holds it. A temp
-- schema's default ACL grants USAGE to its owner only, and permission checks
-- use the CURRENT role — so after `set local role authenticated` every write to
-- probe_results (and every call to pg_temp.probe below) would fail with
-- "permission denied for schema pg_temp_N" without this grant.
do $grant_temp$
begin
  execute format('grant usage on schema %I to public',
                 (select nspname from pg_namespace where oid = pg_my_temp_schema()));
end
$grant_temp$;

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Probe helper — runs one statement, records allow/deny, never aborts
--    the outer transaction (the EXCEPTION block creates an internal savepoint).
--    SECURITY INVOKER on purpose: the probe SQL must execute as the
--    currently-set role, otherwise RLS would be bypassed and the test worthless.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function pg_temp.probe(
  p_test_id    text,
  p_role       text,
  p_target     text,
  p_op         text,
  p_sql        text,
  p_expected   text,
  p_if_allowed text,
  p_if_denied  text,
  p_notes      text default ''
) returns void language plpgsql as $fn$
declare
  n       bigint := 0;
  allowed boolean;
  err     text := '';
begin
  begin
    execute p_sql;
    get diagnostics n = row_count;
    -- For SELECT: rows returned. For INSERT/UPDATE/DELETE: rows affected.
    -- Zero rows on a seeded fixture means RLS filtered it out => denied.
    allowed := (n > 0);
    if not allowed then
      err := 'no rows visible/affected (RLS filtered, no error raised)';
    end if;
  exception
    when insufficient_privilege then
      allowed := false;
      err := 'DENIED 42501: ' || sqlerrm;
    when others then
      allowed := false;
      err := 'ERROR ' || sqlstate || ': ' || sqlerrm;
  end;

  insert into probe_results values (
    p_test_id, p_role, p_target, p_op, p_expected,
    case when allowed then 'ALLOWED' else 'DENIED' end,
    case when allowed then p_if_allowed else p_if_denied end,
    trim(both ' |' from coalesce(p_notes,'') || ' | rows=' || n ||
         case when err <> '' then ' | ' || err else '' end)
  );
end
$fn$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Fixtures (seeded as the superuser/owner, so RLS does not apply here)
--    Fixed UUIDs so probes can target rows precisely. Far-future dates so
--    nothing can collide with real scheduling data.
-- ───────────────────────────────────────────────────────────────────────────

insert into public.branches (id, name, slug)
values ('11111111-0000-0000-0000-000000000001', 'Probe Branch', 'probe-branch-zz');

insert into public.parents (id, full_name, phone, whatsapp_number)
values ('11111111-0000-0000-0000-000000000002', 'Probe Parent', '+919999000001', '+919999000001');

insert into public.students (id, branch_id, parent_id, full_name, grade, board)
values ('11111111-0000-0000-0000-000000000003',
        '11111111-0000-0000-0000-000000000001',
        '11111111-0000-0000-0000-000000000002',
        'Probe Student', 6, 'cbse');

insert into public.subjects (id, name, short_code)
values ('11111111-0000-0000-0000-000000000004', 'Probe Subject ZZ', 'PRBZZ');

insert into public.teachers (id, branch_id, full_name)
values ('11111111-0000-0000-0000-000000000005',
        '11111111-0000-0000-0000-000000000001', 'Probe Teacher');

insert into public.academic_years (id, branch_id, name, is_current)
values ('11111111-0000-0000-0000-000000000006',
        '11111111-0000-0000-0000-000000000001', '2099-00', false);

insert into public.batches (id, branch_id, academic_year_id, name, grade)
values ('11111111-0000-0000-0000-000000000007',
        '11111111-0000-0000-0000-000000000001',
        '11111111-0000-0000-0000-000000000006', 'Probe Batch', 6);

insert into public.batch_students (batch_id, student_id)
values ('11111111-0000-0000-0000-000000000007',
        '11111111-0000-0000-0000-000000000003');

insert into public.batch_subjects (id, batch_id, subject_id, teacher_id, days, start_time, end_time)
values ('11111111-0000-0000-0000-000000000008',
        '11111111-0000-0000-0000-000000000007',
        '11111111-0000-0000-0000-000000000004',
        '11111111-0000-0000-0000-000000000005',
        '{mon,tue,wed,thu,fri}', '17:00', '18:00');

-- Legacy class row: only needed if sessions.class_id is still NOT NULL
-- (see preflight CHK-1 — committed migrations say NOT NULL, production may differ).
insert into public.classes (id, branch_id, subject_id, name)
values ('11111111-0000-0000-0000-000000000009',
        '11111111-0000-0000-0000-000000000001',
        '11111111-0000-0000-0000-000000000004', 'Probe Class');

-- Session insert tolerant of both schema variants.
do $seed$
begin
  if exists (select 1 from information_schema.columns
              where table_schema='public' and table_name='sessions'
                and column_name='class_id' and is_nullable='NO') then
    insert into public.sessions (id, class_id, batch_subject_id, session_date, start_time, status)
    values ('11111111-0000-0000-0000-00000000000a',
            '11111111-0000-0000-0000-000000000009',
            '11111111-0000-0000-0000-000000000008', date '2099-01-04', '17:00', 'in_progress');
  else
    insert into public.sessions (id, batch_subject_id, session_date, start_time, status)
    values ('11111111-0000-0000-0000-00000000000a',
            '11111111-0000-0000-0000-000000000008', date '2099-01-04', '17:00', 'in_progress');
  end if;
end
$seed$;

insert into public.attendance (id, session_id, student_id, status)
values ('11111111-0000-0000-0000-00000000000b',
        '11111111-0000-0000-0000-00000000000a',
        '11111111-0000-0000-0000-000000000003', 'present');

insert into public.attendance_logs (id, attendance_id, old_status, new_status)
values ('11111111-0000-0000-0000-00000000000c',
        '11111111-0000-0000-0000-00000000000b', 'absent', 'present');

insert into public.fees (id, student_id, title, amount, status)
values ('11111111-0000-0000-0000-00000000000d',
        '11111111-0000-0000-0000-000000000003', 'Probe Fee', 5000.00, 'due');

insert into public.payments (id, fee_id, amount, method)
values ('11111111-0000-0000-0000-00000000000e',
        '11111111-0000-0000-0000-00000000000d', 5000.00, 'upi');

insert into public.documents (id, student_id, storage_path, file_name, kind)
values ('11111111-0000-0000-0000-00000000000f',
        '11111111-0000-0000-0000-000000000003',
        'probe/probe-doc.pdf', 'probe-doc.pdf', 'report_card');

insert into public.activity_logs (id, entity_type, action, summary)
values ('11111111-0000-0000-0000-000000000010', 'probe', 'seeded', 'Probe activity row');

insert into public.notifications (id, recipient_role, title, body)
values ('11111111-0000-0000-0000-000000000011', 'super_admin', 'Probe Notification', 'seeded');

insert into public.communication_queue (id, template_key, to_number, payload)
values ('11111111-0000-0000-0000-000000000012', 'attendance_present', '919999000001', '{}'::jsonb);

-- Storage fixture (bucket created only if absent; rolled back either way).
do $seed_storage$
begin
  if not exists (select 1 from storage.buckets where id = 'student-documents') then
    insert into storage.buckets (id, name, public) values ('student-documents','student-documents', false);
  end if;
  insert into storage.objects (bucket_id, name, metadata)
  values ('student-documents', 'probe/probe-doc.pdf', '{"size": 1}'::jsonb);
exception when others then
  -- Storage schema shape varies by Supabase version; probes P07d/P10e will
  -- report the limitation rather than silently passing.
  null;
end
$seed_storage$;

-- ── Probe identities. auth_user_id NULL on purpose (email-matched branch). ──
-- 'admin' enum value only exists from migration 0008; fall back to the legacy
-- 'branch_admin' so the harness still runs on a pre-0008 database.
do $seed_admins$
declare admin_value text;
begin
  select case when exists (
           select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
            where t.typname = 'admin_role' and e.enumlabel = 'admin')
         then 'admin' else 'branch_admin' end
    into admin_value;

  insert into public.admins (id, full_name, email, role, branch_id, is_active)
  values ('22222222-0000-0000-0000-000000000001','Probe Super','probe.super@chalkboard.test','super_admin','11111111-0000-0000-0000-000000000001', true);

  execute format(
    'insert into public.admins (id, full_name, email, role, branch_id, is_active)
     values (%L, %L, %L, %L::admin_role, %L, true)',
    '22222222-0000-0000-0000-000000000002','Probe Admin','probe.admin@chalkboard.test',
    admin_value,'11111111-0000-0000-0000-000000000001');

  insert into public.admins (id, full_name, email, role, branch_id, is_active)
  values ('22222222-0000-0000-0000-000000000003','Probe Teacher User','probe.teacher@chalkboard.test','teacher','11111111-0000-0000-0000-000000000001', true),
         ('22222222-0000-0000-0000-000000000004','Probe Reception','probe.reception@chalkboard.test','reception','11111111-0000-0000-0000-000000000001', true),
         -- BD/Guru PROXY. 'bd' does not exist in the admin_role enum, so the
         -- lowest-privilege existing role stands in. Its capability set in
         -- permissions.ts is EMPTY, exactly like a would-be restricted user.
         ('22222222-0000-0000-0000-000000000005','Probe BD Proxy','probe.bdproxy@chalkboard.test','parent','11111111-0000-0000-0000-000000000001', true),
         -- Dedicated identity for the destructive escalation probes so they
         -- cannot disturb the other probe identities.
         ('22222222-0000-0000-0000-000000000006','Probe Escalator','probe.escalate@chalkboard.test','teacher','11111111-0000-0000-0000-000000000001', true);
end
$seed_admins$;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. PROBES
-- ───────────────────────────────────────────────────────────────────────────

-- ═══ SUPER ADMIN ═══════════════════════════════════════════════════════════
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000aa","email":"probe.super@chalkboard.test","role":"authenticated"}', true);
set local role authenticated;

insert into probe_results values ('S01','super_admin','identity','is_active_admin()','true',
  public.is_active_admin()::text, 'SANITY',
  'current_admin_role=' || coalesce(public.current_admin_role()::text,'NULL') ||
  ' is_super_admin=' || coalesce(public.is_super_admin()::text,'NULL'));

select pg_temp.probe('P01a','super_admin','students','SELECT',
  $$select 1 from public.students where id='11111111-0000-0000-0000-000000000003'$$,
  'ALLOWED','EXPECTED CURRENT BEHAVIOR','*** UNEXPECTED DENIAL ***','Super admin must retain full access');

select pg_temp.probe('P01b','super_admin','feature_flags','SELECT',
  $$select 1 from public.feature_flags limit 1$$,
  'ALLOWED','EXPECTED CURRENT BEHAVIOR','*** UNEXPECTED DENIAL ***','');

select pg_temp.probe('P01c','super_admin','feature_flags','UPDATE',
  $$update public.feature_flags set enabled = enabled where key = 'students'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','Developer panel toggle depends on this');

select pg_temp.probe('P01d','super_admin','system_settings','UPDATE',
  $$update public.system_settings set description = description where key = 'org'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','Settings module depends on this');

select pg_temp.probe('P01e','super_admin','get_system_stats()','EXECUTE',
  $$select public.get_system_stats()$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','Developer panel depends on this');

-- ═══ ADMIN ═════════════════════════════════════════════════════════════════
reset role;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000bb","email":"probe.admin@chalkboard.test","role":"authenticated"}', true);
set local role authenticated;

insert into probe_results values ('S02','admin','identity','is_active_admin()','true',
  public.is_active_admin()::text, 'SANITY',
  'current_admin_role=' || coalesce(public.current_admin_role()::text,'NULL') ||
  ' is_admin_tier=' || coalesce(public.is_admin_tier()::text,'NULL'));

select pg_temp.probe('P02a','admin','students','SELECT',
  $$select 1 from public.students where id='11111111-0000-0000-0000-000000000003'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','Students module');

select pg_temp.probe('P02b','admin','students','UPDATE',
  $$update public.students set notes='probe' where id='11111111-0000-0000-0000-000000000003'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','saveStudent action');

select pg_temp.probe('P02c','admin','parents','SELECT',
  $$select 1 from public.parents where id='11111111-0000-0000-0000-000000000002'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','');

select pg_temp.probe('P02d','admin','batches','SELECT',
  $$select 1 from public.batches where id='11111111-0000-0000-0000-000000000007'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','Batches module');

select pg_temp.probe('P02e','admin','batch_subjects','SELECT',
  $$select 1 from public.batch_subjects where id='11111111-0000-0000-0000-000000000008'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','getSessionsForDate');

select pg_temp.probe('P02f','admin','attendance','UPDATE',
  $$update public.attendance set status='late' where id='11111111-0000-0000-0000-00000000000b'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','finishSession step 2');

select pg_temp.probe('P03','admin','feature_flags','UPDATE',
  $$update public.feature_flags set enabled = enabled where key = 'students'$$,
  'DENIED','*** DEFECT: admin can write flags ***','EXPECTED CURRENT BEHAVIOR',
  'Migration 0008 super-admin gate — the one thing already enforced correctly');

-- ═══ TEACHER ═══════════════════════════════════════════════════════════════
reset role;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000cc","email":"probe.teacher@chalkboard.test","role":"authenticated"}', true);
set local role authenticated;

insert into probe_results values ('S03','teacher','identity','is_active_admin()','true',
  public.is_active_admin()::text, 'SANITY',
  'current_admin_role=' || coalesce(public.current_admin_role()::text,'NULL'));

-- P04: financial data — capability model gives teacher NO fees access.
select pg_temp.probe('P04a','teacher','fees','SELECT',
  $$select 1 from public.fees where id='11111111-0000-0000-0000-00000000000d'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-2)','EXPECTED CURRENT BEHAVIOR',
  'teacher has no fees.manage capability yet DB permits read');

select pg_temp.probe('P04b','teacher','payments','SELECT',
  $$select 1 from public.payments where id='11111111-0000-0000-0000-00000000000e'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-2)','EXPECTED CURRENT BEHAVIOR','');

select pg_temp.probe('P04c','teacher','fees','UPDATE',
  $$update public.fees set amount = 1 where id='11111111-0000-0000-0000-00000000000d'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-2)','EXPECTED CURRENT BEHAVIOR','Write, not just read');

-- P05: the attendance workflow. Every one of these MUST keep working.
select pg_temp.probe('P05a','teacher','sessions','UPDATE',
  $$update public.sessions set status='in_progress' where id='11111111-0000-0000-0000-00000000000a'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** BREAKS ATTENDANCE ***','finishSession step 1');

select pg_temp.probe('P05b','teacher','attendance','UPDATE',
  $$update public.attendance set status='present' where id='11111111-0000-0000-0000-00000000000b'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** BREAKS ATTENDANCE ***','finishSession step 2 — the durable core');

select pg_temp.probe('P05c','teacher','attendance_logs','INSERT',
  $$insert into public.attendance_logs (attendance_id, old_status, new_status)
    values ('11111111-0000-0000-0000-00000000000b','absent','present')$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** BREAKS ATTENDANCE ***','finishSession step 3');

select pg_temp.probe('P05d','teacher','activity_logs','INSERT',
  $$insert into public.activity_logs (entity_type, action, summary)
    values ('probe','marked_present','probe insert')$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** BREAKS ATTENDANCE ***','finishSession step 5');

select pg_temp.probe('P05e','teacher','students','SELECT',
  $$select 1 from public.students where id='11111111-0000-0000-0000-000000000003'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** BREAKS ATTENDANCE ***','finishSession step 6 — roster + WhatsApp payload');

select pg_temp.probe('P05f','teacher','parents','SELECT',
  $$select 1 from public.parents where id='11111111-0000-0000-0000-000000000002'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** BREAKS ATTENDANCE ***','finishSession step 6 — parent phone');

select pg_temp.probe('P05g','teacher','communication_queue','INSERT',
  $$insert into public.communication_queue (template_key, to_number, payload)
    values ('attendance_present','919999000002','{}'::jsonb)$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** BREAKS ATTENDANCE ***','finishSession step 7');

-- P06 / P07: audit tamper + storage
select pg_temp.probe('P06','teacher','activity_logs','DELETE',
  $$delete from public.activity_logs where id='11111111-0000-0000-0000-000000000010'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-3)','EXPECTED CURRENT BEHAVIOR',
  'Audit trail is erasable by any admin');

select pg_temp.probe('P07a','teacher','attendance_logs','UPDATE',
  $$update public.attendance_logs set new_status='absent' where id='11111111-0000-0000-0000-00000000000c'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-3)','EXPECTED CURRENT BEHAVIOR','"Immutable" history is mutable');

select pg_temp.probe('P07b','teacher','documents','SELECT',
  $$select 1 from public.documents where id='11111111-0000-0000-0000-00000000000f'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-2)','EXPECTED CURRENT BEHAVIOR','Student document metadata');

select pg_temp.probe('P07c','teacher','storage.objects','SELECT',
  $$select 1 from storage.objects where bucket_id='student-documents' and name='probe/probe-doc.pdf'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-2)','EXPECTED CURRENT BEHAVIOR',
  'If rows=0 check preflight CHK-5: storage fixture may not have seeded');

select pg_temp.probe('P17','teacher','get_system_stats()','EXECUTE',
  $$select public.get_system_stats()$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-6)','EXPECTED CURRENT BEHAVIOR',
  'Company-wide counts readable by every role');

-- ═══ RECEPTION ═════════════════════════════════════════════════════════════
reset role;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000dd","email":"probe.reception@chalkboard.test","role":"authenticated"}', true);
set local role authenticated;

insert into probe_results values ('S04','reception','identity','is_active_admin()','true',
  public.is_active_admin()::text, 'SANITY',
  'current_admin_role=' || coalesce(public.current_admin_role()::text,'NULL'));

select pg_temp.probe('P08a','reception','students','SELECT',
  $$select 1 from public.students where id='11111111-0000-0000-0000-000000000003'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','reception holds students.view/manage');

select pg_temp.probe('P08b','reception','students','UPDATE',
  $$update public.students set notes='probe2' where id='11111111-0000-0000-0000-000000000003'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','');

select pg_temp.probe('P08c','reception','parents','UPDATE',
  $$update public.parents set notes='probe2' where id='11111111-0000-0000-0000-000000000002'$$,
  'ALLOWED','REGRESSION-SENSITIVE','*** UNEXPECTED DENIAL ***','reception holds parents.manage');

select pg_temp.probe('P09','reception','attendance_logs','UPDATE',
  $$update public.attendance_logs set new_status='excused' where id='11111111-0000-0000-0000-00000000000c'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-3)','EXPECTED CURRENT BEHAVIOR',
  'reception has no attendance capability at all');

-- ═══ BD / GURU PROXY  (role=parent — capability set is EMPTY) ══════════════
-- This is the central proof: it shows what Guru would get on day one.
reset role;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000ee","email":"probe.bdproxy@chalkboard.test","role":"authenticated"}', true);
set local role authenticated;

insert into probe_results values ('S05','bd-proxy','identity','is_active_admin()','true',
  public.is_active_admin()::text, 'SANITY',
  'PROXY for future bd role. current_admin_role=' || coalesce(public.current_admin_role()::text,'NULL') ||
  '. permissions.ts grants this role ZERO capabilities.');

select pg_temp.probe('P10a','bd-proxy','students','SELECT',
  $$select 1 from public.students where id='11111111-0000-0000-0000-000000000003'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-4)','EXPECTED CURRENT BEHAVIOR',
  'PROXY TEST — Guru would read all Tuitions student PII');

select pg_temp.probe('P10b','bd-proxy','parents','SELECT',
  $$select 1 from public.parents where id='11111111-0000-0000-0000-000000000002'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-4)','EXPECTED CURRENT BEHAVIOR','PROXY TEST — parent phone numbers');

select pg_temp.probe('P10c','bd-proxy','fees','SELECT',
  $$select 1 from public.fees where id='11111111-0000-0000-0000-00000000000d'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-4)','EXPECTED CURRENT BEHAVIOR','PROXY TEST — Tuitions financials');

select pg_temp.probe('P10d','bd-proxy','documents','SELECT',
  $$select 1 from public.documents where id='11111111-0000-0000-0000-00000000000f'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-4)','EXPECTED CURRENT BEHAVIOR','PROXY TEST');

select pg_temp.probe('P10e','bd-proxy','storage.objects','SELECT',
  $$select 1 from storage.objects where bucket_id='student-documents' and name='probe/probe-doc.pdf'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-4)','EXPECTED CURRENT BEHAVIOR','PROXY TEST — student files');

select pg_temp.probe('P11a','bd-proxy','attendance','UPDATE',
  $$update public.attendance set status='absent' where id='11111111-0000-0000-0000-00000000000b'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-4)','EXPECTED CURRENT BEHAVIOR',
  'PROXY TEST — Guru could rewrite attendance');

select pg_temp.probe('P11b','bd-proxy','activity_logs','DELETE',
  $$delete from public.activity_logs where id='11111111-0000-0000-0000-000000000010'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-4)','EXPECTED CURRENT BEHAVIOR','PROXY TEST — audit erasure');

-- ═══ H-1 ESCALATION TRIO (dedicated identity) ══════════════════════════════
reset role;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000ff","email":"probe.escalate@chalkboard.test","role":"authenticated"}', true);
set local role authenticated;

insert into probe_results values ('S06','escalator','identity','is_active_admin()','true',
  public.is_active_admin()::text, 'SANITY',
  'role=teacher. current_admin_role=' || coalesce(public.current_admin_role()::text,'NULL'));

-- P14 first: UPDATE escalation is expected to be BLOCKED by the 0008 trigger.
select pg_temp.probe('P14','non-super-admin','admins','UPDATE role=super_admin (self)',
  $$update public.admins set role='super_admin' where lower(email)='probe.escalate@chalkboard.test'$$,
  'DENIED','*** DEFECT: UPDATE escalation works ***','EXPECTED CURRENT BEHAVIOR',
  'guard_admin_self_escalation trigger should raise here');

-- P12: the H-1 CRITICAL path. Case-variant email dodges the case-sensitive
-- UNIQUE(email); lower(email) still satisfies the policy WITH CHECK; no
-- BEFORE INSERT trigger exists to stop the role value.
select pg_temp.probe('P12','non-super-admin','admins','INSERT self-row role=super_admin',
  $$insert into public.admins (full_name, email, role, is_active)
    values ('Escalated','PROBE.ESCALATE@chalkboard.test','super_admin', true)$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-1 CRITICAL)','EXPECTED CURRENT BEHAVIOR',
  'If ALLOWED, privilege escalation to super_admin is possible today');

-- Did the escalation actually take effect?
insert into probe_results values ('P12b','non-super-admin','current_admin_role()','post-INSERT effective role',
  'super_admin or non-deterministic',
  coalesce(public.current_admin_role()::text,'NULL'), 'KNOWN SECURITY DEFECT (H-1 CRITICAL)',
  'is_super_admin() now returns ' || coalesce(public.is_super_admin()::text,'NULL') ||
  '. current_admin_role() uses LIMIT 1 with no ORDER BY, so this may vary per run.');

-- P13: no BEFORE DELETE guard exists on admins.
select pg_temp.probe('P13','non-super-admin','admins','DELETE own row',
  $$delete from public.admins where lower(email)='probe.escalate@chalkboard.test' and role='teacher'$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-1 CRITICAL)','EXPECTED CURRENT BEHAVIOR',
  'Deleting the original row makes the injected super_admin row the only match');

insert into probe_results values ('P13b','non-super-admin','current_admin_role()','post-DELETE effective role',
  'super_admin',
  coalesce(public.current_admin_role()::text,'NULL'), 'KNOWN SECURITY DEFECT (H-1 CRITICAL)',
  'is_super_admin() now returns ' || coalesce(public.is_super_admin()::text,'NULL') ||
  '. If super_admin here, full takeover is proven end-to-end.');

-- ═══ ANONYMOUS ═════════════════════════════════════════════════════════════
reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

select pg_temp.probe('P15','anon','log_auth_event()','EXECUTE with forged input',
  $$select public.log_auth_event('forged@evil.test','login','FORGED BY PROBE — attributed to a real user')$$,
  'ALLOWED','KNOWN SECURITY DEFECT (H-5)','EXPECTED CURRENT BEHAVIOR',
  'SECURITY DEFINER granted to anon — unauthenticated audit-log injection');

select pg_temp.probe('P16a','anon','students','SELECT',
  $$select 1 from public.students where id='11111111-0000-0000-0000-000000000003'$$,
  'DENIED','*** CRITICAL: public data exposure ***','EXPECTED CURRENT BEHAVIOR',
  'Policies are TO authenticated, so anon must see nothing');

select pg_temp.probe('P16b','anon','admins','SELECT',
  $$select 1 from public.admins limit 1$$,
  'DENIED','*** CRITICAL: user table exposed ***','EXPECTED CURRENT BEHAVIOR','');

-- ═══ LAST ACTIVE SUPER ADMIN — DELETE GUARD (added for 0012 verification) ══
-- Placed last so it cannot disturb any probe above: it deactivates the other
-- Super Admins to create the "exactly one left" condition.
-- Pre-0012 this DELETE succeeds (no BEFORE DELETE guard existed).
-- Post-0012 trg_guard_last_super_admin_delete must raise.
reset role;

-- Leave the probe Super Admin as the only active one. The 0008 BEFORE UPDATE
-- guard permits this: probe.super is still active, so one always remains.
update public.admins set is_active = false
 where role::text = 'super_admin'
   and id <> '22222222-0000-0000-0000-000000000001';

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000aa","email":"probe.super@chalkboard.test","role":"authenticated"}', true);
set local role authenticated;

select pg_temp.probe('P18','super_admin','admins','DELETE last active Super Admin',
  $$delete from public.admins where id='22222222-0000-0000-0000-000000000001'$$,
  'DENIED','*** DEFECT: last Super Admin is deletable ***','EXPECTED CURRENT BEHAVIOR',
  'Expectation is the POST-0012 state. Against a pre-0012 database this probe reports ALLOWED.');

-- ───────────────────────────────────────────────────────────────────────────
-- 4. RESULTS
-- ───────────────────────────────────────────────────────────────────────────
reset role;

-- Human-readable
select test_id, role_label, target, operation,
       expected_baseline, actual_result, classification,
       case
         when classification = 'SANITY' then
           case when actual_result = 'true' then 'identity OK'
                else '*** IDENTITY SIMULATION FAILED — ALL RESULTS FOR THIS ROLE ARE INVALID ***' end
         when actual_result = expected_baseline then 'as predicted by Phase 0A'
         else '*** DEVIATES FROM AUDIT — REPORT BEFORE PROCEEDING ***'
       end as deviation,
       notes
from probe_results
order by test_id;

-- Machine-readable (copy into docs/security/phase-0a-baseline.json)
select jsonb_pretty(jsonb_agg(to_jsonb(r) order by r.test_id)) as baseline_json
from probe_results r;

-- ───────────────────────────────────────────────────────────────────────────
-- 5. Discard everything. Nothing above is persisted.
-- ───────────────────────────────────────────────────────────────────────────
rollback;
