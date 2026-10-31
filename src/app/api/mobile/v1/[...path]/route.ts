import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, anonClient, loadStaff, requireOsUnlock, requireStaff, type Staff } from "@/lib/mobile/auth";
import { followUpDays, isExhausted, lastTen, nextActionFields, nextAfterSend } from "@/lib/mobile/leads";
import { capabilitiesFor } from "@/lib/os/permissions";
import { routeNewLead, OPEN_STATUSES } from "@/lib/os/leads";
import { saveAttendance } from "@/lib/os/attendance-save";
import { createStudentRecord } from "@/lib/os/students";
import { studentSchema } from "@/app/admin/(portal)/students/schema";
import { TEMPLATES, type TemplateKey } from "@/lib/os/whatsapp";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Handler = (req: NextRequest, params: string[]) => Promise<unknown>;

const LEAD_FIELDS =
  "id, full_name, phone, status, contact_reason, notes, assigned_to, follow_up_at, follow_up_step, last_contacted_at, last_reply_at, created_at";
const PHONE = /^\+?[0-9]{10,15}$/;
const uuid = z.string().uuid();

async function body<T extends z.ZodTypeAny>(req: NextRequest, schema: T): Promise<z.infer<T>> {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ApiError(400, "invalid", parsed.error.issues[0].message);
  return parsed.data;
}

async function profile(db: SupabaseClient, staff: Staff) {
  const [{ data: hasPin }, { data: os }] = await Promise.all([
    db.rpc("staff_pin_is_set"),
    db.from("mobile_os_access").select("admin_id").eq("admin_id", staff.id).maybeSingle(),
  ]);
  return {
    id: staff.id,
    full_name: staff.full_name,
    role: staff.role,
    capabilities: capabilitiesFor(staff.role),
    has_pin: hasPin === true,
    os_access: !!os,
  };
}

function sessionJson(s: { access_token: string; refresh_token: string; expires_at?: number }) {
  return { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at ?? null };
}

