import { EcosystemNavbar } from "@/components/marketing/EcosystemNavbar";
import { EcosystemFooter } from "@/components/marketing/EcosystemFooter";

/**
 * Marketing layout — shared ecosystem navigation + footer for every public page
 * (/, /tuitions, /about, /learning-studio, /os, /contact). The OS at /admin has
 * its own layout and is untouched.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EcosystemNavbar />
      <main>{children}</main>
      <EcosystemFooter />
    </>
  );
}
