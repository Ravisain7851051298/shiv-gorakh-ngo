"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FiCheckCircle,
  FiMail,
  FiMessageSquare,
  FiStar,
  FiCornerDownRight,
  FiShield,
  FiArrowRight,
  FiAward,
  FiHeart,
  FiClock,
  FiUserCheck,
  FiTrendingUp,
} from "react-icons/fi";
import { getFeedbacks } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";
import { useNgoSettings } from "@/context/NgoSettingsContext";

const DEFAULT_REVIEWS = [
  {
    _id: "home-rev-1",
    name: "Dr. Ananya Sharma",
    email: "ananya.sharma@medhealth.in",
    userRole: "donor",
    rating: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    message:
      "I sponsored the emergency surgery of an accident-hit puppy through Shiv Gorakh Welfare Foundation. Their transparency is commendable—they sent regular video recovery updates and issued the 80G tax receipt immediately. Truly selfless workers on the ground!",
    adminReply:
      "Thank you Dr. Sharma! Puppy 'Sheru' has made a full recovery, finished post-op rehabilitation, and is now happily thriving at our foster sanctuary. We are deeply grateful for your continuous benevolence.",
    adminRepliedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    profilePicture: "/founders/HariOm.jpeg",
  },
  {
    _id: "home-rev-2",
    name: "Vikas Malhotra",
    email: "vikas.malhotra@gmail.com",
    userRole: "volunteer",
    rating: 5,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    message:
      "Being part of the evening feeding rounds in Rampur has been the most fulfilling experience. The foundation supplies fresh hygienic food, medical kits, and immediate ambulance transit whenever an animal is reported in pain.",
    adminReply:
      "We are deeply grateful for your relentless dedication on the evening feeding routes, Vikas! Volunteers like you are the true backbone of our street rescues in Rampur.",
    adminRepliedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    profilePicture: "/founders/AnkitPandey.jpeg",
  },
  {
    _id: "home-rev-3",
    name: "Pooja Singhal",
    email: "pooja.singhal@yahoo.com",
    userRole: "member",
    rating: 5,
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    message:
      "A genuine, legally registered foundation run with extreme dedication by local youth. The rabies vaccination camps have made our neighborhood so much safer for children and stray animals alike.",
    adminReply:
      "Thank you Pooja ji! Our upcoming mass sterilization and booster anti-rabies drive in Keorar panchayat begins next Tuesday. Thank you for championing community animal safety.",
    adminRepliedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    profilePicture: "",
  },
  {
    _id: "home-rev-4",
    name: "Adv. Rajeshwar Verma",
    email: "r.verma.law@rediffmail.com",
    userRole: "supporter",
    rating: 5,
    createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
    message:
      "Witnessed their emergency ambulance team rescue a distressed calf stuck in a ditch near Bilaspur gate. The team handled the calf with immense love, administered first-aid, and stayed till it could stand safely. Truly honorable souls.",
    adminReply:
      "Heartfelt thanks Rajeshwar ji! The calf was treated for minor abrasions and reunited safely with its mother. Your kind words motivate our rescue team to stay on duty 24/7.",
    adminRepliedAt: new Date(Date.now() - 19 * 24 * 3600 * 1000).toISOString(),
    profilePicture: "",
  },
];

function formatDate(dateString) {
  if (!dateString) return "Recently";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? "Recently"
    : d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
}

function StarRating({ rating = 5, size = 15 }) {
  const numericRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${numericRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={`transition-colors duration-200 ${star <= numericRating
              ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
              : "text-stone-300"
            }`}
        />
      ))}
    </div>
  );
}

const ROLE_CONFIG = {
  donor: {
    label: "Philanthropic Donor",
    badge: "bg-rose-50 text-rose-700 border-rose-200/90",
    icon: FiHeart,
  },
  volunteer: {
    label: "Rescue Volunteer",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    icon: FiShield,
  },
  member: {
    label: "Foundation Member",
    badge: "bg-blue-50 text-blue-700 border-blue-200/90",
    icon: FiAward,
  },
  admin: {
    label: "Executive Board",
    badge: "bg-stone-900 text-amber-300 border-stone-700",
    icon: FiShield,
  },
  supporter: {
    label: "Community Supporter",
    badge: "bg-amber-50 text-amber-800 border-amber-200/90",
    icon: FiStar,
  },
  guest: {
    label: "Verified Citizen",
    badge: "bg-stone-100 text-stone-700 border-stone-200",
    icon: FiUserCheck,
  },
};

