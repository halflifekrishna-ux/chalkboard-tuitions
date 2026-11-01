-- READ-ONLY preview of what 0017_student_enrolments.sql will change. Run BEFORE 0017.
-- Contains only a SELECT, so it writes nothing. Mirrors the backfill in section 3 of 0017 and the flag in section 6.
with exited as (
  select s.id, s.full_name, s.status::text as status, s.joined_on, s.deleted_at
  from public.students s
  where s.status::text in ('dropped', 'transferred', 'graduated', 'alumni')
)
select * from (
  select 1 as step, 'Closed stint created (no exit date, reason unknown)' as change,
         e.full_name as student, e.status as student_status, null::text as class,
         'joined_on ' || e.joined_on
           || case when e.deleted_at is not null then ' · record is already removed' else '' end
           || ' · ' || (select count(*) from public.attendance a where a.student_id = e.id)
           || ' attendance marks, untouched' as detail
  from exited e
  union all
  select 2, 'Removed from class (row deleted from batch_students)',
         e.full_name, e.status, b.name,
         'class status ' || b.status::text
           || case when b.deleted_at is not null then ' · class is archived, so its name is NOT kept on the stint'
                   else ' · name kept on the stint' end
  from exited e
  join public.batch_students bs on bs.student_id = e.id
  join public.batches b on b.id = bs.batch_id
  union all
  select 3, 'Individual Attention class paused (active to inactive)',
         e.full_name, e.status, b.name,
         case when b.deleted_at is not null then 'class is archived' else 'on the timetable until now' end
  from exited e
  join public.batches b on b.student_id = e.id
  where b.session_category::text = 'individual_attention' and b.status::text = 'active'
  union all
  select 4, 'Open stint created, marked unconfirmed (no visible change)',
         count(*) || ' students', 'current', null,
         'includes inactive, paused and archived records; registers are unaffected'
  from public.students s
  where s.status::text not in ('dropped', 'transferred', 'graduated', 'alumni')
  union all
  select 5, 'Analytics menu flag', f.key, null, null,
         'enabled is ' || f.enabled || ' now, will be true'
  from public.feature_flags f where f.key = 'analytics'
) preview
order by step, student, class;
