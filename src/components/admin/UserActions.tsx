"use client";

import { useState, useTransition } from "react";
import { Copy, Check, KeyRound, Ban, CircleCheck, Trash2, ShieldCheck, ChevronDown } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ROLE_LABELS, type Role } from "@/lib/os/permissions";
import {
  setUserActive, changeUserRole, resetUserPassword, softDeleteUser, transferSuperAdmin,
  type UserActionState,
} from "@/app/admin/(portal)/users/actions";

export function UserActions({
  userId,
  fullName,
  role,
  isActive,
  isSelf,
  assignableRoles,
  canTransfer,
}: {
  userId: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  isSelf: boolean;
  assignableRoles: Role[];
  canTransfer: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [tempPw, setTempPw] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(false);

  const manageable = !isSelf && assignableRoles.length > 0;

  const doReset = () => startTransition(async () => {
    const res: UserActionState = await resetUserPassword(userId);
    if (res.tempPassword) setTempPw(res.tempPassword);
  });

  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(245,240,232,0.4)" }}>Actions</h2>

      {/* Reset password */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
        <button onClick={doReset} disabled={isPending} className="flex items-center gap-2 text-sm font-semibold disabled:opacity-60" style={{ color: "#f4c430" }}>
          <KeyRound size={15} /> Reset password
        </button>
        {tempPw && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 mt-3" style={{ background: "rgba(245,240,232,0.06)" }}>
            <code className="flex-1 font-mono text-sm" style={{ color: "#f4c430" }}>{tempPw}</code>
            <button onClick={() => { navigator.clipboard.writeText(tempPw); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex items-center gap-1 text-xs font-bold rounded-lg px-2.5 py-1.5" style={{ background: "rgba(201,162,39,0.15)", color: "#f4c430" }}>
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
        <p className="text-[11px] mt-2" style={{ color: "rgba(245,240,232,0.4)" }}>Generates a temporary password; the user must change it at next sign-in.</p>
      </div>

      {manageable && (
        <>
          {/* Change role */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
            <button onClick={() => setRoleOpen((v) => !v)} className="flex items-center justify-between w-full text-sm font-semibold" style={{ color: "#f5f0e8" }}>
              <span>Change role · currently {ROLE_LABELS[role]}</span>
              <ChevronDown size={16} style={{ transform: roleOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
            {roleOpen && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {assignableRoles.filter((r) => r !== role).map((r) => (
                  <button key={r} onClick={() => startTransition(() => changeUserRole(userId, r))} disabled={isPending} className="rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "rgba(245,240,232,0.06)", color: "#f5f0e8" }}>
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enable / disable */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(22,45,36,0.7)", border: "1px solid rgba(201,162,39,0.15)" }}>
            {isActive ? (
              <button onClick={() => startTransition(() => setUserActive(userId, false))} disabled={isPending} className="flex items-center gap-2 text-sm font-semibold disabled:opacity-60" style={{ color: "rgba(232,160,144,0.9)" }}>
                <Ban size={15} /> Disable user
              </button>
            ) : (
              <button onClick={() => startTransition(() => setUserActive(userId, true))} disabled={isPending} className="flex items-center gap-2 text-sm font-semibold disabled:opacity-60" style={{ color: "#7dc98f" }}>
                <CircleCheck size={15} /> Enable user
              </button>
            )}
            <p className="text-[11px] mt-2" style={{ color: "rgba(245,240,232,0.4)" }}>Disabled users cannot sign in. Their history is preserved.</p>
          </div>

          {/* Super admin transfer */}
          {canTransfer && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(244,196,48,0.06)", border: "1px solid rgba(244,196,48,0.3)" }}>
              <p className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: "#f4c430" }}><ShieldCheck size={15} /> Transfer Super Admin</p>
              <p className="text-[11px] mb-3" style={{ color: "rgba(245,240,232,0.5)" }}>
                Promote {fullName} to Super Admin. You can optionally step yourself down to Admin. At least one Super Admin always remains.
              </p>
              {!transferStep ? (
                <button onClick={() => setTransferStep(true)} className="text-xs font-bold rounded-lg px-3 py-2" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>Begin transfer…</button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => startTransition(() => transferSuperAdmin(userId, false))} disabled={isPending} className="text-xs font-bold rounded-lg px-3 py-2 disabled:opacity-60" style={{ background: "rgba(125,201,143,0.15)", color: "#7dc98f" }}>
                    Promote (keep mine)
                  </button>
                  <button onClick={() => startTransition(() => transferSuperAdmin(userId, true))} disabled={isPending} className="text-xs font-bold rounded-lg px-3 py-2 disabled:opacity-60" style={{ background: "rgba(244,196,48,0.2)", color: "#f4c430" }}>
                    Promote & step me down
                  </button>
                  <button onClick={() => setTransferStep(false)} className="text-xs font-semibold px-2 py-2" style={{ color: "rgba(245,240,232,0.5)" }}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* Soft delete */}
          <ConfirmButton
            action={async () => { await softDeleteUser(userId); }}
            triggerLabel="Remove user"
            triggerIcon={<Trash2 size={14} />}
            title={`Remove ${fullName}?`}
            body="The account is disabled and hidden. History is kept. The last active Super Admin can never be removed."
            confirmLabel="Remove"
            className="flex items-center gap-2 text-xs font-semibold px-1"
            style={{ color: "rgba(232,160,144,0.8)" }}
          />
        </>
      )}

      {isSelf && (
        <p className="text-xs px-1" style={{ color: "rgba(245,240,232,0.4)" }}>
          You can&apos;t change your own role or status here. Use another Super Admin, or the transfer workflow.
        </p>
      )}
    </section>
  );
}
