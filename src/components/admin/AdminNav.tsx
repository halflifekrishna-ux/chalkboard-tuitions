"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  MessageCircle,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import type { FeatureFlags } from "@/lib/os/flags";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  flag?: keyof FeatureFlags; // no flag = always visible
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, flag: "dashboard" },
  { href: "/admin/students", label: "Students", icon: Users, flag: "students" },
  { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck, flag: "attendance" },
  { href: "/admin/classes", label: "Classes", icon: BookOpen, flag: "classes" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle, flag: "whatsapp" },
  { href: "/admin/fees", label: "Fees", icon: Wallet, flag: "fees" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, flag: "analytics" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({
  flags,
  adminName,
  logoutAction,
}: {
  flags: FeatureFlags;
  adminName: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => !i.flag || flags[i.flag]);
  // Bottom bar fits 5 comfortably on a phone; overflow lives in the sidebar.
  const mobileItems = items.slice(0, 5);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col z-40"
        style={{ background: "#162d24", borderRight: "1px solid rgba(201,162,39,0.15)" }}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <Image src="/logo-dark.png" alt="" width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-playfair font-bold text-sm" style={{ color: "#f5f0e8" }}>
              Chalkboard OS
            </p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(245,240,232,0.35)" }}>
              Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
              style={
                isActive(href)
                  ? { background: "rgba(201,162,39,0.15)", color: "#f4c430" }
                  : { color: "rgba(245,240,232,0.55)" }
              }
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-5" style={{ borderTop: "1px solid rgba(201,162,39,0.15)" }}>
          <p className="text-xs mb-3 truncate" style={{ color: "rgba(245,240,232,0.5)" }}>
            Signed in as <span style={{ color: "#f5f0e8" }}>{adminName}</span>
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: "rgba(245,240,232,0.45)" }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]"
        style={{
          background: "rgba(22,45,36,0.97)",
          borderTop: "1px solid rgba(201,162,39,0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-2.5 px-3 min-w-[56px]">
              <Icon size={20} className={active ? "" : "opacity-50"} style={{ color: active ? "#f4c430" : "#f5f0e8" }} />
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? "#f4c430" : "rgba(245,240,232,0.5)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
