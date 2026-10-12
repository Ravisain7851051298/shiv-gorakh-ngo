"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useState, useRef } from "react";
import {
  FiHeart,
  FiPhoneCall,
  FiArrowUpRight,
  FiShield,
  FiUsers,
  FiActivity,
  FiStar,
  FiMapPin,
  FiCheckCircle,
  FiChevronRight,
} from "react-icons/fi";
import { useNgoSettings } from "@/context/NgoSettingsContext";

// Three rows of images with specific contextual tags
const ROW_1_IMAGES = [
  { src: "/services/1.jpeg", tag: "Emergency Rescue", title: "Highway Trauma Response" },
  { src: "/services/2.jpeg", tag: "Medical Camp", title: "Veterinary Treatment Camp" },
  { src: "/services/3.jpeg", tag: "Foster Haven", title: "Puppy Rehabilitation Care" },
  { src: "/services/4.jpeg", tag: "First-Aid", title: "Mobile Trauma First Aid" },
  { src: "/services/5.jpeg", tag: "Night Rounds", title: "Stray Animal Feeding Drive" },
  { src: "/services/6.jpeg", tag: "Vaccination", title: "Mass Anti-Rabies Camp" },
];

const ROW_2_IMAGES = [
  { src: "/services/7.jpeg", tag: "Ambulance", title: "24/7 Mobile Ambulance" },
  { src: "/services/8.jpeg", tag: "Youth Squad", title: "Active Volunteer Network" },
  { src: "/services/9.jpeg", tag: "Hands-on Care", title: "Critical Surgery Recovery" },
  { src: "/services/10.jpeg", tag: "Sanctuary", title: "Shelter & Lifetime Care" },
  { src: "/services/1.jpeg", tag: "Compassion", title: "Street Companion Healing" },
  { src: "/services/2.jpeg", tag: "Health Check", title: "Sterilization & Checkups" },
];

const ROW_3_IMAGES = [
  { src: "/services/3.jpeg", tag: "Puppy Haven", title: "Safe Foster Sanctuary" },
  { src: "/services/4.jpeg", tag: "Triage Team", title: "On-Ground Pain Relief" },
  { src: "/services/5.jpeg", tag: "Food Supplies", title: "Nutritional Support Rounds" },
  { src: "/services/6.jpeg", tag: "Immunization", title: "Rabies Prevention Drive" },
  { src: "/services/7.jpeg", tag: "Rapid Transit", title: "Emergency Highway Care" },
  { src: "/services/8.jpeg", tag: "Community", title: "Civic Awareness Sessions" },
];

const STATS = [
  { value: "4,800+", label: "Trauma Rescues", icon: FiActivity, color: "text-orange-400" },
  { value: "180+", label: "Fed Every Night", icon: FiHeart, color: "text-rose-400" },
  { value: "100%", label: "80G Tax Exempt", icon: FiShield, color: "text-emerald-400" },
  { value: "<25m", label: "Hotline Response", icon: FiStar, color: "text-amber-400" },
];

