"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  FiHeart,
  FiUsers,
  FiTrendingUp,
  FiArrowUpRight,
  FiActivity,
  FiPhoneCall,
  FiShield,
  FiAward,
  FiCheckCircle,
  FiSmile,
} from "react-icons/fi";

const initiatives = [
  {
    number: "01",
    icon: FiActivity,
    title: "Trauma Emergency Rescue",
    description:
      "Rapid on-ground mobile ambulance dispatched across Rampur highways within 25 minutes for critical vehicular accidents and animal distress.",
    href: "/campaigns",
    badge: "24/7 Mobile Triage",
    stat: "4,800+ Rescues Handled",
    color: "from-orange-500 via-amber-500 to-red-500",
    glow: "hover:shadow-orange-500/25",
    border: "border-orange-200/80 hover:border-orange-400",
    accent: "bg-orange-500 text-white",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
  },
  {
    number: "02",
    icon: FiHeart,
    title: "Night Feeder & Warm Bedding",
    description:
      "Every single evening, our teams distribute freshly cooked nutritional porridge, milk, and insulated straw bedding in cold industrial belts.",
    href: "/campaigns",
    badge: "180+ Animals Fed Nightly",
    stat: "100% Daily Consistency",
    color: "from-rose-500 via-pink-500 to-amber-500",
    glow: "hover:shadow-rose-500/25",
    border: "border-rose-200/80 hover:border-rose-400",
    accent: "bg-rose-500 text-white",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
  },
  {
    number: "03",
    icon: FiShield,
    title: "Mass Anti-Rabies & ABC Drive",
    description:
      "Humane Animal Birth Control surgeries and mass anti-rabies vaccination camps to safeguard both street companions and neighborhood residents.",
    href: "/projects",
    badge: "Safe Coexistence",
    stat: "Rabies-Free Zones",
    color: "from-emerald-500 via-teal-500 to-green-600",
    glow: "hover:shadow-emerald-500/25",
    border: "border-emerald-200/80 hover:border-emerald-400",
    accent: "bg-emerald-500 text-white",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    number: "04",
    icon: FiUsers,
    title: "Youth Squad & Civic Action",
    description:
      "Mobilizing school students, college volunteers, and civic groups with first-aid kits, collar reflectors, and compassionate animal welfare education.",
    href: "/volunteer/register",
    badge: "Grassroots Force",
    stat: "250+ Active Volunteers",
    color: "from-indigo-500 via-purple-500 to-blue-600",
    glow: "hover:shadow-indigo-500/25",
    border: "border-indigo-200/80 hover:border-indigo-400",
    accent: "bg-indigo-500 text-white",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
];

const stats = [
  { value: "24/7", label: "Emergency Response", icon: FiPhoneCall, desc: "Immediate helpline response" },
  { value: "5,000+", label: "Lives Impacted", icon: FiActivity, desc: "Healed & nourished" },
  { value: "100%", label: "80G Tax Exemption", icon: FiShield, desc: "Instant tax receipt" },
  { value: "0 ₹", label: "Cost to Animals", icon: FiAward, desc: "100% free care & surgeries" },
];

export default function InitiativesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="our-work"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#fffaf5] to-white px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -right-32 top-10 size-[550px] rounded-full bg-orange-100/60 blur-[130px]" />
      <div className="pointer-events-none absolute -left-32 bottom-10 size-[550px] rounded-full bg-amber-100/60 blur-[130px]" />

      {/* Orange gradient top border */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-60" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={!reduceMotion ? { opacity: 0, y: 30 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-100/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange shadow-sm">
              <span className="size-2 rounded-full bg-brand-orange animate-ping" />
              <span>TRANSFORMATIVE GROUND INITIATIVES</span>
            </span>
            <h2 className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-stone-900">
              Care that reaches{" "}
              <span className="italic bg-gradient-to-r from-orange-600 via-brand-orange to-amber-600 bg-clip-text text-transparent">
                the most vulnerable.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-stone-600">
            A compassionate society is built one rescue, one meal, and one treatment at a time.
            Explore our specialized welfare programs saving hundreds of lives monthly in Rampur.
          </p>
        </motion.div>

        {/* 4 Colorful & Interactive Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {initiatives.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.number}
                initial={!reduceMotion ? { opacity: 0, y: 35 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border ${item.border} bg-white p-7 shadow-sm transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl ${item.glow}`}
              >
                {/* Top Glowing Gradient Bar */}
                <div
                  className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${item.color}`}
                />

                <div className="relative">
                  {/* Icon & Number Row */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="font-mono text-3xl font-black text-stone-200 group-hover:text-stone-300 transition-colors">
                      {item.number}
                    </span>
                  </div>

                  {/* Badge */}
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>

                  {/* Title */}
                  <h3 className="mt-4 font-serif text-2xl font-bold text-stone-900 group-hover:text-brand-orange transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {item.description}
                  </p>
                </div>

                {/* Footer CTA */}
                <div className="relative mt-7 flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="text-xs font-bold text-stone-700 group-hover:text-brand-orange transition-colors">
                    Take Action
                  </span>
                  <Link
                    href={item.href}
                    className="inline-flex size-10 items-center justify-center rounded-full bg-stone-100 text-stone-800 shadow-sm transition-all duration-300 group-hover:bg-brand-orange group-hover:text-white group-hover:scale-110"
                    aria-label={`Learn more about ${item.title}`}
                  >
                    <FiArrowUpRight size={18} />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Dynamic 3D Stats Strip */}
        {/* <motion.div
          initial={!reduceMotion ? { opacity: 0, y: 30 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 grid grid-cols-2 gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-6 sm:p-10 text-white shadow-2xl lg:grid-cols-4 border border-orange-500/20"
        >
          {stats.map(({ value, label, icon: Icon, desc }, i) => (
            <motion.div
              key={label}
              initial={!reduceMotion ? { opacity: 0, scale: 0.9 } : false}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group text-center p-3 rounded-2xl transition hover:bg-white/5"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white mb-3 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <Icon size={22} />
              </div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
                {value}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-orange-300">
                {label}
              </div>
              <p className="mt-0.5 text-[11px] text-stone-400">
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </section>
  );
}
