"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { FiArrowUpRight, FiGrid } from "react-icons/fi";

const features = [
  [
    "01",
    "Donation Portal",
    "A clear, 80G tax-deductible way for supporters to contribute with instant receipts.",
    "/donate",
    "Instant 80G",
  ],
  [
    "02",
    "Volunteer Network",
    "Give your time, skills, or local street knowledge to rescue distressed animals.",
    "/volunteer/register",
    "Ground Squad",
  ],
  [
    "03",
    "Welfare Programs",
    "Ongoing feeding routes, sterilization drives, and medical rescue programs.",
    "/programs",
    "Active Drives",
  ],
  [
    "04",
    "Fundraising Campaigns",
    "Verified urgent campaigns for emergency surgeries and medical ambulances.",
    "/campaigns",
    "Live Causes",
  ],
  [
    "05",
    "Verified Reviews & Replies",
    "Read public community reviews alongside official executive admin replies.",
    "/reviews",
    "Public Voice",
  ],
  [
    "06",
    "Official Certificates & Audit",
    "Public government registration documents, MOA, and 80G approval certificates.",
    "/certificates",
    "Full Audit",
  ],
  [
    "07",
    "News & Field Blogs",
    "Stay updated on our vaccination camps, medical milestones, and team updates.",
    "/news",
    "Field Updates",
  ],
  [
    "08",
    "Photo & Video Gallery",
    "Browse authentic field photography and rescue recovery footage.",
    "/gallery",
    "Media Vault",
  ],
  [
    "09",
    "Success Stories",
    "Documented rescue-to-rehabilitation journeys of stray dogs and injured animals.",
    "/stories",
    "Lives Saved",
  ],
];

export default function FeatureSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="digital-home"
      className="relative overflow-hidden bg-gradient-to-br from-[#1b3d31] via-brand-green to-[#132c23] px-5 py-24 text-brand-cream sm:px-8 lg:px-12 lg:py-32 border-t border-emerald-900"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-0 top-0 size-[500px] rounded-full bg-emerald-500/15 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 size-[500px] rounded-full bg-amber-400/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={!reduceMotion ? { opacity: 0, y: 25 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-white/20 pb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-orange-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-200 backdrop-blur-sm shadow-sm mb-4">
              <FiGrid size={13} className="text-orange-300" />
              <span>DIGITAL ECOSYSTEM &amp; SERVICES</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              More ways to connect. <br />
              <span className="italic bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-200 bg-clip-text text-transparent">
                More good to accomplish together.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base leading-relaxed text-emerald-100/80">
            Explore pathways to participate, track foundation operations in real time, and verify our official government registrations.
          </p>
        </motion.div>

        {/* Features Grid with 3D Hover Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([number, title, description, href, badge], idx) => (
            <motion.div
              key={number}
              initial={!reduceMotion ? { opacity: 0, y: 20 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: idx * 0.05, ease: "easeOut" }}
            >
              <Link
                href={href}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-orange-400/50 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black tracking-widest text-orange-300">
                      {number}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-200">
                      {badge}
                    </span>
                  </div>
                  <strong className="block font-serif text-xl font-bold text-white group-hover:text-orange-200 transition-colors">
                    {title}
                  </strong>
                  <span className="mt-2 block text-xs sm:text-sm leading-relaxed text-emerald-100/75">
                    {description}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-end border-t border-white/10 pt-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-300 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <FiArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
