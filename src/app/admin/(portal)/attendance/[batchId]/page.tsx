import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Square } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { signedUrls, PHOTO_BUCKET } from "@/lib/os/storage";
import { isoDate, isIsoDate, fmtDate, fmtTime, type AttendanceStatus } from "@/lib/os/attendance";
import { AttendanceScreen, type RosterStudent } from "@/components/admin/AttendanceScreen";
import { finishSession, stopSession } from "../actions";

export const dynamic = "force-dynamic";

export default async function MarkAttendancePage({
  params,
  searchParams,
}: {
  params: { batchId: string };
  searchParams: { date?: string };
}) {
  await requireCapability("attendance.mark");
  const supabase = createServerSupabase();
  const today = isoDate();
  const day = isIsoDate(searchParams.date) ? searchParams.date : today;

  // Nothing here depends on anything else here, so they all go at once. These
  // used to run one after another: five sequential round trips before the
  // marking screen could paint.
  const [{ data: batch }, { data: batchSubjects }, { data: enrol }, { data: session }] = await Promise.all([
    supabase
      .from("batches")
      .select("id, name, grade, start_time, end_time, room")
      .eq("id", params.batchId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("batch_subjects")
      .select("id, subject_id, colour, subject:subjects(name), teacher:teachers(full_name)")
      .eq("batch_id", params.batchId)
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("batch_students")
      .select("student:students(id, full_name, admission_number, photo_path, status)")
      .eq("batch_id", params.batchId),
    supabase
      .from("sessions")
      .select("id, status, subject_ids, topic_covered, homework_assigned, teacher_notes")
      .eq("batch_id", params.batchId)
      .eq("session_date", day)
      .maybeSingle(),
  ]);
  if (!batch) notFound();

  const subjectOptions = (batchSubjects ?? []).map((bs) => ({
    id: bs.subject_id as string,
    name: (bs.subject as unknown as { name: string } | null)?.name ?? "—",
    teacherName: (bs.teacher as unknown as { full_name: string } | null)?.full_name ?? null,
    colour: bs.colour as string,
  }));

  const students = (enrol ?? [])
    .map((e) => e.student as unknown as { id: string; full_name: string; admission_number: string | null; photo_path: string | null; status: string } | null)
    .filter((s): s is NonNullable<typeof s> => !!s && s.status !== "archived" && s.status !== "dropped")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Existing marks for this date (resume / edit) alongside the photo signing.
  const [existingMarks, photoUrls] = await Promise.all([
    session
      ? supabase.from("attendance").select("student_id, status").eq("session_id", session.id).then((r) => r.data ?? [])
      : Promise.resolve([] as { student_id: string; status: string }[]),
    signedUrls(PHOTO_BUCKET, students.map((s) => s.photo_path)),
  ]);
  const markByStudent = new Map(existingMarks.map((m) => [m.student_id, m.status as AttendanceStatus]));

  const roster: RosterStudent[] = students.map((s, i) => ({
    id: s.id,
    full_name: s.full_name,
    admission_number: s.admission_number,
    photoUrl: photoUrls[i],
    status: markByStudent.get(s.id) ?? "present", // Present pre-selected
  }));

  const initialSubjectIds = session?.subject_ids?.length ? session.subject_ids : subjectOptions.map((s) => s.id);

  return (
    <div className="max-w-2xl">
      <header className="mb-4">
        <Link href={`/admin/attendance${day !== today ? `?date=${day}` : ""}`} className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> {day === today ? "Today's Sessions" : "Back to that day"}
        </Link>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold" style={{ color: "#f4c430" }}>{fmtTime(batch.start_time)}</span>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "#f5f0e8" }}>{batch.name}</h1>
        </div>
        <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
          Grade {batch.grade}{batch.room ? ` · ${batch.room}` : ""} · {fmtDate(day, { weekday: "long", day: "numeric", month: "short" })}
          {session?.status === "completed" && " · completed (editing)"}
        </p>

        {/* Starting used to be one-way. Stopping leaves any marks already
            saved alone — it only reopens the session. */}
        {session?.status === "in_progress" && (
          <form action={stopSession.bind(null, batch.id, day)} className="mt-3">
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold" style={{ background: "rgba(245,240,232,0.07)", color: "rgba(245,240,232,0.7)" }}>
              <Square size={12} /> Stop session
            </button>
          </form>
        )}
      </header>

      {!batch.start_time ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(244,196,48,0.3)" }}>
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.6)" }}>
            This batch has no timing set yet, so attendance can&apos;t be keyed to a session. Add its days and time first.
          </p>
          <Link href={`/admin/batches/${batch.id}/edit`} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
            Set batch timing
          </Link>
        </div>
      ) : roster.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <p className="text-sm mb-4" style={{ color: "rgba(245,240,232,0.5)" }}>No students enrolled in this batch yet.</p>
          <Link href={`/admin/batches/${batch.id}`} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>Enrol Students</Link>
        </div>
      ) : (
        <AttendanceScreen
          batchId={batch.id}
          sessionDate={day}
          startTime={batch.start_time?.slice(0, 5) ?? null}
          endTime={batch.end_time?.slice(0, 5) ?? null}
          roster={roster}
          subjectOptions={subjectOptions}
          initialSubjectIds={initialSubjectIds}
          existingNotes={{ topic: session?.topic_covered ?? "", homework: session?.homework_assigned ?? "", teacherNotes: session?.teacher_notes ?? "" }}
          alreadyCompleted={session?.status === "completed"}
          finishAction={finishSession}
        />
      )}
    </div>
  );
}
