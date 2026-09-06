-- SCRATCH BUNDLE 4 of 4 — migrations 0010, 0011, 0012
-- Run FOURTH. Contents are byte-identical to supabase/migrations/.
-- NOTE: 0012 begins with a duplicate-email precondition that ABORTS the whole
-- bundle if case-insensitive duplicate admin emails exist. That is intended.


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0010_cleanup_legacy_admin.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

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


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0011_sessions_class_id_nullable.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0011: Make sessions.class_id nullable
--
-- WHY: 0001 created class_sessions.class_id as NOT NULL. 0005 renamed that
-- table to `sessions` and introduced batch_subject_id as the real parent, but
-- never relaxed the old constraint. The application has not written class_id
-- since that refactor — startSession/finishSession insert only
-- (batch_subject_id, session_date, start_time, end_time, status, …) — so
-- creating a new session raises 23502 and cannot succeed.
--
-- This was invisible because startSession discards the insert result
-- (src/app/admin/(portal)/attendance/actions.ts) and redirects regardless.
--
-- SAFETY:
--   • Production verified: 0 rows in public.sessions → no backfill, no data
--     migration, nothing to lose.
--   • class_id, its FK to classes(id), and the legacy
--     unique (class_id, session_date, start_time) constraint are ALL RETAINED.
--     NULLs are distinct under a unique constraint and satisfy the FK, so the
--     retained objects stay valid and rollback-safe.
--   • Idempotent: DROP NOT NULL is a no-op if already nullable.
--
-- ROLLBACK (only valid while no NULL class_id rows exist):
--   alter table public.sessions alter column class_id set not null;
--
-- Run after 0010.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.sessions alter column class_id drop not null;

insert into public.schema_migrations (version) values ('0011_sessions_class_id_nullable')
on conflict (version) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
-- ▼▼▼ BEGIN 0012_admins_privilege_escalation_fix.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0012: Close the admins privilege-escalation path
--                                  (Phase 0A finding H-1, CRITICAL)
--
-- THE DEFECT (four conditions combining):
--   C1  admins.email UNIQUE is case-SENSITIVE (admins_email_key); the
--       idx_admins_email index on lower(email) is NOT unique.
--   C2  0008's admins_write policy is FOR ALL, so its WITH CHECK also governs
--       INSERT and accepts any row where lower(email) = lower(jwt email).
--   C3  Both 0008 guard triggers are BEFORE UPDATE — INSERT and DELETE are
--       ungoverned.
--   C4  current_admin_role() ends in LIMIT 1 with no ORDER BY.
--
--   Result: any active non-super-admin could INSERT a second row for their own
--   email in a different letter-case with role='super_admin' (C1+C2+C3), have
--   it take effect non-deterministically (C4), then DELETE their original row
--   (C3) to make the takeover deterministic. Reachable with only their own
--   password plus the public anon key.
--
-- SCOPE: public.admins only. This migration deliberately does NOT touch
-- admins_read, the ~27 blanket admin_all policies on other tables, or anything
-- else. Broad RLS hardening is Phase 0B.
--
-- WHY POLICIES AND NOT AN INSERT TRIGGER: RLS does not apply to the table
-- owner, so migrations 0008/0009/0010 that seed admins rows as `postgres` keep
-- working. A BEFORE INSERT trigger would fire for postgres too — where
-- auth.jwt() is NULL and is_super_admin() is not true — and would break them.
--
-- Idempotent. No data is modified. Run after 0011.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. PRECONDITION: no case-insensitive duplicate admin emails ─────────────
-- Section 3 below adds a unique index on lower(email). Abort loudly rather than
-- fail cryptically. A non-empty result here would also be evidence that H-1 has
-- already been exercised — investigate before re-running.
do $precheck$
declare dupes int;
begin
  select count(*) into dupes
  from (select 1 from public.admins group by lower(email) having count(*) > 1) d;

  if dupes > 0 then
    raise exception
      'ABORT 0012: % case-insensitive duplicate admin email(s) present. Resolve them (and investigate why they exist) before applying this migration.', dupes;
  end if;
end
$precheck$;

-- ── 1. Split the FOR ALL write policy into command-specific policies ────────
-- admins_read is intentionally left untouched.
drop policy if exists admins_write  on public.admins;
drop policy if exists admins_insert on public.admins;
drop policy if exists admins_update on public.admins;
drop policy if exists admins_delete on public.admins;

-- INSERT: Super Admin only. Closes the H-1 self-insertion vector.
-- Preserves createUser (users.manage is super-admin-only).
create policy admins_insert on public.admins
  for insert to authenticated
  with check (public.is_super_admin());

