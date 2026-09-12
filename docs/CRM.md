# Chalkboard OS — Leads / CRM

Angie brings leads for both sides of the business. Each one routes itself, gets
worked by exactly one person, and Angie can follow where it got to without being
able to move it herself.

## The two pipelines

```
                          Angie adds a lead
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
           Tuitions                            Learning Studio
                │                                   │
                ▼                            pending_approval
         straight to Nanditha                       │
                │                         Super Admin approves
                │                                   ▼
                │                             assigned to Guru
                ▼                                   ▼
     contacted → follow_up → converted / lost   (same pipeline)
                │
                ▼
     "Convert to student" prefills Add Student,
     and the lead closes as converted
```

A tuitions lead never waits: it lands with the tuitions owner the moment it is
saved. A studio lead is held at `pending_approval` until a Super Admin approves
it, and only then does it reach the studio's BD. Rejecting one closes it with a
reason instead.

## Who can do what

| | Angie (`marketing`) | Nanditha (`admin`) | Guru (`bd`) | Sreejith (`super_admin`) |
|---|---|---|---|---|
| Add a lead | ✅ | ✅ | ✅ | ✅ |
| See every lead + its status | ✅ | ✅ | ✅ | ✅ |
| Move a lead along | — | ✅ any | ✅ only theirs | ✅ any |
| Approve / reject a studio lead | — | — | — | ✅ |
| Convert a lead to a student | — | ✅ | — | ✅ |
| Everything else in the OS | — | ✅ | — | ✅ |

This is enforced in the database, not just the interface: migration 0014's RLS
policies give `marketing` insert and select only, and restrict `bd` to rows where
`assigned_to` is them. A teacher or receptionist sees no leads at all. The
policies were verified against a local Postgres with 13 probes covering each role
(read, insert, update-own, update-others, delete, and pre-approved insert).

## Adding Angie and Guru

Migration 0014 adds the roles; the accounts are made in the app:

1. `/admin/users` → **Add**, role **Marketing** for Angie, **Studio BD** for Guru.
2. Hand over the one-time temp password it shows. They are forced to change it on
   first sign-in.
3. Both land on `/admin/leads` when they sign in — neither has a reason to see the
   teaching dashboard, so it redirects them.

## Where leads land

`lead_routing` in `system_settings` names the owner per vertical:

```json
{ "tuitions_owner_id": null, "studio_owner_id": null }
```

Null means "work it out": the first active `admin` owns tuitions leads, the first
active `bd` owns studio leads. Set the ids explicitly once there is more than one
person who could own either side. There is no screen for this yet — set it in
Supabase → Table Editor → `system_settings`.

If a studio lead is approved while no `bd` user exists, it lands unassigned and
stays visible to the admin tier, who can still work it.

## What gets recorded

Every move writes to `crm_lead_events` — who, when, from which status to which,
plus any note. That timeline is what Angie reads on the lead page. Status changes
also write to `activity_logs`, so they show up in the dashboard's recent activity
alongside attendance and student changes.
