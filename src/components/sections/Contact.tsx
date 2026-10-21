"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { MessageCircle, Clock, Mail } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/contact";
import { LocationMap } from "@/components/ui/location-map";
import { CENTRE, CENTRE_ADDRESS } from "@/lib/tuitions-location";
import { TuitionsDemoForm } from "./TuitionsDemoForm";

const WHATSAPP = "917411446381";
const WHATSAPP_DISPLAY = "+91 74114 46381";
const EMAIL = CONTACT_EMAIL;


export function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(22,45,36,1) 0%, rgba(30,58,47,0.98) 100%)",
        backgroundImage: `linear-gradient(180deg, rgba(22,45,36,1) 0%, rgba(30,58,47,0.98) 100%), repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,255,255,0.025) 27px, rgba(255,255,255,0.025) 28px)`,
      }}
    >
      {/* Gold radial at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #f4c430, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-chalk-yellow bg-chalk-yellow/10 px-3 py-1 rounded-full mb-4">
            Chalkboard Tuitions
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-chalk mb-4">
            Book your free demo class.
          </h2>
          <p className="text-chalk/60 text-lg max-w-xl mx-auto">
            Fill the form and we&apos;ll WhatsApp you within 30 minutes to confirm your slot.
            No obligation, no pressure.
          </p>
          <p className="mt-4 text-sm text-chalk/60">
            This form is for school tuitions. For corporate, college or trainer enquiries, go to{" "}
            <Link
              href="/learning-studio#enquire"
              className="whitespace-nowrap font-semibold text-chalk/75 underline decoration-chalk/30 underline-offset-4 hover:text-chalk-yellow"
            >
              Chalkboard Learning Studio →
            </Link>
          </p>
        </div>

        <div ref={ref} className="grid lg:grid-cols-5 gap-10 items-start">
          {/* ── Left contact info ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to book a free demo class at Chalkboard Tuitions.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 border border-chalk/10 rounded-2xl hover:border-chalk-yellow/30 transition-all duration-200 group"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-chalk text-sm mb-0.5">WhatsApp Us</p>
                <p className="text-chalk/50 text-sm">Fastest way. We reply within 30 minutes.</p>
                <p className="text-chalk-yellow text-sm font-semibold mt-1.5 group-hover:underline">
                  {WHATSAPP_DISPLAY} →
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-start gap-4 p-5 border border-chalk/10 rounded-2xl hover:border-chalk-yellow/30 transition-all duration-200 group"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="w-10 h-10 bg-chalk-yellow/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-chalk-yellow" />
              </div>
              <div>
                <p className="font-semibold text-chalk text-sm mb-0.5">Email Us</p>
                <p className="text-chalk/50 text-sm">For detailed inquiries & documents</p>
                <p className="text-chalk-yellow text-sm font-semibold mt-1.5 group-hover:underline break-all">
                  {EMAIL}
                </p>
              </div>
            </a>

            {/* Location — interactive 3D map widget */}
            <div className="pt-1 pb-8">
              <p className="font-semibold text-chalk text-sm mb-3">Our Centre</p>
              <LocationMap />
              <address className="mt-4 text-sm not-italic leading-relaxed text-chalk/60">
                {CENTRE.name}, {CENTRE_ADDRESS}
              </address>
              <a
                href={CENTRE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-chalk-yellow hover:underline"
              >
                Get directions on Google Maps →
              </a>
            </div>

            {/* Timings */}
            <div
              className="flex items-start gap-4 p-5 border border-chalk/10 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="w-10 h-10 bg-chalk-blue/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-chalk-blue" />
              </div>
              <div>
                <p className="font-semibold text-chalk text-sm mb-1">Batch Timings</p>
                <div className="text-chalk/60 text-sm space-y-0.5">
                  <p>🕓 4:00 PM – 8:00 PM · Monday to Friday</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 relative"
          >
            <TuitionsDemoForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
