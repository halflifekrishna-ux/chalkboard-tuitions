import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/contact";

/**
 * EcosystemFooter — site-wide footer. Presents the master brand, the three
 * business units, contact details and the legal entity. Server component.
 * Used in: (marketing)/layout.tsx.
 */
const WHATSAPP = "917411446381";
const WHATSAPP_DISPLAY = "+91 74114 46381";
const EMAIL = CONTACT_EMAIL;
const INSTAGRAM = "https://www.instagram.com/chalkboard.tuitions/";

const columns = {
  "Chalkboard Tuitions": [
    { label: "Overview", href: "/tuitions" },
    { label: "Courses & Boards", href: "/tuitions#pricing" },
    { label: "Locations", href: "/tuitions#contact" },
    { label: "Book Free Assessment", href: "/contact" },
  ],
  "Learning Studio": [
    { label: "Overview", href: "/learning-studio" },
    { label: "For Corporates", href: "/learning-studio#corporates" },
    { label: "For Colleges", href: "/learning-studio#colleges" },
    { label: "Enquire", href: "/learning-studio#enquire" },
    { label: "For Trainers", href: "/learning-studio#trainers" },
  ],
  Chalkboard: [
    { label: "About", href: "/about" },
    { label: "Chalkboard OS", href: "/os" },
    { label: "Login", href: "/admin/login" },
    { label: "Contact", href: "/contact" },
  ],
};

export function EcosystemFooter() {
  return (
    <footer className="bg-board-deep text-chalk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image src="/logo-dark.png" alt="Chalkboard" width={44} height={44} className="object-contain rounded-lg" />
              <span className="font-playfair font-black text-chalk text-lg">Chalkboard</span>
            </Link>
            <p className="text-chalk/50 text-sm leading-relaxed mb-5">
              Personalised learning for every stage — tuitions, professional learning, and the
              technology that powers it. Built on Home Tuitions Bangalore since 2018.
            </p>
            <div className="space-y-2.5">
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-chalk/50 hover:text-chalk-yellow transition-colors">
                <Phone size={13} className="text-chalk-yellow flex-shrink-0" /> {WHATSAPP_DISPLAY}
                <span className="text-chalk/30">· Tuitions</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2.5 text-sm text-chalk/50 hover:text-chalk-yellow transition-colors">
                <Mail size={13} className="text-chalk-yellow flex-shrink-0" /> {EMAIL}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-chalk/50">
                <MapPin size={13} className="text-chalk-orange flex-shrink-0 mt-0.5" /> Kammanahalli & Kalyan Nagar, Bangalore
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 hover:bg-chalk-yellow/20 border border-chalk/10 hover:border-chalk-yellow/40 rounded-lg flex items-center justify-center transition-all" aria-label="Instagram">
                <Instagram size={15} className="text-chalk/60" />
              </a>
              <a href="https://www.facebook.com/chalkboardtuitions" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 hover:bg-chalk-yellow/20 border border-chalk/10 hover:border-chalk-yellow/40 rounded-lg flex items-center justify-center transition-all" aria-label="Facebook">
                <Facebook size={15} className="text-chalk/60" />
              </a>
            </div>
          </div>

          {/* Unit columns */}
          {Object.entries(columns).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-chalk text-sm mb-4 tracking-wide">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-chalk/45 text-sm hover:text-chalk transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal bar */}
        <div className="border-t border-chalk/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-chalk/40">
          <p>© {new Date().getFullYear()} Chalkboard Learning Services LLP. All rights reserved.</p>
          <p className="text-chalk/35">Chalkboard · Chalkboard Tuitions · Chalkboard Learning Studio · Chalkboard OS</p>
        </div>
      </div>
    </footer>
  );
}
