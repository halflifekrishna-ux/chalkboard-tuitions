-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0004: Communication queue (Phase 2)
-- Attendance saves first; notifications are queued rows a worker processes.
-- WhatsApp being down can never lose attendance. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin
  create type queue_status as enum ('pending', 'processing', 'sent', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.communication_queue (
  id            uuid primary key default gen_random_uuid(),
  status        queue_status not null default 'pending',
  channel       text not null default 'whatsapp',
  template_key  text not null,             -- attendance_present | attendance_absent | …
  to_number     text not null,
  payload       jsonb not null default '{}'::jsonb,  -- template variables
  student_id    uuid references public.students (id),
  parent_id     uuid references public.parents (id),
  session_id    uuid references public.class_sessions (id),
  retry_count   int not null default 0,
  last_error    text,
  provider_id   text,                      -- Meta message id once sent (webhook correlation)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  processed_at  timestamptz
);

create index if not exists idx_queue_pending on public.communication_queue (status, created_at)
  where status in ('pending', 'failed');
create index if not exists idx_queue_session on public.communication_queue (session_id);
create index if not exists idx_queue_provider on public.communication_queue (provider_id)
  where provider_id is not null;

drop trigger if exists trg_communication_queue_updated_at on public.communication_queue;
create trigger trg_communication_queue_updated_at before update on public.communication_queue
for each row execute function public.set_updated_at();

alter table public.communication_queue enable row level security;
drop policy if exists admin_all on public.communication_queue;
create policy admin_all on public.communication_queue for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
