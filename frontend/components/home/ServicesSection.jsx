"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FiActivity,
  FiPhoneCall,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiHeart,
  FiTruck,
  FiSun,
  FiCheck,
} from "react-icons/fi";
import { getServices } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

const FALLBACK_SERVICES = [
  {
    _id: "s1",
    title: "24/7 Mobile Animal Ambulance & Emergency Rescue",
    category: "Emergency Trauma & Rescue",
    description:
      "Equipped mobile animal ambulance operating 24 hours a day across Rampur and adjoining highways for road accident victims, fallen strays, and critical animal rescue.",
    features: [
      "24/7 Rapid Transit",
      "On-Board Oxygen & Stretcher",
      "Trained Field Handlers",
      "Highway Accident Response",
    ],
    imageUrls: ["/services/7.jpeg"],
  },
  {
    _id: "s2",
    title: "On-Spot Mobile Trauma Care & First Aid",
    category: "Medical & Pain Relief",
    description:
      "Immediate on-ground veterinary triage, antiseptic wound dressing, pain-relieving injections, and stabilization for severely injured street animals.",
    features: [
      "Sterile Medical Kits",
      "Antiseptic Wound Cleaning",
      "Pain Relief & Antibiotics",
      "Maggot Wound Treatment",
    ],
    imageUrls: ["/services/4.jpeg"],
  },
  {
    _id: "s3",
    title: "Anti-Rabies Mass Vaccination & Immunization Drives",
    category: "Preventive Healthcare",
    description:
      "Conducting community-wide vaccination camps to eradicate rabies, protect vulnerable stray dogs and cats, and build safe human-animal coexistence.",
    features: [
      "Govt. Certified Vaccines",
      "Geotagged Vaccinations",
      "Reflective Collar Fitting",
      "Community Health Tracking",
    ],
    imageUrls: ["/services/6.jpeg"],
  },
  {
    _id: "s4",
    title: "Daily Stray Animal Feeding & Nutritional Support",
    category: "Feeding & Nourishment",
    description:
      "Daily meal distribution across slums, railway lines, market sectors, and rural outskirts feeding hundreds of hungry street animals nutritious meals and clean water.",
    features: [
      "Fresh Cooked Warm Meals",
      "Clean Drinking Water Bowls",
      "Puppy Nutrition Support",
      "Winter Feeding Rounds",
    ],
    imageUrls: ["/services/5.jpeg"],
  },
  {
    _id: "s5",
    title: "Animal Birth Control (ABC) & Safe Sterilization",
    category: "Humane Population Control",
    description:
      "Humane surgical sterilization and post-operative recuperation adhering strictly to Animal Welfare Board of India (AWBI) guidelines to control stray overpopulation.",
    features: [
      "Experienced Veterinary Surgeons",
      "Safe Anesthesia Protocols",
      "Post-Op In-Shelter Care",
      "Ear-Notching for ID",
    ],
    imageUrls: ["/services/2.jpeg"],
  },
  {
    _id: "s6",
    title: "Lifetime Sanctuary & Critical Surgery Rehabilitation",
    category: "Shelter & Lifetime Care",
    description:
      "A permanent peaceful haven for paralyzed, blind, amputee, and geriatric animals who cannot survive on the streets, providing lifetime nutritious food, warmth, and love.",
    features: [
      "Specially Designed Wheelchairs",
      "Disabled Dog Enclosures",
      "Continuous Vet Monitoring",
      "Lifetime Compassion & Dignity",
    ],
    imageUrls: ["/services/10.jpeg"],
  },
];

export default function ServicesSection() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await getServices({ page: 1, limit: 12 });
        if (isMounted && res.success && Array.isArray(res.items) && res.items.length > 0) {
          const active = res.items.filter((s) => s.status !== "Draft");
          if (active.length > 0) {
            setServices(active);
          }
        }
      } catch (err) {
        // keep fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="our-services"
      className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50/60 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -left-20 top-20 size-96 rounded-full bg-orange-100/50 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-20 size-96 rounded-full bg-amber-100/40 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* ==================================================== */}
        {/* Section Header (Fluid & Responsive Across Devices)   */}
        {/* ==================================================== */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-brand-orange shadow-2xs"
          >
            <FiActivity className="size-3.5 shrink-0" />
            <span className="tracking-wide uppercase">Compassionate Lifelines · What We Do</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight"
          >
            Round-the-Clock Emergency Services &amp;{" "}
            <span className="bg-gradient-to-r from-orange-600 via-brand-orange to-amber-600 bg-clip-text text-transparent">
              Dedicated Field Care
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-3.5 text-sm sm:text-base lg:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto"
          >
            Every day in Rampur, hundreds of voiceless animals face accidents, starvation, and trauma.
            Our field ambulance units, veterinarians, and volunteer teams respond immediately.
          </motion.p>
        </div>

        {/* ==================================================== */}
        {/* Services Grid (Card UI: Responsive 1/2/3 Cols)       */}
        {/* ==================================================== */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
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
              ? service.features.split(/\r?\n|,/).map((f) => f.trim()).filter(Boolean)
              : [];

            return (
              <motion.article
                key={service._id || service.title || index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10"
              >
                {/* Image Container with Category Badge */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                  {/* Category Chip */}
                  <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-stone-800 shadow-sm">
                    <span className="size-1.5 rounded-full bg-brand-orange animate-pulse" />
                    {service.category || "Animal Welfare Service"}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-brand-orange transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-600 line-clamp-3">
                    {service.description}
                  </p>

                  {/* Key Highlights / Features */}
                  {featuresList.length > 0 && (
                    <ul className="mt-4 space-y-1.5 border-t border-stone-100 pt-3 text-xs text-stone-700">
                      {featuresList.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <FiCheck className="size-3.5 shrink-0 text-emerald-600" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Card Footer Action */}
                  <div className="mt-auto pt-5 flex items-center justify-between gap-3 border-t border-stone-100/80">
                    <Link
                      href="/our-services"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-orange-700 transition"
                    >
                      <span>Learn Details</span>
                      <FiArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href={`/donate?cause=${encodeURIComponent(service.title)}`}
                      className="rounded-lg bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-brand-orange hover:bg-orange-100 transition"
                    >
                      Sponsor Care
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ==================================================== */}
        {/* Bottom Banner: Emergency Callout & All Services Link */}
        {/* ==================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl sm:rounded-3xl border border-orange-200/90 bg-gradient-to-r from-orange-500 via-brand-orange to-amber-600 p-6 sm:p-8 text-white shadow-lg"
        >
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <FiPhoneCall className="size-3.5" />
              <span>Need Immediate Rescue In Rampur?</span>
            </span>
            <h4 className="mt-2 font-serif text-xl sm:text-2xl font-bold">
              Call our rapid ambulance response dispatch now
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-orange-100">
              Operating 24/7 across Milak, Rampur, and NH-24 highway accident stretches.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="tel:+919336950578"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-900 shadow-md transition hover:bg-stone-50 hover:shadow-lg active:scale-95"
            >
              <FiPhoneCall className="text-brand-orange" />
              <span>+91 93369 50578</span>
            </a>
            <Link
              href="/our-services"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <span>All Services &amp; Facilities</span>
              <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
