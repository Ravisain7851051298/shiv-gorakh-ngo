"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FiActivity,
  FiSearch,
  FiPhoneCall,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiHeart,
  FiCheck,
  FiMapPin,
  FiClock,
  FiShare2,
  FiX,
  FiAlertCircle,
  FiTruck,
} from "react-icons/fi";
import { getServices } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

const DEFAULT_SERVICES = [
  {
    _id: "s1",
    title: "24/7 Mobile Animal Ambulance & Emergency Rescue",
    category: "Emergency Trauma & Rescue",
    description:
      "Equipped mobile animal ambulance operating 24 hours a day across Rampur and adjoining highways for road accident victims, fallen strays, and critical animal rescue. With on-board stretchers and experienced handlers, we ensure zero injured animals are left unattended.",
    features: [
      "24/7 Rapid Transit & On-Road Emergency Rescue",
      "On-Board Oxygen Support, Splints & Stretchers",
      "Trained Compassionate Animal Rescue Handlers",
      "Highway Accident & Critical Fall Intervention",
    ],
    imageUrls: ["/services/7.jpeg", "/services/1.jpeg"],
  },
  {
    _id: "s2",
    title: "On-Spot Mobile Trauma Care & First Aid",
    category: "Medical & Pain Relief",
    description:
      "Immediate on-ground veterinary triage, antiseptic wound dressing, pain-relieving injections, and stabilization for severely injured street animals without requiring full relocation when minor healing suffices.",
    features: [
      "Sterile Surgical Dressing Kits & Antiseptics",
      "Antiseptic Deep Wound Cleaning & Maggot Extraction",
      "Veterinary Pain Relief Injections & Antibiotics",
      "Daily Follow-up Dressings Across Street Sectors",
    ],
    imageUrls: ["/services/4.jpeg", "/services/2.jpeg"],
  },
  {
    _id: "s3",
    title: "Anti-Rabies Mass Vaccination & Immunization Drives",
    category: "Preventive Healthcare",
    description:
      "Conducting community-wide vaccination camps to eradicate rabies, protect vulnerable stray dogs and cats, and build safe human-animal coexistence across urban and rural wards of Rampur.",
    features: [
      "Government-Certified Anti-Rabies Vaccinations",
      "GPS Geotagged Vaccination Verification Records",
      "Reflective Safety Collars for High-Risk Highway Dogs",
      "Community Awareness & Rabies Bite Prevention Guidance",
    ],
    imageUrls: ["/services/6.jpeg", "/services/3.jpeg"],
  },
  {
    _id: "s4",
    title: "Daily Stray Animal Feeding & Nutritional Support",
    category: "Feeding & Nourishment",
    description:
      "Daily meal distribution across slums, railway lines, market sectors, and rural outskirts feeding hundreds of hungry street animals nutritious meals and clean water, eliminating starvation-induced aggression.",
    features: [
      "Freshly Cooked Warm Porridge, Rice, Milk & Dal",
      "Clean Drinking Water Earthen Bowls Refilled Daily",
      "High-Protein Supplemental Feed for Vulnerable Pups",
      "Winter Blanket Distributions & Sacks for Bedding",
    ],
    imageUrls: ["/services/5.jpeg", "/services/8.jpeg"],
  },
  {
    _id: "s5",
    title: "Animal Birth Control (ABC) & Safe Sterilization",
    category: "Humane Population Control",
    description:
      "Humane surgical sterilization and post-operative recuperation adhering strictly to Animal Welfare Board of India (AWBI) guidelines to control stray overpopulation compassionately.",
    features: [
      "Experienced Certified Veterinary Surgeons",
      "Modern Pre- & Post-Operative Aseptic Protocols",
      "Safe In-Shelter Healing for 5-7 Days with Nutritious Diet",
      "Distinct Ear-Notching for Transparent Record Tracking",
    ],
    imageUrls: ["/services/2.jpeg", "/services/9.jpeg"],
  },
  {
    _id: "s6",
    title: "Lifetime Sanctuary & Critical Surgery Rehabilitation",
    category: "Shelter & Lifetime Care",
    description:
      "A permanent peaceful haven for paralyzed, blind, amputee, and geriatric animals who cannot survive on the streets, providing lifetime nutritious food, warmth, rehabilitation, and compassionate dignity.",
    features: [
      "Custom Canine Mobility Wheelchairs for Paralyzed Dogs",
      "Spacious Disabled & Senior Canine Care Enclosures",
      "Daily Physiotherapy & Veterinary Health Monitoring",
      "Lifelong Dignity, Clean Water, Warmth & Endless Love",
    ],
    imageUrls: ["/services/10.jpeg", "/services/4.jpeg"],
  },
];

