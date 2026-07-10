-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0009: Demote Nanditha to Admin
--
-- Separated from 0008 on purpose: 0008 adds the 'admin' enum value, and Postgres
-- forbids USING a new enum value in the same transaction that added it. This
-- migration runs in a later transaction where 'admin' already exists, so it
-- needs no COMMIT/BEGIN tricks — the clean, portable pattern (works in the
-- Supabase SQL Editor and via `supabase db push`).
--
-- Lockout-safe: only demotes Nanditha while another active super_admin exists
-- (Sreejith, seeded in 0008). Idempotent.
-- Run after 0008.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
begin
  if exists (
    select 1 from public.admins
    where role = 'super_admin' and is_active and deleted_at is null
      and lower(email) <> 'nandithaskrishna2000@gmail.com'
  ) then
    update public.admins set role = 'admin'
    where lower(email) = 'nandithaskrishna2000@gmail.com'
      and role::text = 'super_admin';
  end if;
end $$;

insert into public.schema_migrations (version) values ('0009_demote_nanditha')
on conflict (version) do nothing;
