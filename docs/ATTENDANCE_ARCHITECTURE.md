# Attendance Architecture — Chalkboard OS Phase 2

Status: **BUILT (Phase 2 complete)**, schedule model simplified in migration
`0013_batch_slot_simplify` — see below. See "Phase 2 delivery" at the bottom
for the originally shipped file map.

## 1. Database

Attendance never attaches to a student directly. The chain is:

```
branches → batches → sessions → attendance → students
              ↑          ↑
      days/start/end   (date, time, status, subject_ids)
        time, room
```

A batch is **one dedicated slot** (e.g. "Grade 8 Foundation", Mon–Fri and
sometimes Sat, 5–7 PM) with no fixed subject-per-day rule — any mix of the
batch's subjects can be covered on any day it meets. `batch_subjects` is just
the list of subjects taught in a batch (subject + teacher + a colour tag),
not a schedule of its own; the schedule (`days[]`, `start_time`, `end_time`,
`room`) lives on `batches`. Each `sessions` row picks freely, per occurrence,
which of those subjects were actually covered (`subject_ids`).

| Table | Role | Key fields |
|---|---|---|
| `batches` | The recurring slot + enrolled group | branch, grade, board, capacity, `days[]`, start/end time, room |
| `batch_students` | Enrolment (who belongs to the batch) | unique (batch_id, student_id) |
| `batch_subjects` | A subject taught within a batch — no schedule of its own | subject, teacher, colour tag |
| `sessions` | One concrete occurrence of a batch's slot on a date | unique (batch_id, session_date, start_time); status scheduled → in_progress → completed; `subject_ids` = what was actually covered; **class notes**: `topic_covered`, `homework_assigned`, `teacher_notes` |
| `attendance` | One row per student per session | unique (session_id, student_id); status present/absent/late/excused; `marked_by`, `marked_at` |
| `attendance_logs` | Immutable edit history | old_status → new_status, changed_by, timestamp |
| `communications` + `whatsapp_logs` | Parent notification record | template_key, provider_id, delivery status |
| `activity_logs` | Student timeline + audit | "Aarav marked present — Grade 6 Foundation" |

**Session creation is lazy**: when Nanditha opens Attendance for a batch
today, the session row is created on first touch (`upsert` on the unique
key). No cron needed; a future scheduler can pre-create sessions without any
schema change.

## 2. User flow (Nanditha, on her phone, < 30 seconds)

