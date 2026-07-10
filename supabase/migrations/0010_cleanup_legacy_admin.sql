-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0010: Retire the legacy admin record
--
-- Soft-deletes the pre-IAM row `nanditha@chalkboardtuitions.in` so that exactly
-- one ACTIVE record remains per person:
--     Sreejith P Krishna → Super Admin (active)
--     Nanditha           → Admin       (active, Gmail row)
--
-- SAFETY:
--   • Soft delete only (is_active=false + deleted_at). NO data is removed —
--     the row stays, so every activity_logs.actor_id and admins.created_by
--     foreign key and all audit history remain valid.
--   • Guarded: runs only if the canonical Gmail admin is active AND a DIFFERENT
--     active Super Admin exists — so it can never remove the last Super Admin
--     (the guard_last_super_admin trigger would also block that).
--   • Rollback: re-activate with
--       update public.admins set is_active = true, deleted_at = null
--       where lower(email) = 'nanditha@chalkboardtuitions.in';
--
-- Idempotent (WHERE deleted_at IS NULL). Safe on fresh DBs where the legacy row
-- was already renamed by 0008 (matches nothing → no-op). Run after 0009.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if exists (
        select 1 from public.admins
        where lower(email) = 'nandithaskrishna2000@gmail.com'
          and is_active and deleted_at is null
     )
     and exists (
        select 1 from public.admins
        where role = 'super_admin' and is_active and deleted_at is null
          and lower(email) <> 'nanditha@chalkboardtuitions.in'
     )
  then
    update public.admins
    set is_active  = false,
        deleted_at = coalesce(deleted_at, now())
    where lower(email) = 'nanditha@chalkboardtuitions.in'
      and deleted_at is null;
  end if;
end $$;

insert into public.schema_migrations (version) values ('0010_cleanup_legacy_admin')
on conflict (version) do nothing;
