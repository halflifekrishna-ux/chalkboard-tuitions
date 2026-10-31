-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0016: Lead app (follow-ups, reasons, templates, PIN)
--
-- Backs the staff Android app, which talks only to /api/mobile/v1 and holds no
-- Supabase keys. The API runs as the signed-in staff member, so everything here
-- is enforced by RLS or by SECURITY DEFINER functions scoped to auth.uid().
--
--   1. Follow-up tracking on crm_leads (a time, a step, last contact, last reply)
--   2. Follow-up schedule, editable by the admin tier
--   3. Contact reasons and message templates (templates start empty)
--   4. A rule: tuition leads are invisible to the studio's BD role
--   5. Staff PINs, stored only as a bcrypt hash, set by the staff member
--   6. Who gets the OS section in the app, plus short-lived unlock tokens
--
-- Additive except for section 4, which narrows the crm_leads policies.
-- Idempotent. Run after 0015.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Follow-up tracking ───────────────────────────────────────────────────
alter table public.crm_leads add column if not exists contact_reason text;
alter table public.crm_leads add column if not exists follow_up_at timestamptz;
alter table public.crm_leads add column if not exists follow_up_step smallint not null default 0;
alter table public.crm_leads add column if not exists last_contacted_at timestamptz;
alter table public.crm_leads add column if not exists last_reply_at timestamptz;

create index if not exists idx_crm_leads_follow_up on public.crm_leads (follow_up_at)
  where deleted_at is null and follow_up_at is not null;
create index if not exists idx_crm_leads_phone on public.crm_leads (phone) where deleted_at is null;

-- ── 2. Follow-up schedule (one row) ─────────────────────────────────────────
-- Not in system_settings: that table is Super Admin write-only, and the admin
-- tier needs to change this.
create table if not exists public.crm_follow_up_settings (
  id          boolean primary key default true check (id),
  days        smallint[] not null default '{1,3,7}'
              check (cardinality(days) between 1 and 10 and 0 < all (days)),
  updated_by  uuid references public.admins (id),
  updated_at  timestamptz not null default now()
);
insert into public.crm_follow_up_settings (id) values (true) on conflict (id) do nothing;

