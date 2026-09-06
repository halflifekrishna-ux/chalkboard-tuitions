# Phase 0A Security Baseline — Result Record

Reference artifact for Phase 0B. Every Phase 0B policy change is diffed against
the results recorded here.

## Status: ⚠️ NOT YET CAPTURED — blocked on environment

The harness is written and ready. It has **not been executed**, because no safe
database is reachable. The results table below therefore holds **Phase 0A
predictions**, not measurements. Nothing here may be cited as evidence until the
Prediction column is replaced by real output.

## 1. Capture environment

Fill this in at capture time. A baseline without its schema version is not usable
as a diff reference.

| Field | Value |
|---|---|
| Captured on (UTC) | _pending_ |
| Captured by | _pending_ |
| Database | _pending — scratch/staging project ref_ |
| `schema_migrations` max version | _pending (expect `0010_cleanup_legacy_admin`)_ |
| Repo commit | `0bda44b` (harness authored against this tree) |
| Preflight CHK-1 (`sessions.class_id` nullable) | _pending — see §5_ |
| Preflight CHK-6 (tables with blanket `admin_all`) | _pending (expect ~24)_ |
| Harness files | `00_preflight_schema_snapshot.sql`, `01_baseline_probes.sql` |

Never record credentials, project URLs with keys, or JWTs in this file.

## 2. Why it could not be run

Re-verified 2026-09-06 during the Phase 0 scratch-verification attempt:

| Requirement | State on this machine |
|---|---|
| Scratch/staging Supabase project | **None configured** anywhere in the repo |
| Supabase credentials in `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are all **empty strings** |
| Supabase CLI | not installed; no `~/.supabase`; no personal access token |
| Vercel CLI | installed (v54.4.1) but **not authenticated** — cannot `env pull` |
| Docker (for a local Supabase stack) | not installed / not running |
| `psql` / `pg_dump` | not installed |
| Supabase/Postgres refs in shell config, `.pgpass`, `.netrc` | none |
| Node | v26.7.0 available (`.node-version` pins 20) |

Consequence: neither the scratch project nor the production read-only preflight
could be executed. Creating a Supabase project requires an authenticated
Supabase account, and no credential of any kind is present.

### Harness defect found and fixed during this attempt

Static review before handover caught a genuine execution blocker in
`01_baseline_probes.sql`: a temp schema's default ACL grants `USAGE` to its
owner only, and permission checks use the **current** role. After
`set local role authenticated`, every write to `probe_results` and every call to
`pg_temp.probe()` would have failed with *"permission denied for schema
pg_temp_N"* — aborting the run on the first probe. A `grant usage on schema
pg_temp_N to public` was added immediately after the table grant. No other
change; the probe logic is untouched.

Production was deliberately **not** probed. Per the Phase 0B-TEST brief:
transaction wrapping is not sufficient justification, and `01_baseline_probes.sql`
briefly materialises a `super_admin` row while proving H-1.

To unblock, see `README.md` → *Required environment*. Free-tier Supabase project
plus migrations `0001`–`0010`; no purchase required.

## 3. Baseline matrix (predictions — replace with measured output)

`P` = Phase 0A prediction. Classifications follow the Phase 0B-TEST brief:
a permitted operation is never simply "pass".

| # | Role | Target | Operation | P: expected | Predicted classification |
|---|---|---|---|---|---|
| S01–S06 | all | identity | `is_active_admin()` | true | SANITY — if false, that role's results are void |
| P01a | super_admin | `students` | SELECT | ALLOWED | EXPECTED CURRENT BEHAVIOR |
| P01b | super_admin | `feature_flags` | SELECT | ALLOWED | EXPECTED CURRENT BEHAVIOR |
| P01c | super_admin | `feature_flags` | UPDATE | ALLOWED | REGRESSION-SENSITIVE |
| P01d | super_admin | `system_settings` | UPDATE | ALLOWED | REGRESSION-SENSITIVE |
| P01e | super_admin | `get_system_stats()` | EXECUTE | ALLOWED | REGRESSION-SENSITIVE |
| P02a | admin | `students` | SELECT | ALLOWED | REGRESSION-SENSITIVE |
| P02b | admin | `students` | UPDATE | ALLOWED | REGRESSION-SENSITIVE |
| P02c | admin | `parents` | SELECT | ALLOWED | REGRESSION-SENSITIVE |
| P02d | admin | `batches` | SELECT | ALLOWED | REGRESSION-SENSITIVE |
| P02e | admin | `batch_subjects` | SELECT | ALLOWED | REGRESSION-SENSITIVE |
| P02f | admin | `attendance` | UPDATE | ALLOWED | REGRESSION-SENSITIVE |
| P03 | admin | `feature_flags` | UPDATE | **DENIED** | EXPECTED CURRENT BEHAVIOR — the one correctly-enforced gate |
| P04a | teacher | `fees` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-2)** |
| P04b | teacher | `payments` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-2)** |
| P04c | teacher | `fees` | UPDATE | ALLOWED | **KNOWN SECURITY DEFECT (H-2)** |
| P05a | teacher | `sessions` | UPDATE | ALLOWED | REGRESSION-SENSITIVE — finishSession §1 |
| P05b | teacher | `attendance` | UPDATE | ALLOWED | REGRESSION-SENSITIVE — finishSession §2 |
| P05c | teacher | `attendance_logs` | INSERT | ALLOWED | REGRESSION-SENSITIVE — finishSession §3 |
| P05d | teacher | `activity_logs` | INSERT | ALLOWED | REGRESSION-SENSITIVE — finishSession §5 |
| P05e | teacher | `students` | SELECT | ALLOWED | REGRESSION-SENSITIVE — finishSession §6 |
| P05f | teacher | `parents` | SELECT | ALLOWED | REGRESSION-SENSITIVE — finishSession §6 |
| P05g | teacher | `communication_queue` | INSERT | ALLOWED | REGRESSION-SENSITIVE — finishSession §7 |
| P06 | teacher | `activity_logs` | DELETE | ALLOWED | **KNOWN SECURITY DEFECT (H-3)** |
| P07a | teacher | `attendance_logs` | UPDATE | ALLOWED | **KNOWN SECURITY DEFECT (H-3)** |
| P07b | teacher | `documents` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-2)** |
| P07c | teacher | `storage.objects` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-2)** |
| P08a | reception | `students` | SELECT | ALLOWED | REGRESSION-SENSITIVE |
| P08b | reception | `students` | UPDATE | ALLOWED | REGRESSION-SENSITIVE |
| P08c | reception | `parents` | UPDATE | ALLOWED | REGRESSION-SENSITIVE |
| P09 | reception | `attendance_logs` | UPDATE | ALLOWED | **KNOWN SECURITY DEFECT (H-3)** |
| P10a | bd-proxy | `students` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-4)** |
| P10b | bd-proxy | `parents` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-4)** |
| P10c | bd-proxy | `fees` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-4)** |
| P10d | bd-proxy | `documents` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-4)** |
| P10e | bd-proxy | `storage.objects` | SELECT | ALLOWED | **KNOWN SECURITY DEFECT (H-4)** |
| P11a | bd-proxy | `attendance` | UPDATE | ALLOWED | **KNOWN SECURITY DEFECT (H-4)** |
| P11b | bd-proxy | `activity_logs` | DELETE | ALLOWED | **KNOWN SECURITY DEFECT (H-4)** |
| P14 | non-super-admin | `admins` | UPDATE own role | **DENIED** | EXPECTED CURRENT BEHAVIOR — trigger holds |
| P12 | non-super-admin | `admins` | INSERT self-row `super_admin` | ALLOWED | **KNOWN SECURITY DEFECT (H-1 CRITICAL)** |
| P12b | non-super-admin | `current_admin_role()` | effective role after INSERT | super_admin / non-deterministic | **KNOWN SECURITY DEFECT (H-1 CRITICAL)** |
| P13 | non-super-admin | `admins` | DELETE own row | ALLOWED | **KNOWN SECURITY DEFECT (H-1 CRITICAL)** |
| P13b | non-super-admin | `current_admin_role()` | effective role after DELETE | super_admin | **KNOWN SECURITY DEFECT (H-1 CRITICAL)** |
| P15 | anon | `log_auth_event()` | EXECUTE forged | ALLOWED | **KNOWN SECURITY DEFECT (H-5)** |
| P16a | anon | `students` | SELECT | **DENIED** | EXPECTED CURRENT BEHAVIOR |
| P16b | anon | `admins` | SELECT | **DENIED** | EXPECTED CURRENT BEHAVIOR |
| P17 | teacher | `get_system_stats()` | EXECUTE | ALLOWED | **KNOWN SECURITY DEFECT (H-6)** |

**The decisive rows are P12/P12b/P13/P13b** (does H-1 actually escalate?) and
**P10a–P11b** (does a Guru-shaped user really see all of Tuitions?). If the
predictions hold, Phase 0B step 2 is mandatory before Phase 1.

## 4. Application vs. database verdicts

Complete by hand per `README.md` → *Application vs. database comparison*.

| Scenario | Role | Verdict | Notes |
|---|---|---|---|
| Read fees | teacher | _pending_ | |
| Edit a student | teacher | _pending_ | |
| Delete audit rows | teacher | _pending_ | |
| Toggle a feature flag | admin | _pending_ | |
| Manage users | admin | _pending_ | |
| Mark attendance | teacher | _pending_ | must remain ALLOWS/ALLOWS |

## 5. Open item discovered while building the harness

**Schema drift: `sessions.class_id`.** Migration 0001 defines
`class_id uuid NOT NULL REFERENCES classes(id)` on `class_sessions`
([0001:217](../../supabase/migrations/0001_chalkboard_os_foundation.sql#L217)).
Migration 0005 renames that table to `sessions` and adds `batch_subject_id`, but
**never drops the NOT NULL or the FK**. The application never writes `class_id`
(`startSession` / `finishSession` insert only `batch_subject_id`, `session_date`,
`start_time`, …).

Consequences:

1. A database built purely from the committed migrations **cannot run the live
   attendance flow** — session creation would fail on a NOT NULL violation.
2. Production evidently can, so production's schema differs from the committed
   migrations: the constraint was almost certainly relaxed by hand in the SQL
   Editor and never captured as a migration.
3. Therefore a scratch project built from `0001`–`0010` **is not a faithful
   replica of production**, and a baseline captured on it may diverge from
   production behaviour.

Preflight `CHK-1` reports this directly. The harness tolerates both variants when
seeding, so it runs either way — but the drift must be resolved before the
baseline is trusted as a production reference.

This is a schema-integrity issue, not a security vulnerability, and it is **not**
fixed here (Phase 0B-TEST forbids migration changes). It needs an explicit
decision, recorded in §6.

## 6. Decisions required

1. Provision the scratch/staging project (free tier) so the baseline can be captured.
2. Decide how to resolve the `sessions.class_id` drift: reconcile production into
   a new migration, or correct `0005`. Either way it should land **before**
   Phase 0B policy work, so the baseline is captured against a schema that matches
   production.
3. Decide whether H-1 warrants an out-of-band hotfix ahead of the full Phase 0B
   sequence — it is exploitable today by the one existing non-super-admin account.