1. **Attendance tab** → a week calendar strip to jump to any day, and a list of that day's batches (derived from `batches.days` matching the weekday), each showing time, enrolled count, the subjects it can cover, and a Done/Pending chip.
2. Tap a batch → session upserted → roster screen: a **Subjects covered today** picker (free choice, pre-selected to everything the batch teaches — deselect what wasn't covered) above one large row per enrolled student (photo, name), four big touch targets: **Present / Absent / Late / Excused**. Default pre-selection: Present (one tap flips the exceptions — fastest path).
3. Optimistic UI — taps update instantly, writes happen in the background.
4. Tap **Finish Class** → a compact **Class Notes** sheet appears (all fields optional, skippable in one tap):
   - **Today's Topic** — e.g. "Force and Motion"
   - **Homework** — e.g. "Exercise 5"
   - **Teacher Notes** — e.g. "Excellent participation today."

   Then, in one server action:
   - class notes saved on the session (`topic_covered`, `homework_assigned`, `teacher_notes`)
   - all attendance rows saved (`marked_by` = Nanditha)
   - session marked `completed` (`completed_at`, `completed_by`)
   - one `activity_logs` entry per student
   - WhatsApp notifications **queued** (`whatsapp_logs` rows with status `queued`)
   - queue is dispatched immediately after (fire-and-forget; failures stay visible)
5. Re-opening a finished class allows corrections — every change writes an `attendance_logs` row (who, what, when). Corrections do **not** re-send WhatsApp automatically.

## 3. WhatsApp flow (Meta Cloud API)

```
Finish Class
  → insert whatsapp_logs (status=queued, template_key=attendance_present|absent|late)
  → dispatch loop: POST graph.facebook.com/v20.0/{phone_number_id}/messages
       success → status=sent, provider_id stored → mirrored into communications (outgoing, whatsapp)
       failure → status=failed, error stored → visible on dashboard + WhatsApp module
  → webhook (later): delivery/read receipts update status via provider_id
```

- Credentials (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`) live in env vars; template text and business identity read from `system_settings` — nothing hardcoded.
- Meta requires **pre-approved template messages** for business-initiated conversations. Three templates (present/absent/late) must be approved in Meta Business Manager before go-live; exact copy per your spec ("Hello {{ParentName}} … {{StudentName}} attended today's class…").
- Excused: no message by default (configurable later in Settings).
- Until Meta credentials exist, a **dev mode** logs to `whatsapp_logs` with status `queued` and a "WhatsApp not configured" banner — attendance itself never blocks on messaging.

## 4. Future QR flow (no schema change needed)

- Every student already has `student_code` (CBT-0001) and `admission_number` — the QR encodes `student_code`.
- Flow: open session → "Scan" mode → camera reads QR → lookup by `student_code` → mark present in that session. Manual roster stays as fallback in the same screen.
- Enabled purely by flipping the `qr_attendance` feature flag and adding a scanner component; writes go through the exact same `attendance` upsert path.

## 5. Future teacher-login flow (no schema change needed)

- `teachers.auth_user_id` and the `admin_role` enum (`teacher`) already exist.
- Enabling: create auth users for teachers, flip `teacher_portal` flag, add RLS policies scoped to `classes.teacher_id = their teacher row` — they see only their own classes/sessions and can mark attendance for them.
- `attendance.marked_by` already records *who* marked, so admin vs teacher marking is auditable from day one.

## 6. What gets built on approval

1. `/admin/classes` — CRUD for classes (name, subject, grade, teacher, days, times, capacity, room) + enrol/remove students.
2. `/admin/attendance` — today view → roster screen → Finish Class with Class Notes sheet (as above). Notes are **not** sent to parents yet; they accumulate per session so weekly reports (attendance % + topics + homework + remarks) and AI summaries can be generated later with zero backfill.
3. WhatsApp dispatcher (`src/lib/os/whatsapp.ts`) + env-var wiring + dev mode.
4. Dashboard hookup — Today's Classes/Present/Absent/Late tiles go fully live.

---

## Phase 2 delivery (shipped)

**Migration**: `0004_communication_queue.sql` — `communication_queue` (pending/processing/sent/failed, retry_count, payload, provider_id, timestamps) + `queue_status` enum + RLS.

**Service layer**: `src/lib/os/whatsapp.ts` — 7 templates (present/absent/late/excused/homework/weekly_report/fee_reminder), `enqueueMessages` (insert-only), `processQueue` (claim → send → log, skips cleanly without Meta creds), `requeueFailed`. `src/lib/os/attendance.ts` — status metadata, weekday/date helpers, template mapping.

**Classes module**: `/admin/classes` (list, new, `[id]` with tap-to-enrol, `[id]/edit`) + `actions.ts` + `schema.ts` + `ClassForm`, `EnrolmentList`.

**Attendance module**: `/admin/attendance` (Today's Classes), `/admin/attendance/[classId]` (marking screen) + `actions.ts` (`finishClass`). Components: `AttendanceScreen` (optimistic marking, sticky Finish, Class Notes sheet, offline-safe), `AttendanceHistory` (%, counts, month calendar, recent sessions).

**Save ordering** (in `finishClass`): session upsert → attendance upsert → attendance_logs (diffs) → activity_logs → session completed → **then** enqueue → best-effort dispatch. Attendance is durable before any messaging.

**WhatsApp ops**: `/admin/whatsapp` — queue tally, per-row status/errors, Retry Failed action.

**Dashboard**: live Attendance %, Classes Done, Marked Today, Present/Absent, Messages Sent/Queued.
