import type { Metadata } from "next";
import { requireAdmin } from "@/lib/os/auth";
import { getFeatureFlags } from "@/lib/os/flags";
import { AdminNav } from "@/components/admin/AdminNav";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";
import { logout } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: "Chalkboard OS — Admin",
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#101d18",
  colorScheme: "dark" as const,
};

export const dynamic = "force-dynamic";

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const [admin, flags] = await Promise.all([requireAdmin(), getFeatureFlags()]);

  return (
    <div className="admin-scope min-h-screen" style={{ background: "#101d18" }}>
      <KeyboardShortcuts />
      <AdminNav flags={flags} adminName={admin.full_name} role={admin.role} logoutAction={logout} />
      {/* pb clears the mobile tab bar; pl clears the desktop sidebar */}
      <main className="lg:pl-60 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">{children}</div>
      </main>
    </div>
  );
}
