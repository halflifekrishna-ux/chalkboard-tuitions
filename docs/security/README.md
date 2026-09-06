# Chalkboard OS — Security Test Harness

Baseline harness for **Phase 0B-TEST**. It records what the database actually
permits today, so that every later Phase 0B policy change can be diffed against
a known-good reference.

> The harness reads and probes. It changes nothing: the whole probe run is one
> transaction ending in `ROLLBACK`.

## Files

| File | Purpose | Safe on production? |
|---|---|---|
| `supabase/tests/security/00_preflight_schema_snapshot.sql` | Captures schema version, RLS status, every policy definition, trigger coverage, drift checks | **Yes** — catalog metadata only, reads no row data |
| `supabase/tests/security/01_baseline_probes.sql` | The 17-probe RLS baseline matrix | **No** — see below |
| `docs/security/phase-0a-baseline.md` | Human-readable baseline artifact | — |
| `docs/security/phase-0a-baseline.json` | Machine-readable baseline artifact | — |

## Required environment

**A scratch or staging Supabase project. Not production.**

`01_baseline_probes.sql` deliberately exercises the H-1 privilege-escalation
path: it briefly materialises a `super_admin` row and deletes an `admins` row.
Everything rolls back, but a mid-run disconnect, a statement timeout, or an
editor that auto-commits would leave that row behind. The blast radius on
production is a real super-admin account. Do not run it there.

The project must have migrations `0001` → `0010` applied. It needs no data:
the harness seeds its own fixtures inside the transaction.

### Setting one up

1. Create a new Supabase project (free tier is sufficient — see the cost note below).
2. Run `supabase/migrations/0001` … `0010` in order in its SQL Editor.
   Run `0008` and `0009` as **two separate executions** (see `docs/OPERATIONS.md` —
   Postgres forbids using a newly-added enum value in the transaction that added it).
3. Run `00_preflight_schema_snapshot.sql`; save the output.
4. Run `01_baseline_probes.sql`; save both result sets.

No production data is copied. No secrets belong in this repo.

## Running

**Supabase SQL Editor** — paste the file, run, copy the two result grids.
The editor shows one grid per statement; the last two `SELECT`s before
`ROLLBACK` are the human-readable table and the JSON blob.

> The editor wraps submissions in its own transaction, so the script's explicit
> `begin;` may emit a "there is already a transaction in progress" warning. That
> is harmless — the closing `rollback;` still discards everything. If the editor
> refuses the explicit block, delete the `begin;` line only: the editor's own
> transaction plus the final `rollback;` give the same guarantee.

**psql** (shows every result set in order, preferred if available):

```bash
psql "$SCRATCH_DB_URL" -f supabase/tests/security/00_preflight_schema_snapshot.sql
psql "$SCRATCH_DB_URL" -f supabase/tests/security/01_baseline_probes.sql
```

Neither `psql` nor the Supabase CLI is currently installed on this machine, and
`.env.local` holds no Supabase credentials — see the environment gap noted in
`phase-0a-baseline.md`.

## How the harness works

Supabase resolves `auth.uid()` and `auth.jwt()` from the `request.jwt.claims`
setting. The harness sets that value transaction-locally and then switches to
the `authenticated` (or `anon`) role, so RLS evaluates exactly as it would for a
signed-in user — **without creating any `auth.users` row and without creating
Guru**.

Fixture `admins` rows carry `auth_user_id = NULL` and are matched on the *email*
branch of `is_active_admin()`, which is the same branch production uses before a
user's first login binds their auth id.

Each probe runs one statement inside a PL/pgSQL exception block, so an RLS
denial is captured as a result rather than aborting the run:

- `SELECT` returning 0 rows against a seeded fixture ⇒ **DENIED** (filtered)
- `INSERT`/`UPDATE`/`DELETE` affecting 0 rows ⇒ **DENIED**
- `SQLSTATE 42501` ⇒ **DENIED** (policy or grant refused it)
- otherwise ⇒ **ALLOWED**

