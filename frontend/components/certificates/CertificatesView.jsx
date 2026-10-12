"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCertificates } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";

const DEFAULT_DOCUMENTS = [
  {
    name: "Memorandum of Association (MOA)",
    href: "/documents/MOA.pdf",
    description: "Official Section 8 non-profit constitution and governance bylaws",
    type: "Legal Constitution",
  },
  {
    name: "Government Approval Letter (SpicePartA)",
    href: "/documents/SpicePartA_ApprovalLetter_AC5890273.pdf",
    description: "Ministry of Corporate Affairs name reservation & approval certificate",
    type: "Government Incorporation",
  },
];

const DEFAULT_CERTS = [
  {
    _id: "def-cert-1",
    title: "Section 8 Non-Profit Organization Incorporation Certificate",
    recipientName: "Shiv Gorakh Welfare Foundation",
    certificateType: "Registration",
    certificateNumber: "U85300UP2024NPL198421",
    issuingAuthority: "Ministry of Corporate Affairs, Govt. of India",
    issueDate: new Date("2024-03-15").toISOString(),
    description:
      "Certificate of Incorporation issued under Section 8 of the Companies Act, 2013, certifying Shiv Gorakh Welfare Foundation as a recognized charitable non-profit entity.",
    imageUrls: ["/services/7.jpeg"],
  },
  {
    _id: "def-cert-2",
    title: "Income Tax 80G Tax Exemption Accreditation",
    recipientName: "Shiv Gorakh Welfare Foundation",
    certificateType: "80G & 12A",
    certificateNumber: "ITBA/EXM/S/80G/2024-25/1065421980",
    issuingAuthority: "Income Tax Department, Government of India",
    issueDate: new Date("2024-05-10").toISOString(),
    description:
      "Official certificate recognizing eligible donations to Shiv Gorakh Welfare Foundation for 50% tax deduction under Section 80G of the Indian Income Tax Act.",
    imageUrls: ["/services/8.jpeg"],
  },
  {
    _id: "def-cert-3",
    title: "District Animal Welfare & Humane Shield Honor",
    recipientName: "Shiv Gorakh Welfare Foundation",
    certificateType: "Recognition",
    certificateNumber: "DAWC-RMP-2024-77",
    issuingAuthority: "District Veterinary Board & Animal Welfare Council",
    issueDate: new Date("2024-09-22").toISOString(),
    description:
      "Appreciation certificate honoring relentless ground response, emergency street accident medical triage, and mass anti-rabies vaccination rounds.",
    imageUrls: ["/services/9.jpeg"],
  },
];

