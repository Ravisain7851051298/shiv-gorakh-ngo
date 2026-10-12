"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FiCheckCircle,
  FiShield,
  FiAward,
  FiHeart,
  FiCompass,
  FiPhone,
  FiMail,
  FiMapPin,
  FiExternalLink,
  FiTarget,
  FiArrowRight,
  FiActivity,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiZap,
  FiEye,
  FiCalendar,
} from "react-icons/fi";
import { getApiImageUrl } from "@/lib/authApi";

const DEFAULT_SETTINGS = {
  ngoName: "Shiv Gorakh Welfare Foundation",
  shortName: "Shiv Gorakh",
  suffix: "Welfare Foundation",
  tagline: "Care, dignity, and hope—made stronger when we do it together.",
  description:
    "Shiv Gorakh Welfare Foundation is a community-rooted registered non-profit foundation based in Rampur, Uttar Pradesh. We believe that care becomes meaningful when people come together and put compassion into action.",
  email: "info@shivgorakh.org.in",
  phone: "+91 93369 50578",
  alternatePhone: "+91 97590 57143",
  addressLine: "Mohammad Pur Jadied, Keorar, Milak",
  city: "Rampur",
  state: "Uttar Pradesh",
  pincode: "244701",
  country: "India",
  founderName: "Hari Om",
  founderRole: "Founder, Shiv Gorakh Welfare Foundation",
  founderImage: "/founders/HariOm.jpeg",
  founderBio: "Leading grassroots emergency animal rescue operations and social welfare initiatives across Rampur.",
  coFounderName: "Ankit Pandey",
  coFounderRole: "Co-Founder, Shiv Gorakh Welfare Foundation",
  coFounderImage: "/founders/AnkitPandey.jpeg",
  coFounderBio: "Mobilizing youth volunteer networks, street feeding drives, and medical trauma treatments.",
};

const DEFAULT_DOCUMENTS = [
  {
    title: "Memorandum of Association (MOA)",
    description: "Official foundation charter, organizational objectives, and legal registration bylaws.",
    href: "/documents/MOA.pdf",
    badge: "Public Charter",
    certificateType: "Bylaws & Charter",
  },
  {
    title: "Ministry of Corporate Affairs Approval Letter",
    description: "Central government SPICe+ Part A approval letter AC5890273 for welfare operations.",
    href: "/documents/SpicePartA_ApprovalLetter_AC5890273.pdf",
    badge: "MCA Approved",
    certificateType: "Government Approval",
  },
];

const DEFAULT_MISSIONS = [
  {
    _id: "m-1",
    type: "Mission",
    title: "Compassionate Rescue, Healing & Sanctuary for Every Stray Life",
    tagline: "Transforming animal distress into safety, treatment, and lifelong compassion",
    description:
      "To serve and protect abandoned, injured, and distressed animals across Rampur and adjoining regions by delivering 24/7 emergency medical care, free trauma surgeries, mass sterilization, and dedicated rehabilitation.",
    points: [
      "24/7 Rapid Emergency Rescue for critical and injured animals",
      "Free veterinary medical treatment, emergency surgeries & trauma care",
      "Mass anti-rabies vaccination & ethical Animal Birth Control (ABC)",
      "Daily street animal feeding drives & community compassion workshops",
    ],
  },
  {
    _id: "m-2",
    type: "Vision",
    title: "A Society Free of Stray Suffering & Animal Cruelty by 2030",
    tagline: "A future where every street animal is protected, nourished, and respected",
    description:
      "We envision an India where every community coexists harmoniously with animals, where no stray animal dies alone on the streets due to lack of medical aid, and where kindness is ingrained in civic culture.",
    points: [
      "Zero unattended stray animal road accidents and medical emergencies",
      "Building a premier modern animal hospital and permanent lifetime sanctuary",
      "Educating youth and schools on humane animal rights and compassion",
      "Empowering citizen volunteer rescue squads in every neighborhood",
    ],
  },
];

