"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FiUsers,
  FiSearch,
  FiMail,
  FiPhone,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
  FiArrowUpRight,
  FiHeart,
  FiShield,
  FiCheckCircle,
  FiRefreshCw,
  FiAward,
} from "react-icons/fi";
import { getTeamMembers } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

// Curated baseline foundation leadership & operational leads
const BASELINE_TEAM = [
  {
    _id: "base-1",
    name: "Hari Om",
    position: "Founder & President",
    department: "Leadership & Board",
    image: "/founders/founder.jpeg",
    bio: "Visionary founder dedicating his life to creating a permanent safety net, 24/7 emergency medical trauma care, and daily nutrition for abandoned community animals in Rampur.",
    email: "hariom@shivgorakh.org.in",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
    order: 1,
    status: "Active",
  },
  {
    _id: "base-2",
    name: "Ankit Pandey",
    position: "Co-Founder & Secretary",
    department: "Leadership & Board",
    image: "/founders/co-founder.jpeg",
    bio: "Spearheading governance, legal compliance, field operations, and transparent welfare resource distribution to empower volunteers and ensure accountability.",
    email: "ankit@shivgorakh.org.in",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
    order: 2,
    status: "Active",
  },
  {
    _id: "base-3",
    name: "Dr. R. K. Sharma",
    position: "Chief Veterinary Officer",
    department: "Veterinary & Medical Care",
    image: "/services/2.jpeg",
    bio: "Senior veterinary surgeon managing trauma stabilization, orthopedic splinting, pre-emptive spay/neuter operations, and critical hospital triage.",
    email: "vetcare@shivgorakh.org.in",
    order: 3,
    status: "Active",
  },
  {
    _id: "base-4",
    name: "Vikram Chauhan",
    position: "Lead Field Rescue Coordinator",
    department: "Field Rescue Operations",
    image: "/services/4.jpeg",
    bio: "Directing 24/7 hotline dispatches, accident-scene emergency ambulance transit, and high-risk street rescues across urban and rural Rampur corridors.",
    email: "rescue@shivgorakh.org.in",
    order: 4,
    status: "Active",
  },
  {
    _id: "base-5",
    name: "Pooja Saxena",
    position: "Head of Volunteer Engagement & Adoption",
    department: "Community & Volunteer Force",
    image: "/services/8.jpeg",
    bio: "Organizing student volunteer drives, humane education workshops, foster nursery networks, and permanent loving adoption placements for rescued pups.",
    email: "volunteers@shivgorakh.org.in",
    order: 5,
    status: "Active",
  },
  {
    _id: "base-6",
    name: "Mohit Verma",
    position: "Ambulance Transit & First-Aid Paramedic",
    department: "Field Rescue Operations",
    image: "/services/7.jpeg",
    bio: "Certified veterinary paramedic providing on-site wound debridement, maggot wound therapy, and critical transit stabilization in emergency response ambulances.",
    email: "transit@shivgorakh.org.in",
    order: 6,
    status: "Active",
  },
];

const DEPARTMENTS = [
  "All",
  "Leadership & Board",
  "Veterinary & Medical Care",
  "Field Rescue Operations",
  "Community & Volunteer Force",
];

