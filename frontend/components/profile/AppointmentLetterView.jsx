"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api, { getApiImageUrl } from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";
import { useNgoSettings } from "@/context/NgoSettingsContext";

export default function AppointmentLetterView({
  user,
  volunteer,
  membership,
  role = "volunteer", // "volunteer" | "member"
}) {
  const { settings } = useNgoSettings();
  const [downloading, setDownloading] = useState(false);

  const isMember = role === "member";
  const idNumber = isMember
    ? membership?.memberId || membership?.certificateNumber || `SG-MEM-2026-${String(user?._id || "").slice(-5).toUpperCase()}`
    : volunteer?.volunteerId || `SG-VOL-2026-${String(user?._id || "").slice(-5).toUpperCase()}`;

  const roleTitle = isMember
    ? `Official Foundation Member (${membership?.membershipType || "Annual"} Tier)`
    : "Authorized Field Volunteer & Animal Rescue Corps";

  const issueDate = isMember
    ? membership?.approvedAt || membership?.startDate || new Date()
    : volunteer?.approvedAt || volunteer?.createdAt || new Date();

  const formattedDate = new Date(issueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const refNumber = `SGWF/APPT/${new Date(issueDate).getFullYear()}/${idNumber.replace(/[^A-Z0-9]/gi, "")}`;

  const address = isMember
    ? [membership?.address, membership?.city, membership?.state, membership?.zipCode].filter(Boolean).join(", ")
    : [volunteer?.address?.addressLine, volunteer?.address?.city, volunteer?.address?.state, volunteer?.address?.pincode].filter(Boolean).join(", ") || "Rampur, Uttar Pradesh";

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const endpoint = isMember
        ? "/api/v1/membership/me/appointment-letter"
        : "/api/v1/volunteer/me/appointment-letter";

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Appointment_Letter_${idNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Official Letter of Appointment downloaded successfully!");
    } catch (err) {
      toast.error(getUserFacingError(err, "Unable to download appointment letter PDF."));
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Official Induction Record
          </span>
          <h3 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
            Formal Letter of Appointment & Offer
          </h3>
          <p className="text-xs text-slate-500">
            Reference No: <strong className="font-mono text-slate-700">{refNumber}</strong> • Assigned to: {user?.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Letter</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-orange hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-60"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{downloading ? "Generating PDF…" : "Download Official PDF"}</span>
          </button>
        </div>
      </div>

      {/* Letterhead Document Preview */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/90 bg-[#fffdfa] p-8 sm:p-12 shadow-xl text-slate-800 font-sans print:shadow-none print:border-none print:p-0">
        {/* Letterhead Top Banner */}
        <div className="border-b-2 border-emerald-800 pb-5 text-center">
          <div className="flex items-center justify-center gap-3">
            {settings?.logo ? (
              <img
                src={getApiImageUrl(settings.logo)}
                alt={settings.ngoName || "NGO"}
                className="size-14 rounded-2xl object-cover ring-2 ring-emerald-800 bg-white p-0.5 shadow shrink-0"
              />
            ) : (
              <div className="size-12 rounded-2xl bg-emerald-800 grid place-items-center text-white font-serif font-black text-xl shadow shrink-0">
                {settings?.logoInitials || "SG"}
              </div>
            )}
            <div className="text-left">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 uppercase">
                {settings?.ngoName || "Shiv Gorakh Welfare Foundation"}
              </h1>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                {settings?.tagline || "Registered Public Charitable Trust • Animal Rescue & Welfare Corps"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Reg. No. {settings?.registrationNumber || "244701/SG-2022"} • {settings?.taxExemption80G || "80G Tax Exemption Certified"} • Head Office: {[settings?.addressLine, settings?.city, settings?.state, settings?.pincode].filter(Boolean).join(", ") || "Milak, Rampur, Uttar Pradesh - 244701"}
          </p>
          <p className="text-[11px] text-slate-500">
            Helpline: {settings?.phone || "+91 93369 50578"} • Email: {settings?.email || "info@shivgorakh.org.in"}
          </p>
        </div>

        {/* Ref and Date */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700 border-b border-slate-200 pb-3">
          <span>Ref. No: <strong className="font-mono text-slate-900">{refNumber}</strong></span>
          <span>Date: <strong>{formattedDate}</strong></span>
        </div>

        {/* Recipient */}
        <div className="mt-6 space-y-1 text-xs">
          <p className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">To,</p>
          <p className="text-base font-bold text-slate-900 font-serif">{user?.name}</p>
          <p className="text-slate-600 font-mono text-[11px]">Official ID: <strong>{idNumber}</strong></p>
          <p className="text-slate-600">Email: {user?.email || "—"}</p>
          {user?.phone && <p className="text-slate-600">Phone: {user.phone}</p>}
          <p className="text-slate-600">Address: {address}</p>
        </div>

        {/* Subject */}
        <div className="mt-6 rounded-xl bg-slate-100 p-3.5 border-l-4 border-emerald-700 text-xs font-bold text-emerald-950 uppercase tracking-wide">
          Subject: Letter of Appointment & Induction — {roleTitle}
        </div>

        {/* Formal Body */}
        <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
          <p>
            Dear <strong>{user?.name}</strong>,
          </p>
          <p>
            On behalf of the Board of Trustees, Executive Council, and the entire welfare fraternity of{" "}
            <strong>Shiv Gorakh Welfare Foundation</strong>, we take immense pleasure in formally appointing and inducting
            you as an official <strong>{roleTitle}</strong> with effect from <strong>{formattedDate}</strong>.
          </p>
          <p>
            Your induction is registered in the official registry under ID Number:{" "}
            <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{idNumber}</strong>. In this
            esteemed role, you are entrusted with representing our noble mission of humane animal rescue, trauma
            stabilization, neighborhood feeding, and community empathy.
          </p>

          {/* Guidelines Box */}
          <div className="my-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-xs text-slate-700">
            <span className="font-bold text-emerald-900 uppercase tracking-wide text-[11px] block">
              Official Terms of Association:
            </span>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Digital Identity Card:</strong> You are issued an official Digital QR ID Card as proof of active
                credentials and emergency field authorization.
              </li>
              <li>
                <strong>Humane Standards:</strong> All welfare duties must adhere strictly to non-violence charters and the
                Prevention of Cruelty to Animals Act.
              </li>
              <li>
                <strong>Community Cooperation:</strong> You are authorized to coordinate with local emergency animal clinics,
                transit ambulances, and municipal shelters.
              </li>
              <li>
                <strong>Voluntary & Non-Commercial:</strong> Your association is driven by public benevolence, philanthropic
                welfare, and ethical care for all voiceless animal companions.
              </li>
            </ul>
          </div>

          <p className="italic text-slate-600">
            We extend our heartiest congratulations and deepest gratitude for stepping forward to be the voice and protector
            of innocent lives across our region.
          </p>
        </div>

        {/* Signatures & Seal */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 items-end text-center">
            {/* President */}
            <div className="text-left">
              <div className="h-10 flex items-center">
                {settings?.presidentSignature || settings?.authorizedSignature ? (
                  <img
                    src={getApiImageUrl(settings.presidentSignature || settings.authorizedSignature)}
                    alt="President Signature"
                    className="h-9 max-w-28 object-contain"
                  />
                ) : (
                  <span className="font-serif italic font-bold text-sm text-emerald-900">
                    {settings?.founderName || "Hari Om"}
                  </span>
                )}
              </div>
              <p className="border-t border-slate-300 pt-1 text-xs font-bold text-slate-900">
                {settings?.founderName || "Hari Om"}
              </p>
              <p className="text-[10px] text-slate-500">{settings?.founderRole || "Founder & President"}</p>
              <p className="text-[9px] text-slate-400">{settings?.shortName || "Shiv Gorakh Foundation"}</p>
            </div>

            {/* Seal */}
            <div className="flex flex-col items-center justify-center">
              {settings?.stampImage ? (
                <img
                  src={getApiImageUrl(settings.stampImage)}
                  alt="Official Seal"
                  className="size-16 object-contain"
                />
              ) : (
                <div className="size-16 rounded-full border-2 border-dashed border-amber-600 grid place-items-center text-center p-1 bg-amber-50/50">
                  <span className="text-[7px] font-black uppercase tracking-widest text-amber-800 block">OFFICIAL SEAL</span>
                  <span className="text-[6px] text-emerald-800 font-bold block">{settings?.registrationNumber || "REG. 244701"}</span>
                </div>
              )}
            </div>

            {/* Secretary */}
            <div className="text-right">
              <div className="h-10 flex items-center justify-end">
                {settings?.secretarySignature ? (
                  <img
                    src={getApiImageUrl(settings.secretarySignature)}
                    alt="Secretary Signature"
                    className="h-9 max-w-28 object-contain"
                  />
                ) : (
                  <span className="font-serif italic font-bold text-sm text-emerald-900">
                    {settings?.coFounderName || "Ankit Pandey"}
                  </span>
                )}
              </div>
              <p className="border-t border-slate-300 pt-1 text-xs font-bold text-slate-900">
                {settings?.coFounderName || "Ankit Pandey"}
              </p>
              <p className="text-[10px] text-slate-500">{settings?.coFounderRole || "Co-Founder & Secretary"}</p>
              <p className="text-[9px] text-slate-400">{settings?.shortName || "Shiv Gorakh Foundation"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
