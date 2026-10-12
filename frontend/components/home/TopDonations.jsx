"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FiHeart,
  FiAward,
  FiCheckCircle,
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiUser,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1\/?$/, "");

function getDonorImageUrl(path) {
  if (!path) return "";
  if (/^(?:https?:)?\/\//i.test(path)) return path;
  if (path.startsWith("/founders/")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

const founders = [
  {
    name: "Hari Om",
    role: "Co-Founder & Managing Trustee",
    image: "/founders/HariOm.jpeg",
    contribution: "₹3,00,000",
    quote:
      "Dedicated to ground-level rescue operations, critical trauma surgeries, and 24/7 care across Rampur.",
  },
  {
    name: "Ankit Pandey",
    role: "Co-Founder & Trustee",
    image: "/founders/AnkitPandey.jpeg",
    contribution: "₹2,50,000",
    quote:
      "Building sustainable animal welfare infrastructure, mobile ambulances, and lifetime sanctuaries.",
  },
];

const fallbackDonors = [
  {
    id: "f1",
    name: "Hari Om",
    formattedAmount: "₹3,00,000",
    tag: "Founding Patron",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    profilePicture: "/founders/HariOm.jpeg",
    role: "Co-Founder & Managing Trustee",
  },
  {
    id: "f2",
    name: "Ankit Pandey",
    formattedAmount: "₹2,50,000",
    tag: "Founding Patron",
    badge: "bg-stone-200 text-stone-800 border-stone-300",
    profilePicture: "/founders/AnkitPandey.jpeg",
    role: "Co-Founder & Trustee",
  },
  {
    id: "f3",
    name: "Jatin Kumar",
    formattedAmount: "₹10,000",
    tag: "Honorary Benefactor",
    badge: "bg-orange-100 text-orange-900 border-orange-300",
    profilePicture: "",
    role: "volunteer",
  },
  {
    id: "f4",
    name: "Ravi Sain",
    formattedAmount: "₹1,200",
    tag: "Community Supporter",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    profilePicture: "",
    role: "member",
  },
  {
    id: "f5",
    name: "Jeetu Singh Jadaun",
    formattedAmount: "₹550",
    tag: "Compassionate Donor",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    profilePicture: "",
    role: "member",
  },
];

const QUICK_GIVE = [
  { amount: "500", label: "Feeds 15 Strays", desc: "Fresh hot porridge & nutrition" },
  { amount: "1500", label: "Vaccines & First Aid", desc: "Anti-rabies + trauma kit" },
  { amount: "3500", label: "Ambulance Fuel & Care", desc: "Rapid road accident transit" },
  { amount: "7000", label: "Major Surgery Sponsoring", desc: "Bone fracture & ICU healing" },
];

export default function DonorSection() {
  const [contributors, setContributors] = useState(fallbackDonors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTopContributors() {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const cleanUrl = baseUrl.replace(/\/+$/, "");
        const res = await fetch(`${cleanUrl}/donations/top-contributors`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (
          isMounted &&
          json?.success &&
          Array.isArray(json?.data) &&
          json.data.length > 0
        ) {
          setContributors(json.data);
        }
      } catch (err) {
        // keep fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTopContributors();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="supporters"
      className="relative overflow-hidden bg-gradient-to-b from-[#faf6f0] via-orange-50/30 to-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      {/* Decorative ambient elements */}
      <div className="pointer-events-none absolute right-0 top-1/4 size-[420px] rounded-full bg-amber-100/40 blur-[130px]" />
      <div className="pointer-events-none absolute -left-20 bottom-10 size-[420px] rounded-full bg-orange-100/40 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* ==================================================== */}
        {/* Main Section Header (Fully Responsive on All Devices)*/}
        {/* ==================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center px-2"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-white/95 px-3.5 py-1 text-[11px] sm:text-xs font-bold text-brand-orange shadow-2xs">
            <FiHeart size={13} className="fill-brand-orange text-brand-orange shrink-0" />
            <span className="tracking-wider uppercase">Honoring Our Pillar Donors &amp; Patrons</span>
          </div>

          <h2 className="mt-3.5 font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.18] break-words">
            The Hearts &amp; Benefactors{" "}
            <span className="italic bg-gradient-to-r from-orange-600 via-brand-orange to-amber-600 bg-clip-text text-transparent inline-block">
              Behind Every Rescued Life.
            </span>
          </h2>

          <p className="mt-3.5 text-xs sm:text-base md:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto">
            From our founding trustees to generous community patrons, every rupee directly fuels
            emergency ambulance runs, life-saving trauma surgeries, and everyday street feeding.
          </p>
        </motion.div>

        {/* ==================================================== */}
        {/* Founders 3D Luxury Patron Cards                      */}
        {/* ==================================================== */}
        <div className="mt-14 sm:mt-18">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-orange-200/80 pb-4"
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-900">
                <FiShield size={12} className="text-emerald-700 shrink-0" />
                <span>Founding Leadership &amp; Personal Endowments</span>
              </span>
              <h3 className="mt-2 font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900">
                Founders &amp; Permanent Trustees
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-500 shrink-0">
              Zero administrative salaries taken · 100% volunteerism
            </span>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-orange-200/90 bg-gradient-to-br from-white via-[#fffdfa] to-orange-50/50 p-6 sm:p-7 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                  {/* Founder Avatar with Verified Badge */}
                  <div className="relative size-20 sm:size-24 lg:size-28 shrink-0 overflow-hidden rounded-2xl ring-4 ring-orange-200 shadow-md">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 right-1 grid size-5 sm:size-6 place-items-center rounded-full bg-emerald-600 text-white shadow-md">
                      <FiCheckCircle size={12} />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-orange border border-orange-200">
                        Managing Trustee
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        Personal Seed Endowment
                      </span>
                    </div>

                    <h4 className="mt-2 font-serif text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-brand-orange transition-colors">
                      {founder.name}
                    </h4>

                    <p className="text-xs font-semibold text-stone-500">
                      {founder.role}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Personal Contribution:
                      </span>
                      <span className="font-serif text-lg sm:text-xl font-black text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-xl border border-emerald-200 shadow-2xs">
                        {founder.contribution}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-stone-600 italic border-t border-stone-100 pt-3.5">
                  &ldquo;{founder.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ==================================================== */}
        {/* Top Donors Honor Roll CARDS UI (Single Row in Large) */}
        {/* ==================================================== */}
        <div className="mt-16 sm:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto px-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-300 shadow-2xs">
              <FiAward size={13} className="text-amber-700" />
              <span>HONOR ROLL · BENEFACTORS</span>
            </span>

            <h3 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
              Community Benefactors &amp; Monthly Lifesavers
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
              Real-time recognition of leading patrons whose contributions save lives across our shelters, camps, and ambulance runs.
            </p>
          </motion.div>

          {/* Cards Grid: 1 col on mobile, 2 on sm, 3 on md, and EXACT SINGLE ROW (5 cols) on lg+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {contributors.slice(0, 5).map((donor, index) => {
              const rank = donor.rank || index + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;
              const avatarUrl = donor.profilePicture
                ? getDonorImageUrl(donor.profilePicture)
                : "";
              const initials = (donor.name || "D")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <motion.div
                  key={donor.id || donor.name || index}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className={`group relative flex flex-col items-center text-center rounded-2xl sm:rounded-3xl border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    isGold
                      ? "border-amber-300/90 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 shadow-md shadow-amber-500/10 hover:border-amber-400"
                      : isSilver
                      ? "border-stone-200/90 bg-gradient-to-b from-stone-50/80 via-white to-stone-50/30 shadow-sm hover:border-stone-400"
                      : isBronze
                      ? "border-orange-200/90 bg-gradient-to-b from-orange-50/80 via-white to-orange-50/30 shadow-sm hover:border-orange-400"
                      : "border-stone-200/80 bg-white shadow-2xs hover:border-orange-300"
                  }`}
                >
                  {/* Top Rank Medallion Ribbon */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black tracking-wide shadow-2xs ${
                        isGold
                          ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-stone-950 ring-2 ring-amber-300/50"
                          : isSilver
                          ? "bg-gradient-to-r from-stone-200 to-stone-400 text-stone-900 ring-2 ring-stone-300/50"
                          : isBronze
                          ? "bg-gradient-to-r from-orange-300 via-amber-500 to-amber-600 text-white ring-2 ring-orange-300/50"
                          : "bg-stone-100 text-stone-700 border border-stone-200"
                      }`}
                    >
                      {isGold
                        ? "👑 Rank #1"
                        : isSilver
                        ? "🥈 Rank #2"
                        : isBronze
                        ? "🥉 Rank #3"
                        : `⭐ Rank #${rank}`}
                    </span>
                  </div>

                  {/* Profile Picture with Ring & Check Badge */}
                  <div className="relative mb-3.5 size-16 sm:size-18 shrink-0">
                    <div
                      className={`size-full overflow-hidden rounded-full border-2 bg-stone-100 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                        isGold
                          ? "border-amber-400 ring-4 ring-amber-100"
                          : isSilver
                          ? "border-stone-300 ring-4 ring-stone-100"
                          : isBronze
                          ? "border-orange-300 ring-4 ring-orange-100"
                          : "border-stone-200 ring-2 ring-stone-100"
                      }`}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={donor.name}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.classList.add(
                                "grid",
                                "place-items-center",
                                "bg-orange-100",
                                "text-brand-orange",
                                "font-bold",
                                "text-sm"
                              );
                              e.currentTarget.parentElement.innerText = initials;
                            }
                          }}
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-orange-100 text-sm font-bold text-brand-orange">
                          {initials}
                        </div>
                      )}
                    </div>
                    <span
                      className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full bg-emerald-600 text-white ring-2 ring-white shadow-2xs"
                      title="Verified Benefactor"
                    >
                      <FiCheckCircle size={11} />
                    </span>
                  </div>

                  {/* Donor Name & Tag */}
                  <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-brand-orange transition-colors truncate max-w-full px-1">
                    {donor.name}
                  </h4>

                  <span
                    className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider truncate max-w-full ${
                      donor.badge || "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {donor.tag || "Generous Donor"}
                  </span>

                  {/* Amount Block */}
                  <div className="mt-4 pt-3.5 border-t border-stone-100 w-full">
                    <span className="block font-serif text-xl sm:text-2xl font-black text-brand-orange leading-tight">
                      {donor.formattedAmount || donor.amount || "₹0"}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Direct Medical Fund
                    </span>
                  </div>

                  {/* Trust Footer */}
                  <div className="mt-3 text-[10px] text-stone-500 font-medium flex items-center justify-center gap-1 text-center">
                    <FiShield size={11} className="text-emerald-600 shrink-0" />
                    <span>80G Tax Exemption</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* Quick Giving Selector Cards                          */}
        {/* ==================================================== */}
        <div className="mt-16 sm:mt-20 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 sm:p-10 border border-orange-200">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-orange">
              IMMEDIATE IMPACT TIERS
            </span>
            <h4 className="mt-1 font-serif text-xl sm:text-3xl font-bold text-stone-900">
              Pick an Amount to Save a Life in Rampur Right Now
            </h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_GIVE.map((tier) => (
              <Link
                key={tier.amount}
                href={`/donate?amount=${tier.amount}`}
                className="group relative overflow-hidden rounded-2xl border border-orange-200 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-orange hover:shadow-xl hover:shadow-orange-500/10"
              >
                <span className="block font-serif text-2xl sm:text-3xl font-black text-brand-orange group-hover:scale-105 transition-transform">
                  ₹{tier.amount}
                </span>
                <span className="mt-1 block text-sm font-bold text-stone-900">
                  {tier.label}
                </span>
                <p className="mt-1 text-xs text-stone-500">
                  {tier.desc}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-orange group-hover:underline">
                  <span>Donate This Amount</span>
                  <FiArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