export default function TeamMembersView() {
  const [apiMembers, setApiMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  async function loadData() {
    setLoading(true);
    const res = await getTeamMembers({ status: "Active" });
    if (res.success && Array.isArray(res.items) && res.items.length > 0) {
      setApiMembers(res.items);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Use API members if available; otherwise use baseline team members
  const allMembers = useMemo(() => {
    if (apiMembers.length > 0) {
      return apiMembers;
    }
    return BASELINE_TEAM;
  }, [apiMembers]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      if (selectedDept !== "All") {
        if (!m.department?.toLowerCase().includes(selectedDept.toLowerCase().split(" ")[0])) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchPos = m.position?.toLowerCase().includes(q);
        const matchDept = m.department?.toLowerCase().includes(q);
        const matchBio = m.bio?.toLowerCase().includes(q);
        if (!matchName && !matchPos && !matchDept && !matchBio) return false;
      }
      return true;
    });
  }, [allMembers, selectedDept, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900">
      {/* ======================================================== */}
      {/* HERO SECTION                                            */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-stone-950 px-5 pt-28 pb-20 text-white sm:px-8 lg:px-12">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-radial from-orange-950/30 via-stone-950 to-stone-950 opacity-80" />
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-amber-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-300 backdrop-blur-md"
          >
            <FiShield size={13} className="text-brand-orange" />
            <span>FOUNDATION GOVERNANCE &amp; FIELD CORPS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight"
          >
            Meet the Heart &amp; Hands of <br />
            <span className="italic text-orange-300">Shiv Gorakh Welfare Foundation</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto max-w-2xl text-sm sm:text-base text-stone-300 leading-relaxed"
          >
            Behind every emergency animal rescue, mass vaccination camp, and daily feeding route is an extraordinary team of dedicated founders, licensed veterinary doctors, and passionate field responders.
          </motion.p>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-3.5">
              <span className="block font-serif text-2xl font-bold text-orange-300">100%</span>
              <span className="text-[11px] text-stone-400">Volunteer Dedication</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-3.5">
              <span className="block font-serif text-2xl font-bold text-orange-300">24/7</span>
              <span className="text-[11px] text-stone-400">Rescue Dispatch</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-3.5">
              <span className="block font-serif text-2xl font-bold text-orange-300">80G</span>
              <span className="text-[11px] text-stone-400">Govt. Verified Trust</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-3.5">
              <span className="block font-serif text-2xl font-bold text-orange-300">5,000+</span>
              <span className="text-[11px] text-stone-400">Lives Impacted</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FILTER & SEARCH BAR                                      */}
      {/* ======================================================== */}
      <section className="sticky top-0 z-20 border-b border-orange-200/80 bg-white/95 backdrop-blur-md px-5 py-4 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Department Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {DEPARTMENTS.map((dept) => {
              const active = selectedDept === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-brand-orange text-white shadow-xs"
                      : "bg-stone-100 text-stone-700 hover:bg-orange-100/70 hover:text-stone-900"
                  }`}
                >
                  {dept}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
            <input
              type="text"
              placeholder="Search by name, position, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-orange-200 bg-white pl-9 pr-8 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* TEAM MEMBERS GRID                                        */}
      {/* ======================================================== */}
      <section className="px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between border-b border-orange-200/60 pb-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                Recognized Officials &amp; Field Staff
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
                Foundation Team Members
              </h2>
            </div>

            <span className="rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-xs font-bold text-brand-orange">
              {filteredMembers.length} Official{filteredMembers.length === 1 ? "" : "s"} Displayed
            </span>
          </div>

          {filteredMembers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredMembers.map((member, idx) => {
                const memberImg = member.image ? getApiImageUrl(member.image) : "";
                const initials = (member.name || "SG")
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <motion.article
                    key={member._id || idx}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.55, delay: (idx % 3) * 0.1 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-brand-orange/40 transition duration-300"
                  >
                    <div>
                      {/* Top Photo & Identity */}
                      <div className="flex items-start gap-4">
                        <div className="relative size-20 sm:size-24 shrink-0 rounded-2xl overflow-hidden border-2 border-orange-200 bg-orange-50 shadow-sm">
                          {memberImg ? (
                            <img
                              src={memberImg}
                              alt={member.name}
                              className="size-full object-cover group-hover:scale-108 transition duration-500 ease-out"
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid size-full place-items-center bg-linear-to-br from-orange-500 to-amber-600 text-white font-serif font-bold text-2xl">
                              {initials}
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-orange border border-orange-200/60 uppercase tracking-wider">
                            {member.department || "Foundation"}
                          </span>

                          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1 truncate group-hover:text-brand-orange transition">
                            {member.name}
                          </h3>

                          <div className="mt-0.5 text-xs font-bold text-stone-600 line-clamp-1">
                            {member.position}
                          </div>
                        </div>
                      </div>

                      {/* Bio Description */}
                      {member.bio && (
                        <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-4 border-t border-stone-100 pt-3.5">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Contact */}
                    <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-stone-400">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:text-brand-orange transition"
                            title={member.email}
                          >
                            <FiMail size={14} />
                          </a>
                        )}
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="hover:text-brand-orange transition"
                            title={member.phone}
                          >
                            <FiPhone size={14} />
                          </a>
                        )}
                        {member.socialLinks?.linkedin && (
                          <a
                            href={member.socialLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-600 transition"
                            title="LinkedIn"
                          >
                            <FiLinkedin size={14} />
                          </a>
                        )}
                        {member.socialLinks?.twitter && (
                          <a
                            href={member.socialLinks.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-sky-500 transition"
                            title="Twitter"
                          >
                            <FiTwitter size={14} />
                          </a>
                        )}
                        {member.socialLinks?.instagram && (
                          <a
                            href={member.socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-pink-600 transition"
                            title="Instagram"
                          >
                            <FiInstagram size={14} />
                          </a>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange">
                        <FiCheckCircle size={12} className="text-emerald-600" />
                        <span>Verified Official</span>
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center text-xs text-stone-500">
              No team members found matching your search. Try adjusting the query.
            </div>
          )}

          {/* Bottom Collaboration Banner */}
          <div className="mt-16 rounded-3xl border border-orange-200 bg-linear-to-r from-orange-500 via-brand-orange to-amber-600 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="rounded-full bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                Join Our Dedicated Collective
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Want to serve on the frontlines of compassion?
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
                Whether you are a veterinary professional, paramedic, or local animal lover ready to respond to distress calls, there is a place for you in our mission.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/volunteer/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-xs font-bold text-stone-900 shadow-md transition hover:bg-orange-50 hover:text-brand-orange"
              >
                <span>Apply as Volunteer</span>
                <FiArrowUpRight size={14} />
              </Link>
              <Link
                href="/membership"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/10 backdrop-blur-sm px-6 py-3 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <span>Become a Member</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
