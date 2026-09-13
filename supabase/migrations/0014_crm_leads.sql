-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0014: CRM leads (Tuitions + Learning Studio)
--
-- Angie (marketing) brings leads for both verticals. She can ADD a lead and
-- WATCH its status — nothing else. Routing from there:
--
--   Tuitions lead  → straight to the Tuitions owner (Nanditha)
--   Studio lead    → held for Super Admin approval → then to the Studio
--                    owner / BD (Guru)
--
-- Enum note (same rule as 0008): `alter type ... add value` is fine inside a
-- transaction as long as the new value is never CAST from a literal in that
-- same transaction. Every policy below compares role::text against plain text,
-- so nothing here casts 'marketing'/'bd' to the enum. Rows carrying those roles
-- are written later by the app (Users → Add), in their own transactions.
--
-- Idempotent. Run after 0013.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Roles: Angie (marketing) and Guru (bd / Learning Studio) ────────────────
alter type public.admin_role add value if not exists 'marketing';
alter type public.admin_role add value if not exists 'bd';

-- ── Who am I? (SECURITY DEFINER so RLS can scope rows to the current user) ──
create or replace function public.current_admin_id()
returns uuid language sql stable security definer set search_path = public as $$
  select a.id from public.admins a
  where a.is_active and a.deleted_at is null
    and (a.auth_user_id = auth.uid() or lower(a.email) = lower(auth.jwt() ->> 'email'))
  limit 1;
$$;

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type lead_vertical as enum ('tuitions', 'studio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum (
    'new',               -- captured, not yet with an owner
    'pending_approval',  -- studio only: waiting on the Super Admin
    'assigned',          -- with its owner, untouched
    'contacted',         -- owner has reached out
    'follow_up',         -- owner is working it, next action scheduled
    'converted',         -- became a student / a studio engagement
    'lost',              -- owner closed it out
    'rejected'           -- Super Admin declined the studio lead
  );
exception when duplicate_object then null; end $$;

-- ── Leads ───────────────────────────────────────────────────────────────────
create table if not exists public.crm_leads (
  id                   uuid primary key default gen_random_uuid(),
  branch_id            uuid references public.branches (id),
  vertical             lead_vertical not null,
  status               lead_status not null default 'new',

  full_name            text not null,
  phone                text not null,
  email                text,
  source               text not null default 'marketing',  -- marketing | website | referral | walk_in | other
  notes                text,

  -- Tuitions shape
  student_grade        smallint check (student_grade between 1 and 12),
  board                board_type,

  -- Studio shape
  organisation         text,
  audience             text,                                -- corporate | college | individual

  -- Ownership + pipeline
  assigned_to          uuid references public.admins (id),
  created_by           uuid references public.admins (id),
  approved_by          uuid references public.admins (id),
  approved_at          timestamptz,
  next_action          text,
  next_action_at       date,
  lost_reason          text,
  converted_student_id uuid references public.students (id),
  converted_at         timestamptz,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);

create index if not exists idx_crm_leads_status   on public.crm_leads (status) where deleted_at is null;
create index if not exists idx_crm_leads_vertical on public.crm_leads (vertical) where deleted_at is null;
create index if not exists idx_crm_leads_assigned on public.crm_leads (assigned_to) where deleted_at is null;
create index if not exists idx_crm_leads_created  on public.crm_leads (created_at desc);
create index if not exists idx_crm_leads_next     on public.crm_leads (next_action_at) where deleted_at is null;

-- ── Lead timeline (every status move and note, append-only in practice) ─────
create table if not exists public.crm_lead_events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.crm_leads (id) on delete cascade,
  actor_id    uuid references public.admins (id),
  action      text not null,          -- created | status_changed | assigned | approved | rejected | note | converted
  from_status lead_status,
  to_status   lead_status,
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_crm_lead_events_lead on public.crm_lead_events (lead_id, created_at desc);

-- ── updated_at ──────────────────────────────────────────────────────────────
drop trigger if exists trg_crm_leads_updated_at on public.crm_leads;
create trigger trg_crm_leads_updated_at before update on public.crm_leads
for each row execute function public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS — marketing can read everything and insert, but never update a lead.
-- Owners (admin tier, bd) work their own rows; Super Admin does anything.
-- All role checks compare ::text, so no new enum value is cast here.
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.crm_leads enable row level security;
alter table public.crm_lead_events enable row level security;

drop policy if exists crm_leads_read on public.crm_leads;
create policy crm_leads_read on public.crm_leads for select to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing', 'bd'));

-- Insert: marketing may only file a fresh, unresolved lead — it cannot arrive
-- pre-approved, pre-converted, or already parked with an owner of its choosing.
drop policy if exists crm_leads_insert on public.crm_leads;
create policy crm_leads_insert on public.crm_leads for insert to authenticated
  with check (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'bd')
    or (
      public.current_admin_role()::text = 'marketing'
      and status::text in ('new', 'pending_approval', 'assigned')
      and approved_by is null
      and approved_at is null
      and converted_student_id is null
      and converted_at is null
    )
  );

-- Update: admin tier anywhere; bd only on leads assigned to them. Marketing is
-- deliberately absent — Angie adds and watches, she never moves a lead.
drop policy if exists crm_leads_update on public.crm_leads;
create policy crm_leads_update on public.crm_leads for update to authenticated
  using (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin')
    or (public.current_admin_role()::text = 'bd' and assigned_to = public.current_admin_id())
  )
  with check (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin')
    or (public.current_admin_role()::text = 'bd' and assigned_to = public.current_admin_id())
  );

drop policy if exists crm_leads_delete on public.crm_leads;
create policy crm_leads_delete on public.crm_leads for delete to authenticated
  using (public.is_super_admin());

drop policy if exists crm_lead_events_read on public.crm_lead_events;
create policy crm_lead_events_read on public.crm_lead_events for select to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing', 'bd'));

-- Anyone who may touch a lead may write its timeline (including the "created"
-- entry Angie's own submission writes).
drop policy if exists crm_lead_events_insert on public.crm_lead_events;
create policy crm_lead_events_insert on public.crm_lead_events for insert to authenticated
  with check (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing', 'bd'));

-- ── Routing config + feature flag ───────────────────────────────────────────
-- Owners are resolved at runtime: this override first, then the first active
-- user holding the matching role (admin for tuitions, bd for studio).
insert into public.system_settings (key, value, description) values
  ('lead_routing', '{"tuitions_owner_id": null, "studio_owner_id": null}'::jsonb,
   'Who new leads land with per vertical. Null falls back to the first active admin (tuitions) / bd (studio).')
on conflict (key) do nothing;

insert into public.feature_flags (key, label, enabled, description) values
  ('crm', 'Leads / CRM', true, 'Lead capture, approval and pipeline')
on conflict (key) do nothing;

insert into public.schema_migrations (version) values ('0014_crm_leads')
on conflict (version) do nothing;
