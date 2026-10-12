"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiCheckCircle,
  FiPlus,
  FiClock,
  FiMapPin,
  FiX,
  FiCalendar,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import api, { getApiImageUrl } from "@/lib/authApi";
import { getEvents } from "@/lib/contentService";
import getUserFacingError from "@/lib/getUserFacingError";

// Curated baseline events for rich experience when DB has fresh setup
const BASELINE_EVENTS = [
  {
    _id: "event-base-1",
    title: "Mega Anti-Rabies Vaccination & Deworming Camp",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days in future
    description:
      "Free medical checkups, vaccination against rabies, and deworming treatments for stray dogs and community pets across Rampur city. Certified veterinarians and trained volunteers will be on site with transport vehicles.",
    imageUrls: ["/services/5.jpeg"],
    location: "Foundation Rescue Ground, Civil Lines, Rampur",
    time: "09:00 AM – 03:00 PM",
    attendeesCount: 14,
  },
  {
    _id: "event-base-2",
    title: "Community Winter Feeder & Shelter Drive",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days in future
    description:
      "Join us in setting up insulated bedding boxes and distributed feed points for community animals facing severe northern winter conditions. Open to youth, college students, and volunteer caregivers.",
    imageUrls: ["/services/6.jpeg"],
    location: "Railway Station Road & Surrounding Clusters, Rampur",
    time: "10:00 AM – 02:00 PM",
    attendeesCount: 9,
  },
  {
    _id: "event-base-3",
    title: "Humane Animal Care & First-Aid Workshop",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    description:
      "Hands-on training session for volunteers on recognizing distress signs in street animals, safe handling of injured canines, wound dressing, and emergency hotline dispatch procedures.",
    imageUrls: ["/services/10.jpeg"],
    location: "Community Center Hall, Rampur",
    time: "11:00 AM – 04:00 PM",
    attendeesCount: 26,
  },
];

function formatEventBadgeDate(dateString) {
  if (!dateString) return { month: "DATE", day: "--", year: "" };
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return { month: "DATE", day: "--", year: "" };
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    year: d.getFullYear(),
  };
}

