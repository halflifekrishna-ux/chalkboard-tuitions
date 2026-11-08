-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0018: Worksheet requests (teacher upload)
--
-- A teacher uploads a worksheet (PDF / photo / doc) at /admin/worksheets and
-- answers two closed questions: colour or B/W, and which sections get
-- answers. The row below is the queue the worksheet-builder works from.
-- Finished PDFs are written back by the builder (service role) and listed on
-- the request page.
--
-- NOT YET APPLIED. Needs approval, then run after 0017.
-- No student data lives here: a worksheet is teaching material, not a record.
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin
  create type worksheet_status as enum ('new', 'processing', 'done', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.worksheet_requests (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.admins (id),
  file_path       text not null,                 -- object path in bucket 'worksheets'
  file_name       text not null,                 -- original name, display only
  colour          boolean not null default false, -- false = B/W, true = colour
  -- 'all' = answers for every section; otherwise the chosen letters, e.g. {A,C}
  answer_sections text[] not null default '{all}',
  status          worksheet_status not null default 'new',
  output_paths    text[] not null default '{}',  -- object paths in bucket 'worksheets'
  error_note      text,
  created_at      timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  constraint worksheet_answer_sections_valid check (
    answer_sections = '{all}'
    or (cardinality(answer_sections) > 0 and answer_sections <@ array['A','B','C','D','E','F'])
  )
);

create index if not exists idx_worksheet_requests_teacher on public.worksheet_requests (teacher_id, created_at desc);
create index if not exists idx_worksheet_requests_status  on public.worksheet_requests (status, created_at);

drop trigger if exists trg_worksheet_requests_updated_at on public.worksheet_requests;
create trigger trg_worksheet_requests_updated_at before update on public.worksheet_requests
for each row execute function public.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Teachers: read and file their own requests only. Admin tier: read all,
-- update (retry / mark failed). Status, outputs and timestamps are written by
-- the builder with the service role, which bypasses RLS; a teacher can never
-- insert a request that is already 'done'.
alter table public.worksheet_requests enable row level security;

drop policy if exists worksheet_requests_read on public.worksheet_requests;
create policy worksheet_requests_read on public.worksheet_requests for select to authenticated
  using (
    public.is_admin_tier()
    or (public.current_admin_role()::text = 'teacher' and teacher_id = public.current_admin_id())
  );

drop policy if exists worksheet_requests_insert on public.worksheet_requests;
create policy worksheet_requests_insert on public.worksheet_requests for insert to authenticated
  with check (
    public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'teacher')
    and teacher_id = public.current_admin_id()
    and status = 'new'
    and output_paths = '{}'
    and started_at is null
    and completed_at is null
  );

drop policy if exists worksheet_requests_update on public.worksheet_requests;
create policy worksheet_requests_update on public.worksheet_requests for update to authenticated
  using (public.is_admin_tier()) with check (public.is_admin_tier());

drop policy if exists worksheet_requests_delete on public.worksheet_requests;
create policy worksheet_requests_delete on public.worksheet_requests for delete to authenticated
  using (public.is_super_admin());

-- ── Storage: private bucket, one folder per teacher ─────────────────────────
-- Layout: <teacher admin id>/in/<file>   uploads (teacher writes)
--         <teacher admin id>/out/<file>  finished PDFs (builder writes, service role)
insert into storage.buckets (id, name, public) values ('worksheets', 'worksheets', false)
on conflict (id) do nothing;

drop policy if exists "worksheets teacher upload" on storage.objects;
create policy "worksheets teacher upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'worksheets'
    and public.current_admin_role()::text in ('super_admin', 'admin', 'branch_admin', 'teacher')
    and (storage.foldername(name))[1] = public.current_admin_id()::text
    and (storage.foldername(name))[2] = 'in'
  );

drop policy if exists "worksheets read" on storage.objects;
create policy "worksheets read" on storage.objects for select to authenticated
  using (
    bucket_id = 'worksheets'
    and (
      public.is_admin_tier()
      or (public.current_admin_role()::text = 'teacher'
          and (storage.foldername(name))[1] = public.current_admin_id()::text)
    )
  );

insert into public.schema_migrations (version) values ('0018_worksheet_requests')
on conflict (version) do nothing;
