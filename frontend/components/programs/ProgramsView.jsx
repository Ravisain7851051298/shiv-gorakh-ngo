"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPrograms } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

const DEFAULT_PROGRAMS = [
  {
    _id: "def-prog-1",
    title: "Emergency Stray Animal Rescue & Intensive Medical Care",
    category: "Animal Rescue & Medical Aid",
    status: "Active",
    location: "Rampur & Surrounding Tehsils, UP",
    beneficiaries: "1,200+ Injured Animals Annually",
    date: new Date().toISOString(),
    imageUrls: ["/services/1.jpeg", "/services/5.jpeg"],
    description:
      "Our dedicated 24/7 rescue unit responds to emergency calls for animals injured in road accidents, cruelty incidents, and severe health distress. We provide on-site triage, ambulance transit, surgical treatment, daily wound dressing, and post-operative foster care until complete recovery and rehabilitation.",
    objective: "Zero untreated stray road accidents and 24/7 trauma care across Rampur.",
  },
  {
    _id: "def-prog-2",
    title: "Daily Community Feeding Drives & Winter Nutrition",
    category: "Feeding & Nutrition",
    status: "Active",
    location: "Milak, Keorar & Rampur Suburbs",
    beneficiaries: "350+ Strays Fed Every Single Day",
    date: new Date().toISOString(),
    imageUrls: ["/services/3.jpeg", "/services/2.jpeg"],
    description:
      "Every evening, our volunteer van distributes fresh nutritious meals to community dogs, cats, and destitute cattle across roadside colonies, railway sidings, and market belts. In winter months, we supplement meals with high-protein warm broth and install insulated gunny-sack bedding.",
    objective: "Prevent street starvation and foster peaceful community coexistence.",
  },
  {
    _id: "def-prog-3",
    title: "Humane Animal Birth Control (ABC) & Anti-Rabies Shield",
    category: "Animal Birth Control & Rabies",
    status: "Active",
    location: "District Rampur Municipal Limits",
    beneficiaries: "800+ Vaccinations & Sterilizations",
    date: new Date().toISOString(),
    imageUrls: ["/services/4.jpeg", "/services/6.jpeg"],
    description:
      "A systematic, humane initiative following Animal Welfare Board guidelines to manage the stray dog population, prevent rabies transmission, and eliminate territorial aggression through certified veterinary sterilization and 100% booster rabies vaccinations.",
    objective: "Achieve a 100% rabies-free and humanely managed street animal community.",
  },
  {
    _id: "def-prog-4",
    title: "Youth Compassion & Animal Welfare Awareness in Schools",
    category: "Community Outreach & Education",
    status: "Active",
    location: "Local Schools & Village Panchayats",
    beneficiaries: "2,500+ Students & Youth Reached",
    date: new Date().toISOString(),
    imageUrls: ["/services/10.jpeg", "/services/9.jpeg"],
    description:
      "Interactive sessions with school children, college youth, and local panchayat members on animal empathy, rabies bite prevention, how to report animal emergencies, and compassionate co-living with street companions.",
    objective: "Cultivate the next generation of animal welfare champions and civic guardians.",
  },
];

const CATEGORIES = [
  "All Categories",
  "Animal Rescue & Medical Aid",
  "Feeding & Nutrition",
  "Animal Birth Control & Rabies",
  "Community Outreach & Education",
];

