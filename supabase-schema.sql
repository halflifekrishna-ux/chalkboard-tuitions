-- ============================================================
-- Chalkboard Tuitions — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Create the leads table
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  child_grade text not null,
  board       text not null,
  message     text,
  created_at  timestamptz not null default now()
);

-- Index for quick lookups by email
create index if not exists leads_email_idx on leads (email);
create index if not exists leads_created_at_idx on leads (created_at desc);

-- Enable Row Level Security
alter table leads enable row level security;

-- Policy: Only service role can insert (called from our API route using service key)
-- The anon key cannot insert directly — all writes go through /api/contact
create policy "service_role_insert" on leads
  for insert
  to service_role
  with check (true);

-- Policy: Service role can read all
create policy "service_role_select" on leads
  for select
  to service_role
  using (true);

-- ============================================================
-- To view your leads in the Supabase dashboard:
--   Table Editor → leads
-- Or run: SELECT * FROM leads ORDER BY created_at DESC;
-- ============================================================
