"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  FiFileText,
  FiCheckCircle,
  FiArrowUpRight,
  FiShield,
  FiAward,
  FiStar,
  FiLock,
  FiEye,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";

const documents = [
  {
    title: "Memorandum of Association (MOA)",
    href: "/documents/MOA.pdf",
    detail: "Official foundation charter, non-profit welfare objectives, and legal registration bylaws approved by Registrar of Companies.",
    badge: "Official Charter",
    icon: FiFileText,
    type: "Legal Bylaws",
    fileSize: "1.3 MB PDF",
    borderGlow: "group-hover:border-orange-400",
  },
  {
    title: "Ministry of Corporate Affairs Approval",
    href: "/documents/SpicePartA_ApprovalLetter_AC5890273.pdf",
    detail: "Central government SPICe+ Part A approval letter AC5890273 verifying Section 8 non-profit animal welfare incorporation.",
    badge: "Govt. Approved",
    icon: FiShield,
    type: "MCA SPICe+ Letter",
    fileSize: "56 KB PDF",
    borderGlow: "group-hover:border-emerald-400",
  },
  {
    title: "80G & 12A Tax Exemption Certificates",
    href: "/certificates",
    detail: "Central Board of Direct Taxes (CBDT) registration giving 50% tax deductions to all Indian donors under Section 80G.",
    badge: "Tax Exemption",
    icon: FiAward,
    type: "CBDT Registered",
    fileSize: "Official Registry",
    borderGlow: "group-hover:border-amber-400",
  },
];

const trustBadges = [
  { label: "Section 8 Non-Profit", icon: FiCheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", sub: "Govt. of India" },
  { label: "80G Tax Exemption", icon: FiAward, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", sub: "50% Tax Relief" },
  { label: "12A Income Tax Cert.", icon: FiStar, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", sub: "Approved Trust" },
  { label: "MCA SPICe+ Verified", icon: FiShield, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", sub: "AC5890273" },
  { label: "NITI Aayog Darpan", icon: FiLock, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", sub: "Registered NGO" },
  { label: "Public Financial Audits", icon: FiEye, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30", sub: "100% Transparent" },
];

export default function TrustProof() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="trust-proof"
      aria-labelledby="trust-title"
      className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 px-5 py-24 sm:px-8 lg:px-12 lg:py-32 text-white border-y border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 size-[600px] rounded-full bg-orange-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[500px] rounded-full bg-amber-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 size-px w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      {/* Modern technical mesh grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,150,50,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,150,50,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={!reduceMotion ? { opacity: 0, y: 25 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-300 shadow-lg shadow-orange-950/50">
            <FiShield size={14} className="text-orange-400" />
            <span>100% LEGAL &amp; REGULATORY TRANSPARENCY</span>
          </span>
          <h2
            id="trust-title"
            className="mt-5 font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            Trust begins with{" "}
            <span className="italic bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              uncompromising honesty.
            </span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-stone-300">
            Every legal registration, audited document, and government certification is publicly
            accessible. We believe in total financial accountability to our donors, volunteers, and supporters.
          </p>
        </motion.div>

        {/* 6 Trust Badges in 3D Glassmorphism */}
        <motion.div
          initial={!reduceMotion ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {trustBadges.map(({ label, icon: Icon, color, bg, sub }, i) => (
            <motion.div
              key={label}
              initial={!reduceMotion ? { opacity: 0, scale: 0.9 } : false}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
              whileHover={!reduceMotion ? { y: -4, scale: 1.03 } : undefined}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${bg} backdrop-blur-md text-center transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`grid size-10 place-items-center rounded-xl bg-white/5 ${color} mb-2`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-bold text-white leading-tight">{label}</span>
              <span className="text-[10px] font-semibold text-stone-400 mt-0.5">{sub}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* 3 Document Cards in 3D Glassmorphism */}
        <div className="grid gap-6 md:grid-cols-3">
          {documents.map((doc, idx) => {
            const DocIcon = doc.icon;
            return (
              <motion.a
                key={doc.title}
                href={doc.href}
                target="_blank"
                rel="noreferrer"
                initial={!reduceMotion ? { opacity: 0, y: 35 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.25 + idx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-stone-900/80 p-7 backdrop-blur-xl transition-all duration-400 hover:-translate-y-2 hover:bg-stone-800/90 hover:shadow-2xl hover:shadow-orange-950/60 ${doc.borderGlow}`}
              >
                {/* Glow accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="grid size-13 place-items-center rounded-2xl bg-orange-500/15 text-orange-300 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white group-hover:scale-110">
                      <DocIcon size={24} />
                    </div>
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-300">
                      {doc.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                    {doc.type} · {doc.fileSize}
                  </span>

                  <h3 className="mt-2 font-serif text-xl font-bold text-white group-hover:text-orange-200 transition-colors">
                    {doc.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-400">
                    {doc.detail}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                    <FiEye size={13} />
                    <span>View Official Document</span>
                  </span>
                  <FiArrowUpRight
                    size={18}
                    className="text-stone-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-orange-400"
                  />
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Footer Verify Link */}
        <motion.div
          initial={!reduceMotion ? { opacity: 0 } : false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-stone-400"
        >
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Registered Under Section 8 of the Companies Act, 2013 · Govt. of India</span>
          </div>
          <Link
            href="/certificates"
            className="inline-flex items-center gap-1.5 font-bold text-orange-400 hover:text-orange-300 transition hover:underline"
          >
            <span>Explore Complete Foundation Certificates Registry</span>
            <FiArrowUpRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