function revalidateLeads(id?: string) {
  revalidatePath("/admin/leads");
  if (id) revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

async function leadFor(db: SupabaseClient, id: string) {
  if (!uuid.safeParse(id).success) throw new ApiError(404, "not_found", "Lead not found.");
  const { data } = await db.from("crm_leads").select(LEAD_FIELDS).eq("id", id).is("deleted_at", null).maybeSingle();
  if (!data) throw new ApiError(404, "not_found", "Lead not found.");
  return data;
}

async function reasonLabel(db: SupabaseClient, key: string | null) {
  if (!key) return null;
  const { data } = await db.from("crm_contact_reasons").select("label").eq("key", key).maybeSingle();
  return data?.label ?? null;
}

async function logEvent(db: SupabaseClient, leadId: string, actor: string, action: string,
  f: { from?: string | null; to?: string | null; note?: string | null } = {}) {
  await db.from("crm_lead_events").insert({
    lead_id: leadId, actor_id: actor, action, from_status: f.from ?? null, to_status: f.to ?? null, note: f.note ?? null,
  });
}

const POST: Record<string, Handler> = {
  "auth/login": async (req) => {
    const { email, password } = await body(req, z.object({ email: z.string().email(), password: z.string().min(1) }));
    const client = anonClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) throw new ApiError(401, "bad_login", "Wrong email or password.");
    const db = anonClient(data.session.access_token);
    const staff = await loadStaff(db, data.user.id, data.user.email);
    if (staff.must_change_password) {
      throw new ApiError(403, "must_change_password", "Set a new password on the Chalkboard OS website first.");
    }
    await db.from("activity_logs").insert({
      actor_id: staff.id, entity_type: "auth", action: "login", summary: `${staff.full_name} signed in (Lead app)`,
    });
    return { session: sessionJson(data.session), profile: await profile(db, staff) };
  },

  "auth/refresh": async (req) => {
    const { refresh_token } = await body(req, z.object({ refresh_token: z.string().min(1) }));
    const { data, error } = await anonClient().auth.refreshSession({ refresh_token });
    if (error || !data.session) throw new ApiError(401, "bad_token", "Your session has expired. Please sign in again.");
    return { session: sessionJson(data.session) };
  },

  "pin/set": async (req) => {
    const { db } = await requireStaff(req);
    const v = await body(req, z.object({ new_pin: z.string().regex(/^[0-9]{4}$/, "PIN must be 4 digits"), current_pin: z.string().optional() }));
    const { data, error } = await db.rpc("set_staff_pin", { new_pin: v.new_pin, current_pin: v.current_pin ?? null });
    if (error) throw new ApiError(500, "server", "Couldn't save your PIN. Please try again.");
    return data;
  },

  "pin/verify": async (req) => {
    const { db } = await requireStaff(req);
    const { pin } = await body(req, z.object({ pin: z.string().regex(/^[0-9]{4}$/, "PIN must be 4 digits") }));
    const { data, error } = await db.rpc("verify_staff_pin", { pin });
    if (error) throw new ApiError(500, "server", "Couldn't check your PIN. Please try again.");
    return data;
  },

  // Saying yes to the prompt. A number we already know returns that lead instead.
  leads: async (req) => {
    const { db, staff } = await requireStaff(req, "leads.manage");
    const v = await body(req, z.object({
      full_name: z.string().trim().min(1, "Name is required"),
      phone: z.string().regex(PHONE, "Enter a valid phone number"),
      reason: z.string().min(1, "Choose a reason"),
      notes: z.string().max(2000).optional(),
    }));
    const { data: dupes } = await db.from("crm_leads").select(LEAD_FIELDS)
      .like("phone", `%${lastTen(v.phone)}`).is("deleted_at", null).in("status", OPEN_STATUSES).limit(1);
    if (dupes?.[0]) return { lead: dupes[0], duplicate: true };

    const { data: branch } = await db.from("branches").select("id").eq("is_active", true).order("created_at").limit(1).maybeSingle();
    const routing = await routeNewLead(db as never, "tuitions");
    const now = new Date().toISOString();
    const days = await followUpDays(db);
    const { data: lead, error } = await db.from("crm_leads").insert({
      branch_id: branch?.id ?? null,
      vertical: "tuitions",
      status: routing.status,
      assigned_to: routing.assigned_to,
      full_name: v.full_name,
      phone: v.phone,
      source: "whatsapp",
      notes: v.notes || null,
      contact_reason: v.reason,
      follow_up_at: now,
      created_by: staff.id,
      ...nextActionFields(0, days, now, await reasonLabel(db, v.reason)),
    }).select(LEAD_FIELDS).single();
    if (error || !lead) throw new ApiError(500, "server", "Couldn't save the lead. Please try again.");

    await logEvent(db, lead.id, staff.id, "created", { to: routing.status, note: "From the Lead app" });
    await db.from("activity_logs").insert({
      actor_id: staff.id, entity_type: "lead", entity_id: lead.id, action: "lead_created",
      summary: `${v.full_name} added as a Tuitions lead from WhatsApp`,
    });
    revalidateLeads();
    return { lead, duplicate: false };
  },

  "os/attendance": async (req) => {
    const { db, staff } = await requireOsUnlock(req, "attendance.mark");
    return saveAttendance(db, staff, await req.json().catch(() => null));
  },

  "os/students": async (req) => {
    const { db, staff } = await requireOsUnlock(req, "students.manage");
    const v = await body(req, studentSchema);
    const created = await createStudentRecord(db, staff.id, v);
    if ("error" in created) throw new ApiError(400, "invalid", created.error);
    revalidatePath("/admin/students");
    return { student: created.student };
  },
};

