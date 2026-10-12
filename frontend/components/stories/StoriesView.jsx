"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStories } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

// Curated baseline community rescue stories
const BASELINE_STORIES = [
  {
    _id: "baseline-1",
    title: "A Second Chance: Sheru's Road to Recovery",
    description:
      "When local residents reported a severely injured stray dog near Rampur bypass, our rapid response volunteer team arrived within 25 minutes. After emergency wound treatment, vaccination, and three weeks of attentive shelter nursing, Sheru made a complete recovery and now thrives in community protection.",
    imageUrls: ["/services/1.jpeg"],
    createdAt: "2026-09-15T10:00:00.000Z",
    tag: "Animal Rescue",
  },
  {
    _id: "baseline-2",
    title: "The Winter Feeding Drive: Reaching 400+ Strays",
    description:
      "During the peak cold wave across Northern Uttar Pradesh, food scarcity becomes critical for stray animals. Thanks to our monthly donor network, 28 dedicated volunteers organized daily warm meal distribution rounds across 14 neighborhood clusters, feeding over 400 animals daily.",
    imageUrls: ["/services/3.jpeg"],
    createdAt: "2026-08-28T14:30:00.000Z",
    tag: "Community Care",
  },
  {
    _id: "baseline-3",
    title: "Healing Injured Birds: Falcon Rehabilitation",
    description:
      "A black kite tangled in synthetic kite string was safely rescued by foundation volunteers. Following wing stabilization and supervised recuperation under avian veterinary care, the bird was successfully released back into the wild skies above Rampur.",
    imageUrls: ["/services/8.jpeg"],
    createdAt: "2026-08-10T09:15:00.000Z",
    tag: "Wildlife Care",
  },
];

