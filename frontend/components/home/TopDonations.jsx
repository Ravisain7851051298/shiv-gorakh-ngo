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
    quote: "Dedicated to ground-level rescue operations, critical trauma surgeries, and 24/7 care across Rampur.",
  },
  {
    name: "Ankit Pandey",
    role: "Co-Founder & Trustee",
    image: "/founders/AnkitPandey.jpeg",
    contribution: "₹2,50,000",
    quote: "Building sustainable animal welfare infrastructure, mobile ambulances, and lifetime sanctuaries.",
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
      className="relative overflow-hidden bg-gradient-to-b from-[#faf6f0] via-orange-50/30 to-white px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      {/* Decorative ambient elements */}
      <div className="pointer-events-none absolute right-0 top-1/4 size-[500px] rounded-full bg-amber-100/40 blur-[130px]" />
      <div className="pointer-events-none absolute -left-20 bottom-10 size-[500px] rounded-full bg-orange-100/40 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* ==================================================== */}
        {/* Section Header with Staggered Scroll Motion          */}
        {/* ==================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-white/95 px-4 py-1.5 text-xs font-bold text-brand-orange shadow-sm">
            <FiHeart size={14} className="fill-brand-orange text-brand-orange" />
            <span>HONORING OUR PILLAR DONORS &amp; PATRONS</span>
          </div>

          <h2 className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-tight">
            The Hearts &amp; Benefactors <br />
            <span className="italic bg-gradient-to-r from-orange-600 via-brand-orange to-amber-600 bg-clip-text text-transparent">
              Behind Every Rescued Life.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-stone-600">
            From our founding trustees to generous community patrons, every rupee directly fuels
            emergency ambulance runs, life-saving trauma surgeries, and everyday street feeding.
          </p>
        </motion.div>

        {/* ==================================================== */}
        {/* Founders 3D Luxury Patron Cards                      */}
        {/* ==================================================== */}
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200/80 pb-4"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900">
                <FiShield size={13} className="text-emerald-700" />
                <span>Founding Leadership &amp; Personal Seed Endowments</span>
              </span>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Founders &amp; Permanent Trustees
              </h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              Zero administrative salaries taken · 100% volunteerism
            </span>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: idx * 0.15, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-3xl border-2 border-orange-200/90 bg-gradient-to-br from-white via-[#fffdfa] to-orange-50/50 p-7 shadow-lg transition-all duration-400 hover:-translate-y-2 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Founder Avatar with Verified Badge */}
                  <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-2xl ring-4 ring-orange-200 shadow-md">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 right-1 grid size-6 place-items-center rounded-full bg-emerald-600 text-white shadow-md">
                      <FiCheckCircle size={13} />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-100 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-orange border border-orange-200">
                        Managing Trustee
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        Personal Seed Endowment
                      </span>
                    </div>

                    <h4 className="mt-2 font-serif text-2xl font-bold text-stone-900 group-hover:text-brand-orange transition-colors">
                      {founder.name}
                    </h4>

                    <p className="text-xs font-semibold text-stone-500">
                      {founder.role}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Personal Contribution:
                      </span>
                      <span className="font-serif text-xl font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                        {founder.contribution}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-stone-600 italic border-t border-stone-100 pt-3.5">
                  &ldquo;{founder.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ==================================================== */}
        {/* Top Donors Honor Roll Table with 3D Medallions        */}
        {/* ==================================================== */}
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-300 shadow-sm">
              <FiAward size={14} className="text-amber-700" />
              <span>HONOR ROLL · BENEFACTORS</span>
            </span>

            <h3 className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              Community Benefactors &amp; Monthly Lifesavers
            </h3>

            <p className="mt-2 text-sm text-stone-500 max-w-xl mx-auto">
              Real-time recognition of leading patrons whose contributions save lives across our shelters, camps, and ambulance runs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-3xl border-2 border-stone-200/90 bg-white shadow-xl"
          >
            {contributors.map((donor, index) => {
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
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 px-6 py-5 last:border-0 transition-all hover:bg-orange-50/40 ${isGold ? "bg-amber-50/40" : isSilver ? "bg-stone-50/60" : ""
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Medallion */}
                    {/* <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-md ${
                        isGold
                          ? "bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-stone-950 ring-2 ring-amber-300 shadow-amber-200"
                          : isSilver
                            ? "bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400 text-stone-900 ring-2 ring-stone-300"
                            : isBronze
                              ? "bg-gradient-to-br from-orange-200 via-amber-500 to-amber-600 text-white ring-2 ring-orange-300"
                              : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {isGold ? "👑 1" : isSilver ? "🥈 2" : isBronze ? "🥉 3" : `#${rank}`}
                    </div> */}

                    {/* Contributor Profile Picture / Initials */}
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-stone-200 bg-stone-100 shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={donor.name}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.classList.add(
                              "grid",
                              "place-items-center",
                              "bg-orange-100",
                              "text-orange-800",
                              "font-bold",
                              "text-xs"
                            );
                            e.currentTarget.parentElement.innerText = initials;
                          }}
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-orange-100 text-xs font-bold text-brand-orange">
                          {initials}
                        </div>
                      )}
                    </div>

                    {/* Contributor Info */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-stone-900">
                          {donor.name}
                        </h4>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${donor.badge ||
                            "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                        >
                          {donor.tag || "Generous Donor"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-stone-500">
                        Verified Bank Transfer · 80G Tax Exemption Issued
                      </p>
                    </div>
                  </div>

                  {/* Contribution Amount */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pl-16 sm:pl-0">
                    <div className="text-right">
                      <span className="font-serif text-xl sm:text-2xl font-black text-brand-orange">
                        {donor.formattedAmount || donor.amount || "₹0"}
                      </span>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                        Direct Medical Fund
                      </p>
                    </div>

                    <span
                      className="grid size-8 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-2xs"
                      title="Verified Contribution"
                    >
                      <FiCheckCircle size={16} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ==================================================== */}
        {/* Quick Giving Selector Cards                          */}
        {/* ==================================================== */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-orange-50 via-white to-amber-50 p-8 sm:p-10 border border-orange-200">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-orange">
              IMMEDIATE IMPACT TIERS
            </span>
            <h4 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
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
                <span className="block font-serif text-3xl font-black text-brand-orange group-hover:scale-105 transition-transform">
                  {tier.amount}
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
