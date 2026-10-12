"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCampaigns } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

const DEFAULT_CAMPAIGNS = [
  {
    _id: "def-camp-1",
    title: "Emergency Animal Ambulance & Trauma Unit for Rampur Rural Belt",
    category: "Emergency Transit",
    status: "Urgent",
    targetAmount: 250000,
    raisedAmount: 185000,
    date: new Date().toISOString(),
    imageUrls: ["/services/1.jpeg", "/services/4.jpeg"],
    description:
      "Severely injured animals on highways and rural village roads currently wait hours for transport to veterinary care. We are raising funds to equip a dedicated rescue vehicle with oxygen support, stretcher, saline drip setup, and emergency medicines.",
  },
  {
    _id: "def-camp-2",
    title: "Winter Shelter & Warm Broth Drive for 500+ Community Strays",
    category: "Winter Relief",
    status: "Active",
    targetAmount: 85000,
    raisedAmount: 62000,
    date: new Date().toISOString(),
    imageUrls: ["/services/3.jpeg", "/services/2.jpeg"],
    description:
      "Extreme cold waves across western Uttar Pradesh threaten newborn puppies and sick street animals. This drive funds 350 waterproof insulated bedding spots and daily hot protein broth feeding throughout December and January.",
  },
  {
    _id: "def-camp-3",
    title: "Mega Stray Dog Vaccination & Anti-Rabies Campaign 2026",
    category: "Public Health & Safety",
    status: "Active",
    targetAmount: 120000,
    raisedAmount: 78000,
    date: new Date().toISOString(),
    imageUrls: ["/services/5.jpeg", "/services/6.jpeg"],
    description:
      "Help us administer 1,000 certified Nobivac rabies vaccines and anti-parasitic spot-on treatments across roadside colonies, preventing rabies spread and safeguarding both humans and street animals.",
  },
];

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

export default function CampaignsView() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getCampaigns({ limit: 50 });
      if (res.success && res.items?.length > 0) {
        setCampaigns(res.items);
      } else {
        setCampaigns(DEFAULT_CAMPAIGNS);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Campaigns Listing */}
      <section id="campaigns-list" className="px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">Verified Appeals</p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-stone-900">Active Foundation Campaigns</h2>
            </div>
            <div className="text-xs text-stone-500">
              Contributions are 100% verified and eligible for 80G tax exemption receipts.
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="py-20 text-center text-sm text-stone-500 animate-pulse">
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
                <p className="font-serif text-2xl text-stone-900">No active campaigns listed</p>
                <p className="mt-2 text-xs text-stone-500">
                  Please contact the foundation or make a direct donation.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((camp) => {
                  const target = Number(camp.targetAmount || 0);
                  const raised = Number(camp.raisedAmount || 0);
                  const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
                  const coverImage =
                    camp.imageUrls && camp.imageUrls.length > 0
                      ? getApiImageUrl(camp.imageUrls[0])
                      : "/services/4.jpeg";

                  return (
                    <article
                      key={camp._id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-xl hover:border-orange-200"
                    >
                      <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                        <img
                          src={coverImage}
                          alt={camp.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold text-white shadow ${camp.status === "Urgent"
                                ? "bg-rose-600 animate-pulse"
                                : "bg-emerald-600"
                              }`}
                          >
                            {camp.status || "Active"}
                          </span>
                          {camp.category && (
                            <span className="rounded-full bg-stone-900/80 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white">
                              {camp.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-brand-orange transition line-clamp-2">
                          {camp.title}
                        </h3>

                        <p className="mt-3 flex-1 text-xs leading-5 text-stone-600 line-clamp-3">
                          {camp.description}
                        </p>

                        {/* Financial Progress Bar */}
                        <div className="mt-5 rounded-xl bg-orange-50/70 p-4 border border-orange-100">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-stone-700">
                              Raised: <strong className="text-emerald-700 font-bold">{formatCurrency(raised)}</strong>
                            </span>
                            <span className="text-stone-500">Goal: {formatCurrency(target)}</span>
                          </div>
                          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="mt-2 flex justify-between text-[11px] text-stone-500 font-medium">
                            <span className="text-brand-orange font-bold">{percent}% funded</span>
                            <span>Direct Impact</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                          <button
                            type="button"
                            onClick={() => setActiveModal(camp)}
                            className="text-xs font-bold text-stone-600 hover:text-brand-orange transition"
                          >
                            Read Details →
                          </button>
                          <Link
                            href={`/donate?campaignId=${camp._id}&campaignTitle=${encodeURIComponent(camp.title)}`}
                            className="rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
                          >
                            Donate Now
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

      {/* Give Safely Aside Section */}
      <section className="bg-brand-green px-6 py-12 sm:px-10 lg:px-16 text-white">
        <div className="mx-auto max-w-4xl grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <h3 className="font-serif text-3xl font-bold">100% Transparent Philanthropy</h3>
            <p className="mt-3 text-sm text-green-50/90 leading-6">
              All campaign proceeds directly fund medicines, veterinary transit, emergency surgeries, and daily animal feeds. Receipts with 80G tax deductions are issued instantly to donors upon donation approval.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
            <Link
              href="/donate"
              className="rounded-full bg-white px-6 py-3 text-center text-xs font-bold text-stone-900 hover:bg-orange-50 transition"
            >
              Open Donation Portal
            </Link>
            <Link
              href="/certificates"
              className="rounded-full border border-white/40 px-6 py-3 text-center text-xs font-bold text-white hover:bg-white/10 transition"
            >
              Verify 80G Tax Exemption
            </Link>
          </div>
        </div>
      </section>

      {/* Modal View */}
      {activeModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
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
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-brand-orange">
                {activeModal.category || "Fundraising Appeal"}
              </span>

              <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {activeModal.title}
              </h2>

              <div className="mt-5 rounded-2xl bg-orange-50/70 p-4 border border-orange-100">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-stone-700">
                    Raised: <strong className="text-emerald-700 font-bold">{formatCurrency(activeModal.raisedAmount)}</strong>
                  </span>
                  <span className="text-stone-500">Goal: {formatCurrency(activeModal.targetAmount)}</span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((Number(activeModal.raisedAmount || 0) / Number(activeModal.targetAmount || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 text-sm leading-7 text-stone-700 whitespace-pre-wrap">
                {activeModal.description}
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-stone-300 px-5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Close
                </button>
                <Link
                  href={`/donate?campaignId=${activeModal._id}&campaignTitle=${encodeURIComponent(activeModal.title)}`}
                  className="rounded-full bg-brand-orange px-6 py-2 text-xs font-bold text-white hover:bg-orange-700 transition"
                >
                  Contribute to this Campaign
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