-- UPDATE: unchanged semantics from 0008's policy.
--   • Super Admin  → manage anyone (changeUserRole, setUserActive,
--                    softDeleteUser, resetUserPassword, transferSuperAdmin)
--   • auth_user_id → own row once bound (last_seen_at, last_login_at,
--                    must_change_password)
--   • email match  → LOAD-BEARING: first-login binding writes auth_user_id
--                    while it is still NULL, so only this branch matches.
create policy admins_update on public.admins
  for update to authenticated
  using      (public.is_super_admin()
              or auth_user_id = auth.uid()
              or lower(email) = lower(auth.jwt() ->> 'email'))
  with check (public.is_super_admin()
              or auth_user_id = auth.uid()
              or lower(email) = lower(auth.jwt() ->> 'email'));

-- DELETE: Super Admin only. Closes the H-1 self-deletion vector.
-- No application code path deletes from admins (softDeleteUser is an UPDATE).
create policy admins_delete on public.admins
  for delete to authenticated
  using (public.is_super_admin());

-- ── 2. BEFORE DELETE guard for the last active Super Admin ──────────────────
-- Complements guard_last_super_admin (BEFORE UPDATE, added in 0008). Triggers
-- DO fire for superusers, so this also covers direct SQL-editor deletion.
create or replace function public.guard_last_super_admin_delete()
returns trigger language plpgsql as $$
declare remaining int;
begin
  if old.role::text = 'super_admin' and old.is_active and old.deleted_at is null then
    select count(*) into remaining
    from public.admins
    where role::text = 'super_admin' and is_active and deleted_at is null and id <> old.id;

    if remaining = 0 then
      raise exception 'Cannot delete the last active Super Admin';
    end if;
  end if;
  return old;
end $$;

drop trigger if exists trg_guard_last_super_admin_delete on public.admins;
create trigger trg_guard_last_super_admin_delete before delete on public.admins
for each row execute function public.guard_last_super_admin_delete();

-- ── 3. Case-insensitive email uniqueness ────────────────────────────────────
-- Removes C1: a case-variant duplicate of an existing admin can no longer be
-- created by anyone, through any path. The pre-existing case-sensitive
-- admins_email_key constraint is retained alongside this.
-- Scope note: like admins_email_key, this index is NOT partial — a soft-deleted
-- row keeps its email reserved. That matches existing behaviour exactly.
-- admins is a tiny table; the brief lock taken here is not a concern.
create unique index if not exists idx_admins_email_lower_unique
  on public.admins (lower(email));

-- ── 4. Deterministic identity resolution ────────────────────────────────────
-- Removes C4. Prefers the explicitly bound auth_user_id match over the email
-- match, then orders deterministically. Signature, return type, volatility,
-- SECURITY DEFINER and search_path are all preserved.
-- is_active_admin() uses EXISTS and needs no change; is_super_admin() and
-- is_admin_tier() derive from this function and inherit the fix.
create or replace function public.current_admin_role()
returns admin_role language sql stable security definer set search_path = public as $$
  select a.role
  from public.admins a
  where a.is_active and a.deleted_at is null
    and (a.auth_user_id = auth.uid() or lower(a.email) = lower(auth.jwt() ->> 'email'))
  order by (a.auth_user_id = auth.uid()) desc nulls last, a.created_at asc, a.id asc
  limit 1;
$$;

-- ── 5. Protect an already-bound auth_user_id from non-super-admin change ────
-- Extends 0008's guard. Everything from the original is preserved verbatim; the
-- only addition is the auth_user_id clause.
--
-- The `old.auth_user_id is not null` qualifier is essential: first-login
-- binding (NULL → auth.uid(), src/lib/os/auth.ts) is performed by the user
-- themselves, who is typically NOT a super admin. A blanket check would lock
-- every seeded user out of their first sign-in.
--
-- Note (unchanged from 0008): with no JWT — SQL Editor, service role, migration
-- scripts — is_super_admin() returns NULL, so `if not …` is NULL and the whole
-- block is skipped. That is why migrations 0009/0010 can still write roles.
create or replace function public.guard_admin_self_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then
    if new.role is distinct from old.role
       or new.is_active is distinct from old.is_active
       or new.deleted_at is distinct from old.deleted_at
       or lower(new.email) is distinct from lower(old.email)
       or new.created_by is distinct from old.created_by then
      raise exception 'You may not change role, status, email or ownership on this account';
    end if;

    if old.auth_user_id is not null
       and new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'You may not change the linked login for this account';
    end if;
  end if;
  return new;
end $$;

-- Trigger already exists from 0008 (BEFORE UPDATE); re-asserted for idempotency
-- on databases where it may be missing. Deliberately still UPDATE-only —
-- INSERT is governed by the admins_insert policy, DELETE by admins_delete plus
-- trg_guard_last_super_admin_delete.
drop trigger if exists trg_guard_admin_self_escalation on public.admins;
create trigger trg_guard_admin_self_escalation before update on public.admins
for each row execute function public.guard_admin_self_escalation();

insert into public.schema_migrations (version) values ('0012_admins_privilege_escalation_fix')
on conflict (version) do nothing;
