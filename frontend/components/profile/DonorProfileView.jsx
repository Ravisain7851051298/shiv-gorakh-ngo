"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiEdit2,
  FiFileText,
  FiHeart,
  FiLogOut,
  FiShield,
  FiUserCheck,
} from "react-icons/fi";
import { getApiImageUrl } from "@/lib/authApi";

export default function DonorProfileView({
  user,
  volunteer,
  membership,
  donations = [],
  onLogout,
  onSaveAccount,
  onDownloadReceipt,
  downloadingReceiptId,
}) {
  const [editingAccount, setEditingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.profilePicture ? getApiImageUrl(user.profilePicture) : ""
  );
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const totalDonationsSum = donations
    .filter((d) => d.status === "Approved")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  function handleAccountSubmit(e) {
    e.preventDefault();
    setSavingAccount(true);
    onSaveAccount({
      ...accountForm,
      avatarFile,
      removeAvatar,
    }).finally(() => {
      setSavingAccount(false);
      setEditingAccount(false);
    });
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/25 via-orange-500/10 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Avatar & Title */}
            <div className="flex items-center gap-5">
              <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-full bg-white shadow-xl ring-4 ring-amber-400/30 border-2 border-amber-500">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center font-serif text-3xl font-bold text-stone-800 uppercase">
                    {user?.name ? user.name.slice(0, 2) : "SG"}
                  </div>
                )}
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                  🎗️ Philanthropic Supporter & Donor
                </span>
                <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {user?.name}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-white/80">
                  {user?.email} {user?.phone ? `• ${user.phone}` : ""}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white hover:text-stone-900"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/75 block">
                Total Giving
              </span>
              <span className="mt-1 block text-lg sm:text-2xl font-black text-white">
                ₹{totalDonationsSum.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-white/60 block mt-0.5">
                {donations.length} gifts
              </span>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/75 block">
                Tax Relief
              </span>
              <span className="mt-1 block text-lg sm:text-2xl font-black text-white">
                80G Certified
              </span>
              <span className="text-[10px] text-white/60 block mt-0.5">
                Receipts available
              </span>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/75 block">
                Account Level
              </span>
              <span className="mt-1 block text-lg sm:text-2xl font-black text-white">
                Compassion Patron
              </span>
              <span className="text-[10px] text-white/60 block mt-0.5">
                Shiv Gorakh Foundation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-4xl px-5 sm:px-8 -mt-6 relative z-10 space-y-8">
        {/* Pending Volunteer Notification */}
        {volunteer?.status === "PENDING" && (
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-5 shadow-md text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🦺</span>
              <div>
                <p className="font-bold text-sm text-stone-900">
                  Volunteer Application Under Admin Verification
                </p>
                <p className="mt-0.5 text-stone-600 leading-relaxed">
                  Your field volunteer application has been submitted and is awaiting administrator verification.
                  Once approved by admin, you will receive your official <strong>Volunteer ID Card</strong> and <strong>Offer & Appointment Letter</strong>, and unlock your full Volunteer Dashboard!
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 shrink-0 text-center">
              Status: Pending Approval
            </div>
          </div>
        )}

        {/* Pending Membership Notification */}
        {membership?.status === "Pending" && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 shadow-md text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-bold text-sm text-stone-900">
                  Foundation Membership Application Under Verification
                </p>
                <p className="mt-0.5 text-stone-600 leading-relaxed">
                  Your application for the <strong>{membership.membershipType}</strong> tier ({membership.amount ? `₹${membership.amount}` : "Submitted"})
                  is undergoing payment audit. Once admin approves, you will immediately receive your official{" "}
                  <strong>Member ID</strong> and <strong>Appointment Letter</strong>, and unlock your full Member Portal!
                </p>
              </div>
            </div>
            <Link
              href="/membership"
              className="rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition shrink-0 text-center"
            >
              View Application →
            </Link>
          </div>
        )}

        {/* Induction Promotion Banner: Register as Volunteer or Member */}
        <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                Unlock Full Portal Dashboard
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white">
                Join As a Volunteer or Foundation Member
              </h2>
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Registered Volunteers and Foundation Members unlock our exclusive <strong>Portal Dashboard</strong> featuring
                your official <strong>Digital QR ID Card</strong>, <strong>Letter of Appointment</strong>,{" "}
                <strong>Welfare Events RSVP</strong>, <strong>Official Certificates</strong>, and <strong>Direct Grievance Desk</strong>.
              </p>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {/* Volunteer card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 flex flex-col justify-between">
              <div>
                <span className="text-xl block">🦺</span>
                <h3 className="mt-2 font-serif text-lg font-bold text-white">
                  Join As Field Volunteer
                </h3>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">
                  Hands-on stray animal rescue, emergency transport, feeding rounds, and community camps.
                  Receive your official Volunteer ID and Letter of Appointment immediately.
                </p>
              </div>
              <Link
                href="/volunteer/register"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 text-xs transition shadow"
              >
                <span>Register as Volunteer</span>
                <FiArrowRight size={13} />
              </Link>
            </div>

            {/* Member card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 flex flex-col justify-between">
              <div>
                <span className="text-xl block">🏛️</span>
                <h3 className="mt-2 font-serif text-lg font-bold text-white">
                  Become a Foundation Member
                </h3>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">
                  Support foundation governance with voting rights, annual convention seats, official Member ID Card,
                  Letter of Appointment, and Official Certificate.
                </p>
              </div>
              <Link
                href="/membership"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 text-xs transition shadow"
              >
                <span>Apply for Membership</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* Giving History & 80G Receipts */}
        <section className="rounded-3xl border border-amber-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-amber-900/5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Philanthropy Ledger
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900">
                My Giving History & 80G Receipts
              </h2>
            </div>
            <Link
              href="/donate"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold transition shadow-sm"
            >
              <span>Make a Contribution</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          {donations.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-amber-100 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 pr-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Payment Mode</th>
                    <th className="py-2.5 px-4">Receipt #</th>
                    <th className="py-2.5 pl-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {donations.map((d) => (
                    <tr key={d._id} className="hover:bg-amber-50/50 transition">
                      <td className="py-3 pr-4 font-bold text-stone-900 text-sm">
                        ₹{Number(d.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            d.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : d.status === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{d.paymentMethod || "UPI"}</td>
                      <td className="py-3 px-4 font-mono text-stone-600 text-[11px]">
                        {d.status === "Approved" ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-emerald-800">{d.receiptNumber || "SG-REC-..."}</span>
                            <button
                              type="button"
                              onClick={() => onDownloadReceipt(d)}
                              disabled={downloadingReceiptId === d._id}
                              className="inline-flex items-center gap-1 rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-black transition disabled:opacity-50"
                              title="Download 80G tax receipt PDF"
                            >
                              <span>{downloadingReceiptId === d._id ? "…" : "PDF"}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-400">{d.status}</span>
                        )}
                      </td>
                      <td className="py-3 pl-4 text-right text-stone-400">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recent"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-800">
                No active donations recorded for this account yet.
              </p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Contributions submitted through the donation portal automatically appear here with tax certificates.
              </p>
              <Link
                href="/donate"
                className="mt-3 inline-flex rounded-full bg-amber-600 text-white px-5 py-2 text-xs font-bold transition hover:bg-amber-700"
              >
                Visit Donation Portal
              </Link>
            </div>
          )}
        </section>

        {/* Account Details & Edit */}
        <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl shadow-stone-900/5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Profile Credentials
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900">
                Account Information
              </h2>
            </div>
            {!editingAccount && (
              <button
                type="button"
                onClick={() => setEditingAccount(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 text-white px-4 py-2 text-xs font-bold hover:bg-black transition"
              >
                <FiEdit2 size={13} />
                <span>Edit Account Details</span>
              </button>
            )}
          </div>

          {editingAccount ? (
            <form onSubmit={handleAccountSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-2">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full overflow-hidden border-2 border-brand-orange bg-white">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-bold text-stone-400">
                        SG
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label className="cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    {(avatarPreview || user?.profilePicture) && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs text-stone-900 outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold transition disabled:opacity-50"
                >
                  {savingAccount ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase text-[10px] block">Full Name:</span>
                <span className="font-semibold text-stone-900 text-sm mt-0.5 block">{user?.name}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase text-[10px] block">Email Address:</span>
                <span className="font-semibold text-stone-900 text-sm mt-0.5 block">{user?.email}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase text-[10px] block">Phone:</span>
                <span className="font-semibold text-stone-900 text-sm mt-0.5 block">{user?.phone || "Not provided"}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-400 uppercase text-[10px] block">Current Role:</span>
                <span className="font-bold text-amber-700 text-sm mt-0.5 block uppercase">DONOR / SUPPORTER</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
