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
