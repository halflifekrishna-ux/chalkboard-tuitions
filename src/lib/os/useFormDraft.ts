"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Autosaves a form's fields to localStorage as the user types, warns before
 * leaving with unsaved input, and restores a draft on return.
 *
 * Attach `formRef` to the <form>. Call `clear()` on successful submit.
 * Returns `{ restored, dirty, clear }` for a restore banner + status.
 */
export function useFormDraft(key: string) {
  const formRef = useRef<HTMLFormElement>(null);
  const [restored, setRestored] = useState(false);
  const [dirty, setDirty] = useState(false);
  const storageKey = `chalkboard-draft:${key}`;

  // Restore on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw || !formRef.current) return;
    try {
      const data = JSON.parse(raw) as Record<string, string>;
      let any = false;
      for (const [name, value] of Object.entries(data)) {
        const field = formRef.current.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
        if (field && "value" in field && !field.value) { field.value = value; any = true; }
      }
      if (any) setRestored(true);
    } catch { /* ignore malformed draft */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on input (debounced via rAF).
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    let raf = 0;
    const save = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const data: Record<string, string> = {};
        for (const el of Array.from(form.elements)) {
          const f = el as HTMLInputElement;
          if (f.name && f.type !== "password" && f.type !== "file" && typeof f.value === "string" && f.value) data[f.name] = f.value;
        }
        window.localStorage.setItem(storageKey, JSON.stringify(data));
        setDirty(Object.keys(data).length > 0);
      });
    };
    form.addEventListener("input", save);
    return () => { form.removeEventListener("input", save); cancelAnimationFrame(raf); };
  }, [storageKey]);

  // Warn before unload while dirty.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const clear = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setDirty(false);
    setRestored(false);
  }, [storageKey]);

  return { formRef, restored, dirty, clear };
}
