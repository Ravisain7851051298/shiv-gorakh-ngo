"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FiCheckCircle,
  FiArrowUpRight,
  FiHeart,
  FiShield,
  FiActivity,
  FiTruck,
  FiUsers,
  FiAward,
  FiPhoneCall,
  FiMapPin,
  FiStar,
} from "react-icons/fi";
import { useNgoSettings } from "@/context/NgoSettingsContext";

export default function AboutSection() {
  const { settings } = useNgoSettings();

  const founderName = settings?.founderName || "Hari Om";
  const coFounderName = settings?.coFounderName || "Ankit Pandey";

  const corePillars = [
    {
      icon: FiActivity,
      title: "24/7 Trauma Ambulance",
      desc: "Emergency wound debridement, splinting, and immediate transit to partner veterinary hospitals.",
      color: "from-orange-500 to-amber-500",
      accentBg: "bg-orange-50 text-brand-orange border-orange-200",
      glow: "hover:shadow-orange-500/20",
    },
    {
      icon: FiHeart,
      title: "180+ Fed Every Night",
      desc: "Hygienic warm meals, clean drinking bowls, and winter insulation bedding across cold clusters.",
      color: "from-rose-500 to-pink-500",
      accentBg: "bg-rose-50 text-rose-600 border-rose-200",
      glow: "hover:shadow-rose-500/20",
    },
    {
      icon: FiCheckCircle,
      title: "Mass Rabies Vaccination",
      desc: "Humane Animal Birth Control (ABC) and mass anti-rabies inoculations for community safety.",
      color: "from-emerald-500 to-teal-500",
      accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      glow: "hover:shadow-emerald-500/20",
    },
    {
      icon: FiAward,
      title: "100% 80G Tax Exemption",
      desc: "Official Section 8 non-profit with 100% legal transparency and instant digital tax exemption receipts.",
      color: "from-blue-500 to-indigo-500",
      accentBg: "bg-blue-50 text-blue-700 border-blue-200",
      glow: "hover:shadow-blue-500/20",
    },
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-b from-[#faf6f0] via-white to-[#fbf7f1] py-24 sm:py-32 border-y border-orange-100"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/3 -left-32 size-[500px] rounded-full bg-orange-200/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 size-[500px] rounded-full bg-amber-200/35 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full bg-orange-100/30 blur-[140px] pointer-events-none" />

      {/* Subtle organic pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(#e96a2c 1px, transparent 1px), radial-gradient(#e96a2c 1px, #faf6f0 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ==================================================== */}
          {/* Left Column (6 Cols): 3D Layered Photo Showcase       */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 relative perspective-1000">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Primary Main Photo Card with 3D Tilt & Glow */}
              <div className="relative aspect-4/5 sm:aspect-3/4 w-full overflow-hidden rounded-3xl border-4 border-white bg-stone-900 shadow-2xl transition-all duration-700 hover:shadow-orange-500/20">
                <Image
                  src="/services/9.jpeg"
                  alt="A dedicated foundation volunteer carrying out on-ground street rescue in Rampur"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

                {/* Bottom Story text overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white mb-2 shadow-md">
                    <span className="size-1.5 rounded-full bg-white animate-ping" />
                    <span>On The Frontlines · Rampur</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                    Every helpless life deserves medicine, nutrition, and a fighting chance.
                  </h3>
                  <p className="mt-1 text-xs text-stone-300 font-medium">
                    Over 4,800+ life-saving interventions across Rampur highways &amp; rural belts.
                  </p>
                </div>
              </div>

              {/* Overlapping Floating Secondary Image Card */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 hidden sm:block w-48 lg:w-56 aspect-square overflow-hidden rounded-2xl border-4 border-white shadow-2xl bg-stone-800 transition-all duration-500 hover:scale-105">
                <Image
                  src="/services/3.jpeg"
                  alt="Safe foster nursery for rescued street puppies"
                  fill
                  sizes="224px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 right-2.5 rounded-lg bg-black/70 backdrop-blur-sm px-2.5 py-1.5 text-[11px] font-bold text-amber-300 text-center">
                  Pediatric Puppy Sanctuary
                </span>
              </div>

              {/* Floating Live Badge Card 1 (Top Left) */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute top-6 -left-3 sm:-left-6 rounded-2xl border border-orange-200/90 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md max-w-xs hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-orange-100 text-brand-orange shadow-inner">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Govt. Section 8 Non-Profit
                    </span>
                    <span className="block text-xs font-black text-stone-900">
                      80G &amp; 12A Certified Trust
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Live Badge Card 2 (Bottom Left) */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="absolute -bottom-6 left-6 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700 shadow-inner">
                    <FiTruck size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-emerald-800">
                      24/7 Mobile Ambulance
                    </span>
                    <span className="block text-[11px] text-stone-500 font-medium">
                      Active Across Rampur &amp; Highways
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ==================================================== */}
          {/* Right Column (6 Cols): Story, 4 Pillars & Leadership  */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/80 px-4 py-1.5 text-xs font-bold text-brand-orange shadow-sm">
                <FiHeart size={14} className="fill-brand-orange" />
                <span>ABOUT SHIV GORAKH WELFARE FOUNDATION</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.14]">
                Rooted in Rampur.<br />
                <span className="italic bg-gradient-to-r from-orange-600 via-brand-orange to-amber-600 bg-clip-text text-transparent">
                  Devoted to Unconditional Compassion.
                </span>
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-stone-700">
                Shiv Gorakh Welfare Foundation was founded with one clear, non-negotiable resolve:
                <strong className="text-stone-900 font-bold"> when a helpless community animal is injured or starving, turning away is never an option.</strong>
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-stone-600">
                From midnight vehicular trauma calls along the national highway to pediatric foster care for abandoned orphaned litters and daily hot meals across Rampur, our volunteers mobilize with medical dressings, love, and unwavering commitment.
              </p>
            </motion.div>

            {/* Core Operational Pillars Grid (Interactive & Colorful) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="grid sm:grid-cols-2 gap-3.5 pt-2"
            >
              {corePillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className={`group relative overflow-hidden rounded-2xl border bg-white p-4.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${pillar.accentBg.split(" ")[2]} ${pillar.glow}`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br ${pillar.color} text-white shadow-sm`}>
                        <Icon size={16} />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-brand-orange transition-colors">
                        {pillar.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-600 leading-snug">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Link
                href="/about-us"
                className="group inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-brand-orange transition-all hover:scale-105"
              >
                <span>Read Full Foundation Story</span>
                <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                href="/team-members"
                className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-white px-5 py-3.5 text-xs font-bold text-stone-800 shadow-sm hover:bg-orange-50 hover:text-brand-orange transition-all hover:scale-105"
              >
                <FiUsers size={14} className="text-brand-orange" />
                <span>Meet Our Team</span>
              </Link>

              <Link
                href="/certificates"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-orange transition ml-2"
              >
                <span>View 80G Certificates</span>
                <span>→</span>
              </Link>
            </motion.div>

            {/* Founder Leadership Card */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 rounded-2xl border border-orange-200/90 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/70 p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-sm"
            >
              <div>
                <span className="font-serif text-xs italic text-stone-500 block">
                  Leading with devotion &amp; hands-on ground rescue:
                </span>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">
                  {founderName} <span className="text-brand-orange">&amp;</span> {coFounderName}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Founders &amp; Managing Board · Shiv Gorakh Welfare Foundation
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-11 rounded-full border-2 border-orange-400 overflow-hidden relative shadow-md">
                  <Image
                    src="/founders/HariOm.jpeg"
                    alt={founderName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="size-11 rounded-full border-2 border-amber-400 overflow-hidden relative shadow-md -ml-3">
                  <Image
                    src="/founders/AnkitPandey.jpeg"
                    alt={coFounderName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