// Routes with an id in the middle: leads/:id/<action>, os/queue/:id/sent.
const LEAD_ACTIONS: Record<string, Handler> = {
  // The chat was opened with a message ready, and staff came back from sending.
  sent: async (req, [id]) => {
    const { db, staff } = await requireStaff(req, "leads.manage");
    const v = await body(req, z.object({ template_id: z.string().uuid().nullable().optional() }));
    const lead = await leadFor(db, id);
    const days = await followUpDays(db);
    const next = nextAfterSend(lead.follow_up_step, days);
    const status = lead.follow_up_step === 0 ? "contacted" : "follow_up";
    const { data, error } = await db.from("crm_leads").update({
      status, last_contacted_at: new Date().toISOString(), ...next,
      ...nextActionFields(next.follow_up_step, days, next.follow_up_at, await reasonLabel(db, lead.contact_reason)),
    }).eq("id", id).select(LEAD_FIELDS).single();
    if (error || !data) throw new ApiError(403, "forbidden", "Couldn't update this lead.");
    await logEvent(db, id, staff.id, "whatsapp_sent", { from: lead.status, to: status, note: v.template_id ? `Template ${v.template_id}` : "Own wording" });
    revalidateLeads(id);
    return { lead: data };
  },

  // They answered, so the schedule stops and it's on us to reply now.
  replied: async (req, [id]) => {
    const { db, staff } = await requireStaff(req, "leads.manage");
    const lead = await leadFor(db, id);
    if (!OPEN_STATUSES.includes(lead.status)) return { lead };
    const now = new Date().toISOString();
    const days = await followUpDays(db);
    const { data, error } = await db.from("crm_leads").update({
      last_reply_at: now, follow_up_at: now, follow_up_step: 0,
      ...nextActionFields(0, days, now, await reasonLabel(db, lead.contact_reason)),
    }).eq("id", id).select(LEAD_FIELDS).single();
    if (error || !data) throw new ApiError(403, "forbidden", "Couldn't update this lead.");
    await logEvent(db, id, staff.id, "replied", { note: "Lead replied on WhatsApp" });
    revalidateLeads(id);
    return { lead: data };
  },
};

const GET: Record<string, Handler> = {
  me: async (req) => {
    const { db, staff } = await requireStaff(req);
    return { profile: await profile(db, staff) };
  },

  bootstrap: async (req) => {
    const { db } = await requireStaff(req, "leads.view");
    const [reasons, templates, staffList, days] = await Promise.all([
      db.from("crm_contact_reasons").select("key, label").eq("is_active", true).order("sort"),
      db.from("crm_templates").select("id, reason_key, title, body").eq("is_active", true).order("sort"),
      db.from("admins").select("id, full_name, role").eq("is_active", true).is("deleted_at", null).in("role", ["super_admin", "admin"]).order("full_name"),
      followUpDays(db),
    ]);
    return { reasons: reasons.data ?? [], templates: templates.data ?? [], staff: staffList.data ?? [], follow_up_days: days };
  },

  // view=due: needs someone now. view=open: every open tuition lead.
  leads: async (req) => {
    const { db } = await requireStaff(req, "leads.view");
    const view = req.nextUrl.searchParams.get("view") ?? "due";
    let q = db.from("crm_leads").select(LEAD_FIELDS).eq("vertical", "tuitions").is("deleted_at", null).in("status", OPEN_STATUSES);
    q = view === "due"
      ? q.lte("follow_up_at", new Date().toISOString()).order("follow_up_at")
      : q.order("follow_up_at", { nullsFirst: false });
    const [{ data, error }, days] = await Promise.all([q.limit(200), followUpDays(db)]);
    if (error) throw new ApiError(500, "server", "Couldn't load leads.");
    return { leads: (data ?? []).map((l) => ({ ...l, exhausted: isExhausted(l.follow_up_step, days) })) };
  },

  // Does this number already have a lead? Decides whether the prompt shows.
  "leads/lookup": async (req) => {
    const { db } = await requireStaff(req, "leads.view");
    const phone = req.nextUrl.searchParams.get("phone") ?? "";
    if (!PHONE.test(phone)) throw new ApiError(400, "invalid", "Enter a valid phone number.");
    const { data } = await db.from("crm_leads").select(LEAD_FIELDS).like("phone", `%${lastTen(phone)}`)
      .is("deleted_at", null).order("created_at", { ascending: false }).limit(1);
    return { lead: data?.[0] ?? null };
  },

  "os/classes": async (req) => {
    const { db } = await requireOsUnlock(req, "attendance.mark");
    const date = req.nextUrl.searchParams.get("date") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, "invalid", "Choose a date.");
    const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(`${date}T00:00:00Z`).getUTCDay()];
    const { data } = await db.from("batches")
      .select("id, name, grade, start_time, end_time, days, session_category")
      .eq("status", "active").is("deleted_at", null).contains("days", [day]).order("start_time");
    return { classes: data ?? [] };
  },

  "os/queue": async (req) => {
    const { db } = await requireOsUnlock(req, "communications.manage");
    const { data } = await db.from("communication_queue")
      .select("id, template_key, to_number, payload, created_at").eq("status", "pending").order("created_at").limit(100);
    return {
      messages: (data ?? []).map((m) => ({
        id: m.id,
        to_number: m.to_number,
        student_name: m.payload?.student_name ?? null,
        created_at: m.created_at,
        body: TEMPLATES[m.template_key as TemplateKey]?.body(m.payload ?? {}) ?? "",
      })),
    };
  },
};

