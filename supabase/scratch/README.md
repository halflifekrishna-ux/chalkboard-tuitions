# Scratch execution bundles — run sheet

Temporary convenience files for pasting into the **Scratch test** project's SQL
Editor. They are concatenations of `supabase/migrations/`, nothing else.

> **Scratch only. Never run these against production.**
> These are not migrations. `supabase/migrations/` remains the source of truth —
> if anything here ever disagrees with it, the migrations win and these files
> should be regenerated.

## Run order

Run each file as its **own** SQL Editor execution, in this order, and confirm it
succeeds before starting the next.

| Step | File | Contains |
|---|---|---|
| 1 | `01_migrations_0001_0007.sql` | 0001, 0002, 0003, 0004, 0005, 0006, 0007 |
| 2 | `02_migration_0008.sql` | 0008 only |
| 3 | `03_migration_0009.sql` | 0009 only |
| 4 | `04_migrations_0010_0012.sql` | 0010, 0011, 0012 |

Steps 2 and 3 **must stay separate executions**. 0008 runs
`alter type public.admin_role add value 'admin'`, and 0009 writes
`role = 'admin'`. Postgres forbids using a newly-added enum value in the same
transaction that added it, so combining them fails.

## Then, verification (also scratch only)

| Step | File | What to keep |
|---|---|---|
| 5 | `../tests/security/00_preflight_schema_snapshot.sql` | all six result grids |
| 6 | `../tests/security/01_baseline_probes.sql` | the final two grids (human-readable table + JSON) |

Step 6 runs inside a transaction that ends in `ROLLBACK` — it leaves nothing
behind. The SQL Editor may warn *"there is already a transaction in progress"*
on the script's explicit `begin;`; that is harmless.

### Step 7 — attendance check (the reason 0011 exists)

Session creation must be verified **against the database**, not the UI:
`startSession` discards its insert error and redirects regardless, so a
successful-looking redirect proves nothing.

```sql
-- pick any batch subject; create one first if the scratch DB has none
insert into public.sessions (batch_subject_id, session_date, start_time, status)
values ((select id from public.batch_subjects limit 1), current_date, '17:00', 'in_progress');

select id, class_id, batch_subject_id, session_date, start_time, status
from public.sessions;
```

**Pass condition:** a real row with `class_id IS NULL`. Before 0011 this insert
fails with `23502 null value in column "class_id"`.

## What was added to the SQL

Nothing executable. Each bundle carries a short header comment and an inert
`-- ▼▼▼ BEGIN <file> ▼▼▼` separator before each migration, so that if the editor
reports an error you can tell which migration it came from. Verified: with
comments and blank lines stripped, every bundle is identical to its source
migrations (709 / 107 / 14 / 105 SQL lines respectively).

## Expected outcomes

**Step 4** — 0012 opens with a precondition that **aborts the entire bundle** if
any case-insensitive duplicate admin emails exist:

```
ABORT 0012: N case-insensitive duplicate admin email(s) present.
```

On a freshly built scratch database this passes: 0008 seeds
Sreejith (`super_admin`) and renames the legacy row to Nanditha's Gmail address,
0009 demotes her to `admin`, and 0010 then matches nothing. Two rows, distinct
emails. If it aborts anyway, stop and report — do not work around it.

**Step 6** — after 0012, these must now report `DENIED`:

| Probe | Operation |
|---|---|
| P12 | non-super INSERT of a case-variant self row with `role='super_admin'` |
| P13 | non-super DELETE of own `admins` row |
| P14 | non-super UPDATE of own role (was already denied pre-0012) |
| P18 | DELETE of the last active Super Admin |

These must remain `ALLOWED` (they are the regression tripwires):
P01a–P01e (super admin), P02a–P02f (admin), P05a–P05g (the full attendance
write path).

Probes P04, P06, P07, P09, P10, P11, P15, P17 are Phase 0B scope and will still
report `KNOWN SECURITY DEFECT`. That is expected — 0012 deliberately touches
only `public.admins`.

Not covered by any probe: first-login `auth_user_id` binding and the Super Admin
transfer flow. Both were verified statically only; they need the Server Action
pass described in `../../docs/security/README.md`.

## Cleanup

Delete this directory once the scratch run is done. It duplicates
`supabase/migrations/` and will drift.
