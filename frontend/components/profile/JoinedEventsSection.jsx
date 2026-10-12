"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api, { getApiImageUrl } from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";

export default function JoinedEventsSection({
  joinedEvents = [],
  allEvents = [],
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState("joined"); // "joined" | "upcoming"
  const [processingId, setProcessingId] = useState(null);

  // Check if an event id is already joined
  const joinedEventIds = new Set(
    joinedEvents.map((r) => r.event?._id || r.event || r._id)
  );

  async function handleJoinEvent(event) {
    const eventId = event._id || event.id;
    setProcessingId(eventId);
    try {
      const res = await api.post(`/api/v1/events/${eventId}/join`, {
        title: event.title,
        date: event.date,
        description: event.description,
        imageUrls: event.imageUrls,
        location: event.location || "Rampur, Uttar Pradesh",
      });
      if (res.data?.success) {
        toast.success(res.data.message || "You have successfully joined this event!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error(getUserFacingError(err, "Failed to join event."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCancelRsvp(rsvp) {
    const eventId = rsvp.event?._id || rsvp.event || rsvp._id;
    if (!window.confirm("Cancel your RSVP attendance for this community drive?")) return;
    setProcessingId(eventId);
    try {
      const res = await api.delete(`/api/v1/events/${eventId}/cancel`);
      if (res.data?.success) {
        toast.success("Event RSVP has been cancelled.");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error(getUserFacingError(err, "Failed to cancel RSVP."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Community Drives & Field Operations
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            My Joined Welfare Events & Camps
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vaccination camps, emergency rescue drives, winter feeding, and community workshops.
          </p>
        </div>
        {/* Tab Pills */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("joined")}
            className={`rounded-lg px-4 py-2 transition ${activeTab === "joined"
              ? "bg-brand-orange text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            My Joined Camps ({joinedEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`rounded-lg px-4 py-2 transition ${activeTab === "upcoming"
              ? "bg-brand-orange text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Browse Camps ({allEvents.length})
          </button>
        </div>
      </div>

      {/* 1. MY JOINED EVENTS VIEW */}
      {activeTab === "joined" && (
        <section className="space-y-4">
          {joinedEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {joinedEvents.map((r, idx) => {
                const event = r.event || {};
                const eventTitle = r.eventTitle || event.title || "Community Welfare Camp";
                const eventDate = r.eventDate || event.date;
                const formattedDate = eventDate
                  ? new Date(eventDate).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  : "Upcoming Date";

                const isPast = eventDate ? new Date(eventDate) < new Date() : false;

                return (
                  <div
                    key={r._id || idx}
                    className="flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-white p-6 shadow-md hover:shadow-lg transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          ✓ RSVP Confirmed
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isPast ? "Camp Completed" : "Upcoming"}
                        </span>
                      </div>

                      <h3 className="mt-3 font-serif text-lg font-bold text-slate-900 leading-snug">
                        {eventTitle}
                      </h3>

                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>🗓️</span> <span>{formattedDate}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <span>📍</span> <span>{r.eventLocation || event.location || "Rampur Rescue Grounds, U.P."}</span>
                        </p>
                      </div>

                      {event.description && (
                        <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700">
                        Field Volunteer Roster
                      </span>

                      {!isPast && (
                        <button
                          type="button"
                          onClick={() => handleCancelRsvp(r)}
                          disabled={processingId === (r.event?._id || r.event || r._id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                        >
                          Cancel RSVP
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
              <span className="text-3xl block">🗓️</span>
              <h3 className="font-serif text-lg font-bold text-slate-800">
                You haven't joined any upcoming camps yet.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore our upcoming anti-rabies vaccination camps, winter rescue drives, and feeding rounds. Click 'Browse Camps' to RSVP!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className="inline-flex rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 text-xs font-bold transition"
              >
                Browse Upcoming Camps →
              </button>
            </div>
          )}
        </section>
      )}

      {/* 2. BROWSE ALL UPCOMING CAMPS */}
      {activeTab === "upcoming" && (
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {allEvents.map((ev, idx) => {
              const eventId = ev._id || ev.id || `ev-${idx}`;
              const isJoined = joinedEventIds.has(eventId);
              const eventDate = ev.date
                ? new Date(ev.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                : "Upcoming Schedule";

              return (
                <div
                  key={eventId}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                          Foundation Camp
                        </span>
                        <span className="rounded-full bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 text-[10px] font-bold text-orange-900">
                          👥 {ev.attendeesCount ?? ev.rsvpsCount ?? 0} Joined
                        </span>
                      </div>
                      {isJoined && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Joined
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-serif text-lg font-bold text-slate-900 leading-snug">
                      {ev.title}
                    </h3>

                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>🗓️</span> <span>{eventDate}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <span>📍</span> <span>{ev.location || "Rampur Rescue Grounds, Civil Lines, Rampur"}</span>
                      </p>
                    </div>

                    {ev.description && (
                      <p className="mt-3 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Open to all Volunteers & Members
                    </span>

                    {isJoined ? (
                      <span className="text-xs font-bold text-emerald-700">
                        RSVP Confirmed ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleJoinEvent(ev)}
                        disabled={processingId === eventId}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-orange hover:opacity-95 text-white px-4 py-2 text-xs font-bold shadow-md transition disabled:opacity-50"
                      >
                        <span>{processingId === eventId ? "Joining…" : "Join This Camp"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
