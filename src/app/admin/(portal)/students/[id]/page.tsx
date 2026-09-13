import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Phone, MessageCircle, QrCode, Archive } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { signedUrl, PHOTO_BUCKET, DOCS_BUCKET } from "@/lib/os/storage";
import { Avatar } from "@/components/admin/Avatar";
import { CommunicationLog, type CommEntry } from "@/components/admin/CommunicationLog";
import { DocumentsSection, type DocEntry } from "@/components/admin/DocumentsSection";
import { AttendanceHistory, type AttendanceRecord } from "@/components/admin/AttendanceHistory";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { BOARD_LABELS, STATUS_LABELS, type Board, type StudentStatus } from "@/lib/os/types";
import { archiveStudent, logCommunication, uploadDocument } from "../actions";

export const dynamic = "force-dynamic";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: "#f5f0e8" }}>{value}</span>
    </div>
  );
}

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  await requireCapability("students.view");
  const supabase = createServerSupabase();

  const [{ data: student }, { data: timeline }, { data: comms }, { data: docs }, { data: attendance }, { data: batchLinks }] = await Promise.all([
    supabase.from("students").select("*, parent:parents(*)").eq("id", params.id).is("deleted_at", null).maybeSingle(),
    supabase.from("activity_logs").select("id, action, summary, created_at").eq("student_id", params.id).order("created_at", { ascending: false }).limit(30),
    supabase.from("communications").select("id, type, direction, message, status, occurred_at").eq("student_id", params.id).order("occurred_at", { ascending: false }).limit(30),
    supabase.from("documents").select("id, file_name, kind, size_bytes, storage_path, created_at").eq("student_id", params.id).is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("attendance").select("status, session:sessions!inner(session_date, subject_ids, batch:batches(name))").eq("student_id", params.id).order("marked_at", { ascending: false }).limit(120),
    supabase.from("batch_students").select("batch:batches(id, name, grade, status, deleted_at)").eq("student_id", params.id),
  ]);

  const batches = (batchLinks ?? [])
    .map((l) => l.batch as unknown as { id: string; name: string; grade: number; status: string; deleted_at: string | null } | null)
    .filter((b): b is NonNullable<typeof b> => !!b && !b.deleted_at);

  if (!student) notFound();

  const subjectIds = Array.from(
    new Set((attendance ?? []).flatMap((a) => (a.session as unknown as { subject_ids: string[] | null } | null)?.subject_ids ?? []))
  );
  const { data: subjectRows } = subjectIds.length
    ? await supabase.from("subjects").select("id, name").in("id", subjectIds)
    : { data: [] as { id: string; name: string }[] };
  const subjectNameById = new Map((subjectRows ?? []).map((s) => [s.id, s.name]));

  const attendanceRecords: AttendanceRecord[] = (attendance ?? []).map((a) => {
    const session = a.session as unknown as { session_date: string; subject_ids: string[] | null; batch: { name: string } | null } | null;
    const subjectsLabel = (session?.subject_ids ?? []).map((id) => subjectNameById.get(id)).filter(Boolean).join(", ");
    return {
      date: session?.session_date ?? "",
      status: a.status as AttendanceRecord["status"],
      className: session?.batch?.name ? `${session.batch.name}${subjectsLabel ? ` · ${subjectsLabel}` : ""}` : "Session",
    };
  });
  const parent = student.parent as {
    full_name: string;
    phone: string;
    whatsapp_number: string | null;
    email: string | null;
    relationship: string | null;
  } | null;

  const [photoUrl, ...docUrls] = await Promise.all([
    signedUrl(PHOTO_BUCKET, student.photo_path),
    ...(docs ?? []).map((d) => signedUrl(DOCS_BUCKET, d.storage_path)),
  ]);

  const docEntries: DocEntry[] = (docs ?? []).map((d, i) => ({
    id: d.id,
    file_name: d.file_name,
    kind: d.kind,
    size_bytes: d.size_bytes,
    created_at: d.created_at,
    url: docUrls[i],
  }));

  const waNumber = (parent?.whatsapp_number || parent?.phone || "").replace(/[^0-9]/g, "");
  const archiveWithId = archiveStudent.bind(null, student.id);
  const logCommWithId = logCommunication.bind(null, student.id);
  const uploadDocWithId = uploadDocument.bind(null, student.id);

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Students
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar name={student.full_name} photoUrl={photoUrl} size={64} />
            <div className="min-w-0">
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold truncate" style={{ color: "#f5f0e8" }}>
                {student.full_name}
              </h1>
              <p className="text-sm mt-1 flex items-center gap-2 flex-wrap" style={{ color: "rgba(245,240,232,0.45)" }}>
                <QrCode size={14} style={{ color: "#c9a227" }} />
                {student.admission_number ?? student.student_code} · Grade {student.grade} ·{" "}
                {BOARD_LABELS[student.board as Board]} · {STATUS_LABELS[student.status as StudentStatus]}
              </p>
            </div>
          </div>
          <Link
            href={`/admin/students/${student.id}/edit`}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm whitespace-nowrap flex-shrink-0"
            style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430", border: "1px solid rgba(201,162,39,0.3)" }}
          >
            <Pencil size={14} /> Edit
          </Link>
        </div>
      </header>

      {/* Quick contact */}
      {parent && (
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${parent.phone}`}
            className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm"
            style={{ background: "rgba(22,45,36,0.9)", color: "#f5f0e8", border: "1px solid rgba(201,162,39,0.25)" }}
          >
            <Phone size={15} /> Call Parent
          </a>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm"
            style={{ background: "#128c7e", color: "#fff" }}
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        </div>
      )}

      {/* Details */}
      <section
        className="rounded-2xl px-4 divide-y"
        style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
      >
        <InfoRow label="Admission no." value={student.admission_number ?? "—"} />
        <InfoRow label="Internal code" value={student.student_code} />
        <div className="flex justify-between gap-4 py-2.5 items-center">
          <span className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>Batch</span>
          <span className="text-sm font-medium text-right flex flex-wrap gap-1.5 justify-end">
            {batches.length === 0 ? (
              <span style={{ color: "rgba(245,240,232,0.5)" }}>Not enrolled</span>
            ) : (
              batches.map((b) => (
                <Link key={b.id} href={`/admin/batches/${b.id}`} className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}>
                  {b.name}
                </Link>
              ))
            )}
          </span>
        </div>
        <InfoRow label="Parent" value={parent ? `${parent.full_name} (${parent.relationship ?? "parent"})` : "—"} />
        <InfoRow label="Parent phone" value={parent?.phone ?? "—"} />
        <InfoRow label="Parent email" value={parent?.email ?? "—"} />
        <InfoRow label="School" value={student.school_name ?? "—"} />
        <InfoRow label="Joined" value={new Date(student.joined_on).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
        <InfoRow label="Emergency contact" value={student.emergency_contact ?? "—"} />
      </section>

      {student.notes && (
        <section
          className="rounded-2xl p-4"
          style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#c9a227" }}>Notes</p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.8)" }}>{student.notes}</p>
        </section>
      )}

      <AttendanceHistory records={attendanceRecords} />

      <CommunicationLog entries={(comms ?? []) as CommEntry[]} action={logCommWithId} />

      <DocumentsSection docs={docEntries} action={uploadDocWithId} />

      {/* Timeline */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>
          Timeline
        </h2>
        <div
          className="rounded-2xl"
          style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          {!timeline?.length ? (
            <p className="p-5 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
              No activity yet.
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
              {timeline.map((t) => (
                <li key={t.id} className="px-4 py-3">
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.85)" }}>{t.summary}</p>
                  <time className="text-[11px]" style={{ color: "rgba(245,240,232,0.35)" }}>
                    {new Date(t.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Archive (soft delete) — confirmed */}
      <div className="pt-2 pb-6">
        <ConfirmButton
          action={archiveWithId}
          triggerLabel="Archive student"
          triggerIcon={<Archive size={14} />}
          title="Archive this student?"
          body={`${student.full_name} will be hidden from active lists and removed from attendance. Their history is kept and this can be reversed by support.`}
          confirmLabel="Archive"
          className="flex items-center gap-2 text-xs font-semibold"
          style={{ color: "rgba(232,160,144,0.8)" }}
        />
      </div>
    </div>
  );
}
