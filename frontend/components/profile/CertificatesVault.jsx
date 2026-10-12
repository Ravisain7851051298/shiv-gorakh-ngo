"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";

export default function CertificatesVault({
  user,
  volunteer,
  membership,
  donations = [],
  role = "volunteer",
}) {
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingVolCert, setDownloadingVolCert] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const isMember = role === "member" || membership?.status === "Active";
  const certNumber = membership?.certificateNumber || "SG-MEM-OFFICIAL";

  async function handleDownloadCertificate() {
    setDownloadingCert(true);
    try {
      const response = await api.get("/api/v1/membership/me/certificate", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Membership_Certificate_${certNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      toast.error(getUserFacingError(err, "Unable to download certificate PDF."));
    } finally {
      setDownloadingCert(false);
    }
  }

  async function handleDownloadVolunteerCertificate() {
    setDownloadingVolCert(true);
    try {
      const response = await api.get("/api/v1/volunteer/me/certificate", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const volCertNum = volunteer?.certificateNumber || volunteer?.volunteerId || "Official";
      link.setAttribute("download", `Volunteer_Certificate_${volCertNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Volunteer Service Certificate downloaded successfully!");
    } catch (err) {
      toast.error(getUserFacingError(err, "Unable to download volunteer certificate PDF."));
    } finally {
      setDownloadingVolCert(false);
    }
  }

  async function handleDownloadReceipt(d) {
    setDownloadingReceiptId(d._id);
    try {
      const response = await api.get(`/api/v1/donations/${d._id}/receipt`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${d.receiptNumber || "Donation_Receipt"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("80G Tax Exemption receipt downloaded!");
    } catch (err) {
      toast.error(getUserFacingError(err, "Unable to download receipt PDF."));
    } finally {
      setDownloadingReceiptId(null);
    }
  }

  const approvedDonations = donations.filter((d) => d.status === "Approved");

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Official Credentials & Accreditations
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            Official Certificates & Tax Receipts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified credentials issued by Shiv Gorakh Welfare Foundation Board of Trustees.
          </p>
        </div>

        <div className="rounded-xl bg-blue-50/70 border border-blue-200 px-4 py-2.5 text-xs text-blue-900">
          <span className="font-bold">Govt. Registered Trust:</span>
          <span className="ml-1 font-mono font-semibold">Reg. 124/2020-2021 • 80G Certified</span>
        </div>
      </div>

      {/* 1. Official Membership Certificate */}
      {isMember && (
        <section className="rounded-3xl border border-blue-200 bg-white p-6 sm:p-8 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-blue-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  Official Credential
                </span>
                {membership?.certificateSentAt ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    ✓ Emailed by Admin
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    Ready in Portal
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">
                Official Certificate of Membership
              </h3>
              <p className="text-xs text-slate-500">
                Certificate No: <strong className="font-mono text-slate-700">{certNumber}</strong> • Tier: {membership?.membershipType || "Annual"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadCertificate}
              disabled={downloadingCert}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-orange hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-60"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{downloadingCert ? "Downloading…" : "Download Certificate PDF"}</span>
            </button>
          </div>

          {/* Certificate Miniature Showcase Card */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-blue-400/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 size-40 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  Shiv Gorakh Welfare Foundation
                </span>
                <h4 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-white">
                  CERTIFICATE OF MEMBERSHIP
                </h4>
                <p className="text-xs text-blue-200 mt-1">
                  Awarded to <strong>{user?.name}</strong> in recognition of civic stewardship and active foundation membership.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-amber-300">
                <span>{certNumber}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
              <div>
                <span>Validity: </span>
                <strong className="text-white">Active General Assembly Voting Member</strong>
              </div>
              <div className="text-right text-[11px] text-white/70">
                Digital Signatures of President & Secretary Affixed
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 flex items-center justify-between gap-3">
            <span>
              💡 <em>Note:</em> Official certificates can also be issued and dispatched via email directly by foundation administration from the management desk.
            </span>
          </div>
        </section>
      )}

      {/* 2. Volunteer Service Certificate */}
      {volunteer && (
        <section className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Field Accreditation
                </span>
                {volunteer.status === "ACTIVE" ? (
                  volunteer.certificateSentAt ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      ✓ Emailed by Admin
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                      Ready in Portal
                    </span>
                  )
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    Pending Verification
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">
                Official Certificate of Volunteer Service
              </h3>
              <p className="text-xs text-slate-500">
                Volunteer ID: <strong className="font-mono text-slate-700">{volunteer?.volunteerId || "SG-VOL-PENDING"}</strong> • Certificate No: {volunteer?.certificateNumber || volunteer?.volunteerId || "SG-CERT-VOL"}
              </p>
            </div>

            {volunteer.status === "ACTIVE" ? (
              <button
                type="button"
                onClick={handleDownloadVolunteerCertificate}
                disabled={downloadingVolCert}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-orange hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-60"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{downloadingVolCert ? "Downloading…" : "Download Certificate PDF"}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                <span>Status: Awaiting Admin Approval</span>
              </div>
            )}
          </div>

          {/* Certificate Miniature Showcase Card */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-400/30">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 size-40 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  Shiv Gorakh Welfare Foundation
                </span>
                <h4 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-white">
                  CERTIFICATE OF VOLUNTEER SERVICE
                </h4>
                <p className="text-xs text-emerald-200 mt-1">
                  Conferred upon <strong>{user?.name}</strong> in recognition of front-line field service, emergency animal rescue, and dedication.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-amber-300">
                <span>{volunteer?.certificateNumber || volunteer?.volunteerId || "SG-CERT-VOL"}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
              <div>
                <span>Validity: </span>
                <strong className="text-white">Authorized Field Volunteer & Responding Corps</strong>
              </div>
              <div className="text-right text-[11px] text-white/70">
                Digital Signatures of President & Secretary Affixed
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 flex items-center justify-between gap-3">
            <span>
              💡 <em>Note:</em> Certificates are awarded and issued by Foundation Administration upon review of active rescue and field service.
            </span>
          </div>
        </section>
      )}

      {/* 3. 80G Tax Exemption Certificates */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Income Tax Act Section 80G
            </span>
            <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">
              Donation Tax Exemption Certificates
            </h3>
            <p className="text-xs text-slate-500">
              Official 80G receipts for all verified contributions.
            </p>
          </div>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            {approvedDonations.length} Receipts Available
          </span>
        </div>

        {approvedDonations.length > 0 ? (
          <div className="mt-6 space-y-3">
            {approvedDonations.map((d) => (
              <div
                key={d._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition"
              >
                <div>
                  <span className="font-bold text-sm text-slate-900">
                    ₹{Number(d.amount).toLocaleString("en-IN")}
                  </span>
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Approved
                  </span>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">
                    Receipt No: <strong className="text-slate-800">{d.receiptNumber || `SG-REC-${d._id}`}</strong> • Mode: {d.paymentMethod || "UPI"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Date: {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(d)}
                  disabled={downloadingReceiptId === d._id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 transition disabled:opacity-50"
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{downloadingReceiptId === d._id ? "Downloading…" : "Download 80G Receipt PDF"}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-500">
            No donation tax receipts recorded for this account yet. Contributions made via the donation portal appear here automatically.
          </div>
        )}
      </section>
    </div>
  );
}