export default function HomeHero() {
  const { settings } = useNgoSettings();
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);

  const emergencyPhone = settings?.phone || "+91 93369 50578";
  const city =
    settings?.city && settings?.state
      ? `${settings.city}, ${settings.state}`
      : "Rampur, Uttar Pradesh";

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative isolate min-h-screen overflow-hidden bg-transparent px-4 pt-28 pb-20 text-center text-white sm:px-6 lg:px-8 lg:pt-36 lg:pb-28 flex flex-col justify-center"
      aria-label="Shiv Gorakh Welfare Foundation Hero"
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3-ROW INFINITE SCROLLING IMAGE GRID BACKGROUND                 */}
      {/* Row 1: Left to Right                                          */}
      {/* Row 2: Right to Left                                          */}
      {/* Row 3: Left to Right                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden perspective-1000 flex flex-col justify-center gap-4 sm:gap-6 opacity-35 sm:opacity-45 select-none -rotate-1 scale-105"
        aria-hidden="true"
      >
        {/* ROW 1: Scrolling Left to Right (infinite slow) */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-ltr-slow pause-on-hover flex gap-4 sm:gap-6 items-center">
            {[...ROW_1_IMAGES, ...ROW_1_IMAGES].map((img, idx) => (
              <div
                key={`row1-${idx}`}
                className="group relative h-40 w-64 sm:h-52 sm:w-80 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-stone-900 shadow-2xl transition-all duration-500 hover:scale-105 hover:border-orange-400/60"
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 256px, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority={idx < 4}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="inline-block rounded-full bg-orange-500/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {img.tag}
                  </span>
                  <p className="mt-1 text-xs font-semibold text-white/90 truncate">
                    {img.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: Scrolling Right to Left (infinite slow) */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-rtl-slow pause-on-hover flex gap-4 sm:gap-6 items-center">
            {[...ROW_2_IMAGES, ...ROW_2_IMAGES].map((img, idx) => (
              <div
                key={`row2-${idx}`}
                className="group relative h-40 w-64 sm:h-52 sm:w-80 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-stone-900 shadow-2xl transition-all duration-500 hover:scale-105 hover:border-amber-400/60"
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 256px, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="inline-block rounded-full bg-amber-500/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {img.tag}
                  </span>
                  <p className="mt-1 text-xs font-semibold text-white/90 truncate">
                    {img.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 3: Scrolling Left to Right (infinite slow) */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-ltr-slow pause-on-hover flex gap-4 sm:gap-6 items-center">
            {[...ROW_3_IMAGES, ...ROW_3_IMAGES].map((img, idx) => (
              <div
                key={`row3-${idx}`}
                className="group relative h-40 w-64 sm:h-52 sm:w-80 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-stone-900 shadow-2xl transition-all duration-500 hover:scale-105 hover:border-rose-400/60"
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 256px, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="inline-block rounded-full bg-rose-500/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {img.tag}
                  </span>
                  <p className="mt-1 text-xs font-semibold text-white/90 truncate">
                    {img.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MULTI-LAYER CINEMATIC VIGNETTE & AMBIENT GLOWS                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial from-stone-800/60 via-stone-800/85 to-stone-800" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-t from-stone-800 via-stone-800/95 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-stone-800 via-stone-800/80 to-transparent" />

      {/* Glowing atmospheric energy lights */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-orange-600/15 blur-[130px] -z-10" />
      <div className="pointer-events-none absolute right-10 top-1/4 size-96 rounded-full bg-amber-500/10 blur-[110px] -z-10" />
      <div className="pointer-events-none absolute left-10 bottom-1/4 size-96 rounded-full bg-rose-500/10 blur-[110px] -z-10" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CENTER FOREGROUND CONTENT & 3D INTERACTIVE HERO CARD           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        style={!reduceMotion ? { y: heroY, opacity: heroOpacity } : {}}
        className="relative z-10 mx-auto max-w-5xl"
      >
        {/* Grand Headline with 3D Gradient Text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight leading-[1.08] text-white"
        >
          Healing Wounds, Protecting Lives &amp;{" "}
          <span className="block mt-2 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(233,106,44,0.35)]">
            Giving the Voiceless a Future.
          </span>
        </motion.h1>

        {/* Subtitle / Value Proposition */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-3xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-stone-300"
        >
          Shiv Gorakh Welfare Foundation operates non-stop across Rampur to rescue injured animals,
          perform emergency surgeries, run daily feeding routes, and advocate for animal rights.
          Every rupee given directly supports food and medicine with{" "}
          <span className="font-semibold text-orange-300 underline decoration-orange-400/50 underline-offset-4">
            100% transparent 80G tax receipts
          </span>.
        </motion.p>

        {/* High-Impact CTA Cluster */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4 sm:gap-5"
        >
          {/* Primary Donate CTA */}
          <Link
            href="/campaigns"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-brand-orange via-orange-500 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-orange-600/30 transition-all duration-300 hover:scale-105 hover:shadow-orange-600/50 hover:brightness-110 active:scale-95"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            <FiHeart className="transition-transform group-hover:scale-125" size={18} />
            <span>Donate Now &amp; Save a Life</span>
            <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={18} />
          </Link>

          {/* Emergency Rescue Call */}
          <a
            href={`tel:${emergencyPhone}`}
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-stone-900/80 px-7 py-4 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-orange-400 hover:bg-stone-800 hover:scale-105 active:scale-95"
          >
            <FiPhoneCall className="text-orange-400 transition-transform group-hover:rotate-12" size={18} />
            <span>Report Injured Animal</span>
          </a>

          {/* Volunteer / Join */}
          <Link
            href="/volunteer/register"
            className="group inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-6 py-4 text-base font-semibold text-orange-200 backdrop-blur-md transition-all duration-300 hover:bg-orange-500/20 hover:border-orange-400 hover:scale-105"
          >
            <FiUsers size={18} className="text-orange-400" />
            <span>Join Volunteer Squad</span>
            <FiChevronRight size={16} className="text-orange-300 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* FLOATING 3D GLASSMORPHIC LIVE IMPACT STATS BAR             */}
        {/* ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 sm:mt-16 mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {STATS.map(({ value, label, icon: Icon, color }) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-stone-900/80 p-4 sm:p-5 text-left backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-400/50 hover:bg-stone-800/90"
            >
              {/* Subtle top glow bar */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="flex items-center justify-between">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-orange-300 transition-colors">
                  {value}
                </span>
                <div className={`grid size-9 place-items-center rounded-xl bg-white/5 ${color} transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/10`}>
                  <Icon size={17} />
                </div>
              </div>

              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}