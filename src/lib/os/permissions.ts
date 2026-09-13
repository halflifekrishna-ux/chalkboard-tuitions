/**
 * Central capability model — the single source of truth for authorization.
 * Pure (no server imports) so it runs on client and server. Every guard,
 * nav item and Server Action derives access from here; never from hidden UI.
 */

export const ROLES = ["super_admin", "admin", "bd", "teacher", "reception", "marketing", "parent", "student"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  bd: "Studio BD",
  teacher: "Teacher",
  reception: "Reception",
  marketing: "Marketing",
  parent: "Parent",
  student: "Student",
};

/** Higher rank = more authority. Used for "can this user manage that user". */
export const ROLE_RANK: Record<Role, number> = {
  super_admin: 100, admin: 80, bd: 60, teacher: 60, reception: 60, marketing: 40, parent: 20, student: 10,
};

export const ROLE_BADGE: Record<Role, { bg: string; color: string }> = {
  super_admin: { bg: "rgba(244,196,48,0.18)", color: "#f4c430" },
  admin: { bg: "rgba(125,201,143,0.16)", color: "#7dc98f" },
  bd: { bg: "rgba(78,201,176,0.16)", color: "#4ec9b0" },
  teacher: { bg: "rgba(74,158,202,0.18)", color: "#7fc3e8" },
  reception: { bg: "rgba(232,120,100,0.16)", color: "#e8a090" },
  marketing: { bg: "rgba(157,124,216,0.18)", color: "#c3a8e8" },
  parent: { bg: "rgba(157,124,216,0.16)", color: "#c3a8e8" },
  student: { bg: "rgba(245,240,232,0.1)", color: "rgba(245,240,232,0.6)" },
};

export type Capability =
  // System (super admin only)
  | "users.manage"
  | "developer.view"
  | "flags.manage"
  | "settings.manage"
  | "analytics.view"
  // Core data (admin tier)
  | "subjects.manage"
  | "batches.manage"
  | "reports.view"
  | "communications.manage"
  // CRM — capture is wide, working a lead is narrow, approval is the gate
  | "leads.create"
  | "leads.view"
  | "leads.manage"
  | "leads.approve"
  // People
  | "students.manage"
  | "students.view"
  | "parents.manage"
  // Teaching
  | "batches.viewAssigned"
  | "attendance.mark"
  | "homework.manage"
  // Reception
  | "fees.manage"
  | "documents.manage";

const ALL: Capability[] = [
  "users.manage", "developer.view", "flags.manage", "settings.manage", "analytics.view",
  "subjects.manage", "batches.manage", "reports.view", "communications.manage",
  "leads.create", "leads.view", "leads.manage", "leads.approve",
  "students.manage", "students.view", "parents.manage",
  "batches.viewAssigned", "attendance.mark", "homework.manage",
  "fees.manage", "documents.manage",
];

/** Role → capabilities. Super Admin gets everything. */
export const ROLE_CAPABILITIES: Record<Role, Set<Capability>> = {
  super_admin: new Set(ALL),
  admin: new Set<Capability>([
    "subjects.manage", "batches.manage", "reports.view", "communications.manage",
    "leads.create", "leads.view", "leads.manage",
    "students.manage", "students.view", "parents.manage",
    "attendance.mark", "homework.manage", "documents.manage",
  ]),
  // Learning Studio business development — studio leads once approved, nothing
  // from the tuitions side.
  bd: new Set<Capability>(["leads.create", "leads.view", "leads.manage"]),
  teacher: new Set<Capability>([
    "batches.viewAssigned", "attendance.mark", "homework.manage", "students.view",
  ]),
  reception: new Set<Capability>([
    "students.manage", "students.view", "parents.manage", "fees.manage", "documents.manage",
  ]),
  // Marketing files leads and watches where they get to. That is the whole job:
  // no student records, no attendance, and no moving a lead along itself.
  marketing: new Set<Capability>(["leads.create", "leads.view"]),
  parent: new Set<Capability>([]),   // future read-only, own child
  student: new Set<Capability>([]),  // future read-only, own profile
};

export function can(role: string | null | undefined, cap: Capability): boolean {
  if (!role || !(role in ROLE_CAPABILITIES)) return false;
  return ROLE_CAPABILITIES[role as Role].has(cap);
}

export function capabilitiesFor(role: string | null | undefined): Capability[] {
  if (!role || !(role in ROLE_CAPABILITIES)) return [];
  return ALL.filter((c) => ROLE_CAPABILITIES[role as Role].has(c));
}

/** Can `actor` administer a user of role `target`? (Strictly higher rank, or super admin.) */
export function canManageRole(actorRole: string, targetRole: string): boolean {
  if (actorRole === "super_admin") return true;
  const a = ROLE_RANK[actorRole as Role] ?? 0;
  const t = ROLE_RANK[targetRole as Role] ?? 0;
  return a > t;
}

export const ALL_CAPABILITIES = ALL;