async function roster(req: NextRequest, batchId: string) {
  const { db } = await requireOsUnlock(req, "attendance.mark");
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!uuid.safeParse(batchId).success || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, "invalid", "Choose a class and date.");
  const { data: batch } = await db.from("batches")
    .select("id, name, start_time, end_time, session_category, student:students(id, full_name, admission_number)")
    .eq("id", batchId).is("deleted_at", null).maybeSingle();
  if (!batch) throw new ApiError(404, "not_found", "This class could not be found.");

  type Person = { id: string; full_name: string; admission_number: string | null };
  let students: Person[];
  if (batch.session_category === "individual_attention") {
    const one = batch.student as unknown as Person | null;
    students = one ? [one] : [];
  } else {
    const { data: enrol } = await db.from("batch_students")
      .select("student:students(id, full_name, admission_number, status)").eq("batch_id", batchId);
    students = (enrol ?? [])
      .map((e) => e.student as unknown as (Person & { status: string }) | null)
      .filter((s): s is Person & { status: string } => !!s && s.status !== "archived" && s.status !== "dropped")
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  const { data: session } = await db.from("sessions").select("id, status, topic_covered, homework_assigned, teacher_notes")
    .eq("batch_id", batchId).eq("session_date", date).order("start_time").limit(1).maybeSingle();
  const marks = session ? (await db.from("attendance").select("student_id, status").eq("session_id", session.id)).data ?? [] : [];
  const byStudent = new Map(marks.map((m) => [m.student_id, m.status]));
  return {
    batch: { id: batch.id, name: batch.name, start_time: batch.start_time?.slice(0, 5) ?? null, end_time: batch.end_time?.slice(0, 5) ?? null },
    session,
    students: students.map((s) => ({ id: s.id, full_name: s.full_name, admission_number: s.admission_number, status: byStudent.get(s.id) ?? "present" })),
  };
}

async function markQueueSent(req: NextRequest, id: string) {
  const { db, staff } = await requireOsUnlock(req, "communications.manage");
  if (!uuid.safeParse(id).success) throw new ApiError(404, "not_found", "Message not found.");
  const { data: row } = await db.from("communication_queue")
    .update({ status: "sent", provider_id: `manual:${staff.id}`, processed_at: new Date().toISOString(), last_error: null })
    .eq("id", id).eq("status", "pending")
    .select("id, template_key, to_number, payload, student_id, parent_id").maybeSingle();
  if (!row) throw new ApiError(404, "not_found", "This message was already handled.");
  const text = TEMPLATES[row.template_key as TemplateKey]?.body(row.payload ?? {}) ?? "";
  await Promise.all([
    db.from("whatsapp_logs").insert({
      parent_id: row.parent_id, student_id: row.student_id, to_number: row.to_number, template_key: row.template_key,
      body: text, status: "sent", provider_id: `manual:${staff.id}`, sent_at: new Date().toISOString(),
    }),
    db.from("communications").insert({
      student_id: row.student_id, parent_id: row.parent_id, type: "whatsapp", direction: "outgoing", status: "sent",
      message: text, metadata: { template_key: row.template_key, sent_by: "manual", actor_id: staff.id },
    }),
  ]);
  revalidatePath("/admin/whatsapp");
  return { ok: true };
}