function formatFullDateTime(dateString) {
  if (!dateString) return "Date to be confirmed";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Date to be confirmed";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsView() {
  const router = useRouter();
  const user = useSelector((state) => state.auth?.user);

  const [apiEvents, setApiEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "upcoming" | "past"
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEventModal, setActiveEventModal] = useState(null);

  // User RSVP state for 1-click joining
  const [myJoinedEventIds, setMyJoinedEventIds] = useState(new Set());
  const [joiningEventId, setJoiningEventId] = useState(null);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    const res = await getEvents({ limit: 50 });
    if (res.success) {
      setApiEvents(res.items || []);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // Fetch current user's joined events
  useEffect(() => {
    async function loadUserJoined() {
      if (!user) {
        setMyJoinedEventIds(new Set());
        return;
      }
      try {
        const res = await api.get("/api/v1/events/my-joined");
        if (res.data?.success && Array.isArray(res.data.data)) {
          const ids = new Set(
            res.data.data.map((r) => String(r.event?._id || r.event || r._id))
          );
          setMyJoinedEventIds(ids);
        }
      } catch {
        // Non-blocking
      }
    }
    loadUserJoined();
  }, [user]);

  const allEvents = useMemo(() => {
    return apiEvents.length > 0 ? apiEvents : BASELINE_EVENTS;
  }, [apiEvents]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return allEvents.filter((ev) => {
      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          ev.title?.toLowerCase().includes(q) ||
          ev.description?.toLowerCase().includes(q) ||
          ev.location?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Tab check
      if (activeTab === "upcoming") {
        const evDate = new Date(ev.date);
        return !Number.isNaN(evDate.getTime()) && evDate >= now;
      }
      if (activeTab === "past") {
        const evDate = new Date(ev.date);
        return !Number.isNaN(evDate.getTime()) && evDate < now;
      }
      return true;
    });
  }, [allEvents, searchQuery, activeTab]);

  // Single-Click Join Handler
  async function handleSingleClickJoin(event, e) {
    if (e) e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to join this event in 1 click!");
      router.push("/login?redirect=/events");
      return;
    }

    const eventId = String(event._id || event.id);
    setJoiningEventId(eventId);

    try {
      const res = await api.post(`/api/v1/events/${eventId}/join`, {
        title: event.title,
        date: event.date,
        description: event.description,
        imageUrls: event.imageUrls,
        location: event.location || "Foundation Rescue Ground, Civil Lines, Rampur",
      });

      if (res.data?.success) {
        toast.success(res.data.message || "RSVP Confirmed! You joined this event.");
        setMyJoinedEventIds((prev) => new Set([...prev, eventId]));
        // Optimistically increment attendee count
        setApiEvents((prev) =>
          prev.map((ev) =>
            String(ev._id) === eventId
              ? { ...ev, attendeesCount: (ev.attendeesCount || 0) + 1 }
              : ev
          )
        );
      }
    } catch (err) {
      toast.error(getUserFacingError(err, "Failed to join event."));
    } finally {
      setJoiningEventId(null);
    }
  }

  // Cancel RSVP Handler
  async function handleCancelJoin(event, e) {
    if (e) e.stopPropagation();

    if (!window.confirm(`Cancel your attendance for "${event.title}"?`)) return;

    const eventId = String(event._id || event.id);
    setJoiningEventId(eventId);

    try {
      const res = await api.delete(`/api/v1/events/${eventId}/cancel`);
      if (res.data?.success) {
        toast.success("RSVP cancelled.");
        setMyJoinedEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        // Optimistically decrement attendee count
        setApiEvents((prev) =>
          prev.map((ev) =>
            String(ev._id) === eventId
              ? { ...ev, attendeesCount: Math.max(0, (ev.attendeesCount || 1) - 1) }
              : ev
          )
        );
      }
    } catch (err) {
      toast.error(getUserFacingError(err, "Failed to cancel RSVP."));
    } finally {
      setJoiningEventId(null);
    }
  }

  // Calculate total people joined across all events
  const totalJoinedAcrossEvents = useMemo(() => {
    return allEvents.reduce((sum, ev) => sum + (ev.attendeesCount || ev.rsvpsCount || 0), 0);
  }, [allEvents]);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero Header */}
      {/* <section className="bg-brand-green px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-xs px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-200">
                Meet · Connect · Take Part
              </span>
              <span className="rounded-full bg-orange-500/30 px-3 py-1 text-xs font-bold text-orange-200 border border-orange-400/30">
                👥 {totalJoinedAcrossEvents}+ Participants Active
              </span>
            </div>

            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
              Good work is <br />
              better <span className="italic text-orange-200">together.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-green-50/85 sm:text-base">
              Join upcoming vaccination camps, feeding drives, and educational workshops across Rampur.
              Every drive is free, community-driven, and open to all supporters with 1-click attendance.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-orange-600"
                >
                  <span>My Joined Camps ({myJoinedEventIds.size})</span>
                  <FiArrowRight size={13} />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-orange-600"
                >
                  <span>Sign Up in 1 Minute</span>
                  <FiArrowRight size={13} />
                </Link>
              )}

              <a
                href="mailto:info@shivgorakh.org.in?subject=Propose%20a%20Community%20Drive"
                className="inline-flex rounded-full border border-white/40 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Propose an Event
              </a>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <Image
              className="object-cover"
              src="/services/10.jpeg"
              alt="Volunteers carrying out hands-on field welfare activities"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-xs text-white/90">
              <p className="font-semibold">Hands-on Compassion in Action</p>
              <p className="text-[11px] text-white/70">Rampur, Uttar Pradesh & Surrounding Regions</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Events Listing Section */}
      <section className="px-5 pt-5 pb-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Filter, Search & Refresh Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-orange-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Foundation Schedule
                </span>
                {apiEvents.length > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Live ({apiEvents.length} events)
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-stone-900">
                Community Events &amp; Field Camps
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Tab Pills */}
              <div className="flex rounded-full bg-white border border-orange-200 p-1 text-xs font-bold">
                {[
                  { id: "all", label: "All" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "past", label: "Past Drives" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-3.5 py-1.5 transition cursor-pointer ${activeTab === tab.id
                      ? "bg-brand-orange text-white"
                      : "text-stone-600 hover:text-stone-950"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={loadEvents}
                disabled={loading}
                className="rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-orange-50 disabled:opacity-50 transition cursor-pointer"
                title="Refresh events"
              >
                <FiRefreshCw className={loading ? "animate-spin text-brand-orange" : ""} size={13} />
              </button>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Search events, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-orange-200 bg-white px-4 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-orange-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>


            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="mt-8 space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex flex-col md:flex-row gap-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                  <div className="h-44 w-full md:w-64 rounded-xl bg-orange-100/70 shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-6 w-3/4 rounded bg-orange-100/60" />
                    <div className="h-4 w-1/3 rounded bg-orange-50" />
                    <div className="h-16 w-full rounded bg-orange-50/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-800">
                Failed to load events from server: {error}
              </p>
              <button
                type="button"
                onClick={loadEvents}
                className="mt-3 rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white transition hover:bg-orange-600 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="mt-8 space-y-6">
              {filteredEvents.map((event) => {
                const eventId = String(event._id || event.id);
                const badge = formatEventBadgeDate(event.date);
                const isUpcoming = event.date && new Date(event.date) >= new Date();
                const coverImage = event.imageUrls?.[0]
                  ? getApiImageUrl(event.imageUrls[0])
                  : "/services/5.jpeg";
                const isJoined = myJoinedEventIds.has(eventId);
                const isProcessing = joiningEventId === eventId;
                const attendeesCount = event.attendeesCount ?? event.rsvpsCount ?? 0;

                return (
                  <article
                    key={eventId}
                    onClick={() => setActiveEventModal(event)}
                    className="group flex flex-col md:flex-row overflow-hidden rounded-3xl border border-orange-100/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                  >
                    {/* Event image */}
                    <div className="relative h-56 md:h-auto md:w-72 shrink-0 overflow-hidden bg-stone-100">
                      <img
                        src={coverImage}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Top status badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ${isUpcoming ? "bg-emerald-600/90" : "bg-stone-700/80"
                            }`}
                        >
                          {isUpcoming ? "Upcoming Drive" : "Completed Event"}
                        </span>

                        {/* Top Attendee Count Chip */}
                        <span className="rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-amber-200 border border-white/20 flex items-center gap-1">
                          <FiUsers size={11} />
                          <span>{attendeesCount} Joined</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {/* Date & Title */}
                        <div className="flex items-start gap-4">
                          {/* Calendar Day Box */}
                          <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-center min-w-[62px]">
                            <span className="text-[10px] font-bold tracking-wider text-brand-orange">
                              {badge.month}
                            </span>
                            <span className="text-2xl font-black text-stone-900 leading-none mt-0.5">
                              {badge.day}
                            </span>
                            <span className="text-[9px] text-stone-500 font-medium">
                              {badge.year}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-serif text-2xl font-bold text-stone-900 group-hover:text-brand-orange transition">
                              {event.title}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                              <span className="flex items-center gap-1 font-medium text-stone-700">
                                <FiClock size={12} className="text-brand-orange" />
                                <span>{formatFullDateTime(event.date)}</span>
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <FiMapPin size={12} className="text-brand-orange" />
                                  <span>{event.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-stone-600 line-clamp-3">
                          {event.description}
                        </p>

                        {/* PARTICIPANT STATS PILL */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200/90 px-3.5 py-1 text-xs font-bold text-orange-900">
                            <FiUsers className="text-brand-orange" size={13} />
                            <span>
                              {attendeesCount}{" "}
                              {attendeesCount === 1 ? "Person has" : "People have"} joined this camp
                            </span>
                          </div>

                          {isJoined && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                              <FiCheckCircle size={12} />
                              <span>You're Attending</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action strip: 1-Click Join / Cancel RSVP */}
                      <div className="mt-6 pt-4 border-t border-orange-100 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-bold text-brand-orange group-hover:underline flex items-center gap-1">
                          <span>View full camp itinerary</span>
                          <FiArrowRight size={12} />
                        </span>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {isUpcoming ? (
                            isJoined ? (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={(e) => handleCancelJoin(event, e)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 disabled:opacity-50 cursor-pointer shadow-2xs"
                                title="Click to cancel your RSVP"
                              >
                                {isProcessing ? (
                                  <span className="size-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiCheckCircle size={13} />
                                )}
                                <span>Attending · Leave</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={(e) => handleSingleClickJoin(event, e)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/30 transition hover:bg-orange-600 hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
                              >
                                {isProcessing ? (
                                  <>
                                    <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Joining…</span>
                                  </>
                                ) : (
                                  <>
                                    <FiPlus size={13} />
                                    <span>Join in 1-Click</span>
                                  </>
                                )}
                              </button>
                            )
                          ) : (
                            <span className="text-xs text-stone-400 font-medium">
                              Field records archived ({attendeesCount} attended)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 p-12 text-center">
              <h3 className="font-serif text-2xl text-stone-800">
                No events match this filter.
              </h3>
              <p className="mt-2 text-xs text-stone-500">
                Try switching the tab above or clearing your search keywords.
              </p>
            </div>
          )}

          {/* Volunteer / Support invitation footer */}
          <div className="mt-16 rounded-3xl bg-brand-green p-8 sm:p-12 text-white text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-200">
              Be Part of the Action
            </span>
            <h3 className="mt-2 font-serif text-3xl sm:text-4xl text-white">
              Want to Help Organize a Welfare Camp?
            </h3>
            <p className="mt-3 max-w-2xl mx-auto text-xs sm:text-sm text-green-50/85 leading-relaxed">
              We welcome doctors, student volunteers, and neighborhood caregivers who want to
              bring medical aid, food drives, and humane awareness to their local localities.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/volunteer/register"
                className="rounded-full bg-brand-orange px-6 py-3 text-xs font-bold text-white transition hover:bg-orange-600"
              >
                Register as a Volunteer
              </Link>
              <a
                href="mailto:info@shivgorakh.org.in?subject=Suggest%20an%20Event%20Location"
                className="rounded-full border border-white/40 px-6 py-3 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Suggest a Location
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* EVENT DETAILS & 1-CLICK JOIN MODAL                       */}
      {/* ======================================================== */}
      {activeEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setActiveEventModal(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-2xl w-full overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-brand-orange uppercase tracking-wider">
                  Event Briefing
                </span>
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200/80 flex items-center gap-1">
                  <FiUsers size={12} />
                  <span>
                    {activeEventModal.attendeesCount ?? activeEventModal.rsvpsCount ?? 0} Joined
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveEventModal(null)}
                className="grid size-8 place-items-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {activeEventModal.imageUrls?.[0] && (
              <div className="mt-5 aspect-16/9 w-full overflow-hidden rounded-2xl bg-stone-100">
                <img
                  src={getApiImageUrl(activeEventModal.imageUrls[0])}
                  alt={activeEventModal.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-5">
              <h2 className="font-serif text-3xl font-bold text-stone-900 leading-snug">
                {activeEventModal.title}
              </h2>

              {/* Schedule, Venue & Attendees Stats */}
              <div className="mt-4 grid sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-orange-50 border border-orange-100 text-xs">
                <div>
                  <span className="font-bold text-stone-500 uppercase text-[10px] block">
                    Schedule & Timing
                  </span>
                  <span className="font-semibold text-stone-900">
                    {formatFullDateTime(activeEventModal.date)}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-stone-500 uppercase text-[10px] block">
                    Venue / Locality
                  </span>
                  <span className="font-semibold text-stone-900">
                    {activeEventModal.location || "Rampur & Assigned Regional Centers"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-stone-500 uppercase text-[10px] block">
                    Community Participation
                  </span>
                  <span className="font-bold text-brand-orange flex items-center gap-1">
                    <FiUsers size={12} />
                    <span>
                      {activeEventModal.attendeesCount ?? activeEventModal.rsvpsCount ?? 0} People Joined
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-orange-100 pt-4 text-sm leading-7 text-stone-700 whitespace-pre-line">
                {activeEventModal.description}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-orange-100 flex flex-wrap items-center justify-between gap-3">
              {myJoinedEventIds.has(String(activeEventModal._id || activeEventModal.id)) ? (
                <button
                  type="button"
                  disabled={joiningEventId === String(activeEventModal._id || activeEventModal.id)}
                  onClick={(e) => handleCancelJoin(activeEventModal, e)}
                  className="rounded-full bg-emerald-50 border border-emerald-300 px-5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition cursor-pointer"
                >
                  ✓ You're Attending (Cancel RSVP)
                </button>
              ) : (
                <button
                  type="button"
                  disabled={joiningEventId === String(activeEventModal._id || activeEventModal.id)}
                  onClick={(e) => handleSingleClickJoin(activeEventModal, e)}
                  className="rounded-full bg-brand-orange px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-600 shadow-md shadow-orange-600/30 transition cursor-pointer"
                >
                  Join This Event in 1-Click →
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveEventModal(null)}
                className="rounded-full bg-stone-100 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
