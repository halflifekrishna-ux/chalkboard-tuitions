import Script from "next/script";

/**
 * Google Analytics 4 for the public site only — mounted in the (marketing)
 * layout, never under /admin, so the OS (students, parents, staff) is not
 * tracked. Renders nothing until NEXT_PUBLIC_GA_ID (the G-XXXXXXXXXX
 * Measurement ID) is set in Vercel, so it is safe to ship before the GA4
 * property exists. Search Console's Settings → Associations links to it once
 * the property is live under the same Google account.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
