"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FiArrowUpRight,
  FiPlay,
  FiPause,
  FiCamera,
  FiFilm,
  FiMapPin,
  FiHeart,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiEye,
} from "react-icons/fi";

const GALLERY_ITEMS = [
  {
    id: "g-1",
    src: "/services/9.jpeg",
    category: "rescue",
    categoryLabel: "Highway Rescue",
    title: "Trauma stabilization & highway stray rescue",
    caption:
      "Our emergency response vehicle arrived within 20 minutes to stabilize an injured stray dog after a highway accident in Rampur. Full medical care and safe transit provided.",
    location: "Civil Lines Highway, Rampur",
    date: "Weekly Dispatch",
    tag: "High Priority",
  },
  {
    id: "g-2",
    src: "/services/4.jpeg",
    category: "medical",
    categoryLabel: "Emergency Triage",
    title: "Mobile first-aid deployment & wound dressing",
    caption:
      "Trained youth volunteers applying antiseptic dressing and pain relief to community animals on the street before clinical transport.",
    location: "Old City Market, Rampur",
    date: "Field Routine",
    tag: "First-Aid",
  },
  {
    id: "g-3",
    src: "/services/10.jpeg",
    category: "rescue",
    categoryLabel: "Puppy Care",
    title: "Abandoned litter rescue & pediatric medical triage",
    caption:
      "Four orphaned street pups recovered from a drain during monsoon waterlogging, sheltered at our safe rehabilitation foster home.",
    location: "Railway Colony, Rampur",
    date: "Care Watch",
    tag: "Rehabilitated",
  },
  {
    id: "g-4",
    src: "/services/5.jpeg",
    category: "feeding",
    categoryLabel: "Winter Feeder",
    title: "Community feeding rounds & warm bedding boxes",
    caption:
      "Nightly nutritional feeding rounds combined with insulated straw boxes placed across cold industrial clusters in northern winter.",
    location: "Industrial Sector, Rampur",
    date: "Daily 8 PM",
    tag: "Community Care",
  },
  {
    id: "g-5",
    src: "/services/6.jpeg",
    category: "medical",
    categoryLabel: "Mass Camp",
    title: "Mass anti-rabies vaccination & health checkup",
    caption:
      "Licensed vets and volunteers administering rabies vaccines and tracking community pets with safe reflective identification collars.",
    location: "Town Hall Compound, Rampur",
    date: "Community Drive",
    tag: "Rabies-Free",
  },
  {
    id: "g-6",
    src: "/services/1.jpeg",
    category: "rescue",
    categoryLabel: "Sanctuary",
    title: "Post-surgery recovery & foster healing watch",
    caption:
      "A peaceful corner at our foster sanctuary where convalescing animals receive nutritious broth, gentle affection, and clean bedding.",
    location: "Rescue Center, Rampur",
    date: "Permanent Foster",
    tag: "Healed & Safe",
  },
];

const VIDEO_ARCHIVES = [
  {
    id: "v-1",
    src: "/videos/11.mp4",
    poster: "/services/4.jpeg",
    title: "Emergency Canine Trauma Rescue & Stabilization",
    subtitle: "Rapid on-scene paramedic triage and ambulance transit in Rampur.",
    duration: "Field Capture #11",
    tag: "Active Rescue Call",
    highlights: [
      "Response time under 25 minutes",
      "Sterile wound dressing and saline IV administered on site",
      "Safe transportation to partner veterinary hospital",
    ],
  },
  {
    id: "v-2",
    src: "/videos/12.mp4",
    poster: "/services/10.jpeg",
    title: "Daily Street Animal Feeding & Care Round",
    subtitle: "Nutritious warm meal distribution across community feeder clusters.",
    duration: "Field Capture #12",
    tag: "Daily Feeding Routine",
    highlights: [
      "Over 180+ stray animals nourished nightly",
      "Health monitoring and deworming tablet distribution",
      "Zero-kill, community-centered animal welfare ethos",
    ],
  },
];

const FILTER_TABS = [
  { id: "all", label: "All Highlights" },
  { id: "rescue", label: "Emergency Rescues" },
  { id: "feeding", label: "Daily Feeding" },
  { id: "medical", label: "Medical & Camps" },
];