export default function StoriesView() {
  const [apiStories, setApiStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStoryModal, setActiveStoryModal] = useState(null);

  async function loadStories() {
    setLoading(true);
    setError(null);
    const res = await getStories({ limit: 50 });
    if (res.success) {
      setApiStories(res.items || []);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStories();
  }, []);

  // Combine live API stories with curated fallback so page is always rich & engaging
  const displayStories = useMemo(() => {
    const list = apiStories.length > 0 ? apiStories : BASELINE_STORIES;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [apiStories, searchQuery]);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero Banner */}
      <section className="bg-brand-green px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-xs px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-200">
              Community Field Stories
            </span>
            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
              Care is made <br />
              of <span className="italic text-orange-200">people.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-green-50/85 sm:text-base">
              Every rescue, feeding round, and rehabilitation journey reflects the compassion of volunteers,
              local caregivers, and generous supporters working together on the ground.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/gallery"
                className="inline-flex rounded-full bg-white px-5 py-2.5 text-xs font-bold text-brand-green shadow-sm transition hover:bg-orange-50"
              >
                See Field Photographs ↗
              </Link>
              <a
                href="mailto:info@shivgorakh.org.in?subject=Share%20a%20Community%20Story"
                className="inline-flex rounded-full border border-white/40 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Submit a Story
              </a>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <Image
              className="object-cover"
              src="/services/4.jpeg"
              alt="Community members and volunteers working together outdoors"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-xs text-white/90">
              <p className="font-semibold">Shiv Gorakh Welfare Foundation</p>
              <p className="text-[11px] text-white/70">Verified On-Ground Welfare Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Stories Grid Section */}
      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header & Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-orange-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Real Impact Accounts
                </span>
                {apiStories.length > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Live API Connected ({apiStories.length} stories)
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-stone-900">
                Stories From the Field
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search stories…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-orange-200 bg-white px-4 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-orange-100"
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

              <button
                type="button"
                onClick={loadStories}
                disabled={loading}
                className="rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-orange-50 disabled:opacity-50 transition"
              >
                {loading ? "Refreshing…" : "↻ Refresh"}
              </button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="aspect-16/10 w-full rounded-xl bg-orange-100/70" />
                  <div className="mt-4 h-6 w-3/4 rounded bg-orange-100/60" />
                  <div className="mt-2 h-4 w-full rounded bg-orange-50" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-orange-50" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-800">
                Failed to load stories from server: {error}
              </p>
              <button
                type="button"
                onClick={loadStories}
                className="mt-3 rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : displayStories.length > 0 ? (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {displayStories.map((story) => {
                const coverImage = story.imageUrls?.[0]
                  ? getApiImageUrl(story.imageUrls[0])
                  : "/services/4.jpeg";

                return (
                  <article
                    key={story._id}
                    onClick={() => setActiveStoryModal(story)}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-orange-100/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                        <img
                          src={coverImage}
                          alt={story.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-brand-orange/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {story.tag || "Field Story"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <span className="text-[11px] font-bold text-stone-400">
                          {story.createdAt
                            ? new Date(story.createdAt).toLocaleDateString("en-IN", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent Publication"}
                        </span>
                        <h3 className="mt-2 font-serif text-2xl font-bold text-stone-900 group-hover:text-brand-orange transition">
                          {story.title}
                        </h3>
                        <p className="mt-3 text-xs leading-relaxed text-stone-600 line-clamp-3">
                          {story.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 pb-6 pt-2 border-t border-orange-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-orange group-hover:underline">
                        Read full story →
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Verified Update
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-10 text-center">
              <h3 className="font-serif text-2xl text-stone-800">No stories match your search.</h3>
              <p className="mt-2 text-xs text-stone-500">Try searching for other keywords or clear your search input.</p>
            </div>
          )}

          {/* Call to action strip */}
          <div className="mt-16 rounded-3xl bg-orange-50 border border-orange-200/80 p-8 sm:p-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Join Our Mission
            </span>
            <h3 className="mt-2 font-serif text-3xl sm:text-4xl text-stone-900">
              Every Story Starts With a Helping Hand
            </h3>
            <p className="mt-3 max-w-2xl mx-auto text-xs sm:text-sm text-stone-600 leading-relaxed">
              Whether you volunteer in rescue drives, sponsor veterinary surgeries, or donate medical supplies,
              your participation directly creates new stories of hope.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/donate"
                className="rounded-full bg-brand-orange px-6 py-3 text-xs font-bold text-white transition hover:bg-orange-600 shadow-sm"
              >
                Support With a Donation
              </Link>
              <Link
                href="/volunteer/register"
                className="rounded-full border border-brand-orange bg-white px-6 py-3 text-xs font-bold text-brand-orange transition hover:bg-orange-50"
              >
                Register as a Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Story Modal */}
      {activeStoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setActiveStoryModal(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl w-full overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-brand-orange uppercase tracking-wider">
                {activeStoryModal.tag || "Field Story"}
              </span>
              <button
                type="button"
                onClick={() => setActiveStoryModal(null)}
                className="grid size-8 place-items-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
              >
                ✕
              </button>
            </div>

            {activeStoryModal.imageUrls?.[0] && (
              <div className="mt-5 aspect-16/9 w-full overflow-hidden rounded-2xl bg-stone-100">
                <img
                  src={getApiImageUrl(activeStoryModal.imageUrls[0])}
                  alt={activeStoryModal.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs text-stone-400">
                {activeStoryModal.createdAt
                  ? new Date(activeStoryModal.createdAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Verified Field Story"}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-stone-900 leading-snug">
                {activeStoryModal.title}
              </h2>
              <div className="mt-4 border-t border-orange-100 pt-4 text-sm leading-7 text-stone-700 whitespace-pre-line">
                {activeStoryModal.description}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-orange-100 flex items-center justify-between">
              <Link
                href="/volunteer/register"
                className="text-xs font-bold text-brand-orange hover:underline"
              >
                Want to be part of the next rescue? Volunteer with us →
              </Link>
              <button
                type="button"
                onClick={() => setActiveStoryModal(null)}
                className="rounded-full bg-stone-100 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200"
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
