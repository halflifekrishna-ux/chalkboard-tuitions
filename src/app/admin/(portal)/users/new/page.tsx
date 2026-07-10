import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCapability } from "@/lib/os/auth";
import { createServerSupabase } from "@/lib/os/supabase-server";
import { UserForm } from "@/components/admin/UserForm";
import { ROLES, canManageRole, type Role } from "@/lib/os/permissions";
import { createUser } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const actor = await requireCapability("users.manage");
  const supabase = createServerSupabase();
  const { data: branches } = await supabase.from("branches").select("id, name").is("deleted_at", null).order("created_at");

  // Only offer roles the actor is allowed to assign.
  const assignableRoles = ROLES.filter((r) => canManageRole(actor.role, r)) as Role[];

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
          <ArrowLeft size={14} /> Users
        </Link>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: "#f5f0e8" }}>Add User</h1>
      </header>

      <UserForm action={createUser} branches={branches ?? []} assignableRoles={assignableRoles} />
    </div>
  );
}