async function patchLead(req: NextRequest, id: string) {
  const { db, staff } = await requireStaff(req, "leads.manage");
  const v = await body(req, z.object({
    status: z.enum(["contacted", "follow_up", "converted", "lost"]).optional(),
    note: z.string().max(2000).optional(),
    lost_reason: z.string().max(500).optional(),
    follow_up_at: z.string().datetime({ offset: true }).nullable().optional(),
    assigned_to: z.string().uuid().optional(),
  }));
  const lead = await leadFor(db, id);
  if (lead.status === "pending_approval") throw new ApiError(400, "invalid", "This lead still needs Super Admin approval.");

  const days = await followUpDays(db);
  const closing = v.status === "converted" || v.status === "lost";
  const followUpAt = closing ? null : v.follow_up_at !== undefined ? v.follow_up_at : lead.follow_up_at;
  const update: Record<string, unknown> = {
    ...(v.status ? { status: v.status } : {}),
    ...(v.assigned_to ? { assigned_to: v.assigned_to } : {}),
    ...(v.status === "lost" ? { lost_reason: v.lost_reason || null } : {}),
    ...(v.status === "converted" ? { converted_at: new Date().toISOString() } : {}),
    follow_up_at: followUpAt,
    ...nextActionFields(lead.follow_up_step, days, followUpAt, await reasonLabel(db, lead.contact_reason)),
  };
  const { data, error } = await db.from("crm_leads").update(update).eq("id", id).select(LEAD_FIELDS).single();
  if (error || !data) throw new ApiError(403, "forbidden", "Couldn't update this lead.");

  if (v.status) await logEvent(db, id, staff.id, "status_changed", { from: lead.status, to: v.status, note: v.note ?? v.lost_reason });
  else if (v.assigned_to) await logEvent(db, id, staff.id, "assigned", { note: v.note });
  else if (v.note) await logEvent(db, id, staff.id, "note", { note: v.note });
  revalidateLeads(id);
  return { lead: data };
}

async function dispatch(req: NextRequest, method: "GET" | "POST" | "PUT" | "PATCH", path: string[]) {
  const key = path.join("/");
  if (method === "GET") {
    if (GET[key]) return GET[key](req, []);
    if (path[0] === "os" && path[1] === "classes" && path.length === 4 && path[3] === "roster") return roster(req, path[2]);
  }
  if (method === "POST") {
    if (POST[key]) return POST[key](req, []);
    if (path[0] === "leads" && path.length === 3 && LEAD_ACTIONS[path[2]]) return LEAD_ACTIONS[path[2]](req, [path[1]]);
    if (path[0] === "os" && path[1] === "queue" && path.length === 4 && path[3] === "sent") return markQueueSent(req, path[2]);
  }
  if (method === "PATCH" && path[0] === "leads" && path.length === 2) return patchLead(req, path[1]);
  if (method === "PUT" && key === "settings/follow-ups") {
    const { db, staff } = await requireStaff(req, "leads.manage");
    const { days } = await body(req, z.object({ days: z.array(z.number().int().min(1).max(365)).min(1).max(10) }));
    const sorted = Array.from(new Set(days)).sort((a, b) => a - b);
    const { data, error } = await db.from("crm_follow_up_settings")
      .update({ days: sorted, updated_by: staff.id, updated_at: new Date().toISOString() }).eq("id", true).select("days").maybeSingle();
    if (error || !data) throw new ApiError(403, "forbidden", "You can't change the follow-up schedule.");
    return { follow_up_days: data.days };
  }
  throw new ApiError(404, "not_found", "Unknown route.");
}

function handler(method: "GET" | "POST" | "PUT" | "PATCH") {
  return async (req: NextRequest, { params }: { params: { path: string[] } }) => {
    try {
      return NextResponse.json(await dispatch(req, method, params.path), { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
      console.error("mobile api", e);
      return NextResponse.json({ error: "Something went wrong. Please try again.", code: "server" }, { status: 500 });
    }
  };
}

const getHandler = handler("GET");
const postHandler = handler("POST");
const putHandler = handler("PUT");
const patchHandler = handler("PATCH");
export { getHandler as GET, postHandler as POST, putHandler as PUT, patchHandler as PATCH };
