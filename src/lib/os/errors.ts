/**
 * Turn a Supabase/Postgres error into a sentence Nanditha can act on.
 * Raw database text is never shown to the user; it goes to the server log.
 */

export interface DbErrorLike {
  code?: string;
  message?: string;
}

/** Shape every new mutation returns. The UI renders `error` or `message` as-is. */
export interface MutationResult {
  ok: boolean;
  error?: string;
  message?: string;
}

const GENERIC: Record<string, string> = {
  "23505": "That already exists. Refresh the page and check before trying again.",
  "23514": "Some of these details don't fit together. Please check them and try again.",
  "23503": "Something this depends on no longer exists. Refresh the page and try again.",
  "23502": "A required detail is missing. Please check the form and try again.",
  "42501": "You don't have permission to do that.",
  PGRST116: "That record could not be found. It may have been removed.",
};

export function friendlyError(
  err: DbErrorLike | null | undefined,
  fallback: string,
  overrides: Record<string, string> = {}
): string {
  if (!err) return fallback;
  const code = err.code ?? "";
  if (err.message) console.error(`[chalkboard-os] ${code || "error"}: ${err.message}`);
  return overrides[code] ?? GENERIC[code] ?? fallback;
}

export function fail(error: string): MutationResult {
  return { ok: false, error };
}
