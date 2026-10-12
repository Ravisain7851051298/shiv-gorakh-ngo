"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  FiHeart,
  FiUsers,
  FiArrowUpRight,
  FiPhone,
  FiStar,
  FiShield,
  FiActivity,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import { useNgoSettings } from "@/context/NgoSettingsContext";

const WAYS_TO_HELP = [
  {
    title: "Join as a Volunteer",
    subtitle: "Hands-on rescue & weekend feeder squads",
    desc: "Give your time to feed hungry strays, assist ambulance teams, and participate in mass vaccination camps across Rampur.",
    cta: "Register as Volunteer",
    href: "/volunteer/register",
    icon: FiUsers,
    badge: "Grassroots Action",
    color: "from-orange-500 via-amber-500 to-yellow-500",
    glow: "hover:shadow-orange-500/25",
    border: "border-orange-300/80 hover:border-orange-400",
  },
  {
    title: "Sponsor a Surgery",
    subtitle: "Direct life-saving trauma intervention",
    desc: "Cover the medication, orthopedic splinting, and clinical hospital admission costs for an injured animal in pain.",
    cta: "Sponsor Medical Care",
    href: "/campaigns",
    icon: FiHeart,
    badge: "Immediate Healing",
    color: "from-rose-500 via-pink-500 to-red-500",
    glow: "hover:shadow-rose-500/25",
    border: "border-rose-300/80 hover:border-rose-400",
  },
  {
    title: "Become an Official Member",
    subtitle: "Lifetime ID card & membership credentials",
    desc: "Get officially inducted into Shiv Gorakh Welfare Foundation with an ID card, welcome letter, and governance participation.",
    cta: "Join as Member",
    href: "/membership",
    icon: FiShield,
    badge: "Foundation Pillar",
    color: "from-indigo-500 via-purple-500 to-blue-600",
    glow: "hover:shadow-indigo-500/25",
    border: "border-indigo-300/80 hover:border-indigo-400",
  },
  {
    title: "Report an Injured Animal",
    subtitle: "Instant 24/7 rapid dispatch in Rampur",
    desc: "Spotted an accident-hit animal, sick puppy, or abandoned calf in Rampur? Call our rapid response ambulance helpline right away.",
    cta: "Call Rescue Hotline",
    href: "tel:+919336950578",
    icon: FiPhone,
    badge: "24/7 Hotline",
    color: "from-emerald-500 via-teal-500 to-green-600",
    glow: "hover:shadow-emerald-500/25",
    border: "border-emerald-300/80 hover:border-emerald-400",
  },
];

export default function GetInvolvedSection() {
  const reduceMotion = useReducedMotion();
  const { settings } = useNgoSettings();
  const phone = settings?.phone || "+91 93369 50578";

  return (
    <section
      id="get-involved"
      className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32"
      aria-labelledby="get-involved-title"
    >
      {/* Dynamic 3D ambient glows */}
      <div className="pointer-events-none absolute -left-32 top-10 size-[600px] rounded-full bg-orange-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 size-[600px] rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full bg-orange-500/5 blur-[160px]" />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.div
            initial={!reduceMotion ? { opacity: 0, y: 20 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-300 backdrop-blur-md shadow-lg shadow-orange-950/40"
          >
            <FiStar size={13} className="text-amber-300" />
            <span>JOIN OUR GROUND RESCUE FAMILY</span>
          </motion.div>

          <motion.h2
            id="get-involved-title"
            initial={!reduceMotion ? { opacity: 0, y: 30 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white"
          >
            Remarkable things happen <br />
            when{" "}
            <span className="italic bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              we stand together for the voiceless.
            </span>
          </motion.h2>

          <motion.p
            initial={!reduceMotion ? { opacity: 0, y: 20 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-stone-300"
          >
            Whether you volunteer on night feeding rounds, sponsor an emergency amputation surgery,
            or report an injured stray in Rampur — every single action saves a soul.
          </motion.p>
        </div>

        {/* 4 Interactive 3D Pathways Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WAYS_TO_HELP.map((way, idx) => {
            const Icon = way.icon;
            return (
              <motion.div
                key={way.title}
                initial={!reduceMotion ? { opacity: 0, y: 35 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-stone-900/80 p-7 backdrop-blur-xl transition-all duration-400 hover:-translate-y-2 hover:bg-stone-800/90 hover:shadow-2xl ${way.border} ${way.glow}`}
              >
                {/* Glowing top line */}
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${way.color}`}
                />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${way.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-300">
                      {way.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-orange-300 transition-colors">
                    {way.title}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-orange-400">
                    {way.subtitle}
                  </p>

                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-400">
                    {way.desc}
                  </p>
                </div>

                <div className="mt-7 border-t border-white/10 pt-4">
                  {way.href.startsWith("tel:") ? (
                    <a
                      href={way.href}
                      className="inline-flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-600"
                    >
                      <span>{way.cta}</span>
                      <FiPhone size={14} />
                    </a>
                  ) : (
                    <Link
                      href={way.href}
                      className="inline-flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-orange"
                    >
                      <span>{way.cta}</span>
                      <FiArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Emergency Banner at Bottom */}
        <motion.div
          initial={!reduceMotion ? { opacity: 0 } : false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md text-center sm:text-left"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-80" />
              <span className="relative inline-flex size-3 rounded-full bg-rose-500" />
            </span>
            <span className="text-sm font-semibold text-stone-300">
              24/7 Rapid Ground Rescue Helpline:{" "}
              <strong className="text-white font-bold">{phone}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-orange to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/30 transition hover:scale-105"
            >
              <FiHeart size={13} />
              <span>Donate Now</span>
            </Link>
            <Link
              href="/volunteer/register"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white hover:text-stone-900"
            >
              <span>Volunteer</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