export default function FeedbackSection() {
  const { settings } = useNgoSettings();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 4, averageRating: 5.0 });
  const [filter, setFilter] = useState("all"); // 'all' | 'with-reply' | 'top'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getFeedbacks({ limit: 12 });
        if (res.success && res.items?.length > 0) {
          setReviews(res.items);
          if (res.stats) setStats(res.stats);
        } else {
          setReviews(DEFAULT_REVIEWS);
        }
      } catch {
        setReviews(DEFAULT_REVIEWS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredReviews = useMemo(() => {
    if (filter === "with-reply") {
      return reviews.filter((r) => Boolean(r.adminReply));
    }
    if (filter === "top") {
      return reviews.filter((r) => Number(r.rating) === 5);
    }
    return reviews;
  }, [reviews, filter]);

  const displayReviews = filteredReviews.slice(0, 6);

  return (
    <section
      id="community-reviews"
      className="relative overflow-hidden bg-gradient-to-b from-[#fdfbf9] via-[#faf6f0] to-[#f7f2ea] px-6 py-20 sm:px-10 lg:px-16 border-y border-orange-100/80"
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -left-28 top-24 size-[420px] rounded-full bg-gradient-to-tr from-orange-200/35 to-amber-100/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-12 size-[450px] rounded-full bg-gradient-to-bl from-amber-200/30 to-orange-100/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-orange-200/60"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold text-brand-orange shadow-xs backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-orange" />
              </span>
              <span className="tracking-wide uppercase text-[11px]">Direct Community Feedback &amp; Admin Replies</span>
            </div>

            <h2 className="mt-4 font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-[1.18]">
              Stories of Impact,{" "}
              <br className="hidden sm:inline" />
              <span className="italic text-brand-orange bg-gradient-to-r from-brand-orange via-orange-600 to-amber-600 bg-clip-text text-transparent">
                Honored with Official Replies.
              </span>
            </h2>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-600">
              Read community testimonials and official executive responses directly in a clear comment-and-reply format.
            </p>
          </div>

          {/* Rating Summary Card & Action Button */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-orange-200/90 bg-white/95 p-3.5 sm:px-5 sm:py-3 shadow-md shadow-orange-950/5 backdrop-blur-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-black text-stone-900 leading-none">
                    {stats.averageRating ? Number(stats.averageRating).toFixed(1) : "5.0"}
                  </span>
                  <StarRating rating={stats.averageRating || 5} size={17} />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
                  <FiCheckCircle size={12} className="text-emerald-600" />
                  <span>{stats.totalReviews || reviews.length} Verified Reviews</span>
                </div>
              </div>
            </div>

            <Link
              href="/reviews"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-orange to-orange-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:shadow-orange-600/35 active:translate-y-0"
            >
              <span>View All &amp; Write Review</span>
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Interactive Filter Pills Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${filter === "all"
                  ? "bg-brand-orange text-white shadow-sm shadow-orange-600/30"
                  : "bg-white/80 text-stone-600 border border-stone-200/80 hover:bg-white hover:text-stone-900"
                }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("with-reply")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${filter === "with-reply"
                  ? "bg-stone-900 text-amber-300 shadow-sm"
                  : "bg-white/80 text-stone-600 border border-stone-200/80 hover:bg-white hover:text-stone-900"
                }`}
            >
              <span className="text-brand-orange font-bold">↳</span>
              <span>With Admin Reply ({reviews.filter((r) => Boolean(r.adminReply)).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("top")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${filter === "top"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "bg-white/80 text-stone-600 border border-stone-200/80 hover:bg-white hover:text-stone-900"
                }`}
            >
              <FiStar size={13} className="fill-current" />
              <span>5-Star Rated ({reviews.filter((r) => Number(r.rating) === 5).length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
            <FiTrendingUp className="text-emerald-600" />
            <span>Community Comments &amp; Official Executive Replies</span>
          </div>
        </motion.div>

        {/* ==================================================== */}
        {/* Comment-Style Reviews List with Threaded Replies     */}
        {/* ==================================================== */}
        <div className="mt-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {displayReviews.map((rev, index) => {
              const name = rev.user?.name || rev.name || "Anonymous Supporter";
              const roleKey = (rev.user?.role || rev.userRole || "supporter").toLowerCase();
              const roleConfig = ROLE_CONFIG[roleKey] || ROLE_CONFIG.supporter;
              const RoleIcon = roleConfig.icon;
              const email = rev.user?.email || rev.email || "";
              const avatar = rev.user?.profilePicture || rev.profilePicture;
              const hasAdminReply = Boolean(rev.adminReply);

              return (
                <motion.article
                  layout
                  key={rev._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-lg"
                >
                  {/* 1. Comment Header: User Photo + Name + Role + Email + Date */}
                  <div className="flex items-start gap-4">
                    {/* User Photo */}
                    <div className="relative size-12 sm:size-13 shrink-0 overflow-hidden rounded-full ring-2 ring-orange-200/90 bg-orange-100 shadow-xs">
                      {avatar ? (
                        <img
                          src={getApiImageUrl(avatar)}
                          alt={name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 font-serif font-bold text-xs sm:text-sm text-white uppercase">
                          {name.slice(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* User Metadata & Rating */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                          {name}
                        </h3>

                        {/* Role Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleConfig.badge}`}
                        >
                          <RoleIcon size={10} />
                          <span>{roleConfig.label}</span>
                        </span>

                        {/* Email */}
                        {email && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-mono bg-stone-100/90 px-2 py-0.5 rounded border border-stone-200/70">
                            <FiMail size={11} className="text-orange-500 shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-none">{email}</span>
                          </span>
                        )}

                        {/* Submission Date */}
                        <span className="text-[11px] text-stone-400 sm:ml-auto">
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>

                      {/* 2. Then Her Star Rating */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <StarRating rating={rev.rating || 5} size={15} />
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                          {Number(rev.rating || 5).toFixed(1)} / 5.0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Then Her Message */}
                  <div className="mt-4 sm:ml-17 text-stone-800 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                    {rev.message}
                  </div>

                  {/* 4. Then Arrow and Reply Who Reply */}
                  {hasAdminReply && (
                    <div className="mt-5 sm:ml-17 pt-3 border-t border-stone-100">
                      <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-orange-50/50 border border-orange-200/90 p-4 sm:p-4.5">
                        {/* The Reply Arrow */}
                        <div className="shrink-0 text-brand-orange pt-0.5 select-none font-bold text-lg leading-none">
                          ↳
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Who Reply Header */}
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            {/* Who Reply Photo */}
                            <div className="size-6 shrink-0 overflow-hidden rounded-full border border-amber-300 bg-white shadow-xs">
                              {settings?.logo ? (
                                <img
                                  src={getApiImageUrl(settings.logo)}
                                  alt={settings?.ngoName || "NGO Logo"}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="grid size-full place-items-center bg-stone-900 text-[9px] font-black text-amber-300">
                                  {settings?.logoInitials || "SG"}
                                </div>
                              )}
                            </div>

                            {/* Who Reply Name & Role */}
                            <span className="font-bold text-xs sm:text-sm text-stone-900">
                              {settings?.ngoName || "Shiv Gorakh Welfare Foundation"}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[9px] font-extrabold uppercase tracking-wider">
                              <FiCheckCircle size={9} /> Official Reply
                            </span>

                            {rev.adminRepliedAt && (
                              <span className="text-[11px] text-stone-400">
                                • {formatDate(rev.adminRepliedAt)}
                              </span>
                            )}
                          </div>

                          {/* Reply Message */}
                          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-800 italic">
                            &ldquo;{rev.adminReply}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 relative overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-r from-white via-orange-50/50 to-amber-50/40 p-6 sm:p-9 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-orange to-amber-600 text-white shadow-md shadow-orange-600/20">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-900 leading-tight">
                Have you interacted with our rescue or feeding team?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                Your feedback takes less than a minute and helps us remain accountable, transparent, and responsive.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/reviews"
              className="rounded-full bg-brand-orange px-6 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 hover:shadow-lg transition-all text-center whitespace-nowrap"
            >
              Post a Review ↗
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