alter table public.crm_follow_up_settings enable row level security;
drop policy if exists follow_up_settings_read on public.crm_follow_up_settings;
create policy follow_up_settings_read on public.crm_follow_up_settings for select to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing', 'bd'));
drop policy if exists follow_up_settings_write on public.crm_follow_up_settings;
create policy follow_up_settings_write on public.crm_follow_up_settings for update to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'))
  with check (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'));

-- ── 3. Contact reasons + templates ──────────────────────────────────────────
create table if not exists public.crm_contact_reasons (
  key        text primary key,
  label      text not null,
  sort       smallint not null default 0,
  is_active  boolean not null default true
);
insert into public.crm_contact_reasons (key, label, sort) values
  ('new_enquiry', 'New enquiry', 1),
  ('demo_class',  'Demo class',  2),
  ('fees',        'Fees',        3),
  ('timings',     'Timings',     4),
  ('callback',    'Wants a call', 5),
  ('other',       'Other',       6)
on conflict (key) do nothing;

-- No rows on purpose: approved wording is added last.
create table if not exists public.crm_templates (
  id          uuid primary key default gen_random_uuid(),
  reason_key  text not null references public.crm_contact_reasons (key),
  title       text not null,
  body        text not null,
  sort        smallint not null default 0,
  is_active   boolean not null default true,
  created_by  uuid references public.admins (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_crm_templates_reason on public.crm_templates (reason_key) where is_active;

drop trigger if exists trg_crm_templates_updated_at on public.crm_templates;
create trigger trg_crm_templates_updated_at before update on public.crm_templates
for each row execute function public.set_updated_at();

alter table public.crm_contact_reasons enable row level security;
alter table public.crm_templates enable row level security;

drop policy if exists contact_reasons_read on public.crm_contact_reasons;
create policy contact_reasons_read on public.crm_contact_reasons for select to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing', 'bd'));
drop policy if exists contact_reasons_write on public.crm_contact_reasons;
create policy contact_reasons_write on public.crm_contact_reasons for all to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'))
  with check (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'));

drop policy if exists templates_read on public.crm_templates;
create policy templates_read on public.crm_templates for select to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing', 'bd'));
drop policy if exists templates_write on public.crm_templates;
create policy templates_write on public.crm_templates for all to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'))
  with check (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'));

-- ── 4. The studio's BD never sees tuition leads ─────────────────────────────
drop policy if exists crm_leads_read on public.crm_leads;
create policy crm_leads_read on public.crm_leads for select to authenticated
  using (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing')
    or (public.current_admin_role()::text = 'bd' and vertical = 'studio')
  );

drop policy if exists crm_leads_insert on public.crm_leads;
create policy crm_leads_insert on public.crm_leads for insert to authenticated
  with check (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin')
    or (public.current_admin_role()::text = 'bd' and vertical = 'studio')
    or (
      public.current_admin_role()::text = 'marketing'
      and status::text in ('new', 'pending_approval', 'assigned')
      and approved_by is null
      and approved_at is null
      and converted_student_id is null
      and converted_at is null
    )
  );

drop policy if exists crm_leads_update on public.crm_leads;
create policy crm_leads_update on public.crm_leads for update to authenticated
  using (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin')
    or (public.current_admin_role()::text = 'bd' and vertical = 'studio' and assigned_to = public.current_admin_id())
  )
  with check (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin')
    or (public.current_admin_role()::text = 'bd' and vertical = 'studio' and assigned_to = public.current_admin_id())
  );

drop policy if exists crm_lead_events_read on public.crm_lead_events;
create policy crm_lead_events_read on public.crm_lead_events for select to authenticated
  using (exists (select 1 from public.crm_leads l where l.id = lead_id));

drop policy if exists crm_lead_events_insert on public.crm_lead_events;
create policy crm_lead_events_insert on public.crm_lead_events for insert to authenticated
  with check (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing')
    or (public.current_admin_role()::text = 'bd' and exists (select 1 from public.crm_leads l where l.id = lead_id))
  );

-- ── 5. Staff PINs ───────────────────────────────────────────────────────────
-- No policies: this table is reachable only through the functions below.
create table if not exists public.staff_pins (
  admin_id         uuid primary key references public.admins (id) on delete cascade,
  pin_hash         text not null,
  failed_attempts  smallint not null default 0,
  locked_until     timestamptz,
  updated_at       timestamptz not null default now()
);
alter table public.staff_pins enable row level security;

-- ── 6. OS section access + unlock tokens ────────────────────────────────────
create table if not exists public.mobile_os_access (
  admin_id    uuid primary key references public.admins (id) on delete cascade,
  granted_at  timestamptz not null default now()
);
alter table public.mobile_os_access enable row level security;
drop policy if exists mobile_os_access_read on public.mobile_os_access;
create policy mobile_os_access_read on public.mobile_os_access for select to authenticated
  using (admin_id = public.current_admin_id() or public.is_super_admin());
drop policy if exists mobile_os_access_write on public.mobile_os_access;
create policy mobile_os_access_write on public.mobile_os_access for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Boon signs in as the active admin account named Nanditha.
insert into public.mobile_os_access (admin_id)
select a.id from public.admins a
where a.is_active and a.deleted_at is null
  and a.role::text = 'admin' and lower(a.full_name) = 'nanditha'
on conflict (admin_id) do nothing;

create table if not exists public.staff_unlock_tokens (
  token_hash  text primary key,
  admin_id    uuid not null references public.admins (id) on delete cascade,
  expires_at  timestamptz not null
);
alter table public.staff_unlock_tokens enable row level security;

create or replace function public.staff_pin_is_set()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff_pins p where p.admin_id = public.current_admin_id());
$$;

-- Setting a PIN you already have requires the current one.
create or replace function public.set_staff_pin(new_pin text, current_pin text default null)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  me uuid := public.current_admin_id();
  row_pin public.staff_pins%rowtype;
begin
  if me is null then return jsonb_build_object('ok', false, 'error', 'not_staff'); end if;
  if new_pin !~ '^[0-9]{4}$' then return jsonb_build_object('ok', false, 'error', 'pin_format'); end if;

  select * into row_pin from public.staff_pins where admin_id = me for update;
  if found then
    if row_pin.locked_until is not null and row_pin.locked_until > now() then
      return jsonb_build_object('ok', false, 'error', 'locked', 'locked_until', row_pin.locked_until);
    end if;
    if current_pin is null or crypt(current_pin, row_pin.pin_hash) <> row_pin.pin_hash then
      update public.staff_pins
        set failed_attempts = failed_attempts + 1,
            locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' end
        where admin_id = me;
      return jsonb_build_object('ok', false, 'error', 'wrong_pin');
    end if;
  end if;

  insert into public.staff_pins (admin_id, pin_hash)
  values (me, crypt(new_pin, gen_salt('bf', 10)))
  on conflict (admin_id) do update
    set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null, updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;

-- Five wrong tries locks that person's PIN for 15 minutes. A correct PIN returns
-- a one-time-visible token; only its hash is stored.
create or replace function public.verify_staff_pin(pin text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  me uuid := public.current_admin_id();
  row_pin public.staff_pins%rowtype;
  token text;
begin
  if me is null then return jsonb_build_object('ok', false, 'error', 'not_staff'); end if;
  select * into row_pin from public.staff_pins where admin_id = me for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'no_pin'); end if;
  if row_pin.locked_until is not null and row_pin.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'locked', 'locked_until', row_pin.locked_until);
  end if;

  if crypt(pin, row_pin.pin_hash) <> row_pin.pin_hash then
    update public.staff_pins
      set failed_attempts = failed_attempts + 1,
          locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' end
      where admin_id = me;
    return jsonb_build_object('ok', false, 'error', 'wrong_pin');
  end if;

  update public.staff_pins set failed_attempts = 0, locked_until = null where admin_id = me;
  delete from public.staff_unlock_tokens where admin_id = me or expires_at < now();
  token := encode(gen_random_bytes(32), 'hex');
  insert into public.staff_unlock_tokens (token_hash, admin_id, expires_at)
  values (encode(digest(token, 'sha256'), 'hex'), me, now() + interval '15 minutes');
  return jsonb_build_object('ok', true, 'token', token);
end;
$$;

-- True only for the signed-in person's own live token, and only if they have
-- the OS section at all.
create or replace function public.os_section_unlocked(token text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1
    from public.staff_unlock_tokens t
    join public.mobile_os_access m on m.admin_id = t.admin_id
    where t.token_hash = encode(digest(token, 'sha256'), 'hex')
      and t.admin_id = public.current_admin_id()
      and t.expires_at > now()
  );
$$;

revoke all on function public.staff_pin_is_set() from public, anon;
revoke all on function public.set_staff_pin(text, text) from public, anon;
revoke all on function public.verify_staff_pin(text) from public, anon;
revoke all on function public.os_section_unlocked(text) from public, anon;
grant execute on function public.staff_pin_is_set() to authenticated;
grant execute on function public.set_staff_pin(text, text) to authenticated;
grant execute on function public.verify_staff_pin(text) to authenticated;
grant execute on function public.os_section_unlocked(text) to authenticated;

insert into public.schema_migrations (version) values ('0016_lead_app')
on conflict (version) do nothing;