### Sanity probes matter

Rows `S01`–`S06` assert `is_active_admin()` is `true` for each simulated
identity. If a sanity probe reports anything but `identity OK`, the identity
simulation failed and **every result for that role is meaningless** — a false
`DENIED` would otherwise look like good news.

## Reading the results

Three classifications, per Phase 0A. A currently-permitted operation is never
simply a "pass":

| Classification | Meaning |
|---|---|
| `EXPECTED CURRENT BEHAVIOR` | The system behaves as intended. |
| `KNOWN SECURITY DEFECT` | Permitted today; Phase 0A says it must eventually be denied. Cited to its finding (H-1 … H-6). |
| `REGRESSION-SENSITIVE` | Permitted today **and must stay permitted** — an existing workflow depends on it. These are the Phase 0B tripwires. |
| `SANITY` | Identity-simulation check, not a security assertion. |

The `deviation` column flags any probe whose outcome Phase 0A did not predict.
**Any `*** DEVIATES FROM AUDIT ***` row stops Phase 0B** until it is reported
and understood.

## Application vs. database comparison

The SQL harness measures layer 4 (RLS). The point of the exercise is the *gap*
between it and layers 2–3 (page guards, Server Action guards), which is measured
by hand — no test framework, no new dependency.

For each row below: sign into a **staging** deployment as a user with that role,
attempt the UI path, then attempt the same operation directly with that user's
JWT (via `supabase-js` and the public anon key, e.g. from the browser console).

| Scenario | Role | App path | Direct DB probe | Expected verdict today |
|---|---|---|---|---|
| Read fees | teacher | `/admin/fees` — no page guard, renders `ComingSoon` only | `P04a` | APPLICATION SHOWS NOTHING / **DATABASE ALLOWS** |
| Edit a student | teacher | `saveStudent` (`students.manage`) → redirect | `P02b` equivalent | APPLICATION BLOCKED / **DATABASE ALLOWS** |
| Delete audit rows | teacher | no UI exists | `P06` | APPLICATION HAS NO PATH / **DATABASE ALLOWS** |
| Toggle a feature flag | admin | `/admin/developer` → `requireSuperAdmin()` redirect | `P03` | APPLICATION BLOCKED / DATABASE BLOCKED ✅ |
| Manage users | admin | `/admin/users` → `users.manage` redirect | `admins` INSERT (`P12`) | APPLICATION BLOCKED / **DATABASE ALLOWS** |
| Mark attendance | teacher | `finishSession` succeeds | `P05a`–`P05g` | APPLICATION ALLOWS / DATABASE ALLOWS ✅ (must stay) |

Record each verdict in `phase-0a-baseline.md` §4.

## Attendance regression contract

`P05a`–`P05g` mirror the real `finishSession` write order
(`src/app/admin/(portal)/attendance/actions.ts`) step by step:

| Step | Table | Op | Probe |
|---|---|---|---|
| 1 | `sessions` | upsert | `P05a` |
| 2 | `attendance` | upsert — the durable core | `P05b` |
| 3 | `attendance_logs` | insert (diffs) | `P05c` |
| 4 | `batch_subjects`/`subjects`/`batches` | select | `P02e` |
| 5 | `activity_logs` | insert | `P05d` |
| 6 | `students` + `parents` | select | `P05e`, `P05f` |
| 7 | `communication_queue` | insert | `P05g` |
| 8 | `whatsapp_logs`, `communications` | insert (dispatch) | covered by step 7's grant path |

Every one of these runs as the **signed-in user** under RLS — no service role,
no `SECURITY DEFINER` anywhere in the attendance path. If a Phase 0B change
flips any of them to `DENIED`, attendance is broken. Re-run the harness after
every policy change and diff against the recorded baseline.

## Cost

No new service and no paid tier is required. A second Supabase **free-tier**
project is sufficient for the scratch environment, and free projects pause when
idle, which is fine for an on-demand harness. No purchase is being requested.
