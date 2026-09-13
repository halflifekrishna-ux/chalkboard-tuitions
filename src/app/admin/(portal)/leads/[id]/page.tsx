import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Mail, UserPlus, Clock } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { can } from "@/lib/os/permissions";
import { LEAD_STATUS_META, VERTICAL_META, STUDIO_AUDIENCES, LEAD_SOURCES, resolveOwner, type LeadStatus, type LeadVertical } from "@/lib/os/leads";
import { BOARD_LABELS, type Board } from "@/lib/os/types";
import { ApprovalPanel, StatusPanel, NotePanel } from "@/components/admin/LeadActions";
import { approveLead, rejectLead, updateLeadStatus, addLeadNote } from "../actions";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-xs" style={{ color: "rgba(245,240,232,0.45)" }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: "#f5f0e8" }}>{value}</span>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireCapability("leads.view");
  const supabase = createServerSupabase();

  const { data: lead } = await supabase
    .from("crm_leads")
    .select("*, owner:assigned_to(id, full_name), creator:created_by(full_name), approver:approved_by(full_name)")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!lead) notFound();

  const { data: events } = await supabase
    .from("crm_lead_events")
    .select("id, action, from_status, to_status, note, created_at, actor:actor_id(full_name)")
    .eq("lead_id", params.id)
    .order("created_at", { ascending: false });

  const owner = lead.owner as unknown as { id: string; full_name: string } | null;
  const creator = lead.creator as unknown as { full_name: string } | null;
  const approver = lead.approver as unknown as { full_name: string } | null;
  const status = LEAD_STATUS_META[lead.status as LeadStatus];
  const vertical = VERTICAL_META[lead.vertical as LeadVertical];

  const isOwner = owner?.id === admin.id;
  const canApprove = can(admin.role, "leads.approve");
  const canWork = can(admin.role, "leads.manage") && (isOwner || canApprove || admin.role === "admin");
  const awaitingApproval = lead.status === "pending_approval";
  const studioOwnerId = awaitingApproval && canApprove ? await resolveOwner(supabase, "studio") : null;
  const { data: studioOwner } = studioOwnerId
    ? await supabase.from("admins").select("full_name").eq("id", studioOwnerId).maybeSingle()
    : { data: null };

  const waNumber = lead.phone.replace(/[^0-9]/g, "");
  const approveWithId = approveLead.bind(null, lead.id);
  const rejectWithId = async (reason: string) => {
    "use server";
    await rejectLead(params.id, reason);
  };
  const updateWithId = updateLeadStatus.bind(null, lead.id);
  const noteWithId = addLeadNote.bind(null, lead.id);

  const canConvert =
    lead.vertical === "tuitions" && !lead.converted_student_id && can(admin.role, "students.manage") && lead.status !== "rejected";

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Leads
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold truncate" style={{ color: "#f5f0e8" }}>{lead.full_name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: status.bg, color: status.color }}>{status.label}</span>
              <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: vertical.bg, color: vertical.color }}>{vertical.label}</span>
              {owner && <span className="text-[11px]" style={{ color: "rgba(245,240,232,0.45)" }}>with {owner.full_name}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Quick contact */}
      <div className="grid grid-cols-2 gap-3">
        <a href={`tel:${lead.phone}`} className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm" style={{ background: "rgba(22,45,36,0.9)", color: "#f5f0e8", border: "1px solid rgba(201,162,39,0.25)" }}>
          <Phone size={15} /> Call
        </a>
        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm" style={{ background: "#128c7e", color: "#fff" }}>
          <MessageCircle size={15} /> WhatsApp
        </a>
      </div>

      {awaitingApproval && canApprove && (
        <ApprovalPanel
          leadName={lead.full_name}
          ownerName={(studioOwner as { full_name: string } | null)?.full_name ?? null}
          approveAction={approveWithId}
          rejectAction={rejectWithId}
        />
      )}

      {awaitingApproval && !canApprove && (
        <p className="rounded-2xl p-4 text-sm" style={{ background: "rgba(244,196,48,0.06)", border: "1px solid rgba(244,196,48,0.25)", color: "rgba(245,240,232,0.7)" }}>
          Waiting on Super Admin approval before it reaches the studio team.
        </p>
      )}

      {/* Details */}
      <section className="rounded-2xl px-4 divide-y" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        <Row label="Phone" value={lead.phone} />
        {lead.email && <Row label="Email" value={lead.email} />}
        <Row label="Source" value={LEAD_SOURCES.find((s) => s.value === lead.source)?.label ?? lead.source} />
        {lead.vertical === "tuitions" ? (
          <>
            <Row label="Grade" value={lead.student_grade ? `Grade ${lead.student_grade}` : "—"} />
            <Row label="Board" value={lead.board ? BOARD_LABELS[lead.board as Board] : "—"} />
          </>
        ) : (
          <>
            <Row label="Organisation" value={lead.organisation ?? "—"} />
            <Row label="For" value={STUDIO_AUDIENCES.find((a) => a.value === lead.audience)?.label ?? "—"} />
          </>
        )}
        <Row label="Added by" value={creator?.full_name ?? "—"} />
        <Row label="Added on" value={new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
        {approver && <Row label="Approved by" value={approver.full_name} />}
        {lead.lost_reason && <Row label="Reason" value={lead.lost_reason} />}
      </section>

      {lead.notes && (
        <section className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#c9a227" }}>Notes from capture</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(245,240,232,0.8)" }}>{lead.notes}</p>
        </section>
      )}

      {lead.next_action && lead.status !== "converted" && lead.status !== "lost" && (
        <p className="flex items-center gap-2 rounded-2xl p-4 text-sm" style={{ background: "rgba(157,124,216,0.08)", border: "1px solid rgba(157,124,216,0.25)", color: "#f5f0e8" }}>
          <Clock size={15} style={{ color: "#c3a8e8" }} />
          {lead.next_action}
          {lead.next_action_at && (
            <span style={{ color: "rgba(245,240,232,0.5)" }}>
              · {new Date(`${lead.next_action_at}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </p>
      )}

      {canConvert && (
        <Link
          href={`/admin/students/new?lead=${lead.id}`}
          className="flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm active:scale-[0.98] transition-transform"
          style={{ background: "rgba(125,201,143,0.16)", color: "#7dc98f", border: "1px solid rgba(125,201,143,0.4)" }}
        >
          <UserPlus size={16} /> Convert to student
        </Link>
      )}

      {lead.converted_student_id && (
        <Link href={`/admin/students/${lead.converted_student_id}`} className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm" style={{ background: "rgba(125,201,143,0.12)", color: "#7dc98f" }}>
          Joined as a student — open their profile →
        </Link>
      )}

      {canWork && !awaitingApproval && lead.status !== "rejected" && (
        <StatusPanel
          currentStatus={lead.status as LeadStatus}
          defaultNextAction={lead.next_action}
          defaultNextActionAt={lead.next_action_at}
          updateAction={updateWithId}
        />
      )}

      {canWork && <NotePanel addNoteAction={noteWithId} />}

      {/* Timeline */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>History</h2>
        <div className="rounded-2xl" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
          {!events?.length ? (
            <p className="p-5 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>Nothing logged yet.</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
              {events.map((e) => {
                const actor = e.actor as unknown as { full_name: string } | null;
                const to = e.to_status ? LEAD_STATUS_META[e.to_status as LeadStatus] : null;
                const label =
                  e.action === "created" ? "Lead added"
                  : e.action === "approved" ? "Approved for the studio"
                  : e.action === "rejected" ? "Rejected"
                  : e.action === "assigned" ? (e.note ?? "Assigned")
                  : e.action === "note" ? "Note"
                  : `Moved to ${to?.label ?? e.to_status}`;
                return (
                  <li key={e.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm" style={{ color: to ? to.color : "#f5f0e8" }}>{label}</p>
                        {e.note && e.action !== "assigned" && (
                          <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,232,0.6)" }}>{e.note}</p>
                        )}
                        {actor && <p className="text-[11px] mt-0.5" style={{ color: "rgba(245,240,232,0.35)" }}>{actor.full_name}</p>}
                      </div>
                      <time className="text-[11px] whitespace-nowrap" style={{ color: "rgba(245,240,232,0.35)" }}>
                        {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <div className="h-2" />
    </div>
  );
}