export default function ProgramsView() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getPrograms({ limit: 50 });
      if (res.success && res.items?.length > 0) {
        setPrograms(res.items);
      } else {
        setPrograms(DEFAULT_PROGRAMS);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (selectedCategory !== "All Categories" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const t = (p.title || "").toLowerCase();
        const d = (p.description || "").toLowerCase();
        const l = (p.location || "").toLowerCase();
        if (!t.includes(q) && !d.includes(q) && !l.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [programs, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero Banner */}
      <section className="bg-orange-50 px-6 py-16 sm:px-10 lg:px-16 border-b border-orange-100">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
              Our Active Initiatives
            </p>
            <h1 className="mt-4 font-serif text-4xl sm:text-6xl leading-tight text-stone-900">
              Grassroots care.<br />
              <span className="italic text-brand-orange">Every single life.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600">
              From emergency midnight rescues to systematic rabies vaccination and daily feeding rounds, explore our dedicated programs transforming animal welfare across Rampur, Uttar Pradesh.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/donate"
                className="bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700 transition"
              >
                Support Our Programs ↗
              </Link>
              <Link
                href="/volunteer/register"
                className="border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-800 hover:border-brand-orange transition"
              >
                Join as a Volunteer
              </Link>
            </div>
          </div>
          <div className="relative h-80 overflow-hidden sm:h-96 rounded-2xl shadow-lg">
            <Image
              className="object-cover"
              src="/services/1.jpeg"
              alt="Shiv Gorakh animal welfare team in action"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            {/* Category Pills */}
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
                placeholder="Search programs..."
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

          {/* Programs Grid */}
          <div className="mt-8">
            {loading ? (
              <div className="py-20 text-center text-sm text-stone-500 animate-pulse">
                Loading foundation programs...
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
                <p className="font-serif text-2xl text-stone-900">No programs found</p>
                <p className="mt-2 text-xs text-stone-500">
                  Try clearing your search filters or check back shortly.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                {filteredPrograms.map((prog) => {
                  const coverImage =
                    prog.imageUrls && prog.imageUrls.length > 0
                      ? getApiImageUrl(prog.imageUrls[0])
                      : "/services/4.jpeg";

                  return (
                    <article
                      key={prog._id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-xl hover:border-orange-200"
                    >
                      {/* Image Banner */}
                      <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                        <img
                          src={coverImage}
                          alt={prog.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-stone-900/80 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white">
                            {prog.category || "Animal Welfare"}
                          </span>
                          <span className="rounded-full bg-emerald-600/90 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white">
                            {prog.status || "Active"}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6 sm:p-7">
                        <h2 className="font-serif text-2xl font-bold text-stone-900 group-hover:text-brand-orange transition">
                          {prog.title}
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                          {prog.location && <span>📍 {prog.location}</span>}
                          {prog.beneficiaries && <span>🎯 {prog.beneficiaries}</span>}
                        </div>

                        <p className="mt-4 flex-1 text-sm leading-6 text-stone-600 line-clamp-3">
                          {prog.description}
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                          <button
                            type="button"
                            onClick={() => setActiveModal(prog)}
                            className="text-xs font-bold text-brand-orange hover:text-orange-800 transition"
                          >
                            Read Full Details →
                          </button>
                          <Link
                            href="/donate"
                            className="rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold text-brand-orange hover:bg-brand-orange hover:text-white transition"
                          >
                            Support Program
                          </Link>
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

      {/* Program Details Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal Image Carousel or Banner */}
            <div className="relative h-64 sm:h-72 w-full bg-stone-900">
              <img
                src={
                  activeModal.imageUrls && activeModal.imageUrls.length > 0
                    ? getApiImageUrl(activeModal.imageUrls[0])
                    : "/services/4.jpeg"
                }
                alt={activeModal.title}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-brand-orange">
                  {activeModal.category}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {activeModal.status || "Active"}
                </span>
              </div>

              <h3 className="mt-3 font-serif text-3xl font-bold text-stone-900">
                {activeModal.title}
              </h3>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-500 pb-4 border-b border-stone-100">
                {activeModal.location && <span>📍 <strong>Location:</strong> {activeModal.location}</span>}
                {activeModal.beneficiaries && <span>🎯 <strong>Reach:</strong> {activeModal.beneficiaries}</span>}
              </div>

              {activeModal.objective && (
                <div className="mt-4 rounded-xl bg-orange-50/70 p-4 text-xs text-stone-800">
                  <strong className="block text-brand-orange uppercase tracking-wider mb-1">
                    Program Objective:
                  </strong>
                  {activeModal.objective}
                </div>
              )}

              <div className="mt-4 text-sm leading-7 text-stone-700 whitespace-pre-wrap">
                {activeModal.description}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-5">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-stone-300 px-5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Close
                </button>
                <div className="flex items-center gap-3">
                  <Link
                    href="/volunteer/register"
                    className="rounded-full border border-brand-green px-5 py-2 text-xs font-bold text-brand-green hover:bg-brand-green hover:text-white transition"
                  >
                    Volunteer Here
                  </Link>
                  <Link
                    href="/donate"
                    className="rounded-full bg-brand-orange px-6 py-2 text-xs font-bold text-white hover:bg-orange-700 transition"
                  >
                    Donate to this Cause
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
