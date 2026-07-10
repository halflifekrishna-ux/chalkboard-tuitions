import { requireAdmin } from "@/lib/os/auth";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { changePassword } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const admin = await requireAdmin(); // must be signed in; may be a forced change

  return (
    <main className="admin-scope min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #162d24, #101d18)" }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.25)", backdropFilter: "blur(16px)" }}>
        <h1 className="font-playfair text-2xl font-bold mb-1" style={{ color: "#f5f0e8" }}>Set a new password</h1>
        <p className="text-sm mb-6" style={{ color: "rgba(245,240,232,0.5)" }}>
          {admin.must_change_password ? "For security, choose a new password before continuing." : "Update your account password."}
        </p>
        <ChangePasswordForm action={changePassword} />
      </div>
    </main>
  );
}
