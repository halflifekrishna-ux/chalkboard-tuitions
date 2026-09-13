"use client";
import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * The public site is a fixed art direction — dark board sections against cream
 * ones — not a themeable surface. Only /about and /os ever carried `dark:`
 * variants, so honouring the OS preference re-skinned two pages out of six and
 * left the rest untouched. Pinned to one palette, and the navbar toggle that
 * advertised the half-finished behaviour is gone. The admin portal styles
 * itself under .admin-scope and is unaffected.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      {children}
    </NextThemeProvider>
  );
}
