"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import {
  FiCamera,
  FiFilm,
  FiSearch,
  FiEye,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiShare2,
  FiMapPin,
  FiCalendar,
  FiArrowUpRight,
  FiCheckCircle,
  FiRefreshCw,
  FiGrid,
  FiHeart,
  FiMaximize2,
  FiTag,
  FiVideo,
  FiPlay,
  FiLayers,
  FiCheck,
  FiSliders,
} from "react-icons/fi";
import { getGalleries } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

// Check if a URL represents a video format or embed
function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  return (
    /\.(mp4|webm|mov|ogv|mkv)(\?.*)?$/i.test(url) ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
}

// Extract YouTube embed URL if applicable
function getYouTubeEmbedUrl(url, autoplay = false) {
  if (!url || typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=[&]?|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=${autoplay ? 1 : 0}&rel=0`;
  }
  return null;
}

// Extract all media items (photos and videos, up to 10+ items) strictly from an API document
function extractDocumentMedia(doc) {
  const media = [];
  const seen = new Set();

  function addMedia(rawUrl, forceVideo = false) {
    if (!rawUrl || typeof rawUrl !== "string") return;
    const trimmed = rawUrl.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);

    const isVid = forceVideo || isVideoUrl(trimmed);
    media.push({
      id: `${doc._id || "doc"}-${media.length}`,
      type: isVid ? "video" : "image",
      url: getApiImageUrl(trimmed),
      rawUrl: trimmed,
      title: doc.title || "Field Document Media",
      description: doc.description || "",
      category: doc.category || "General",
      location: "Rampur, Uttar Pradesh",
      date: doc.createdAt
        ? new Date(doc.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Field Record",
    });
  }

  // 1. Direct videoUrl
  if (doc.videoUrl) addMedia(doc.videoUrl, true);

  // 2. videoUrls array
  if (Array.isArray(doc.videoUrls)) {
    doc.videoUrls.forEach((u) => addMedia(u, true));
  }

  // 3. imageUrls array (up to 10 files)
  if (Array.isArray(doc.imageUrls)) {
    doc.imageUrls.forEach((u) => addMedia(u));
  }

  return media;
}

// -------------------------------------------------------------
// DOCUMENT CARD COMPONENT: Presents a single gallery document
// with Title, Description, and its images & videos (up to 10)
// -------------------------------------------------------------
function DocumentCard({ doc, index, onOpenModal }) {
  const mediaList = useMemo(() => extractDocumentMedia(doc), [doc]);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [cardViewMode, setCardViewMode] = useState("showcase"); // 'showcase' or 'grid'

  const videoCount = mediaList.filter((m) => m.type === "video").length;
  const photoCount = mediaList.filter((m) => m.type === "image").length;
  const activeMedia = mediaList[activeMediaIdx] || mediaList[0];

  function copyDocLink() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Document link copied to clipboard!");
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-sm transition duration-300 hover:shadow-xl hover:border-brand-orange/40">
      {/* 1. DOCUMENT HEADER */}
      <div className="border-b border-stone-100 bg-stone-50/70 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-bold text-brand-orange">
              {doc.category || "General"}
            </span>
            <span className="rounded-full bg-stone-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">
              Document #{index + 1}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <FiCalendar size={13} className="text-brand-orange" />
              <span>
                {doc.createdAt
                  ? new Date(doc.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Field Record"}
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiMapPin size={13} className="text-brand-orange" />
              <span>Rampur, UP</span>
            </span>
            <button
              type="button"
              onClick={copyDocLink}
              title="Share Document"
              className="ml-1 rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition cursor-pointer"
            >
              <FiShare2 size={13} />
            </button>
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="mt-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
            {doc.title || "Untitled Field Document"}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed max-w-4xl">
            {doc.description || "No description provided for this field document."}
          </p>
        </div>

        {/* Media Counts & View Mode Switcher */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/60">
          <div className="flex items-center gap-2 text-xs font-bold">
            {photoCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-orange-100/70 px-2.5 py-1 text-brand-orange">
                <FiCamera size={12} />
                <span>{photoCount} Photo{photoCount > 1 ? "s" : ""}</span>
              </span>
            )}
            {videoCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-100/80 px-2.5 py-1 text-rose-800">
                <FiVideo size={12} />
                <span>{videoCount} Video{videoCount > 1 ? "s" : ""}</span>
              </span>
            )}
            <span className="text-stone-400">
              ({mediaList.length} of up to 10 files)
            </span>
          </div>

          {mediaList.length > 1 && (
            <div className="flex items-center rounded-xl bg-stone-200/70 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCardViewMode("showcase")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  cardViewMode === "showcase"
                    ? "bg-white text-stone-900 shadow-2xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FiEye size={12} />
                <span>Showcase</span>
              </button>
              <button
                type="button"
                onClick={() => setCardViewMode("grid")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  cardViewMode === "grid"
                    ? "bg-white text-stone-900 shadow-2xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FiGrid size={12} />
                <span>All Grid ({mediaList.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. MEDIA DISPLAY SECTION (UP TO 10 IMAGES & VIDEOS) */}
      <div className="p-6 sm:p-8">
        {mediaList.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-8 text-center text-xs text-stone-400">
            <FiCamera size={28} className="mx-auto mb-2 text-stone-300" />
            <span>No image or video files attached to this document yet.</span>
          </div>
        ) : cardViewMode === "showcase" ? (
          /* SHOWCASE VIEW: Large featured media + thumbnail strip of all files */
          <div className="space-y-4">
            {/* Primary Display Frame */}
            <div className="group relative aspect-16/9 sm:aspect-21/9 w-full overflow-hidden rounded-2xl bg-black shadow-inner flex items-center justify-center">
              {activeMedia?.type === "video" ? (
                getYouTubeEmbedUrl(activeMedia.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(activeMedia.url, false)}
                    className="size-full border-0"
                    allowFullScreen
                    title={doc.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    key={activeMedia.url}
                    src={activeMedia.url}
                    controls
                    playsInline
                    className="size-full object-contain bg-black"
                  >
                    <source src={activeMedia.url} type="video/mp4" />
                    <source src={activeMedia.url} type="video/webm" />
                    Your browser does not support video playback.
                  </video>
                )
              ) : (
                <img
                  src={activeMedia?.url}
                  alt={doc.title}
                  className="size-full object-contain sm:object-cover transition duration-500 group-hover:scale-102"
                  loading="lazy"
                />
              )}

              {/* Fullscreen Expand Action Button */}
              <button
                type="button"
                onClick={() => onOpenModal(mediaList, activeMediaIdx)}
                className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/20 hover:bg-brand-orange hover:border-brand-orange transition cursor-pointer shadow-md"
              >
                <FiMaximize2 size={13} />
                <span>Fullscreen</span>
              </button>

              {/* Media Type Indicator */}
              <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-white/10 pointer-events-none">
                {activeMedia?.type === "video" ? "🎥 Video Clip" : "📷 High-Clarity Photo"} ({activeMediaIdx + 1} / {mediaList.length})
              </span>
            </div>

            {/* Thumbnail Strip of All Files in this Document */}
            {mediaList.length > 1 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Document Media Attachments ({mediaList.length} files):
                </p>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {mediaList.map((item, idx) => {
                    const isSelected = idx === activeMediaIdx;
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => setActiveMediaIdx(idx)}
                        className={`group relative shrink-0 aspect-square w-20 sm:w-24 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                          isSelected
                            ? "border-brand-orange ring-2 ring-brand-orange/30 scale-102 shadow-md"
                            : "border-stone-200 opacity-75 hover:opacity-100 hover:border-stone-400"
                        }`}
                      >
                        {item.type === "video" ? (
                          <div className="size-full bg-stone-900 flex items-center justify-center text-white relative">
                            <span className="grid size-7 place-items-center rounded-full bg-brand-orange text-white text-[10px]">
                              ▶
                            </span>
                            <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/80 px-1 rounded text-amber-300">
                              Video
                            </span>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt=""
                            className="size-full object-cover transition duration-300 group-hover:scale-108"
                            loading="lazy"
                          />
                        )}
                        <span className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[8px] font-bold text-white">
                          #{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GRID VIEW: Side-by-side grid of all up to 10 images and videos */
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mediaList.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => onOpenModal(mediaList, idx)}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-stone-900 border border-stone-200/80 shadow-2xs transition duration-300 hover:shadow-lg hover:border-brand-orange hover:-translate-y-0.5"
              >
                {item.type === "video" ? (
                  <div className="size-full bg-black flex items-center justify-center relative">
                    <video
                      src={item.url}
                      className="size-full object-cover opacity-80"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <span className="grid size-9 place-items-center rounded-full bg-brand-orange text-white text-xs shadow-md group-hover:scale-110 transition">
                        ▶
                      </span>
                    </div>
                    <span className="absolute top-2 left-2 rounded-full bg-rose-900/90 px-2 py-0.5 text-[9px] font-bold text-rose-200">
                      🎥 Video
                    </span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt=""
                    className="size-full object-cover transition duration-500 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                )}

                {/* Hover overlay with zoom */}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                  <FiMaximize2 size={16} />
                  <span className="text-xs font-bold">Fullscreen</span>
                </div>

                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// -------------------------------------------------------------
// MAIN GALLERY VIEW COMPONENT
// -------------------------------------------------------------
export default function GalleryView() {
  const [apiGalleries, setApiGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fullscreen Theater / Lightbox Modal State
  // items: array of media items in active document
  // currentIndex: active media index
  const [activeModal, setActiveModal] = useState(null);

  async function loadGalleries() {
    setLoading(true);
    setError(null);
    const res = await getGalleries({ limit: 50 });
    if (res.success) {
      setApiGalleries(res.items || []);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadGalleries();
  }, []);

  // Filtered documents strictly from API data
  const filteredDocuments = useMemo(() => {
    return apiGalleries.filter((doc) => {
      // Category filter
      if (selectedCategory !== "all") {
        if ((doc.category || "General").toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      // Search filter across title, description, category
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title?.toLowerCase().includes(q);
        const matchesDesc = doc.description?.toLowerCase().includes(q);
        const matchesCat = doc.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [apiGalleries, selectedCategory, searchQuery]);

  // Dynamic category pills calculated purely from API documents
  const categoryFilters = useMemo(() => {
    const map = new Map();
    apiGalleries.forEach((doc) => {
      const cat = doc.category?.trim() || "General";
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const categories = [{ id: "all", label: "All Documents", count: apiGalleries.length }];
    map.forEach((count, cat) => {
      categories.push({ id: cat, label: cat, count });
    });
    return categories;
  }, [apiGalleries]);

  // Overall totals strictly from API
  const totalStats = useMemo(() => {
    let photos = 0;
    let videos = 0;
    apiGalleries.forEach((doc) => {
      const media = extractDocumentMedia(doc);
      media.forEach((m) => {
        if (m.type === "video") videos++;
        else photos++;
      });
    });
    return {
      docs: apiGalleries.length,
      photos,
      videos,
    };
  }, [apiGalleries]);

  // Open modal for a specific document's media list
  function openModal(mediaList, index) {
    if (!mediaList || mediaList.length === 0) return;
    setActiveModal({
      items: mediaList,
      currentIndex: index >= 0 ? index : 0,
    });
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e) {
      if (!activeModal) return;
      if (e.key === "Escape") setActiveModal(null);
      if (e.key === "ArrowRight" && activeModal.items?.length > 1) {
        setActiveModal((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.items.length,
        }));
      }
      if (e.key === "ArrowLeft" && activeModal.items?.length > 1) {
        setActiveModal((prev) => ({
          ...prev,
          currentIndex:
            (prev.currentIndex - 1 + prev.items.length) % prev.items.length,
        }));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  function handleShare() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Gallery link copied to clipboard!");
    } else {
      toast.success("Sharing ready!");
    }
  }

  function handleDownload(imageUrl, title) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${(title || "ShivGorakh_Media").replace(/[^a-z0-9]/gi, "_")}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Download started!");
  }

  function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  const currentModalItem = activeModal?.items?.[activeModal?.currentIndex] || null;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & SEARCH / FILTER CONTROLS                 */}
      {/* ======================================================== */}
      <section className="relative border-b border-orange-200/60 bg-gradient-to-b from-orange-50/70 via-stone-50 to-[#faf8f5] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3.5 py-1 text-xs font-bold text-brand-orange mb-3">
                <FiLayers size={13} />
                <span>On-Ground Documentary Records</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight">
                Field Documents & <span className="text-brand-orange">Media Gallery</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
                Clear documentary records of animal rescues, medical camps, and daily feeding drives. Each document features verified field titles, descriptions, and up to 10 photos and video recordings.
              </p>

              {/* Total Summary Counters */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-stone-600">
                <span className="rounded-full bg-white px-3 py-1 border border-stone-200 shadow-2xs">
                  📁 {totalStats.docs} Document{totalStats.docs === 1 ? "" : "s"} Published
                </span>
                <span className="rounded-full bg-white px-3 py-1 border border-stone-200 shadow-2xs">
                  📷 {totalStats.photos} Photo{totalStats.photos === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-white px-3 py-1 border border-stone-200 shadow-2xs">
                  🎥 {totalStats.videos} Video{totalStats.videos === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Search Input & Refresh */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="w-full md:w-80 relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description…"
                  className="w-full rounded-2xl border border-stone-300 bg-white pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 shadow-2xs focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    aria-label="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={loadGalleries}
                disabled={loading}
                title="Refresh Documents"
                className="grid size-11 shrink-0 place-items-center rounded-2xl border border-stone-300 bg-white text-stone-700 shadow-2xs hover:bg-orange-50 hover:text-brand-orange transition disabled:opacity-50 cursor-pointer"
              >
                <FiRefreshCw size={15} className={loading ? "animate-spin text-brand-orange" : ""} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryFilters.map((tab) => {
              const isActive = selectedCategory.toLowerCase() === tab.id.toLowerCase();
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition duration-200 cursor-pointer ${
                    isActive
                      ? "bg-brand-orange text-white shadow-md shadow-brand-orange/25"
                      : "bg-white text-stone-600 border border-stone-200/80 hover:bg-orange-50 hover:text-brand-orange hover:border-orange-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. MULTIPLE DOCUMENTS FEED (TITLE, DESC, UP TO 10 MEDIA) */}
      {/* ======================================================== */}
      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-8">
              {[1, 2].map((n) => (
                <div key={n} className="animate-pulse rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                  <div className="h-6 w-1/4 rounded-full bg-orange-100" />
                  <div className="mt-4 h-8 w-3/4 rounded-lg bg-orange-100/70" />
                  <div className="mt-2 h-4 w-full rounded bg-orange-50" />
                  <div className="mt-6 aspect-16/9 w-full rounded-2xl bg-orange-100/60" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center max-w-xl mx-auto">
              <p className="text-sm font-semibold text-rose-800">
                Could not load documents: {error}
              </p>
              <button
                type="button"
                onClick={loadGalleries}
                className="mt-4 rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 transition cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredDocuments.length > 0 ? (
            /* Multiple Documents Stack */
            <div className="space-y-12">
              {filteredDocuments.map((doc, idx) => (
                <DocumentCard
                  key={doc._id || idx}
                  doc={doc}
                  index={idx}
                  onOpenModal={openModal}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white p-12 text-center max-w-lg mx-auto">
              <FiLayers size={42} className="mx-auto mb-3 text-stone-300" />
              <h3 className="font-serif text-xl font-bold text-stone-800">
                {searchQuery ? "No matching documents found" : "No documents published yet"}
              </h3>
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                {searchQuery
                  ? "Try checking your spelling or clearing the search query to view all published documents."
                  : "Field documents with title, description, and up to 10 photos/videos uploaded from the admin panel will appear here automatically."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 transition cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FULL SCREEN LIGHTBOX & VIDEO THEATER MODAL            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeModal && currentModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-stone-950/95 backdrop-blur-md"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 text-white z-20">
              <div className="flex items-center gap-3 min-w-0">
                <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-[11px] font-bold text-white shrink-0">
                  {currentModalItem.category || "Field Record"}
                </span>
                <span className="truncate text-sm font-semibold text-stone-200">
                  {currentModalItem.title}
                </span>
                {activeModal.items.length > 1 && (
                  <span className="hidden sm:inline text-xs text-stone-400 shrink-0">
                    ({activeModal.currentIndex + 1} / {activeModal.items.length})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share"
                  className="grid size-9 place-items-center rounded-full bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white transition cursor-pointer"
                >
                  <FiShare2 size={15} />
                </button>
                {currentModalItem.type === "image" && (
                  <button
                    type="button"
                    onClick={() => handleDownload(currentModalItem.url, currentModalItem.title)}
                    aria-label="Download"
                    className="grid size-9 place-items-center rounded-full bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white transition cursor-pointer"
                  >
                    <FiDownload size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label="Fullscreen"
                  className="hidden sm:grid size-9 place-items-center rounded-full bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white transition cursor-pointer"
                >
                  <FiMaximize2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full bg-stone-800 text-stone-200 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Modal Stage (Center Display) */}
            <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
              {/* Prev Button */}
              {activeModal.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal((prev) => ({
                      ...prev,
                      currentIndex:
                        (prev.currentIndex - 1 + prev.items.length) % prev.items.length,
                    }))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 grid size-11 place-items-center rounded-full bg-stone-900/80 text-white border border-stone-700/60 shadow-lg hover:bg-brand-orange transition cursor-pointer"
                  aria-label="Previous file"
                >
                  <FiChevronLeft size={22} />
                </button>
              )}

              {/* Next Button */}
              {activeModal.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal((prev) => ({
                      ...prev,
                      currentIndex: (prev.currentIndex + 1) % prev.items.length,
                    }))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 grid size-11 place-items-center rounded-full bg-stone-900/80 text-white border border-stone-700/60 shadow-lg hover:bg-brand-orange transition cursor-pointer"
                  aria-label="Next file"
                >
                  <FiChevronRight size={22} />
                </button>
              )}

              {/* Media Container */}
              <div className="relative size-full flex items-center justify-center">
                {currentModalItem.type === "video" ? (
                  getYouTubeEmbedUrl(currentModalItem.url) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(currentModalItem.url, true)}
                      className="aspect-video w-[85vw] max-w-5xl max-h-[76vh] rounded-2xl shadow-2xl border border-stone-800"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={currentModalItem.title}
                    />
                  ) : (
                    <video
                      key={currentModalItem.url}
                      src={currentModalItem.url}
                      controls
                      autoPlay
                      playsInline
                      className="max-h-[76vh] max-w-[85vw] rounded-2xl shadow-2xl bg-black border border-stone-800"
                    >
                      <source src={currentModalItem.url} type="video/mp4" />
                      <source src={currentModalItem.url} type="video/webm" />
                      Your browser does not support HTML5 video playback.
                    </video>
                  )
                ) : (
                  <img
                    key={currentModalItem.url}
                    src={currentModalItem.url}
                    alt={currentModalItem.title}
                    className="max-h-[76vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl select-none"
                  />
                )}
              </div>
            </div>

            {/* Modal Bottom Metadata / Thumbnails Strip */}
            <div className="border-t border-stone-800 bg-stone-900/90 px-4 py-3 text-stone-300 z-20">
              <div className="mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-brand-orange font-semibold">
                    <FiMapPin size={12} />
                    <span>{currentModalItem.location || "Rampur, Uttar Pradesh"}</span>
                    <span>•</span>
                    <span>{currentModalItem.date || "Field Record"}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-300 max-w-xl line-clamp-2">
                    {currentModalItem.description}
                  </p>
                </div>

                {/* Thumbnails to jump between items of this document */}
                {activeModal.items.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-xs">
                    {activeModal.items.map((it, idx) => {
                      const isCurrent = idx === activeModal.currentIndex;
                      return (
                        <button
                          key={it.id || idx}
                          type="button"
                          onClick={() =>
                            setActiveModal((prev) => ({
                              ...prev,
                              currentIndex: idx,
                            }))
                          }
                          className={`relative size-10 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                            isCurrent
                              ? "border-brand-orange scale-105"
                              : "border-stone-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          {it.type === "video" ? (
                            <div className="size-full bg-black flex items-center justify-center text-[10px] text-white">
                              ▶
                            </div>
                          ) : (
                            <img
                              src={it.url}
                              alt=""
                              className="size-full object-cover"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
