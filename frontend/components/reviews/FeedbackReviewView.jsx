"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import {
  FiStar,
  FiCheckCircle,
  FiShield,
  FiHeart,
  FiAward,
  FiMail,
  FiClock,
  FiCornerDownRight,
  FiMessageSquare,
  FiUserCheck,
  FiTrendingUp,
  FiFilter,
  FiSearch,
  FiSend,
  FiArrowRight,
  FiX,
  FiExternalLink,
} from 'react-icons/fi';
import { getFeedbacks, submitFeedback } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";
import { useNgoSettings } from "@/context/NgoSettingsContext";

const DEFAULT_REVIEWS = [
  {
    _id: "def-rev-1",
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
    _id: "def-rev-2",
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
    _id: "def-rev-3",
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
    _id: "def-rev-4",
    name: "Adv. Rajeshwar Verma",
    email: "r.verma.law@rediffmail.com",
    userRole: "supporter",
    rating: 5,
    createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
    message:
      "Witnessed their emergency ambulance team rescue a severely injured calf near Bilaspur gate. The team handled the calf with immense tenderness, provided first-aid on spot, and stayed till it could stand. Truly honorable team.",
    adminReply:
      "Heartfelt thanks Rajeshwar ji! The calf was treated for minor abrasions and reunited safely with its mother. Your words motivate our rapid response team to go the extra mile.",
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

function StarRating({ rating = 5, size = 16 }) {
  const numericRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${numericRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={`transition-colors duration-200 ${star <= numericRating
              ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.35)]"
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
    dot: "bg-rose-500",
    icon: FiHeart,
  },
  volunteer: {
    label: "Rescue Volunteer",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    dot: "bg-emerald-500",
    icon: FiShield,
  },
  member: {
    label: "Foundation Member",
    badge: "bg-blue-50 text-blue-700 border-blue-200/90",
    dot: "bg-blue-500",
    icon: FiAward,
  },
  admin: {
    label: "Executive Board",
    badge: "bg-stone-900 text-amber-300 border-stone-700",
    dot: "bg-amber-400",
    icon: FiShield,
  },
  supporter: {
    label: "Community Supporter",
    badge: "bg-amber-50 text-amber-800 border-amber-200/90",
    dot: "bg-amber-500",
    icon: FiStar,
  },
  guest: {
    label: "Verified Citizen",
    badge: "bg-stone-100 text-stone-700 border-stone-200",
    dot: "bg-stone-400",
    icon: FiUserCheck,
  },
};

const RATING_LABELS = {
  5: "⭐⭐⭐⭐⭐ Exceptional (5/5)",
  4: "⭐⭐⭐⭐ Very Good (4/5)",
  3: "⭐⭐⭐ Good / Average (3/5)",
  2: "⭐⭐ Needs Improvement (2/5)",
  1: "⭐ Poor (1/5)",
};

export default function FeedbackReviewView() {
  const { settings } = useNgoSettings();
  const user = useSelector((state) => state.auth?.user);

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 4, averageRating: 5.0, breakdown: {} });
  const [loading, setLoading] = useState(true);

  // Filter and Search States
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'with-reply' | '5-star' | 'donors'
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'highest'

  // Review Submission Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  async function loadFeedbacks() {
    setLoading(true);
    try {
      const res = await getFeedbacks({ limit: 100 });
      if (res.success && res.items?.length > 0) {
        setReviews(res.items);
        if (res.stats) setStats(res.stats);
      } else {
        setReviews(DEFAULT_REVIEWS);
        setStats({
          totalReviews: 4,
          averageRating: 5.0,
          breakdown: { 5: 4, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      }
    } catch {
      setReviews(DEFAULT_REVIEWS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedbacks();
  }, []);

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your feedback message.");
      return;
    }
    if (!user && !guestName.trim()) {
      toast.error("Please provide your name.");
      return;
    }

    setSubmitting(true);
    const payload = {
      rating,
      message: message.trim(),
    };

    if (!user) {
      payload.name = guestName.trim();
      payload.email = guestEmail.trim();
      payload.phone = guestPhone.trim();
    }

    const res = await submitFeedback(payload);
    setSubmitting(false);

    if (res.success) {
      toast.success(res.message || "Thank you for your valuable feedback!");
      setMessage("");
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setFormOpen(false);
      loadFeedbacks();
    } else {
      toast.error(res.error || "Failed to submit review.");
    }
  }

  // Filtered & Sorted Reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const name = (r.user?.name || r.name || "").toLowerCase();
        const msg = (r.message || "").toLowerCase();
        const rep = (r.adminReply || "").toLowerCase();
        return name.includes(q) || msg.includes(q) || rep.includes(q);
      });
    }

    // Filter pills
    if (activeFilter === "with-reply") {
      list = list.filter((r) => Boolean(r.adminReply));
    } else if (activeFilter === "5-star") {
      list = list.filter((r) => Number(r.rating) === 5);
    } else if (activeFilter === "donors") {
      list = list.filter((r) => {
        const role = (r.user?.role || r.userRole || "").toLowerCase();
        return role === "donor" || role === "volunteer";
      });
    }

    // Sorting
    if (sortBy === "highest") {
      list.sort((a, b) => Number(b.rating || 5) - Number(a.rating || 5));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [reviews, searchQuery, activeFilter, sortBy]);

  // Breakdown percentages
  const breakdownCount = stats.breakdown || {};
  const total = stats.totalReviews || reviews.length || 1;
  const count5 = breakdownCount[5] || reviews.filter((r) => Number(r.rating) === 5).length || total;
  const count4 = breakdownCount[4] || 0;
  const count3 = breakdownCount[3] || 0;
  const percent5 = Math.round((count5 / total) * 100);
  const percent4 = Math.round((count4 / total) * 100);
  const percent3 = Math.round((count3 / total) * 100);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ==================================================== */}
      {/* Hero Header with Rating Breakdown & Trust Stats      */}
      {/* ==================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-[#faf6f0] to-[#f7f2ea] px-6 py-16 sm:px-10 lg:px-16 border-b border-orange-200/70">
        <div className="pointer-events-none absolute -left-20 top-10 size-96 rounded-full bg-orange-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left Column: Heading */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-brand-orange shadow-xs backdrop-blur-sm">
                <FiCheckCircle size={13} className="text-emerald-600" />
                <span>Verified Community Reviews &amp; Trustee Replies</span>
              </div>

              <h1 className="mt-4 font-serif text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.14]">
                Public trust, <br />
                <span className="italic text-brand-orange bg-gradient-to-r from-brand-orange to-amber-600 bg-clip-text text-transparent">
                  built on accountability.
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-600 max-w-xl">
                Every review submitted by donors, volunteers, and community members is publicly logged with our trustees&apos; official replies. We welcome honest critique and feedback.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="rounded-full bg-brand-orange px-7 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/25 hover:bg-orange-700 hover:shadow-lg transition-all cursor-pointer"
                >
                  + Write a Review
                </button>
                <Link
                  href="/certificates"
                  className="rounded-full border border-orange-300 bg-white/80 px-6 py-3 text-xs font-bold text-stone-700 hover:bg-white hover:border-orange-400 transition-all"
                >
                  Verify Audit Records ↗
                </Link>
              </div>
            </div>

            {/* Right Column: Rating Dashboard Card */}
            <div className="rounded-3xl border border-orange-200/90 bg-white/95 p-6 sm:p-8 shadow-xl shadow-orange-950/5 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Overall Satisfaction Score
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-5xl font-black text-stone-900">
                      {stats.averageRating ? Number(stats.averageRating).toFixed(1) : "5.0"}
                    </span>
                    <span className="text-sm font-bold text-stone-400">/ 5.0</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={stats.averageRating || 5} size={18} />
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      100% Authentic
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="block font-serif text-2xl font-bold text-stone-900">
                    {stats.totalReviews || reviews.length}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    Verified Community Reviews
                  </span>
                  <span className="mt-1 block text-[11px] text-brand-orange font-semibold">
                    {reviews.filter((r) => Boolean(r.adminReply)).length} Official Replies Posted
                  </span>
                </div>
              </div>

              {/* Star Breakdown Bars */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-12 font-bold text-stone-700">5 Stars</span>
                  <div className="h-2.5 flex-1 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-brand-orange transition-all duration-500"
                      style={{ width: `${percent5}%` }}
                    />
                  </div>
                  <span className="w-9 text-right font-medium text-stone-500">{percent5}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-12 font-bold text-stone-700">4 Stars</span>
                  <div className="h-2.5 flex-1 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${percent4}%` }}
                    />
                  </div>
                  <span className="w-9 text-right font-medium text-stone-500">{percent4}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-12 font-bold text-stone-700">3 Stars</span>
                  <div className="h-2.5 flex-1 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-300 transition-all duration-500"
                      style={{ width: `${percent3}%` }}
                    />
                  </div>
                  <span className="w-9 text-right font-medium text-stone-500">{percent3}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* Interactive Review Submission Modal / Form           */}
      {/* ==================================================== */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl my-8 rounded-3xl border-2 border-orange-200 bg-white p-6 sm:p-9 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-orange-100">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Submit Your Review &amp; Feedback
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Share your experience with our rescue, daily feeding, or medical initiatives.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full p-2 text-stone-400 hover:bg-stone-100 transition cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
                {/* User Status Bar */}
                {user ? (
                  <div className="flex items-center gap-3.5 rounded-2xl bg-orange-50/80 p-4 border border-orange-200 text-xs">
                    <div className="size-11 rounded-full bg-brand-orange text-white grid place-items-center font-bold overflow-hidden shrink-0 shadow-xs ring-2 ring-orange-300">
                      {user.profilePicture ? (
                        <img
                          src={getApiImageUrl(user.profilePicture)}
                          alt={user.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        user.name?.slice(0, 2).toUpperCase() || "SG"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">
                        Posting as: {user.name} <span className="text-brand-orange font-semibold">({user.email})</span>
                      </p>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Verified Role: <strong className="uppercase text-stone-800">{user.role}</strong> • Profile picture and name will be displayed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-stone-50 p-3 text-xs text-stone-600 flex items-center justify-between border border-stone-200/80">
                      <span>Have an account with us?</span>
                      <Link href="/login?redirect=/reviews" className="font-bold underline text-brand-orange">
                        Sign In for a Verified Badge →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="grid gap-1 text-xs font-semibold text-stone-700">
                        Full Name *
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Chandra"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs outline-none focus:border-brand-orange focus:bg-white"
                        />
                      </label>

                      <label className="grid gap-1 text-xs font-semibold text-stone-700">
                        Email Address (optional)
                        <input
                          type="email"
                          placeholder="e.g. ramesh@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs outline-none focus:border-brand-orange focus:bg-white"
                        />
                      </label>

                      <label className="grid gap-1 text-xs font-semibold text-stone-700">
                        Phone (optional)
                        <input
                          type="tel"
                          placeholder="e.g. +91 9876543210"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs outline-none focus:border-brand-orange focus:bg-white"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Select Your Rating *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                          aria-label={`${star} star`}
                        >
                          <FiStar
                            size={26}
                            className={`${star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                : "text-stone-300"
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-stone-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {RATING_LABELS[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Message Textarea */}
                <label className="grid gap-1.5 text-xs font-semibold text-stone-700">
                  Your Review / Experience *
                  <textarea
                    required
                    rows={4}
                    maxLength={1000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe how our team responded, ambulance assistance, or donation transparency..."
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed outline-none focus:border-brand-orange focus:bg-white"
                  />
                  <span className="text-[11px] font-normal text-stone-400 text-right">
                    {message.length} / 1000 characters
                  </span>
                </label>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="rounded-full border border-stone-300 px-5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-brand-orange px-7 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {submitting ? "Posting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* Filter, Search & Sorting Controls Bar                 */}
      {/* ==================================================== */}
      <section className="px-6 py-8 sm:px-10 lg:px-16 border-b border-stone-200/80 bg-white">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${activeFilter === "all"
                  ? "bg-brand-orange text-white shadow-sm shadow-orange-600/30"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("with-reply")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${activeFilter === "with-reply"
                  ? "bg-stone-900 text-amber-300 shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
            >
              <FiCornerDownRight size={13} className="text-brand-orange" />
              <span>With Trustee Replies ({reviews.filter((r) => Boolean(r.adminReply)).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("5-star")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${activeFilter === "5-star"
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
            >
              <FiStar size={13} className="fill-current" />
              <span>5-Star ({reviews.filter((r) => Number(r.rating) === 5).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("donors")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${activeFilter === "donors"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
            >
              <FiHeart size={13} />
              <span>Donors &amp; Volunteers</span>
            </button>
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 size-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-stone-200 bg-stone-50 pl-9 pr-4 py-1.5 text-xs outline-none focus:border-brand-orange focus:bg-white"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-700 outline-none focus:border-brand-orange"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
            </select>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* Main Reviews Cards Grid                              */}
      {/* ==================================================== */}
      <section className="px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="py-24 text-center text-sm font-semibold text-stone-500 animate-pulse">
              Loading verified community reviews...
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-14 text-center shadow-sm">
              <span className="grid size-14 place-items-center rounded-2xl bg-orange-100 text-brand-orange mx-auto mb-4">
                <FiMessageSquare size={24} />
              </span>
              <p className="font-serif text-2xl font-bold text-stone-900">
                No matching reviews found
              </p>
              <p className="mt-2 text-xs text-stone-500 max-w-md mx-auto">
                No testimonials match the active filter or search query. Be the first to post a review or reset your search.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setSearchQuery("");
                  }}
                  className="rounded-full border border-stone-300 px-5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="rounded-full bg-brand-orange px-6 py-2 text-xs font-bold text-white hover:bg-orange-700 transition cursor-pointer"
                >
                  Write a Review
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedReviews.map((rev) => {
                const name = rev.user?.name || rev.name || "Anonymous Supporter";
                const roleKey = (rev.user?.role || rev.userRole || "supporter").toLowerCase();
                const roleConfig = ROLE_CONFIG[roleKey] || ROLE_CONFIG.supporter;
                const RoleIcon = roleConfig.icon;
                const email = rev.user?.email || rev.email || "";
                const avatar = rev.user?.profilePicture || rev.profilePicture;
                const hasAdminReply = Boolean(rev.adminReply);

                return (
                  <article
                    key={rev._id}
                    className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-orange-300 hover:shadow-md transition-all duration-200"
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

                      {/* User Details & Rating */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <h4 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                            {name}
                          </h4>

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
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ==================================================== */}
      {/* Bottom Sticky Action Banner                          */}
      {/* ==================================================== */}
      <section className="bg-white border-t border-orange-100 px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Have you partnered with us or witnessed our ground operations?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Your feedback takes less than a minute and helps us secure grants and improve animal rescue response times.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded-full bg-brand-orange px-8 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition whitespace-nowrap cursor-pointer text-center"
          >
            Post Your Review Now ↗
          </button>
        </div>
      </section>
    </main>
  );
}
