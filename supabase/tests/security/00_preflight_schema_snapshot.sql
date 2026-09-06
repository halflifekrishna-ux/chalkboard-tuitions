-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Security Baseline, Step 0: PREFLIGHT SCHEMA SNAPSHOT
--
-- Phase 0B-TEST. Captures the exact schema/policy state that the baseline
-- probes (01_baseline_probes.sql) are measured against.
--
-- READ-ONLY. Touches no row data, creates nothing, changes nothing. It reads
-- catalog metadata only (pg_policies, information_schema, schema_migrations).
-- Safe to run anywhere, including production.
--
-- Run this FIRST and keep the output next to the probe results: a baseline is
-- meaningless without the schema version it was captured against.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Which migrations the database believes are applied ───────────────────
select 'migrations' as section, version, applied_at
from public.schema_migrations
order by version;

-- ── 2. RLS enabled/disabled per table ───────────────────────────────────────
select 'rls_status' as section,
       c.relname                                  as table_name,
       c.relrowsecurity                           as rls_enabled,
       c.relforcerowsecurity                      as rls_forced,
       (select count(*) from pg_policies p
         where p.schemaname = 'public' and p.tablename = c.relname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- ── 3. Every policy definition, verbatim ────────────────────────────────────
-- This is the artifact the Phase 0B diff is taken against.
select 'policies' as section,
       schemaname, tablename, policyname,
       cmd, roles::text,
       qual        as using_expression,
       with_check  as with_check_expression
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- ── 4. Security-relevant functions (definer vs invoker) ─────────────────────
select 'functions' as section,
       p.proname                                        as function_name,
       p.prosecdef                                      as is_security_definer,
       pg_get_function_identity_arguments(p.oid)        as arguments,
       array(select r.rolname
               from pg_roles r
              where has_function_privilege(r.rolname, p.oid, 'EXECUTE')
                and r.rolname in ('anon','authenticated','service_role','public')
            )::text                                     as executable_by
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_active_admin','is_super_admin','is_admin_tier',
                    'current_admin_role','log_auth_event','get_system_stats',
                    'guard_last_super_admin','guard_admin_self_escalation',
                    'next_admission_number','assign_admission_number',
                    'protect_admission_number','set_updated_at')
order by p.proname;

-- ── 5. Triggers on admins (which commands the IAM guards actually cover) ────
-- Phase 0A finding H-1 depends on these being UPDATE-only.
select 'admins_triggers' as section,
       t.tgname                              as trigger_name,
       case t.tgtype::int & 28
            when 4  then 'INSERT'
            when 8  then 'DELETE'
            when 16 then 'UPDATE'
            when 20 then 'INSERT,UPDATE'
            when 24 then 'DELETE,UPDATE'
            when 28 then 'INSERT,UPDATE,DELETE'
            else 'OTHER(' || (t.tgtype::int & 28)::text || ')'
       end                                   as fires_on,
       case when t.tgtype::int & 1 = 1 then 'ROW' else 'STATEMENT' end as level,
       p.proname                             as function_name
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_proc  p on p.oid = t.tgfoid
where c.relname = 'admins' and not t.tgisinternal
order by t.tgname;

-- ── 6. Drift checks — committed migrations vs. actual columns ───────────────
-- CHK-1 is the discrepancy found in Phase 0B-TEST: sessions.class_id is
-- NOT NULL in migration 0001 and never relaxed, but the application never
-- writes it. If this reports is_nullable = 'NO', the committed migrations
-- cannot reproduce the live attendance flow.
select 'drift_checks' as section, check_id, detail, observed
from (
  select 'CHK-1' as check_id,
         'sessions.class_id nullability (expect YES on live schema)' as detail,
         coalesce((select is_nullable from information_schema.columns
                    where table_schema='public' and table_name='sessions'
                      and column_name='class_id'), 'COLUMN ABSENT') as observed
  union all
  select 'CHK-2',
         'admins.email unique constraint is case-sensitive (H-1 precondition)',
         coalesce((select string_agg(conname, ', ') from pg_constraint
                    where conrelid = 'public.admins'::regclass and contype = 'u'), 'NONE')
  union all
  select 'CHK-3',
         'unique index on lower(admins.email)? (absence enables H-1)',
         coalesce((select string_agg(indexname, ', ') from pg_indexes
                    where schemaname='public' and tablename='admins'
                      and indexdef ilike '%unique%' and indexdef ilike '%lower%'), 'NONE')
  union all
  select 'CHK-4',
         'admin_role enum values present',
         (select string_agg(e.enumlabel, ', ' order by e.enumsortorder)
            from pg_enum e join pg_type t on t.oid = e.enumtypid
           where t.typname = 'admin_role')
  union all
  select 'CHK-5',
         'storage buckets present',
         coalesce((select string_agg(id, ', ') from storage.buckets), 'NONE')
  union all
  select 'CHK-6',
         'tables still carrying the blanket admin_all policy',
         coalesce((select count(*)::text from pg_policies
                    where schemaname='public' and policyname='admin_all'), '0')
) d
order by check_id;
