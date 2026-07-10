-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0008: Identity & Access Management
--
-- Role hierarchy: super_admin > admin > teacher > reception > parent > student.
--
-- COMPATIBILITY: migration 0001 created admin_role WITHOUT 'admin' (it used
-- 'branch_admin'). The app + IAM use 'admin', so we ADD it here.
--
-- No explicit COMMIT/BEGIN is needed. `ALTER TYPE ... ADD VALUE` runs fine in a
-- transaction on Postgres 12+. Postgres only forbids USING a newly-added enum
-- value in the SAME transaction that added it, so this migration never writes
-- 'admin' to a row and never casts the literal 'admin' to the enum type:
--   • role comparisons use ::text (plain string comparison, no enum cast)
--   • the one statement that WRITES role='admin' (Nanditha's demotion) lives in
--     migration 0009, which runs in a later transaction where 'admin' exists.
--
-- Idempotent · backwards compatible · preserves all users and permissions.
-- Run after 0007.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. Ensure the enum has 'admin' (legacy 'branch_admin' is preserved) ─────
alter type public.admin_role add value if not exists 'admin';

-- ── admins (users) columns ──────────────────────────────────────────────────
alter table public.admins add column if not exists phone                text;
alter table public.admins add column if not exists photo_path           text;
alter table public.admins add column if not exists last_login_at        timestamptz;
alter table public.admins add column if not exists last_seen_at         timestamptz;
alter table public.admins add column if not exists last_device          text;
alter table public.admins add column if not exists must_change_password boolean not null default false;
alter table public.admins add column if not exists created_by           uuid references public.admins (id);
alter table public.admins add column if not exists invited_at           timestamptz;

create index if not exists idx_admins_role on public.admins (role) where deleted_at is null;

-- ── Role helpers (SECURITY DEFINER so RLS policies can call them) ───────────
-- Comparisons use ::text so no reference casts the (possibly same-transaction)
-- 'admin' literal to the enum type.
create or replace function public.current_admin_role()
returns admin_role language sql stable security definer set search_path = public as $$
  select a.role from public.admins a
  where a.is_active and a.deleted_at is null
    and (a.auth_user_id = auth.uid() or lower(a.email) = lower(auth.jwt() ->> 'email'))
  limit 1;
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_admin_role()::text = 'super_admin';
$$;

-- admin OR super_admin (legacy branch_admin counts as admin tier).
create or replace function public.is_admin_tier()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin');
$$;

-- ── Last-super-admin guard ──────────────────────────────────────────────────
create or replace function public.guard_last_super_admin()
returns trigger language plpgsql as $$
declare remaining int;
begin
  if old.role::text = 'super_admin'
     and (new.role::text is distinct from 'super_admin'
          or new.is_active = false
          or new.deleted_at is not null) then
    select count(*) into remaining from public.admins
    where role::text = 'super_admin' and is_active and deleted_at is null and id <> old.id;
    if remaining = 0 then
      raise exception 'Cannot remove the last active Super Admin';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_last_super_admin on public.admins;
create trigger trg_guard_last_super_admin before update on public.admins
for each row execute function public.guard_last_super_admin();

-- ── Auth-event logger (callable pre-auth for failed logins) ─────────────────
create or replace function public.log_auth_event(p_email text, p_action text, p_summary text)
returns void language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  select id into aid from public.admins where lower(email) = lower(p_email) limit 1;
  insert into public.activity_logs (actor_id, entity_type, action, summary, metadata)
  values (aid, 'auth', p_action, p_summary, jsonb_build_object('email', p_email));
end $$;

grant execute on function public.log_auth_event(text, text, text) to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLE-GATED RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- admins (users): everyone signed-in can read. Writes are allowed for
-- super_admin (manage anyone) OR a user editing their OWN row (last_seen,
-- last_login, password flag, auth binding). A guard trigger prevents a
-- non-super-admin from escalating role/status on their own row.
drop policy if exists admin_all on public.admins;
drop policy if exists admins_read on public.admins;
drop policy if exists admins_write on public.admins;
create policy admins_read on public.admins for select to authenticated using (public.is_active_admin());
create policy admins_write on public.admins for all to authenticated
  using (public.is_super_admin() or auth_user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email'))
  with check (public.is_super_admin() or auth_user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email'));

-- Block privilege escalation on self-updates by non-super-admins.
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
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_admin_self_escalation on public.admins;
create trigger trg_guard_admin_self_escalation before update on public.admins
for each row execute function public.guard_admin_self_escalation();

-- feature_flags & system_settings: super_admin only for writes.
do $$
declare t text;
begin
  foreach t in array array['feature_flags','system_settings'] loop
    execute format('drop policy if exists admin_all on public.%I;', t);
    execute format('drop policy if exists %I_read on public.%I;', t, t);
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format('create policy %I_read on public.%I for select to authenticated using (public.is_active_admin());', t, t);
    execute format('create policy %I_write on public.%I for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());', t, t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED USERS (part 1 — no 'admin' write here; that is 0009)
--   Super Admin — Sreejith P Krishna <Sreejithpkrishna@outlook.com>
--   Admin       — Nanditha           <nandithaskrishna2000@gmail.com>
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Ensure Sreejith exists as super_admin (auth_user_id binds on first login).
--    'super_admin' already existed before this migration, so this is safe here.
insert into public.admins (full_name, email, role, branch_id)
select 'Sreejith P Krishna', 'Sreejithpkrishna@outlook.com', 'super_admin', b.id
from public.branches b where b.is_active order by b.created_at limit 1
on conflict (email) do update set role = 'super_admin', full_name = excluded.full_name, is_active = true, deleted_at = null;

-- 2. Establish Nanditha's Gmail row idempotently, handling BOTH scenarios:
--    (a) fresh DB — only the legacy nanditha@chalkboardtuitions.in row exists,
--    (b) already-fixed DB — a nandithaskrishna2000@gmail.com row already exists.
--    If the Gmail row exists we ADOPT it untouched (preserving auth_user_id,
--    role, created_by and activity history) and never rename the legacy row,
--    so we can never hit the admins_email unique constraint.
do $$
begin
  if exists (select 1 from public.admins where lower(email) = 'nandithaskrishna2000@gmail.com') then
    -- (b) Adopt the existing Gmail row. Leave email/role/auth_user_id/created_by
    --     intact; only fill in the display name if it is missing.
    update public.admins
    set full_name = 'Nanditha'
    where lower(email) = 'nandithaskrishna2000@gmail.com'
      and (full_name is null or btrim(full_name) = '');
  else
    -- (a) No Gmail row yet: rename the legacy row in place (keeps its id,
    --     auth_user_id, role, created_by and history).
    update public.admins
    set full_name = 'Nanditha', email = 'nandithaskrishna2000@gmail.com'
    where lower(email) = 'nanditha@chalkboardtuitions.in';
  end if;
end $$;

insert into public.schema_migrations (version) values ('0008_iam')
on conflict (version) do nothing;