const IMPACT_METRICS = [
  {
    value: "4,800+",
    label: "Stray Animals Treated",
    detail: "Emergency trauma, wound dressings, and life-saving outpatient care across Rampur.",
    icon: FiActivity,
    color: "text-brand-orange bg-orange-100",
  },
  {
    value: "180+",
    label: "Meals Served Daily",
    detail: "Freshly prepared nutritious meals distributed every evening by volunteer feeder routes.",
    icon: FiCalendar,
    color: "text-amber-700 bg-amber-100",
  },
  {
    value: "1,250+",
    label: "Vaccinations & Collars",
    detail: "Free anti-rabies inoculations and high-visibility reflective collars fitted for road safety.",
    icon: FiShield,
    color: "text-emerald-700 bg-emerald-100",
  },
  {
    value: "340+",
    label: "Sterilizations & Surgeries",
    detail: "Humane Animal Birth Control (ABC) and complex orthopedic surgeries by partner veterinary surgeons.",
    icon: FiZap,
    color: "text-indigo-700 bg-indigo-100",
  },
  {
    value: "25 min",
    label: "Avg. Hotline Response",
    detail: "Rapid response ambulance dispatch for critical road accidents and reported trauma.",
    icon: FiClock,
    color: "text-rose-700 bg-rose-100",
  },
  {
    value: "250+",
    label: "Active Volunteer Network",
    detail: "Dedicated college youth, local caretakers, and foster guardians active in every ward.",
    icon: FiUsers,
    color: "text-teal-700 bg-teal-100",
  },
];

const WHY_CHOOSE_US_POINTS = [
  {
    title: "100% Radical Transparency & Open Audit",
    description:
      "Every single rupee received is accounted for in public records. We publish our Ministry of Corporate Affairs (MCA) filings, MOA bylaws, and expenditure reports without secrecy.",
    badge: "Accountability First",
    icon: FiFileText,
  },
  {
    title: "24/7 Rapid Ambulance & Field Dispatch",
    description:
      "Our emergency distress hotline operates around the clock. When a community animal is struck by a vehicle or in agony, our trained handlers mobilize on site with medical splints within 25 minutes.",
    badge: "Fastest Ground Response",
    icon: FiClock,
  },
  {
    title: "Direct Donor Verification & Photo Proof",
    description:
      "We believe donors deserve to see their kindness at work. We share photographic and video recovery logs for every animal admitted, fed, or operated under our care.",
    badge: "Photographic Evidence",
    icon: FiEye,
  },
  {
    title: "Licensed Veterinary Surgical Standards",
    description:
      "All surgical interventions, sterilizations, and wound debridement are supervised by licensed veterinary surgeons adhering to the highest humane clinical standards.",
    badge: "Clinical Excellence",
    icon: FiShield,
  },
  {
    title: "Zero Corporate Bloat (Over 92% to Animals)",
    description:
      "We operate with lean grassroots efficiency. More than 92% of donated funds go directly into animal food bags, antiseptic medicines, vaccines, and surgical materials.",
    badge: "Maximum Direct Impact",
    icon: FiTrendingUp,
  },
  {
    title: "Tax Benefits & Instant 80G Receipts",
    description:
      "As a legally approved welfare foundation, your charitable gifts qualify for official tax exemptions under Indian statutory laws, backed by instant digital receipts.",
    badge: "Tax Exemption Ready",
    icon: FiAward,
  },
];

const ABOUT_NAV_LINKS = [
  { id: "who-we-are", label: "Who We Are", icon: FiUsers },
  { id: "mission-vision", label: "Mission & Vision", icon: FiCompass },
  { id: "impact", label: "Our Impact", icon: FiActivity },
  { id: "why-choose-us", label: "Why Choose Us", icon: FiCheckCircle },
  { id: "leadership", label: "Leadership", icon: FiHeart },
  { id: "legal-transparency", label: "Legal & Audit", icon: FiShield },
];

