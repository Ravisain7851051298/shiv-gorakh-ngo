"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBlogs } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

const DEFAULT_POSTS = [
  {
    _id: "def-post-1",
    title: "Over 500 Animals Treated in Annual Free Anti-Rabies Vaccination Camp",
    category: "News",
    author: "Veterinary Outreach Unit",
    publishedDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    summary:
      "A landmark health drive across 8 rural pockets of Rampur vaccinated stray dogs, community cats, and livestock against deadly rabies.",
    description:
      "The Shiv Gorakh Welfare Foundation successfully concluded its 3-day mass vaccination campaign across Milak, Keorar, and surrounding villages. Over 520 animals received free rabies protection, tick treatments, and general health checkups by our visiting team of certified veterinary doctors. Local ward representatives praised the foundation for proactive disease prevention and distributed animal welfare informational pamphlets to over 600 households.",
    imageUrls: ["/services/5.jpeg", "/services/6.jpeg"],
  },
  {
    _id: "def-post-2",
    title: "How Community Feeding Rounds Are Reducing Stray Aggression in Urban Pockets",
    category: "Blog",
    author: "Dr. S. K. Verma, Animal Behaviorist",
    publishedDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    summary:
      "Consistent food distribution along regular routes drastically decreases territorial disputes and fosters harmony between human residents and street animals.",
    description:
      "Hunger is the primary driver of fear and territorial tension among street dogs. When stray packs know food is reliably delivered at fixed feeding points away from busy pedestrian intersections, anxiety drops significantly. In our latest study covering Rampur market areas, incidents of growling and pack disputes decreased by over 74% following 6 months of systematic evening feeding rounds by volunteer squads.",
    imageUrls: ["/services/2.jpeg", "/services/3.jpeg"],
  },
  {
    _id: "def-post-3",
    title: "Winter Relief Alert: Protect Street Dogs from Freezing Temperatures",
    category: "Announcement",
    author: "Foundation Rescue Desk",
    publishedDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    summary:
      "Simple steps every citizen can take to keep community animals warm and protected during cold wave nights in North India.",
    description:
      "As nighttime temperatures drop in Uttar Pradesh, puppies and senior dogs face hypothermia risks. Our foundation is distributing 300+ insulated straw-filled jute sacks to warm sleeping spots. We urge residents to open porch corners, avoid pouring cold water near resting strays, and report shivering litters to our rescue helpline for emergency blanket assistance.",
    imageUrls: ["/services/10.jpeg", "/services/8.jpeg"],
  },
];

const CATEGORIES = ["All", "News", "Blog", "Announcement", "Field Story"];

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export default function NewsView() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getBlogs({ limit: 50 });
      if (res.success && res.items?.length > 0) {
        setPosts(res.items);
      } else {
        setPosts(DEFAULT_POSTS);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const t = (p.title || "").toLowerCase();
        const s = (p.summary || "").toLowerCase();
        const d = (p.description || "").toLowerCase();
        if (!t.includes(q) && !s.includes(q) && !d.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featured = filteredPosts[0];

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero Section */}
      <section className="bg-orange-50 px-6 py-16 sm:px-10 lg:px-16 border-b border-orange-100">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
              News, Stories & Foundation Blogs
            </p>
            <h1 className="mt-4 font-serif text-4xl sm:text-6xl leading-tight text-stone-900">
              Verified notes.<br />
              <span className="italic text-brand-orange">Voices from the ground.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600">
              Stay connected with verified foundation news, veterinary advice, field rescue updates, and articles written with compassion for the welfare of community animals.
            </p>
          </div>
          <div className="relative h-72 overflow-hidden sm:h-96 rounded-2xl shadow-lg">
            <Image
              className="object-cover"
              src="/services/10.jpeg"
              alt="Shiv Gorakh Welfare news and field activity"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    selectedCategory === cat
                      ? "bg-brand-orange text-white shadow-sm"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-brand-orange hover:text-brand-orange"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <input
                type="text"
                placeholder="Search articles and news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Featured Spotlight Card */}
          {featured && !searchQuery && selectedCategory === "All" && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-md transition hover:shadow-xl">
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-full min-h-[280px] bg-stone-100">
                  <img
                    src={
                      featured.imageUrls && featured.imageUrls.length > 0
                        ? getApiImageUrl(featured.imageUrls[0])
                        : "/services/5.jpeg"
                    }
                    alt={featured.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white shadow">
                    ⭐ Featured Story
                  </span>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10">
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 font-bold text-brand-orange">
                      {featured.category}
                    </span>
                    <span>{formatDate(featured.publishedDate || featured.createdAt)}</span>
                  </div>
                  <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-stone-600 line-clamp-3">
                    {featured.summary || featured.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                    <span className="text-xs font-medium text-stone-500">
                      By {featured.author || "Shiv Gorakh Welfare Foundation"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveArticle(featured)}
                      className="rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white hover:bg-orange-700 transition"
                    >
                      Read Story →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Articles */}
          <div className="mt-10">
            {loading ? (
              <div className="py-20 text-center text-sm text-stone-500 animate-pulse">
                Loading articles and news posts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
                <p className="font-serif text-2xl text-stone-900">No articles found</p>
                <p className="mt-2 text-xs text-stone-500">
                  Try adjusting your search query or select another category.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => {
                  const img =
                    post.imageUrls && post.imageUrls.length > 0
                      ? getApiImageUrl(post.imageUrls[0])
                      : "/services/1.jpeg";

                  return (
                    <article
                      key={post._id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-lg hover:border-orange-200"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                        <img
                          src={img}
                          alt={post.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white">
                          {post.category || "News"}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>{formatDate(post.publishedDate || post.createdAt)}</span>
                          <span>{post.author ? `By ${post.author}` : ""}</span>
                        </div>

                        <h3 className="mt-2 font-serif text-lg font-bold text-stone-900 group-hover:text-brand-orange transition line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="mt-3 flex-1 text-xs leading-5 text-stone-600 line-clamp-3">
                          {post.summary || post.description}
                        </p>

                        <div className="mt-5 pt-3 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setActiveArticle(post)}
                            className="text-xs font-bold text-brand-orange hover:text-orange-800 transition"
                          >
                            Read Full Post →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Read Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative h-64 sm:h-72 w-full bg-stone-900">
              <img
                src={
                  activeArticle.imageUrls && activeArticle.imageUrls.length > 0
                    ? getApiImageUrl(activeArticle.imageUrls[0])
                    : "/services/5.jpeg"
                }
                alt={activeArticle.title}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                aria-label="Close article"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="rounded-full bg-orange-100 px-3 py-1 font-bold text-brand-orange">
                  {activeArticle.category}
                </span>
                <span>{formatDate(activeArticle.publishedDate || activeArticle.createdAt)}</span>
                {activeArticle.author && <span>• By {activeArticle.author}</span>}
              </div>

              <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {activeArticle.title}
              </h2>

              {activeArticle.summary && (
                <p className="mt-3 text-sm font-semibold text-brand-orange border-l-2 border-brand-orange pl-3 italic">
                  {activeArticle.summary}
                </p>
              )}

              <div className="mt-5 text-sm leading-7 text-stone-700 whitespace-pre-wrap">
                {activeArticle.description}
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="rounded-full bg-stone-900 px-6 py-2 text-xs font-bold text-white hover:bg-black"
                >
                  Close Article
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
