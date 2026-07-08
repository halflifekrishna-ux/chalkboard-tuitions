export type Board = "cbse" | "icse" | "state_board";

export type StudentStatus =
  | "active"
  | "inactive"
  | "graduated"
  | "dropped"
  | "transferred"
  | "archived"
  // legacy values kept valid in the DB enum
  | "trial"
  | "paused"
  | "alumni";

export const BOARD_LABELS: Record<Board, string> = {
  cbse: "CBSE",
  icse: "ICSE",
  state_board: "State Board",
};

/** The six selectable statuses (legacy values still render via STATUS_LABELS). */
export const STATUS_OPTIONS = [
  "active",
  "inactive",
  "graduated",
  "dropped",
  "transferred",
  "archived",
] as const;

export const STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
  dropped: "Dropped",
  transferred: "Transferred",
  archived: "Archived",
  trial: "Trial",
  paused: "Paused",
  alumni: "Alumni",
};

export const STATUS_COLORS: Record<StudentStatus, string> = {
  active: "#7dc98f",
  inactive: "rgba(245,240,232,0.4)",
  graduated: "#9db4c9",
  dropped: "#e8a090",
  transferred: "#c9a227",
  archived: "rgba(245,240,232,0.3)",
  trial: "#f4c430",
  paused: "#e8a090",
  alumni: "#9db4c9",
};

export type CommunicationType = "whatsapp" | "sms" | "phone_call" | "email" | "note";
export type CommunicationDirection = "incoming" | "outgoing";

export const COMM_TYPE_LABELS: Record<CommunicationType, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  phone_call: "Phone Call",
  email: "Email",
  note: "Note",
};

export const DOCUMENT_KINDS = [
  { value: "report_card", label: "Report Card" },
  { value: "id_proof", label: "ID Proof" },
  { value: "admission_form", label: "Admission Form" },
  { value: "medical_note", label: "Medical Note" },
  { value: "other", label: "Other" },
] as const;

export interface Parent {
  id: string;
  full_name: string;
  phone: string;
  whatsapp_number: string | null;
  alternate_phone: string | null;
  email: string | null;
  relationship: string | null;
}

export interface Student {
  id: string;
  student_code: string;
  admission_number: string | null;
  photo_path: string | null;
  branch_id: string;
  parent_id: string;
  full_name: string;
  grade: number;
  board: Board;
  school_name: string | null;
  status: StudentStatus;
  joined_on: string;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
  parent?: Parent;
}

export interface OrgSettings {
  business_name: string;
  logo_path: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  timezone: string;
  academic_year: string;
}
