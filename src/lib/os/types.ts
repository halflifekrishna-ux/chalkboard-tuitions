export type Board = "cbse" | "icse" | "state_board";
export type StudentStatus = "active" | "trial" | "paused" | "alumni" | "dropped";

export const BOARD_LABELS: Record<Board, string> = {
  cbse: "CBSE",
  icse: "ICSE",
  state_board: "State Board",
};

export const STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Active",
  trial: "Trial",
  paused: "Paused",
  alumni: "Alumni",
  dropped: "Dropped",
};

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

export interface ActivityLog {
  id: string;
  action: string;
  summary: string;
  entity_type: string;
  created_at: string;
}
