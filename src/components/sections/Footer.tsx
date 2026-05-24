import Image from "next/image";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";

const WHATSAPP = "917411446381";
const WHATSAPP_DISPLAY = "+91 74114 46381";
const EMAIL = "chalkboardtuitions@gmail.com";
const INSTAGRAM = "https://www.instagram.com/chalkboard.tuitions/";

const footerLinks = {
  "Quick Links": [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  Boards: [
    { label: "CBSE Tuitions", href: "#pricing" },
    { label: "ICSE Tuitions", href: "#pricing" },
    { label: "State Board (KSEEB)", href: "#pricing" },
    { label: "10th Board Prep", href: "#pricing" },
  ],
  Grades: [
    { label: "Grades 1–4 (Foundation)", href: "#pricing" },
    { label: "Grades 5–7 (Growth)", href: "#pricing" },
    { label: "Grades 8–9 (Core)", href: "#pricing" },
    { label: "Grade 10 (Board Prep)", href: "#pricing" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-board-deep text-chalk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* Top grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/logo-dark.png"
                  alt="Chalkboard Tuitions"
                  width={48}
                  height={48}
                  className="object-contain rounded-lg"
                />
              </div>
              <div>
                <span className="font-playfair font-black text-chalk text-base block leading-none">Chalkboard</span>
                <span className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-chalk-yellow block mt-0.5">Tuitions</span>
              </div>
            </div>

            <p className="text-chalk/50 text-sm leading-relaxed mb-5">
              Small-batch daily tuitions for Grades 1–10. CBSE · ICSE · State Board. Kammanahalli & Kalyan Nagar, Bangalore.
            </p>

            {/* Contact details */}
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-chalk/50 hover:text-chalk-yellow transition-colors group"
              >
                <Phone size={13} className="text-chalk-yellow flex-shrink-0" />
                <span>{WHATSAPP_DISPLAY}</span>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2.5 text-sm text-chalk/50 hover:text-chalk-yellow transition-colors"
              >
                <Mail size={13} className="text-chalk-yellow flex-shrink-0" />
                <span>{EMAIL}</span>
              </a>
              <div className="flex items-start gap-2.5 text-sm text-chalk/50">
                <MapPin size={13} className="text-chalk-orange flex-shrink-0 mt-0.5" />
                <span>Kammanahalli & Kalyan Nagar, Bangalore</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex gap-2.5 mt-5">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-chalk-yellow/20 border border-chalk/10 hover:border-chalk-yellow/40 rounded-lg flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram size={15} className="text-chalk/60" />
              </a>
              <a
                href="https://www.facebook.com/chalkboardtuitions"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-chalk-yellow/20 border border-chalk/10 hover:border-chalk-yellow/40 rounded-lg flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook size={15} className="text-chalk/60" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-chalk-yellow/20 border border-chalk/10 hover:border-chalk-yellow/40 rounded-lg flex items-center justify-center transition-all"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="text-chalk/60">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-chalk text-sm mb-4 tracking-wide">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-chalk/45 text-sm hover:text-chalk transition-colors duration-150"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div
          className="relative overflow-hidden rounded-2xl p-8 text-center mb-10 border border-chalk-yellow/15"
          style={{
            background:
              "linear-gradient(135deg, rgba(30,58,47,0.95) 0%, rgba(42,80,64,0.9) 100%)",
            backgroundImage: `linear-gradient(135deg, rgba(30,58,47,0.97) 0%, rgba(22,45,36,1) 100%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.025) 27px, rgba(255,255,255,0.025) 28px)`,
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, #f4c430, transparent 70%)" }}
          />
          <div className="relative z-10">
            <p className="font-special-elite text-chalk-yellow tracking-widest text-xs uppercase mb-3 opacity-80">
              Ready to get started?
            </p>
            <h3 className="font-playfair text-2xl font-bold text-chalk mb-5">
              Book your FREE demo class today.
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to book a free demo class at Chalkboard Tuitions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-chalk-dark text-sm shadow-lg shadow-chalk-yellow/20 hover:scale-[1.03] transition-transform duration-200"
                style={{ background: "linear-gradient(135deg, #f4c430 0%, #c9a227 100%)" }}
              >
                WhatsApp Us →
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-chalk text-sm border border-chalk/20 hover:border-chalk/40 transition-colors"
              >
                <Mail size={15} />
                Send us an email
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-chalk/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-chalk/30 text-xs">
            © {new Date().getFullYear()} Chalkboard Tuitions. All rights reserved.
          </p>
          <p className="text-chalk/30 text-xs">
            Kammanahalli · Kalyan Nagar · Bangalore · Est. 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
