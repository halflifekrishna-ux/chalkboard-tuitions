/** App version — bump on each shipped sprint. Surfaced in the Developer panel. */
export const APP_VERSION = "0.4.0";

/** Build commit hash (Vercel injects VERCEL_GIT_COMMIT_SHA at build time). */
export function commitHash(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_COMMIT_SHA;
  return sha ? sha.slice(0, 7) : "local";
}

/** Deploy environment as reported by Vercel (production / preview / development). */
export function deployEnv(): string {
  return process.env.VERCEL_ENV || "development";
}
