"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/admin/Avatar";
import { ATTENDANCE_META, type AttendanceStatus } from "@/lib/os/attendance";
import { CheckCircle2, Loader2, X, WifiOff } from "lucide-react";
import type { FinishResult } from "@/app/admin/(portal)/attendance/actions";

export interface RosterStudent {
  id: string;
  full_name: string;
  admission_number: string | null;
  photoUrl: string | null;
  status: AttendanceStatus;
}

const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

interface FinishArgs {
  batchSubjectId: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  marks: { studentId: string; status: AttendanceStatus }[];
  topic?: string;
  homework?: string;
  teacherNotes?: string;
}

/** One student row — memo-friendly; four large touch targets. */
function StudentRow({
  student,
  onMark,
}: {
  student: RosterStudent;
  onMark: (id: string, status: AttendanceStatus) => void;
}) {
  return (
    <li
      className="rounded-2xl p-3"
      style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.12)" }}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <Avatar name={student.full_name} photoUrl={student.photoUrl} size={40} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#f5f0e8" }}>{student.full_name}</p>
          <p className="text-[11px]" style={{ color: "rgba(245,240,232,0.4)" }}>{student.admission_number ?? "—"}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {STATUSES.map((s) => {
          const meta = ATTENDANCE_META[s];
          const active = student.status === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              aria-label={`${student.full_name}: ${meta.label}`}
              onClick={() => onMark(student.id, s)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 transition-all active:scale-95"
              style={{
                background: active ? meta.bg : "rgba(245,240,232,0.04)",
                border: `1.5px solid ${active ? meta.border : "transparent"}`,
              }}
            >
              <span className="text-base leading-none" aria-hidden>{meta.emoji}</span>
              <span
                className="text-[10px] font-bold"
                style={{ color: active ? meta.color : "rgba(245,240,232,0.4)" }}
              >
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </li>
  );
}

export function AttendanceScreen({
  batchSubjectId,
  sessionDate,
  startTime,
  endTime,
  roster,
  existingNotes,
  alreadyCompleted,
  finishAction,
}: {
  batchSubjectId: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  roster: RosterStudent[];
  existingNotes: { topic: string; homework: string; teacherNotes: string };
  alreadyCompleted: boolean;
  finishAction: (args: FinishArgs) => Promise<FinishResult>;
}) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(
    () => Object.fromEntries(roster.map((s) => [s.id, s.status]))
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [topic, setTopic] = useState(existingNotes.topic);
  const [homework, setHomework] = useState(existingNotes.homework);
  const [teacherNotes, setTeacherNotes] = useState(existingNotes.teacherNotes);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<FinishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One tap changes status — pure local state, instant feedback, no network.
  const onMark = useCallback((id: string, status: AttendanceStatus) => {
    setMarks((prev) => (prev[id] === status ? prev : { ...prev, [id]: status }));
  }, []);

  const counts = useMemo(() => {
    const c: Record<AttendanceStatus, number> = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const s of roster) c[marks[s.id]]++;
    return c;
  }, [marks, roster]);

  const bulkPresent = () => setMarks(Object.fromEntries(roster.map((s) => [s.id, "present"])));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await finishAction({
          batchSubjectId,
          sessionDate,
          startTime,
          endTime,
          marks: roster.map((s) => ({ studentId: s.id, status: marks[s.id] })),
          topic,
          homework,
          teacherNotes,
        });
        if (!res.ok) {
          setError(res.error ?? "Something went wrong");
          return;
        }
        setResult(res);
      } catch {
        setError("Network error — your marks are kept. Tap Save again when back online.");
      }
    });
  };

  // Success screen.
  if (result?.ok) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(22,45,36,0.85)", border: "1px solid rgba(125,201,143,0.4)" }}>
        <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: "#7dc98f" }} />
        <h2 className="font-playfair text-xl font-bold mb-1" style={{ color: "#f5f0e8" }}>Attendance Saved</h2>
        <p className="text-sm mb-1" style={{ color: "rgba(245,240,232,0.6)" }}>
          {result.saved} students · {counts.present} present, {counts.absent} absent, {counts.late} late, {counts.excused} excused
        </p>
        <p className="text-xs mb-5" style={{ color: "rgba(245,240,232,0.45)" }}>
          {result.whatsappSkipped
            ? `${result.queued} WhatsApp messages queued (dispatch pending configuration)`
            : `${result.sent ?? 0} sent · ${(result.queued ?? 0) - (result.sent ?? 0)} queued`}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push("/admin/attendance")} className="rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "#c9a227", color: "#162d24" }}>
            Today&apos;s Classes
          </button>
          <button onClick={() => { setResult(null); router.refresh(); }} className="rounded-xl px-5 py-3 font-bold text-sm" style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }}>
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bulk action + running tally */}
      <div className="flex items-center justify-between mb-3 sticky top-0 z-10 py-2" style={{ background: "linear-gradient(#101d18, #101d18ee)" }}>
        <div className="flex gap-2 text-[11px] font-semibold">
          {STATUSES.map((s) => (
            <span key={s} style={{ color: ATTENDANCE_META[s].color }}>
              {counts[s]} {ATTENDANCE_META[s].label}
            </span>
          ))}
        </div>
        <button onClick={bulkPresent} className="text-[11px] font-bold rounded-lg px-2.5 py-1.5" style={{ background: "rgba(125,201,143,0.14)", color: "#7dc98f" }}>
          All present
        </button>
      </div>

      {/* Roster — Present pre-selected; teacher taps only exceptions */}
      <ul className="space-y-2 pb-28">
        {roster.map((s) => (
          <StudentRow key={s.id} student={{ ...s, status: marks[s.id] }} onMark={onMark} />
        ))}
      </ul>

      {/* Sticky Finish */}
      <div className="fixed bottom-0 inset-x-0 lg:pl-60 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+72px)] lg:pb-4 pt-3" style={{ background: "linear-gradient(transparent, #101d18 30%)" }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSheetOpen(true)}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-60"
            style={{ background: "#c9a227", color: "#162d24", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          >
            {alreadyCompleted ? "Update Attendance" : "Finish Class"} · {roster.length} students
          </button>
        </div>
      </div>

      {/* Class Notes bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => !isPending && setSheetOpen(false)}>
          <div
            className="w-full max-w-lg rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] animate-[slideUp_0.25s_ease-out]"
            style={{ background: "#162d24", borderTop: "1px solid rgba(201,162,39,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-lg font-bold" style={{ color: "#f5f0e8" }}>Class Notes</h3>
              <button onClick={() => !isPending && setSheetOpen(false)} aria-label="Close" style={{ color: "rgba(245,240,232,0.5)" }}>
                <X size={20} />
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "rgba(245,240,232,0.4)" }}>All optional — saved with this session for reports.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Today&apos;s Topic</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Force and Motion" className="w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Homework</label>
                <input value={homework} onChange={(e) => setHomework(e.target.value)} placeholder="e.g. Exercise 5" className="w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(245,240,232,0.6)" }}>Teacher Notes</label>
                <textarea value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} rows={2} placeholder="e.g. Excellent participation today." className="w-full rounded-xl px-4 py-3 text-sm outline-none border-0 focus:ring-2 focus:ring-[#c9a227]" style={{ background: "rgba(245,240,232,0.08)", color: "#f5f0e8" }} />
              </div>
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2 mt-3 flex items-center gap-2" style={{ background: "rgba(220,80,60,0.15)", color: "#e8a090" }}>
                <WifiOff size={14} /> {error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-base mt-4 active:scale-[0.98] transition-transform disabled:opacity-60"
              style={{ background: "#c9a227", color: "#162d24" }}
            >
              {isPending ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : "Save Attendance"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