export default function ServicesView() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAllServices() {
      try {
        const res = await getServices({ page: 1, limit: 100 });
        if (isMounted && res.success && Array.isArray(res.items) && res.items.length > 0) {
          const activeOnly = res.items.filter((item) => item.status !== "Draft");
          if (activeOnly.length > 0) {
            setServices(activeOnly);
          }
        }
      } catch (err) {
        // keep fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAllServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const list = ["All"];
    services.forEach((s) => {
      if (s.category && !list.includes(s.category)) {
        list.push(s.category);
      }
    });
    return list;
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat =
        selectedCategory === "All" ||
        s.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.title?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        (Array.isArray(s.features) &&
          s.features.some((f) => f.toLowerCase().includes(q)));

      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      {/* ==================================================== */}
      {/* Hero Header Section                                  */}
      {/* ==================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-[#1b252c] to-stone-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 text-white">
        <div className="pointer-events-none absolute -left-24 top-0 size-96 rounded-full bg-brand-orange/20 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 bottom-0 size-96 rounded-full bg-amber-500/15 blur-[140px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-300 backdrop-blur-md">
            <FiActivity className="size-3.5 text-brand-orange" />
            <span className="tracking-widest uppercase">
              Official Foundation Services · Rampur, UP
            </span>
          </div>

          <h1 className="mt-5 font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Comprehensive Rescue, Medical &amp; <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-brand-orange to-amber-300 bg-clip-text text-transparent">
              Sanctuary Services
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg lg:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
            Delivering unconditional relief, on-spot trauma aid, daily street nourishment, and lifetime
            rehabilitation for injured, destitute, and homeless animals across Rampur.
          </p>

          {/* Quick Action Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:+919336950578"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-600 active:scale-95"
            >
              <FiPhoneCall />
              <span>24/7 Rescue Dispatch: +91 93369 50578</span>
            </a>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <FiHeart className="text-rose-400" />
              <span>Sponsor a Service</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* Filter & Search Bar                                  */}
      {/* ==================================================== */}
      <section className="sticky top-16 z-20 border-y border-stone-200/80 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-orange text-white shadow-md shadow-orange-500/20"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search services or features…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-10 pr-4 text-xs font-medium text-stone-800 placeholder-stone-400 transition focus:border-brand-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* Services List / Cards Grid                           */}
      {/* ==================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-orange-50 text-brand-orange">
              <FiAlertCircle size={22} />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-stone-800">
              No matching services found
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Try searching with different keywords or switch the category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service, index) => {
              const rawImg =
                Array.isArray(service.imageUrls) && service.imageUrls.length > 0
                  ? service.imageUrls[0]
                  : `/services/${(index % 10) + 1}.jpeg`;
              const imageSrc = rawImg.startsWith("/services/")
                ? rawImg
                : getApiImageUrl(rawImg);

              const featuresList = Array.isArray(service.features)
                ? service.features
                : typeof service.features === "string"
                ? service.features
                    .split(/\r?\n|,/)
                    .map((f) => f.trim())
                    .filter(Boolean)
                : [];

              return (
                <motion.article
                  key={service._id || service.title || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10"
                >
                  {/* Card Visual Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                    <img
                      src={imageSrc}
                      alt={service.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `/services/${(index % 10) + 1}.jpeg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

                    {/* Category Chip */}
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800 shadow-sm backdrop-blur-md">
                      <span className="size-1.5 rounded-full bg-brand-orange animate-pulse" />
                      {service.category || "Service"}
                    </span>

                    {/* Quick View Button on Image */}
                    <button
                      type="button"
                      onClick={() => setActiveModal(service)}
                      className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur-md hover:bg-white hover:text-brand-orange transition"
                      title="View full details"
                    >
                      <FiActivity size={14} />
                    </button>
                  </div>

                  {/* Card Main Body */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-brand-orange transition-colors">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-600">
                      {service.description}
                    </p>

                    {/* Feature Checkpoints */}
                    {featuresList.length > 0 && (
                      <div className="mt-5 border-t border-stone-100 pt-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                          Key Service Highlights
                        </span>
                        <ul className="mt-2.5 space-y-2 text-xs text-stone-700">
                          {featuresList.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <FiCheck className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setActiveModal(service)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-orange-700 transition"
                      >
                        <span>Full Description</span>
                        <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </button>

                      <Link
                        href={`/donate?cause=${encodeURIComponent(service.title)}`}
                        className="rounded-xl bg-orange-50 px-3.5 py-2 text-xs font-bold text-brand-orange hover:bg-brand-orange hover:text-white transition shadow-2xs"
                      >
                        Sponsor Service
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 24/7 Field Operations Callout Banner                 */}
      {/* ==================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="pointer-events-none absolute right-0 top-0 size-80 rounded-full bg-brand-orange/20 blur-[100px]" />

          <div className="relative grid gap-8 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-300">
                <FiTruck size={14} />
                <span>On-Call Rapid Transit Corps</span>
              </span>
              <h2 className="mt-3 font-serif text-2xl sm:text-4xl font-bold tracking-tight">
                Report an Injured Animal or Cruelty Case in Rampur
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-300 max-w-2xl">
                Please share the exact location, animal condition, and photo/video on WhatsApp or call
                our 24/7 rescue helpline immediately. Our ambulance and handlers will be dispatched.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-300">
                <span className="inline-flex items-center gap-1.5">
                  <FiMapPin className="text-brand-orange" />
                  Rampur, Milak, Keorar &amp; NH-24
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiClock className="text-emerald-400" />
                  24 Hours · 365 Days a Year
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiShield className="text-amber-300" />
                  100% Free Emergency Response
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <a
                href="tel:+919336950578"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-orange px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 active:scale-95"
              >
                <FiPhoneCall size={18} />
                <span>Call Helpline: 93369 50578</span>
              </a>
              <a
                href="https://wa.me/919336950578?text=Hello%20Shiv%20Gorakh%20Welfare%20Team%2C%20I%20want%20to%20report%20an%20animal%20emergency."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <span>Send WhatsApp Location</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* Detailed Service Modal Dialog                        */}
      {/* ==================================================== */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
              >
                <FiX size={18} />
              </button>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-brand-orange">
                <FiActivity size={12} />
                {activeModal.category || "Service Detail"}
              </span>

              <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {activeModal.title}
              </h3>

              {/* Modal Image Carousel / Preview */}
              {Array.isArray(activeModal.imageUrls) && activeModal.imageUrls.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl bg-stone-100">
                  <img
                    src={
                      activeModal.imageUrls[0].startsWith("/services/")
                        ? activeModal.imageUrls[0]
                        : getApiImageUrl(activeModal.imageUrls[0])
                    }
                    alt={activeModal.title}
                    className="max-h-80 w-full object-cover"
                  />
                </div>
              )}

              <p className="mt-5 text-sm leading-relaxed text-stone-600">
                {activeModal.description}
              </p>

              {activeModal.features && (
                <div className="mt-6 rounded-2xl bg-stone-50 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Key Highlights &amp; Scope of Service:
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs text-stone-700">
                    {(Array.isArray(activeModal.features)
                      ? activeModal.features
                      : String(activeModal.features).split(/\r?\n|,/)
                    )
                      .map((f) => f.trim())
                      .filter(Boolean)
                      .map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FiCheckCircle className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
                <a
                  href="tel:+919336950578"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-brand-orange"
                >
                  <FiPhoneCall />
                  <span>Call Emergency Dispatch</span>
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                  >
                    Close
                  </button>
                  <Link
                    href={`/donate?cause=${encodeURIComponent(activeModal.title)}`}
                    className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-600"
                  >
                    Sponsor This Care
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