const TYPES = ["All Types", "Registration", "80G & 12A", "Recognition", "Volunteer", "Legal"];

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export default function CertificatesView() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All Types");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyIdQuery, setVerifyIdQuery] = useState("");
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getCertificates({ limit: 50 });
      if (res.success && res.items?.length > 0) {
        setCerts(res.items);
      } else {
        setCerts(DEFAULT_CERTS);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredCerts = useMemo(() => {
    return certs.filter((c) => {
      if (selectedType !== "All Types" && c.certificateType !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const t = (c.title || "").toLowerCase();
        const num = (c.certificateNumber || "").toLowerCase();
        const r = (c.recipientName || "").toLowerCase();
        const a = (c.issuingAuthority || "").toLowerCase();
        if (!t.includes(q) && !num.includes(q) && !r.includes(q) && !a.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [certs, selectedType, searchQuery]);

  function handleVerify(e) {
    e.preventDefault();
    if (!verifyIdQuery.trim()) return;
    const q = verifyIdQuery.trim().toLowerCase();
    const found = certs.find(
      (c) => (c.certificateNumber || "").toLowerCase() === q || (c.title || "").toLowerCase().includes(q)
    );
    setVerifiedResult(found || "not_found");
  }

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero Section */}
      <section className="bg-brand-cream px-6 py-16 sm:px-10 lg:px-16 border-b border-orange-100">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
              Transparency, Trust & Governance
            </p>
            <h1 className="mt-4 font-serif text-4xl sm:text-6xl leading-tight text-stone-900">
              Clear records.<br />
              <span className="italic text-brand-orange">Verified credentials.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600">
              Open public access to our official Section 8 NGO incorporation certificate, 80G tax exemption accreditations, government approval letters, and verified honors.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#verification-tool"
                className="rounded-full bg-brand-orange px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
              >
                Verify a Certificate ID ↓
              </a>
              <a
                href="#official-documents"
                className="rounded-full border border-stone-300 bg-white px-6 py-2.5 text-xs font-bold text-stone-800 hover:border-brand-orange transition"
              >
                Download Legal PDFs
              </a>
            </div>
          </div>
          <div className="relative h-64 overflow-hidden sm:h-80 rounded-2xl shadow-lg">
            <Image
              className="object-cover object-[center_20%]"
              src="/founders/HariOm.jpeg"
              alt="Hari Om, co-founder of Shiv Gorakh Welfare Foundation"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>

      {/* Online Verification Tool Banner */}
      <section id="verification-tool" className="bg-stone-900 px-6 py-12 sm:px-10 lg:px-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <span className="rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Online Credential Verification
          </span>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold">
            Verify Certificate or 80G Exemption Number
          </h2>
          <p className="mt-2 text-xs text-stone-300 max-w-lg mx-auto">
            Enter any Certificate ID, Registration Number, or volunteer credential number issued by Shiv Gorakh Welfare Foundation to instantly confirm its authenticity.
          </p>

          <form onSubmit={handleVerify} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="e.g. U85300UP2024NPL198421 or 80G..."
              value={verifyIdQuery}
              onChange={(e) => setVerifyIdQuery(e.target.value)}
              className="flex-1 rounded-xl sm:rounded-full bg-stone-800 border border-stone-700 px-4 py-2.5 text-xs text-white placeholder-stone-500 outline-none focus:border-brand-orange"
            />
            <button
              type="submit"
              className="rounded-xl sm:rounded-full bg-brand-orange px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-700 transition"
            >
              Verify Now
            </button>
          </form>

          {/* Verification Result Display */}
          {verifiedResult && (
            <div className="mt-6 max-w-md mx-auto text-left">
              {verifiedResult === "not_found" ? (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200">
                  ⚠️ <strong>Record Not Found:</strong> No certificate matching "{verifyIdQuery}" was found in our active records. Please check the ID or contact us directly at <a className="underline text-white" href="mailto:info@shivgorakh.org.in">info@shivgorakh.org.in</a>.
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/50 p-4 text-xs text-emerald-200">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <span>✓</span> Verified Active Document
                  </div>
                  <p className="mt-1 font-semibold text-white">{verifiedResult.title}</p>
                  <p className="mt-1 text-emerald-300 font-mono">ID: {verifiedResult.certificateNumber}</p>
                  <p className="text-stone-300">Issued to: {verifiedResult.recipientName}</p>
                  <p className="text-stone-400">Authority: {verifiedResult.issuingAuthority}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Certificates Grid */}
      <section className="px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    selectedType === t
                      ? "bg-brand-orange text-white shadow-sm"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-brand-orange hover:text-brand-orange"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[260px]">
              <input
                type="text"
                placeholder="Search certificate title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-brand-orange"
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

          <div className="mt-8">
            {loading ? (
              <div className="py-20 text-center text-sm text-stone-500 animate-pulse">
                Loading certificates and documents...
              </div>
            ) : filteredCerts.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
                <p className="font-serif text-2xl text-stone-900">No certificates found</p>
                <p className="mt-2 text-xs text-stone-500">
                  Try adjusting your search query or view available foundation documents below.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCerts.map((c) => {
                  const img =
                    c.imageUrls && c.imageUrls.length > 0
                      ? getApiImageUrl(c.imageUrls[0])
                      : "/services/7.jpeg";

                  return (
                    <article
                      key={c._id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-lg hover:border-orange-200"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                        <img
                          src={img}
                          alt={c.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white">
                          {c.certificateType || "Official"}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-brand-orange transition line-clamp-2">
                          {c.title}
                        </h3>

                        <div className="mt-3 space-y-1 text-xs text-stone-600">
                          {c.certificateNumber && (
                            <p>
                              <span className="text-stone-400 font-semibold">ID:</span>{" "}
                              <span className="font-mono font-bold text-stone-800">{c.certificateNumber}</span>
                            </p>
                          )}
                          {c.recipientName && (
                            <p>
                              <span className="text-stone-400 font-semibold">Issued To:</span>{" "}
                              <span>{c.recipientName}</span>
                            </p>
                          )}
                          {c.issuingAuthority && (
                            <p>
                              <span className="text-stone-400 font-semibold">Authority:</span>{" "}
                              <span>{c.issuingAuthority}</span>
                            </p>
                          )}
                          <p>
                            <span className="text-stone-400 font-semibold">Date:</span>{" "}
                            <span>{formatDate(c.issueDate || c.date || c.createdAt)}</span>
                          </p>
                        </div>

                        {c.description && (
                          <p className="mt-3 flex-1 text-xs leading-5 text-stone-500 line-clamp-2">
                            {c.description}
                          </p>
                        )}

                        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                          <button
                            type="button"
                            onClick={() => setActiveModal(c)}
                            className="font-bold text-brand-orange hover:text-orange-800 transition"
                          >
                            Inspect Document →
                          </button>
                          <a
                            href={c.fileUrl ? getApiImageUrl(c.fileUrl) : img}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-stone-100 px-3 py-1 font-semibold text-stone-700 hover:bg-brand-orange hover:text-white transition"
                          >
                            Open File ↗
                          </a>
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

      {/* Official Foundation Legal Documents PDF Archive */}
      <section id="official-documents" className="px-6 py-12 sm:px-10 lg:px-16 bg-white border-t border-stone-200">
        <div className="mx-auto max-w-5xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Public Registry
          </span>
          <h2 className="mt-1 font-serif text-3xl font-bold text-stone-900">
            Available Foundation Legal Documents
          </h2>
          <p className="mt-2 text-xs text-stone-500 max-w-xl">
            You may directly download our legal charter and incorporation approval letters in full format:
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {DEFAULT_DOCUMENTS.map((doc) => (
              <a
                key={doc.href}
                href={doc.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 border border-stone-200 bg-[#faf8f5] p-5 rounded-2xl transition hover:border-brand-orange hover:bg-orange-50/60"
              >
                <div className="flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-100 text-xs font-bold text-brand-orange shadow-sm">
                    PDF
                  </span>
                  <div>
                    <strong className="block text-sm text-stone-900">{doc.name}</strong>
                    <span className="mt-0.5 block text-xs text-stone-500">{doc.description}</span>
                  </div>
                </div>
                <span className="text-lg text-brand-orange group-hover:translate-y-0.5 transition">
                  ↓
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-brand-orange bg-orange-50/70 p-5">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Need a personalized Volunteer or Membership Certificate?
            </h3>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              If you have registered as a volunteer or subscribed as an official member, you can download your official high-resolution, digitally signed PDF certificate directly from your <Link href="/profile" className="font-bold underline text-brand-orange">User Profile</Link> upon admin verification.
            </p>
          </div>
        </div>
      </section>

      {/* Inspect Certificate Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative h-64 sm:h-80 w-full bg-stone-900">
              <img
                src={
                  activeModal.imageUrls && activeModal.imageUrls.length > 0
                    ? getApiImageUrl(activeModal.imageUrls[0])
                    : "/services/7.jpeg"
                }
                alt={activeModal.title}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-7">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                {activeModal.certificateType || "Official Certificate"}
              </span>

              <h2 className="mt-2 font-serif text-2xl font-bold text-stone-900">
                {activeModal.title}
              </h2>

              <div className="mt-4 rounded-xl bg-stone-50 p-4 border border-stone-200 text-xs space-y-1.5">
                {activeModal.certificateNumber && (
                  <p>
                    <strong className="text-stone-500">Certificate ID:</strong>{" "}
                    <span className="font-mono font-bold text-stone-900">{activeModal.certificateNumber}</span>
                  </p>
                )}
                {activeModal.recipientName && (
                  <p>
                    <strong className="text-stone-500">Issued To:</strong>{" "}
                    <span className="text-stone-800 font-semibold">{activeModal.recipientName}</span>
                  </p>
                )}
                {activeModal.issuingAuthority && (
                  <p>
                    <strong className="text-stone-500">Issuing Authority:</strong>{" "}
                    <span className="text-stone-800">{activeModal.issuingAuthority}</span>
                  </p>
                )}
                <p>
                  <strong className="text-stone-500">Issue Date:</strong>{" "}
                  <span>{formatDate(activeModal.issueDate || activeModal.date || activeModal.createdAt)}</span>
                </p>
              </div>

              {activeModal.description && (
                <p className="mt-4 text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">
                  {activeModal.description}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-stone-300 px-5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Close
                </button>
                <a
                  href={
                    activeModal.fileUrl
                      ? getApiImageUrl(activeModal.fileUrl)
                      : activeModal.imageUrls?.[0]
                      ? getApiImageUrl(activeModal.imageUrls[0])
                      : "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white hover:bg-orange-700 transition"
                >
                  Open Full File ↗
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