export default function AboutUsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [missionItems, setMissionItems] = useState(DEFAULT_MISSIONS);
  const [certificates, setCertificates] = useState([]);
  const [programsCount, setProgramsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("who-we-are");

  useEffect(() => {
    let isMounted = true;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");

    async function fetchData() {
      try {
        // Fetch NGO Settings
        const settingsRes = await fetch(`${apiBase}/ngo-settings`, { cache: "no-store" }).catch(() => null);
        if (settingsRes && settingsRes.ok) {
          const sJson = await settingsRes.json();
          if (isMounted && sJson?.data) {
            setSettings((prev) => ({ ...prev, ...sJson.data }));
          }
        }

        // Fetch Mission & Vision
        const mvRes = await fetch(`${apiBase}/mission-vision/all`, { cache: "no-store" }).catch(() => null);
        if (mvRes && mvRes.ok) {
          const mvJson = await mvRes.json();
          const list = mvJson.missionVisions || mvJson.items || [];
          if (isMounted && Array.isArray(list) && list.length > 0) {
            setMissionItems(list.filter((x) => x.status !== "Draft"));
          }
        }

        // Fetch Certificates
        const certRes = await fetch(`${apiBase}/certificates/all`, { cache: "no-store" }).catch(() => null);
        if (certRes && certRes.ok) {
          const cJson = await certRes.json();
          const list = cJson.certificates || cJson.items || [];
          if (isMounted && Array.isArray(list)) {
            setCertificates(list);
          }
        }

        // Fetch Programs Count
        const progRes = await fetch(`${apiBase}/programs/all`, { cache: "no-store" }).catch(() => null);
        if (progRes && progRes.ok) {
          const pJson = await progRes.json();
          const total = pJson.pagination?.total || pJson.programs?.length || 0;
          if (isMounted) setProgramsCount(total);
        }
      } catch (err) {
        // Fallback data is already set
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Hash Scrolling on mount or hash change
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleHashScroll() {
      const hash = window.location.hash?.replace("#", "");
      if (hash) {
        setActiveSection(hash);
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      }
    }

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  // Intersection Observer for subnav active tracking
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const sections = ABOUT_NAV_LINKS.map((link) => document.getElementById(link.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible && visible.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const fullAddress = [
    settings.addressLine,
    settings.city,
    settings.state,
    settings.pincode,
    settings.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="overflow-hidden bg-[#faf7f2]">
      {/* ======================================================== */}
      {/* 1. HERO HEADER SECTION                                   */}
      {/* ======================================================== */}
      <section className="relative isolate overflow-hidden bg-brand-green p-6 text-white sm:p-12 lg:p-20">
        <div className="absolute inset-0 -z-10 grid grid-cols-2 opacity-20 sm:grid-cols-3" aria-hidden="true">
          {["/services/9.jpeg", "/services/4.jpeg", "/services/10.jpeg"].map((src) => (
            <div className="relative min-h-64 overflow-hidden" key={src}>
              <Image className="object-cover" src={src} alt="" fill sizes="33vw" priority />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-green via-brand-green/95 to-brand-green/75" />

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/25 px-4 py-1.5 backdrop-blur-md text-xs font-bold uppercase tracking-[0.16em] text-orange-200"
          >
            {settings?.logo ? (
              <img
                src={getApiImageUrl(settings.logo)}
                alt={settings.ngoName || "NGO Logo"}
                className="size-7 rounded-full object-cover ring-2 ring-orange-400 bg-white"
              />
            ) : (
              <span className="grid size-7 place-items-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
                {settings?.logoInitials || "SG"}
              </span>
            )}
            <span>Official Foundation Dossier • {settings.ngoName}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl font-serif text-5xl leading-[1.04] tracking-tight sm:text-7xl lg:text-8xl"
          >
            Local roots.<br />
            <span className="italic text-orange-200">Relentless action.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 max-w-2xl text-base leading-relaxed text-white/90 sm:text-xl sm:leading-8"
          >
            {settings.description}
          </motion.p>

          {/* Direct Anchor Jump Pills in Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a
              href="#who-we-are"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-orange px-6 text-xs font-bold text-white shadow-lg shadow-orange-700/30 transition hover:bg-orange-700"
            >
              <span>Who We Are</span>
              <FiArrowRight size={13} />
            </a>

            <a
              href="#mission-vision"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-green"
            >
              <span>Mission &amp; Vision</span>
              <FiCompass size={13} />
            </a>

            <a
              href="#impact"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-green"
            >
              <span>Our Impact</span>
              <FiActivity size={13} />
            </a>

            <a
              href="#why-choose-us"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-green"
            >
              <span>Why Choose Us</span>
              <FiCheckCircle size={13} />
            </a>

            <a
              href="#legal-transparency"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-green"
            >
              <span>Legal Audit</span>
              <FiShield size={13} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* STICKY IN-PAGE SUBNAV RIBBON                             */}
      {/* ======================================================== */}
      <nav
        aria-label="About Us in-page sections"
        className="sticky top-[68px] sm:top-[72px] z-30 border-b border-orange-200/80 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md transition-all"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {ABOUT_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setActiveSection(link.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${isActive
                    ? "bg-brand-orange text-white shadow-xs"
                    : "text-stone-600 hover:bg-orange-50 hover:text-brand-orange"
                    }`}
                >
                  <Icon size={12} className={isActive ? "text-white" : "text-brand-orange"} />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          <Link
            href="/volunteer/register"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-orange transition shrink-0"
          >
            <span>Volunteer</span>
            <FiArrowRight size={12} />
          </Link>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. SECTION: #who-we-are                                   */}
      {/* ======================================================== */}
      <section
        id="who-we-are"
        className="scroll-mt-0 px-6 py-16 sm:px-10 lg:px-16 lg:py-24 border-b border-orange-100"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative min-h-96 overflow-hidden rounded-3xl bg-orange-100 shadow-xl sm:min-h-[480px]"
          >
            <Image
              src="/services/9.jpeg"
              alt="Foundation volunteers carrying out hands-on community field work"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <span className="inline-block rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Grassroots Action
              </span>
              <p className="mt-2 font-serif text-xl font-bold text-white sm:text-2xl">
                Showing up, side by side.
              </p>
              <p className="mt-1 text-xs text-stone-200">
                Operating directly across {settings.city}, {settings.state}.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/70 px-3.5 py-1 text-xs font-bold text-brand-orange">
              <span>Section: Who We Are</span>
            </div>

            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl">
              A local foundation, <br />
              <span className="italic text-brand-orange">built around empathy.</span>
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-stone-600 sm:text-base sm:leading-8">
              <p>
                <strong>{settings.ngoName}</strong> is headquartered at {fullAddress}. Founded by grassroots animal welfare workers and youth caregivers, its mission stems from a simple, undeniable truth: when local citizens organize around collective goodwill, no vulnerable street life needs to suffer unattended.
              </p>
              <p>
                In smaller urban clusters and highways across Uttar Pradesh, municipal animal infrastructure has historically been scarce. We stepped into this gap by establishing an on-ground 24/7 volunteer hotline, emergency trauma stabilization ambulances, post-operative foster shelter care, and daily community feeder routes.
              </p>
              <p>
                We do not operate as a detached corporate charity. Every member of our leadership team is in the field—administering antiseptic dressings, lifting injured street dogs onto stretchers, and serving freshly prepared food in neighborhood alleys.
              </p>
            </div>

            {/* Core Tenets Strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-orange-200/80 bg-white p-3.5 shadow-2xs">
                <span className="text-xs font-bold text-stone-900 block">Radical Proximity</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Volunteers stationed within 15 minutes of key Rampur junctions.
                </span>
              </div>
              <div className="rounded-2xl border border-orange-200/80 bg-white p-3.5 shadow-2xs">
                <span className="text-xs font-bold text-stone-900 block">Open Door Sanctuary</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  No sick or distressed animal turned away regardless of condition.
                </span>
              </div>
            </div>

            {/* Quick stats ribbon */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-stone-200 pt-6">
              <div>
                <span className="block font-serif text-3xl font-bold text-stone-900">24/7</span>
                <span className="text-xs text-stone-500 font-medium">Emergency Response</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-brand-orange">
                  {programsCount > 0 ? `${programsCount}+` : "12+"}
                </span>
                <span className="text-xs text-stone-500 font-medium">Active Programs</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-emerald-700">100%</span>
                <span className="text-xs text-stone-500 font-medium">Verified Records</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION: #mission-vision                              */}
      {/* ======================================================== */}
      <section
        id="mission-vision"
        className="scroll-mt-12 relative border-b border-orange-100 bg-white px-6 py-20 sm:px-10 lg:px-16"
      >
        {/* Alias anchor for backwards compatibility */}
        <div id="mission-vision-anchor" className="absolute -top-28 left-0 pointer-events-none" />

        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <FiTarget size={13} />
              <span>Section: Mission &amp; Vision</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
              Mission, Vision &amp; Strategic Commitments
            </h2>
            <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed">
              These principles guide every rupee received, every emergency ambulance dispatch, and every animal rehabilitated by our team.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {missionItems.map((item, idx) => {
              const isMission = item.type === "Mission";
              const isVision = item.type === "Vision";
              const IconComp = isMission ? FiHeart : isVision ? FiCompass : FiShield;
              const accentColor = isMission
                ? "border-orange-200 bg-orange-50/50"
                : isVision
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-indigo-200 bg-indigo-50/50";
              const badgeColor = isMission
                ? "bg-orange-100 text-brand-orange"
                : isVision
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-indigo-100 text-indigo-800";
              const iconColor = isMission
                ? "bg-brand-orange text-white"
                : isVision
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white";

              return (
                <motion.article
                  key={item._id || idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className={`flex flex-col justify-between rounded-3xl border p-8 shadow-sm transition hover:shadow-lg ${accentColor}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`grid size-12 place-items-center rounded-2xl shadow-md ${iconColor}`}>
                        <IconComp size={22} />
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
                        {item.type}
                      </span>
                    </div>

                    <h3 className="mt-6 font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h3>

                    {item.tagline && (
                      <p className="mt-3 border-l-2 border-brand-orange pl-3 text-xs italic font-medium text-stone-500">
                        "{item.tagline}"
                      </p>
                    )}

                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-600">
                      {item.description}
                    </p>

                    {Array.isArray(item.points) && item.points.length > 0 && (
                      <div className="mt-6 border-t border-stone-200/60 pt-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                          Key Pillars &amp; Operational Objectives
                        </p>
                        <ul className="mt-3 space-y-2">
                          {item.points.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                              <FiCheckCircle className="mt-0.5 shrink-0 text-brand-orange" size={15} />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 border-t border-stone-200/60 pt-5 flex items-center justify-between">
                    <Link
                      href="/donate"
                      className="text-xs font-bold text-stone-900 hover:text-brand-orange transition flex items-center gap-1.5"
                    >
                      <span>Support This Cause</span>
                      <FiArrowRight size={13} />
                    </Link>
                    <Link
                      href="/volunteer/register"
                      className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-orange shadow-sm"
                    >
                      Volunteer
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SECTION: #impact                                       */}
      {/* ======================================================== */}
      <section
        id="impact"
        className="scroll-mt-0 px-6 py-20 sm:px-10 lg:px-16 bg-[#fbf6ef] border-b border-orange-200/60"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/70 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <FiActivity size={13} />
              <span>Section: Our Impact</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
              Verified Ground Impact &amp; Lives Touched
            </h2>
            <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed">
              Real metrics, real rescues, and verifiable milestones achieved across Rampur and adjoining towns through relentless volunteer action.
            </p>
          </div>

          {/* 6 Key Impact Metrics Grid */}
          <div className="mt-14 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {IMPACT_METRICS.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="rounded-3xl border border-orange-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`grid size-12 place-items-center rounded-2xl ${metric.color}`}>
                        <Icon size={22} />
                      </div>
                      <span className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900">
                        {metric.value}
                      </span>
                    </div>

                    <h3 className="mt-5 font-serif text-lg font-bold text-stone-900">
                      {metric.label}
                    </h3>
                    <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                      {metric.detail}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="font-mono text-emerald-700 font-semibold">✓ Verified Record</span>
                    <span className="text-brand-orange font-bold">Rampur Hub</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Impact Transformation Milestones */}
          <div className="mt-14 rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200/70">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Field Milestone Archives
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  On-Scene Transformations
                </h3>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-orange-700"
              >
                <span>Browse entire photo &amp; video gallery</span>
                <FiArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="space-y-3">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-100">
                  <Image src="/services/1.jpeg" alt="Post-operative care" fill className="object-cover" />
                </div>
                <h4 className="font-serif text-base font-bold text-stone-900">Post-Op Trauma Rehabilitation</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  24/7 foster convalescence watch following critical orthopedic stabilization for hit-and-run animal survivors.
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-100">
                  <Image src="/services/3.jpeg" alt="Puppy foster haven" fill className="object-cover" />
                </div>
                <h4 className="font-serif text-base font-bold text-stone-900">Safe Haven Puppy Nursery</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Protecting vulnerable orphaned litters from harsh northern monsoon and winter rains with warmth and pediatric deworming.
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-100">
                  <Image src="/services/6.jpeg" alt="Mass vaccination camp" fill className="object-cover" />
                </div>
                <h4 className="font-serif text-base font-bold text-stone-900">Rabies-Free Rampur Drives</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Neighborhood-by-neighborhood mass rabies vaccination camps combined with bright reflective road collars.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION: #why-choose-us                                */}
      {/* ======================================================== */}
      <section
        id="why-choose-us"
        className="scroll-mt-0 px-6 py-20 sm:px-10 lg:px-16 bg-white border-b border-orange-100"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <FiCheckCircle size={13} />
              <span>Section: Why Choose Us</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
              Why Citizens &amp; Donors Trust Shiv Gorakh
            </h2>
            <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed">
              We stand apart through unconditional operational transparency, direct donor feedback loops, and pure grassroots dedication.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE_US_POINTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="rounded-3xl border border-stone-200 bg-[#faf8f5] p-7 shadow-2xs hover:shadow-lg hover:border-brand-orange/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-brand-orange shadow-2xs">
                        <Icon size={22} />
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-orange border border-orange-200">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="mt-6 font-serif text-xl font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-600">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs font-bold text-brand-orange">
                    <span>Active Standard</span>
                    <span>✓ Guaranteed</span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SECTION: #leadership                                   */}
      {/* ======================================================== */}
      <section
        id="leadership"
        className="scroll-mt-28 px-6 py-16 sm:px-10 lg:px-16 lg:py-24 border-b border-orange-100"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
                Foundation Leadership
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
                The people steering the mission.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Founded under the leadership of {settings.founderName} and {settings.coFounderName}, our operations are driven entirely by ground presence, volunteer engagement, and complete dedication to public welfare.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {/* Founder 1 */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:shadow-xl"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-orange-50">
                <Image
                  className="object-cover object-center transition duration-500 group-hover:scale-105"
                  src={settings.founderImage || "/founders/HariOm.jpeg"}
                  alt={`${settings.founderName}, ${settings.founderRole}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 sm:p-8">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Leadership
                </span>
                <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {settings.founderName}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-orange">
                  {settings.founderRole}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-stone-600">
                  {settings.founderBio}
                </p>
              </div>
            </motion.article>

            {/* Founder 2 */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:shadow-xl"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-orange-50">
                <Image
                  className="object-cover object-center transition duration-500 group-hover:scale-105"
                  src={settings.coFounderImage || "/founders/AnkitPandey.jpeg"}
                  alt={`${settings.coFounderName}, ${settings.coFounderRole}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 sm:p-8">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Co-Leadership
                </span>
                <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {settings.coFounderName}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-orange">
                  {settings.coFounderRole}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-stone-600">
                  {settings.coFounderBio}
                </p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. SECTION: #legal-transparency                          */}
      {/* ======================================================== */}
      <section
        id="legal-transparency"
        className="scroll-mt-28 bg-brand-green px-6 py-20 text-white sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-200">
                <FiShield size={14} />
                <span>Verified Legal Filings</span>
              </div>

              <h2 className="mt-4 font-serif text-4xl sm:text-5xl font-bold leading-tight">
                Complete Transparency. <br />
                <span className="italic text-orange-200">Publicly Audited Records.</span>
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-green-50/85">
                We believe public confidence begins with unconditional openness. Below are official government certificates, approvals, and legal bylaws for {settings.ngoName}.
              </p>

              {/* Combined Documents & Certificates Grid */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* Default Legal PDFs */}
                {DEFAULT_DOCUMENTS.map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col justify-between rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition hover:border-orange-300 hover:bg-white/20"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid size-10 place-items-center rounded-xl bg-orange-300/20 text-xs font-bold text-orange-200">
                          PDF
                        </span>
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-orange-200">
                          {doc.badge}
                        </span>
                      </div>
                      <h4 className="mt-4 font-serif text-lg font-bold text-white group-hover:text-orange-100 transition">
                        {doc.title}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-green-50/75">
                        {doc.description}
                      </p>
                    </div>

                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-orange-200">
                      <span>Open document</span>
                      <FiExternalLink size={12} />
                    </span>
                  </a>
                ))}

                {/* Dynamic API Certificates */}
                {certificates.map((cert) => {
                  const certImage = Array.isArray(cert.imageUrls) && cert.imageUrls[0];
                  const certLink = cert.fileUrl
                    ? getApiImageUrl(cert.fileUrl)
                    : certImage
                      ? getApiImageUrl(certImage)
                      : "/certificates";

                  return (
                    <a
                      key={cert._id}
                      href={certLink}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col justify-between rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition hover:border-orange-300 hover:bg-white/20"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/20 text-xs font-bold text-emerald-200">
                            <FiAward size={18} />
                          </span>
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-orange-200">
                            {cert.certificateType || "Official Certificate"}
                          </span>
                        </div>
                        <h4 className="mt-4 font-serif text-lg font-bold text-white group-hover:text-orange-100 transition">
                          {cert.title}
                        </h4>
                        {cert.certificateNumber && (
                          <p className="mt-1 font-mono text-xs text-orange-200 font-semibold">
                            ID: {cert.certificateNumber}
                          </p>
                        )}
                        <p className="mt-2 text-xs leading-relaxed text-green-50/75 line-clamp-2">
                          {cert.description || `Issued by ${cert.issuingAuthority || "Competent Authority"}`}
                        </p>
                      </div>

                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-orange-200">
                        <span>View certificate</span>
                        <FiExternalLink size={12} />
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Visit / Contact Card (Dynamic from NGO Settings) */}
            <aside className="rounded-3xl border border-white/20 bg-white/10 p-7 sm:p-9 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-200">
                Official Head Office
              </span>
              <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                {settings.ngoName}
              </h3>
              <p className="mt-1 text-xs text-green-50/70 italic">
                {settings.tagline}
              </p>

              <div className="mt-6 space-y-4 text-sm text-green-50/90">
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-1 shrink-0 text-orange-300" size={17} />
                  <address className="not-italic leading-relaxed">
                    {fullAddress}
                  </address>
                </div>

                <div className="flex items-center gap-3">
                  <FiMail className="shrink-0 text-orange-300" size={17} />
                  <a
                    className="hover:text-white transition font-semibold"
                    href={`mailto:${settings.email}`}
                  >
                    {settings.email}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <FiPhone className="shrink-0 text-orange-300" size={17} />
                  <div className="flex flex-wrap gap-2">
                    <a
                      className="hover:text-white transition font-semibold"
                      href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    >
                      {settings.phone}
                    </a>
                    {settings.alternatePhone && (
                      <>
                        <span className="text-white/40">|</span>
                        <a
                          className="hover:text-white transition font-semibold"
                          href={`tel:${settings.alternatePhone.replace(/\s+/g, "")}`}
                        >
                          {settings.alternatePhone}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/20 pt-6">
                <Link
                  href="/donate"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-700"
                >
                  <FiHeart className="fill-white" size={15} />
                  <span>Make a Tax-Exempt Donation</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. CALL TO ACTION                                        */}
      {/* ======================================================== */}
      <section className="px-6 py-20 text-center sm:px-10 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange">
            Join The Movement
          </p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
            Compassion is only as real as our willingness to act.
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-600">
            Whether you volunteer for a few hours over the weekend, report an injured stray animal, or support our medical supplies, every contribution brings hope to a vulnerable life.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/volunteer/register"
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-brand-orange px-8 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700"
            >
              <span>Register as Volunteer</span>
              <FiArrowRight size={15} />
            </Link>
            <Link
              href="/donate"
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-stone-300 bg-white px-8 text-sm font-bold text-stone-800 transition hover:bg-stone-50"
            >
              <span>Donate Towards Treatment</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}