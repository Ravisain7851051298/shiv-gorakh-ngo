"use client";

import { useState } from "react";
import QrCodeDisplay from "./QrCodeDisplay";
import { getApiImageUrl } from "@/lib/authApi";
import { useNgoSettings } from "@/context/NgoSettingsContext";

export default function DigitalIdCard({
  user,
  volunteer,
  membership,
  role = "volunteer", // "volunteer" | "member"
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { settings } = useNgoSettings();

  const logoUrl = settings?.logo ? getApiImageUrl(settings.logo) : "";
  const presidentSigUrl = (settings?.presidentSignature || settings?.authorizedSignature)
    ? getApiImageUrl(settings.presidentSignature || settings.authorizedSignature)
    : "";
  const secretarySigUrl = settings?.secretarySignature
    ? getApiImageUrl(settings.secretarySignature)
    : "";
  const ngoName = settings?.ngoName || "Shiv Gorakh Welfare Foundation";
  const shortName = settings?.shortName || "Shiv Gorakh";
  const suffix = settings?.suffix || "Welfare Foundation";
  const regNo = settings?.registrationNumber || "244701/SG-2022";
  const phone = settings?.phone || "+91 93369 50578";
  const address = [settings?.addressLine, settings?.city, settings?.state, settings?.pincode].filter(Boolean).join(", ") || "Milak, Rampur, U.P. - 244701";

  const isMember = role === "member";
  const idNumber = isMember
    ? membership?.memberId || membership?.certificateNumber || `SG-MEM-2026-${String(user?._id || "").slice(-5).toUpperCase()}`
    : volunteer?.volunteerId || `SG-VOL-2026-${String(user?._id || "").slice(-5).toUpperCase()}`;

  const roleTitle = isMember ? "OFFICIAL FOUNDATION MEMBER" : "AUTHORIZED FIELD VOLUNTEER";
  const roleSubtitle = isMember
    ? `${membership?.membershipType || "Annual"} Member • Voting Delegate`
    : "Animal Rescue & Emergency First-Aid Force";

  const themeGradient = isMember
    ? "from-slate-900 via-blue-950 to-indigo-950 border-blue-400/40"
    : "from-emerald-950 via-teal-950 to-slate-950 border-emerald-400/40";

  const accentColor = isMember ? "#3b82f6" : "#10b981";
  const accentBadge = isMember
    ? "bg-amber-400 text-slate-950 font-black"
    : "bg-emerald-400 text-slate-950 font-black";

  const avatarUrl = user?.profilePicture ? getApiImageUrl(user.profilePicture) : "";

  const verificationPayload = JSON.stringify({
    org: ngoName,
    regNo: regNo,
    id: idNumber,
    name: user?.name,
    role: roleTitle,
    status: "VERIFIED_ACTIVE",
    verifyUrl: `https://shivgorakh.org.in/verify/${idNumber}`,
  });

  const issueDate = isMember
    ? membership?.approvedAt || membership?.startDate || new Date()
    : volunteer?.approvedAt || volunteer?.createdAt || new Date();

  const formattedDate = new Date(issueDate).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-col items-center">
      {/* Action Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-2 rounded-2xl border border-orange-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 shadow-xs transition hover:bg-orange-50 hover:text-brand-orange"
        >
          <svg className="size-4 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isFlipped ? "Show Front Side" : "Flip to Back Side"}</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-orange hover:opacity-95 px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print / Save ID Card</span>
        </button>
      </div>

      {/* ID Card Wrapper */}
      <div className="w-full max-w-[440px] perspective-[1000px]">
        {!isFlipped ? (
          /* ======================================================== */
          /* FRONT SIDE                                               */
          /* ======================================================== */
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${themeGradient} p-6 sm:p-7 text-white shadow-2xl border ${themeGradient} select-none transition-all duration-300`}
            id="digital-id-card-front"
          >
            {/* Subtle background security patterns */}
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 size-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

            {/* Header: Org Branding & Hologram */}
            <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-white p-1 shadow-md shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={ngoName}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-stone-900 font-serif font-black text-xs">
                      {settings?.logoInitials || "SG"}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                    {shortName}
                  </span>
                  <span className="block text-xs font-serif font-bold text-white tracking-wide">
                    {suffix}
                  </span>
                  <span className="block text-[9px] text-white/60 tracking-wider">
                    Govt. Reg. No. {regNo}
                  </span>
                </div>
              </div>

              {/* Holographic Badge */}
              <div className="rounded-xl border border-amber-400/50 bg-gradient-to-br from-amber-400/20 via-yellow-300/10 to-transparent px-2.5 py-1 text-center shadow-inner">
                <span className="block text-[8px] font-black tracking-widest text-amber-300 uppercase">
                  VERIFIED
                </span>
                <span className="block text-[7px] text-amber-200/80 uppercase">
                  CREDENTIAL
                </span>
              </div>
            </div>

            {/* Center Area: Photo & Credentials */}
            <div className="mt-5 flex items-center gap-5 relative z-10">
              {/* Photo Box */}
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-slate-800 shadow-xl ring-4 ring-white/10">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "Member Photo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-700 to-slate-900 font-serif text-3xl font-bold text-white uppercase">
                    {user?.name ? user.name.slice(0, 2) : "SG"}
                  </div>
                )}
                {/* Active indicator dot */}
                <span className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
              </div>

              {/* Name & Role */}
              <div className="min-w-0 flex-1">
                <span className={`inline-block rounded-md px-2 py-0.5 text-[8.5px] uppercase tracking-wider ${accentBadge} shadow-xs`}>
                  {roleTitle}
                </span>
                <h3 className="mt-1 font-serif text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {user?.name || "Official Member"}
                </h3>
                <p className="text-[11px] font-medium text-white/80 leading-tight mt-0.5 truncate">
                  {roleSubtitle}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
                    {idNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Strip: QR Code & Metadata */}
            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/15 pt-4 relative z-10">
              <div className="text-left space-y-1">
                <div className="text-[11px] text-white/70">
                  <span className="text-white/50 text-[10px] uppercase font-bold block">Email:</span>
                  <span className="font-medium text-white/95 truncate max-w-[180px] block">{user?.email || "N/A"}</span>
                </div>
                {user?.phone && (
                  <div className="text-[11px] text-white/70">
                    <span className="text-white/50 text-[10px] uppercase font-bold block">Helpline / Phone:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}
                <div className="text-white/60 text-[10px] pt-1">
                  <span>Issued: </span>
                  <strong className="text-white/90">{formattedDate}</strong>
                  <span> • Valid Lifetime</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="shrink-0 flex flex-col items-center">
                <QrCodeDisplay
                  value={verificationPayload}
                  size={84}
                  darkColor="#020617"
                  lightColor="#ffffff"
                  className="rounded-xl ring-2 ring-white/20"
                />
                <span className="mt-1 text-[8px] font-bold text-white/60 uppercase tracking-widest">
                  Scan to Verify
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* BACK SIDE                                                */
          /* ======================================================== */
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${themeGradient} p-6 sm:p-7 text-white shadow-2xl border ${themeGradient} select-none transition-all duration-300 min-h-[380px] flex flex-col justify-between`}
            id="digital-id-card-back"
          >
            <div>
              {/* Back Header */}
              <div className="border-b border-white/15 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {logoUrl ? (
                    <div className="size-8 rounded-xl bg-white p-0.5 shrink-0 shadow-xs">
                      <img
                        src={logoUrl}
                        alt=""
                        className="h-full w-full object-cover rounded-lg"
                      />
                    </div>
                  ) : null}
                  <div>
                    <h4 className="font-serif text-sm font-bold tracking-wide text-white leading-tight">
                      {ngoName}
                    </h4>
                    <p className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                      Authorized Field Identity & Terms
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-white/60">
                  {idNumber}
                </div>
              </div>

              {/* Conditions List */}
              <div className="mt-4 space-y-2 text-[10.5px] text-white/80 leading-relaxed">
                <p>
                  1. <strong className="text-white">Official Authority:</strong> The holder of this card is an authorized representative of {ngoName} for stray animal rescue, feeding drives, and humanitarian relief.
                </p>
                <p>
                  2. <strong className="text-white">Emergency Response:</strong> Civil authorities, local police, and veterinary teams are requested to render lawful assistance during critical animal distress emergencies.
                </p>
                <p>
                  3. <strong className="text-white">Non-Commercial:</strong> This credential is strictly voluntary and non-transferable.
                </p>
                <p>
                  4. <strong className="text-white">Helpline:</strong> In case of loss or emergency verification, contact the Foundation Hotline at {phone} immediately.
                </p>
              </div>
            </div>

            {/* Back Footer: Contacts & Signatures */}
            <div className="mt-6 border-t border-white/15 pt-3">
              <div className="flex items-end justify-between gap-4 text-center">
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold text-white/50 block">Registered Office:</span>
                  <span className="text-[10px] text-white/80 block max-w-56 leading-snug">{address}</span>
                  <span className="text-[10px] font-bold text-amber-300 block mt-0.5">Hotline: {phone}</span>
                </div>

                {/* Signatures */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="h-7 flex items-center justify-center">
                      {presidentSigUrl ? (
                        <img
                          src={presidentSigUrl}
                          alt="President"
                          className="h-7 max-w-18 object-contain brightness-200"
                        />
                      ) : (
                        <span className="font-serif italic text-xs text-amber-300">
                          {settings?.founderName || "Hari Om"}
                        </span>
                      )}
                    </div>
                    <span className="border-t border-white/20 pt-0.5 block text-[8px] font-bold uppercase text-white/60">
                      President
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="h-7 flex items-center justify-center">
                      {secretarySigUrl ? (
                        <img
                          src={secretarySigUrl}
                          alt="Secretary"
                          className="h-7 max-w-18 object-contain brightness-200"
                        />
                      ) : (
                        <span className="font-serif italic text-xs text-amber-300">
                          {settings?.coFounderName || "Ankit Pandey"}
                        </span>
                      )}
                    </div>
                    <span className="border-t border-white/20 pt-0.5 block text-[8px] font-bold uppercase text-white/60">
                      Secretary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500 max-w-sm">
        Official digital credential with cryptographic QR verification. Carry this on your phone or print a physical card during welfare duties.
      </p>
    </div>
  );
}
