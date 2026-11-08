-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0017: DEMO leads from Meta ads (Lead app)
--
-- A WhatsApp Business message that starts with DEMO is logged by the Lead app
-- as a crm_lead with source = 'meta_ad'. Staff get a full-screen alert and send
-- the demo slots by hand. If nobody has handled the chat within 10 minutes the
-- server posts a Telegram alert (no personal data in it).
--
--   1. Three timestamps on crm_leads: when the DEMO message arrived, when staff
--      handled it, and when the Telegram alert went out (so it goes out once).
--   2. crm_demo_settings: one row holding the demo-slots message the app
--      pre-fills. Admin tier edits it from the OS Leads page.
--
-- Additive only. No existing policy is touched. Idempotent. Run after 0016.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. DEMO tracking on crm_leads ───────────────────────────────────────────
alter table public.crm_leads add column if not exists demo_requested_at timestamptz;
alter table public.crm_leads add column if not exists demo_handled_at   timestamptz;
alter table public.crm_leads add column if not exists demo_alerted_at   timestamptz;

-- The overdue check only ever looks at waiting DEMO leads.
create index if not exists idx_crm_leads_demo_waiting on public.crm_leads (demo_requested_at)
  where deleted_at is null
    and demo_requested_at is not null
    and demo_handled_at is null
    and demo_alerted_at is null;

-- ── 2. Demo slots message (one row) ─────────────────────────────────────────
-- Not in system_settings: that table is Super Admin write-only, and the admin
-- tier needs to change the slots each week. Same shape as crm_follow_up_settings.
create table if not exists public.crm_demo_settings (
  id          boolean primary key default true check (id),
  message     text not null default '',
  updated_by  uuid references public.admins (id),
  updated_at  timestamptz not null default now()
);
insert into public.crm_demo_settings (id) values (true) on conflict (id) do nothing;

alter table public.crm_demo_settings enable row level security;
drop policy if exists demo_settings_read on public.crm_demo_settings;
create policy demo_settings_read on public.crm_demo_settings for select to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'marketing', 'bd'));
drop policy if exists demo_settings_write on public.crm_demo_settings;
create policy demo_settings_write on public.crm_demo_settings for update to authenticated
  using (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'))
  with check (public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin'));

insert into public.schema_migrations (version) values ('0017_demo_leads')
on conflict (version) do nothing;
