"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll } from "motion/react";
import {
  FiHeart,
  FiCompass,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiTarget,
  FiAward,
  FiEye,
  FiActivity,
  FiUsers,
  FiClock,
  FiZap,
} from "react-icons/fi";
import { getApiImageUrl } from "@/lib/authApi";

const STACK_CARDS = [
  {
    _id: "pillar-mission",
    pillarNum: "01",
    type: "Mission",
    badgeLabel: "FOUNDATION MISSION",
    title: "Compassionate Rescue, Healing & Sanctuary for Every Stray Life",
    tagline: "Transforming animal distress into safety, rapid medical care, and lifelong compassion.",
    description:
      "To serve and protect abandoned, injured, and distressed animals across Rampur and adjoining highway corridors by delivering 24/7 emergency medical rescue, free trauma surgeries, mass sterilization, and dedicated rehabilitation.",
    points: [
      "24/7 Rapid Emergency Highway Rescue for critical and hit-and-run animals",
      "Free veterinary medical treatment, surgical debridement & trauma care",
      "Mass anti-rabies vaccination & ethical Animal Birth Control (ABC)",
      "Daily street animal feeding drives & community compassion workshops",
    ],
    statValue: "4,800+",
    statLabel: "Emergency Rescues",
    image: "/services/9.jpeg",
    imageCaption: "Rapid Ground Trauma Response",
    theme: {
      border: "border-orange-400/50 hover:border-orange-500",
      bgGradient: "bg-gradient-to-br from-orange-50/90 via-white to-amber-50/90",
      topBanner: "bg-gradient-to-r from-orange-500 to-amber-500",
      badge: "bg-orange-100 text-orange-800 border-orange-300",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/30",
      icon: FiHeart,
      checkColor: "text-brand-orange",
      ctaBg: "bg-brand-orange hover:bg-orange-700 text-white",
      pillColor: "bg-orange-500/10 text-orange-700 border-orange-200",
      glow: "shadow-[0_20px_50px_rgba(233,106,44,0.18)]",
    },
  },
  {
    _id: "pillar-vision",
    pillarNum: "02",
    type: "Vision",
    badgeLabel: "LONG-TERM VISION 2030",
    title: "A Society Free of Stray Suffering & Animal Cruelty by 2030",
    tagline: "A future where every street animal is protected, nourished, and respected by the community.",
    description:
      "We envision an India where every community coexists harmoniously with animals, where no stray animal dies alone on the streets due to lack of medical aid, and where civic empathy is ingrained in schools, neighborhoods, and youth culture.",
    points: [
      "Zero unattended stray animal road accidents and medical emergencies",
      "Building a premier modern animal hospital and permanent lifetime sanctuary",
      "Educating youth and schools on humane animal rights and empathy",
      "Empowering citizen volunteer rescue squads in every neighborhood",
    ],
    statValue: "100%",
    statLabel: "Rabies-Free Target",
    image: "/services/6.jpeg",
    imageCaption: "Community Immunization Drives",
    theme: {
      border: "border-emerald-400/50 hover:border-emerald-500",
      bgGradient: "bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/90",
      topBanner: "bg-gradient-to-r from-emerald-600 to-teal-600",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      iconBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/30",
      icon: FiCompass,
      checkColor: "text-emerald-600",
      ctaBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
      pillColor: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      glow: "shadow-[0_20px_50px_rgba(16,185,129,0.18)]",
    },
  },
  {
    _id: "pillar-values",
    pillarNum: "03",
    type: "Core Values",
    badgeLabel: "OPERATIONAL INTEGRITY",
    title: "Unyielding Empathy, Swift Action & Complete Transparency",
    tagline: "Serving the voiceless with deep devotion, financial integrity, and absolute dignity.",
    description:
      "Our foundation operates with unconditional love for all living beings, holding ourselves to the highest standards of financial honesty, operational speed, and civic responsibility. Every rupee goes to medicine and food.",
    points: [
      "Zero discrimination — every creature big or small deserves dignity and care",
      "100% donation transparency with public 80G tax certificates and reports",
      "Swift on-ground mobilization — under 25-minute emergency response time",
      "Collaborative community-powered empathy and active volunteerism",
    ],
    statValue: "100%",
    statLabel: "80G Tax Deductible",
    image: "/services/8.jpeg",
    imageCaption: "Devoted Youth Volunteer Force",
    theme: {
      border: "border-indigo-400/50 hover:border-indigo-500",
      bgGradient: "bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90",
      topBanner: "bg-gradient-to-r from-indigo-600 to-purple-600",
      badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
      iconBg: "bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-indigo-500/30",
      icon: FiShield,
      checkColor: "text-indigo-600",
      ctaBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
      pillColor: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
      glow: "shadow-[0_20px_50px_rgba(99,102,241,0.18)]",
    },
  },
  {
    _id: "pillar-sanctuary",
    pillarNum: "04",
    type: "Roadmap",
    badgeLabel: "HOSPITAL & SANCTUARY GOAL",
    title: "Constructing Rampur's Premier Animal Hospital & Sanctuary",
    tagline: "Dedicated ICU, sterile surgical theatre, and lifetime hospice for paralyzed animals.",
    description:
      "We are building a permanent high-tech medical facility featuring an advanced operating theatre, pediatric recovery ward for orphan puppies, digital X-ray diagnostics, and an open-air rehabilitation sanctuary for permanently disabled animals.",
    points: [
      "Dedicated sterile veterinary surgery unit with critical care monitors",
      "24/7 in-house shelter & trauma recovery ward for 150+ animals",
      "Permanent hospice haven for paralyzed, blind, and senior street dogs",
      "Solar-powered emergency facility with clean drinking water and green yards",
    ],
    statValue: "150+",
    statLabel: "Sanctuary Capacity",
    image: "/services/2.jpeg",
    imageCaption: "Sterile Medical Treatment Facility",
    theme: {
      border: "border-rose-400/50 hover:border-rose-500",
      bgGradient: "bg-gradient-to-br from-rose-50/90 via-white to-orange-50/90",
      topBanner: "bg-gradient-to-r from-rose-600 to-orange-600",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
      iconBg: "bg-gradient-to-br from-rose-600 to-orange-600 text-white shadow-rose-500/30",
      icon: FiTarget,
      checkColor: "text-rose-600",
      ctaBg: "bg-rose-600 hover:bg-rose-700 text-white",
      pillColor: "bg-rose-500/10 text-rose-700 border-rose-200",
      glow: "shadow-[0_20px_50px_rgba(244,63,94,0.18)]",
    },
  },
];