export default function MediaSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null); // photo object or null

  const videoRef = useRef(null);

  // Filtered photos
  const filteredPhotos =
    selectedCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  const activeVideo = VIDEO_ARCHIVES[activeVideoIndex];

  // Sync play state
  function handlePlayToggle() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }

  // Handle switching video
  function handleSelectVideo(index) {
    if (activeVideoIndex === index) return;
    setActiveVideoIndex(index);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e) {
      if (!lightboxImage) return;
      if (e.key === "Escape") setLightboxImage(null);
      if (e.key === "ArrowRight") {
        const idx = GALLERY_ITEMS.findIndex((p) => p.id === lightboxImage.id);
        const nextIdx = (idx + 1) % GALLERY_ITEMS.length;
        setLightboxImage(GALLERY_ITEMS[nextIdx]);
      }
      if (e.key === "ArrowLeft") {
        const idx = GALLERY_ITEMS.findIndex((p) => p.id === lightboxImage.id);
        const prevIdx = (idx - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
        setLightboxImage(GALLERY_ITEMS[prevIdx]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  return (
    <section id="stories" className="relative overflow-hidden bg-[#faf8f5] px-5 py-20 sm:px-10 lg:px-16 lg:py-28 border-t border-orange-100/70">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-28 top-24 size-96 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-28 bottom-28 size-96 rounded-full bg-emerald-100/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ======================================================== */}
        {/* SECTION HEADER                                           */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-orange-200/60 pb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/80 px-3.5 py-1 text-xs font-bold text-brand-orange shadow-2xs">
              <FiCamera size={13} />
              <span>Ground Realities &amp; Field Media</span>
            </div>

            <h2 className="mt-3.5 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-stone-900">
              Moments from the front lines.
              <br />
              <span className="italic text-brand-orange">Real rescues, unconditional care.</span>
            </h2>

            <p className="mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-stone-600">
              Unfiltered photographs and live field clips recorded directly by Shiv Gorakh Welfare Foundation responders during emergency calls, daily feeding rounds, and medical camps across Rampur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <Link
              className="group inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-bold text-stone-800 shadow-xs hover:border-brand-orange hover:bg-orange-50 hover:text-brand-orange transition"
              href="/gallery"
            >
              <FiFilm size={14} className="text-brand-orange" />
              <span>Explore Complete Media Vault</span>
              <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* CATEGORY FILTER TABS                                     */}
        {/* ======================================================== */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? "bg-brand-orange text-white shadow-sm ring-2 ring-orange-300/50"
                    : "bg-white text-stone-600 hover:bg-orange-50 hover:text-stone-900 border border-stone-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          <span className="text-xs text-stone-400 ml-auto hidden sm:inline">
            Showing {filteredPhotos.length} curated field captures
          </span>
        </div>

        {/* ======================================================== */}
        {/* PHOTO SHOWCASE BENTO GRID                                */}
        {/* ======================================================== */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo, index) => {
            const isFeatured = index === 0;

            return (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                onClick={() => setLightboxImage(photo)}
                className={`group relative overflow-hidden rounded-3xl bg-stone-900 shadow-md cursor-pointer border border-stone-200/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isFeatured ? "sm:col-span-2 lg:col-span-2 h-72 sm:h-96" : "h-72 sm:h-96"
                }`}
              >
                {/* Background Image */}
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes={
                    isFeatured
                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-stone-900/10 transition-opacity duration-300 group-hover:from-stone-950/95" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                  <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-white/15">
                    {photo.categoryLabel}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiEye size={11} />
                    <span>Click to zoom</span>
                  </span>
                </div>

                {/* Bottom Story Description */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 text-[11px] text-orange-200/90 mb-1">
                    <FiMapPin size={12} className="text-brand-orange" />
                    <span>{photo.location}</span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white line-clamp-1 group-hover:text-amber-200 transition">
                    {photo.title}
                  </h3>

                  <p className="mt-1 text-xs text-stone-300/90 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Caption note */}
        <div className="mt-3.5 flex items-center justify-between text-xs text-stone-500">
          <span>
            📸 Unfiltered photography archived by verified field responders in Rampur, U.P.
          </span>
          <Link href="/gallery" className="font-bold text-brand-orange hover:underline hidden sm:inline">
            Browse all 100+ images in gallery →
          </Link>
        </div>

        {/* ======================================================== */}
        {/* FEATURED CINEMA VIDEO PLAYER STUDIO                      */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-14 rounded-3xl bg-gradient-to-br from-stone-950 via-[#181a20] to-stone-900 p-6 sm:p-8 lg:p-10 text-white shadow-2xl border border-stone-800 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-brand-orange/15 blur-3xl" />

          {/* Studio Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-rose-500" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">
                  Documentary Video Footage
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                  See the rescue work unfold live.
                </h3>
              </div>
            </div>

            {/* Video selector tabs */}
            <div className="flex rounded-2xl bg-stone-900 p-1 border border-stone-800">
              {VIDEO_ARCHIVES.map((vid, idx) => (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => handleSelectVideo(idx)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    activeVideoIndex === idx
                      ? "bg-brand-orange text-white shadow-xs"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Footage #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Player & Intel Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Video Player (7 Columns) */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl border border-stone-800 aspect-video group">
                <video
                  ref={videoRef}
                  className="h-full w-full object-contain bg-black"
                  playsInline
                  controls
                  preload="metadata"
                  poster={activeVideo.poster}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  aria-label={activeVideo.title}
                >
                  <source src={activeVideo.src} type="video/mp4" />
                  Your browser does not support the video element.
                </video>

                {/* Custom Play/Pause Overlay Indicator if paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={handlePlayToggle}
                    className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-2xs transition-opacity hover:bg-black/30 group-hover:scale-100"
                    aria-label="Play video"
                  >
                    <div className="grid size-16 sm:size-20 place-items-center rounded-full bg-brand-orange text-white shadow-2xl ring-4 ring-white/30 transition-transform duration-300 hover:scale-110">
                      <FiPlay size={26} className="translate-x-0.5" />
                    </div>
                  </button>
                )}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 px-1">
                <span className="font-mono text-amber-300 font-bold">
                  {activeVideo.tag} • Recorded in Rampur, U.P.
                </span>
                <span>Click play to watch full clip</span>
              </div>
            </div>

            {/* Intel & Case Context (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <span className="inline-block rounded-md bg-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-300 border border-orange-500/30">
                  {activeVideo.duration}
                </span>

                <h4 className="mt-2 font-serif text-2xl font-bold text-white leading-snug">
                  {activeVideo.title}
                </h4>

                <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {activeVideo.subtitle}
                </p>

                {/* Highlight Checkmarks */}
                <div className="mt-5 space-y-2.5">
                  {activeVideo.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-stone-300">
                      <FiCheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Banner inside Video Box */}
              <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="block font-bold text-white">Want to support these rescues?</span>
                    <span className="text-[11px] text-stone-400">Tax exemption under 80G certified.</span>
                  </div>
                  <Link
                    href="/donate"
                    className="shrink-0 rounded-xl bg-brand-orange hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
                  >
                    Donate Now →
                  </Link>
                </div>
              </div>

              {/* Secondary Links */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-300 pt-2">
                <Link href="/volunteer/register" className="hover:text-orange-300 transition inline-flex items-center gap-1">
                  <span>Join as Volunteer Responder</span>
                  <FiArrowUpRight size={13} />
                </Link>
                <span className="text-stone-700">•</span>
                <Link href="/gallery" className="hover:text-orange-300 transition inline-flex items-center gap-1">
                  <span>Open Video Vault</span>
                  <FiArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE FULLSCREEN LIGHTBOX MODAL                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 sm:p-8"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-700 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {lightboxImage.categoryLabel}
                  </span>
                  <span className="text-xs text-stone-400">
                    {lightboxImage.location}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="grid size-8 place-items-center rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white transition"
                  aria-label="Close modal"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* High-Resolution Picture View */}
              <div className="relative w-full h-[50vh] sm:h-[60vh] bg-black">
                <Image
                  src={lightboxImage.src}
                  alt={lightboxImage.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Modal Bottom Metadata */}
              <div className="p-6 bg-stone-950/90 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-800">
                <div>
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
                    {lightboxImage.title}
                  </h4>
                  <p className="mt-1 text-xs text-stone-300 max-w-2xl leading-relaxed">
                    {lightboxImage.caption}
                  </p>
                </div>

                <Link
                  href="/gallery"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-orange hover:border-brand-orange transition"
                >
                  <span>More in Gallery</span>
                  <FiArrowUpRight size={13} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
