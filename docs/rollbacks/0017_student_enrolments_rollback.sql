-- Undo 0017. Run only if the release has to be backed out, and redeploy the
-- previous app version first: the new app reads these tables.
-- Exit dates, reasons and notes recorded since 0017 are lost, so export
-- student_enrolments and student_exit_details first. Students who left keep
-- their status, but class links removed at exit are not restored.
begin;
drop trigger if exists trg_students_open_enrolment on public.students;
drop trigger if exists trg_students_sync_joined on public.students;
drop trigger if exists trg_students_guard_exit on public.students;
drop function if exists public.record_student_exit(uuid, date, text, text, text);
drop function if exists public.record_student_rejoin(uuid, date);
drop function if exists public.correct_student_enrolment(uuid, date, date, text, text, text);
drop function if exists public.check_exit_input(date, text, text, text);
drop function if exists public.open_first_enrolment();
drop function if exists public.sync_first_enrolment_date();
drop function if exists public.guard_student_exit_status();
drop table if exists public.student_exit_details;
drop table if exists public.student_enrolments;
drop function if exists public.can_manage_students();
alter table public.students alter column joined_on set default current_date;
update public.feature_flags set enabled = false where key = 'analytics';
delete from public.schema_migrations where version = '0017_student_enrolments';
commit;