export default function MissionVisionSection() {
  const containerRef = useRef(null);
  const [cards, setCards] = useState(STACK_CARDS);

  useEffect(() => {
    let active = true;
    async function loadMissionVision() {
      try {
        const baseUrl = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
        ).replace(/\/+$/, "");
        const res = await fetch(`${baseUrl}/mission-vision/all`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.missionVisions || data.items || [];
          if (active && Array.isArray(list) && list.length >= 2) {
            // Merge custom API data with rich themes
            const merged = list
              .filter((it) => it.status !== "Draft")
              .slice(0, 4)
              .map((it, idx) => {
                const base = STACK_CARDS[idx % STACK_CARDS.length];
                return {
                  ...base,
                  _id: it._id || base._id,
                  title: it.title || base.title,
                  type: it.type || base.type,
                  description: it.description || base.description,
                  tagline: it.tagline || base.tagline,
                  points:
                    Array.isArray(it.points) && it.points.length > 0
                      ? it.points
                      : base.points,
                  image:
                    Array.isArray(it.imageUrls) && it.imageUrls[0]
                      ? getApiImageUrl(it.imageUrls[0])
                      : base.image,
                };
              });
            if (merged.length > 0) setCards(merged);
          }
        }
      } catch (err) {
        // Fallback to STACK_CARDS
      }
    }
    loadMissionVision();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="mission-vision"
      aria-labelledby="mission-vision-title"
      className="relative overflow-visible bg-gradient-to-b from-[#faf6f0] via-[#f7f2ea] to-[#faf6f0] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-orange-100"
    >
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 h-[600px] w-[600px] rounded-full bg-orange-200/35 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 h-[600px] w-[600px] rounded-full bg-emerald-200/30 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 bottom-20 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-indigo-100/35 blur-[150px]"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* ==================================================== */}
        {/* Section Header                                       */}
        {/* ==================================================== */}
        <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-100/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-orange shadow-sm"
          >
            <FiTarget className="text-brand-orange" size={14} />
            <span>OUR GUIDING COMPASS &amp; PRINCIPLES</span>
          </motion.div>

          <motion.h2
            id="mission-vision-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.12]"
          >
            Driven by Compassion, <br className="hidden sm:inline" />
            <span className="italic bg-gradient-to-r from-orange-600 via-brand-orange to-amber-600 bg-clip-text text-transparent">
              Guided by Vision.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg leading-relaxed text-stone-600"
          >
            Scroll through our core operational pillars below. Each card reveals our
            commitments, daily rescue standards, and the roadmap guiding our teams across Rampur.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-stone-400"
          >
            <span className="size-2 rounded-full bg-brand-orange animate-ping" />
            <span>Scroll down to stack cards one upon another</span>
          </motion.div>
        </div>

        {/* ==================================================== */}
        {/* STICKY STACKING CARDS CONTAINER                      */}
        {/* Cards stack on top of each other as user scrolls!    */}
        {/* ==================================================== */}
        <div className="relative space-y-10 sm:space-y-16 pb-12">
          {cards.map((card, idx) => {
            const Icon = card.theme.icon;
            // Progressive top offset so previous card headers peek through like stacked tabs
            const topOffset = 80 + idx * 24;

            return (
              <div
                key={card._id}
                style={{
                  top: `${topOffset}px`,
                  zIndex: 10 + idx,
                }}
                className="sticky transition-all duration-300"
              >
                <div
                  className={`group relative overflow-hidden rounded-3xl border-2 ${card.theme.border} ${card.theme.bgGradient} ${card.theme.glow} backdrop-blur-xl transition-all duration-500 hover:scale-[1.01]`}
                >
                  {/* Glowing Top Colored Bar with Pillar Counter */}
                  <div
                    className={`h-2.5 w-full ${card.theme.topBanner}`}
                  />

                  <div className="p-6 sm:p-9 lg:p-11">
                    {/* Top Row: Pillar ID + Badge + Stat Pill */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid size-12 sm:size-14 place-items-center rounded-2xl ${card.theme.iconBg}`}
                        >
                          <Icon size={26} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${card.theme.badge}`}
                            >
                              {card.badgeLabel}
                            </span>
                            <span className="text-xs font-black tracking-widest text-stone-400">
                              #{card.pillarNum}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-stone-500 mt-0.5 block">
                            Shiv Gorakh Welfare Foundation
                          </span>
                        </div>
                      </div>

                      {/* Live Stat Pill */}
                      <div
                        className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-2 ${card.theme.pillColor} backdrop-blur-sm`}
                      >
                        <FiActivity size={16} />
                        <div>
                          <span className="block text-sm font-black leading-none">
                            {card.statValue}
                          </span>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 leading-none mt-1">
                            {card.statLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Grid: 2 Columns */}
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                      {/* Left Column (7 Cols): Headline, Tagline, Points */}
                      <div className="lg:col-span-7 space-y-5">
                        <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug text-stone-900 group-hover:text-stone-950 transition-colors">
                          {card.title}
                        </h3>

                        <div className="border-l-4 border-orange-400 pl-4 py-0.5">
                          <p className="text-xs sm:text-sm font-semibold italic text-stone-600 leading-relaxed">
                            “{card.tagline}”
                          </p>
                        </div>

                        <p className="text-sm sm:text-base leading-relaxed text-stone-700">
                          {card.description}
                        </p>

                        {/* Bullet Points */}
                        <div className="pt-2">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                            Strategic Execution &amp; Ground Deliverables:
                          </span>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {card.points.map((pt, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-white/80 p-3 shadow-2xs hover:bg-white transition"
                              >
                                <FiCheckCircle
                                  size={16}
                                  className={`mt-0.5 shrink-0 ${card.theme.checkColor}`}
                                />
                                <span className="text-xs font-semibold text-stone-800 leading-snug">
                                  {pt}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons Inside Card */}
                        <div className="pt-4 flex flex-wrap items-center gap-3">
                          <Link
                            href="/campaigns"
                            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold shadow-md transition-all hover:scale-105 ${card.theme.ctaBg}`}
                          >
                            <span>Support This Pillar</span>
                            <FiArrowRight size={14} />
                          </Link>

                          <Link
                            href="/volunteer/register"
                            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-2xs hover:border-orange-400 hover:text-brand-orange transition-all hover:scale-105"
                          >
                            <FiUsers size={14} />
                            <span>Volunteer With Us</span>
                          </Link>
                        </div>
                      </div>

                      {/* Right Column (5 Cols): High-Res Visual Photo Card */}
                      <div className="lg:col-span-5 relative">
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border-4 border-white bg-stone-900 shadow-xl group-hover:shadow-2xl transition-all">
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                            <span className="rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-amber-200">
                              {card.imageCaption}
                            </span>
                            <span className="text-[10px] font-semibold text-stone-300">
                              Rampur On-Ground
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================================================== */}
        {/* Bottom Call to Action Impact Card                    */}
        {/* ==================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-orange-500/30"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-0 size-80 rounded-full bg-orange-500/20 blur-3xl"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-300">
                <FiZap size={13} className="text-orange-400" />
                <span>Join Our Living Mission</span>
              </div>
              <h3 className="mt-4 font-serif text-2xl sm:text-4xl font-bold leading-tight">
                Turn Compassion Into Immediate Medical Relief Today.
              </h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-300 max-w-xl">
                Every rupee, every rescue call, and every volunteer hour directly powers medicines,
                wound dressings, emergency ambulance transport, and hot meals for stray animals in Rampur.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:justify-end">
              <Link
                href="/campaigns"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-brand-orange to-amber-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:scale-105 active:scale-95"
              >
                <FiHeart className="fill-white" size={17} />
                <span>Donate to Foundation</span>
              </Link>
              <Link
                href="/volunteer/register"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-stone-950 hover:scale-105"
              >
                <FiUsers size={17} />
                <span>Become a Volunteer</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
