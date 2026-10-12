"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import getUserFacingError from "@/lib/getUserFacingError";
import api from "@/lib/authApi";
import { fetchMembership } from "@/store/membershipSlice";
import MembershipRegistrationForm from "@/components/MembershipRegistrationForm";

function formatDate(value) {
  if (!value) return "Lifetime";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
}

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

export default function MembershipPortal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, initialized } = useSelector((state) => state.auth);
  const { profile, profileStatus, error } = useSelector(
    (state) => state.membership,
  );
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [reapplying, setReapplying] = useState(false);

  useEffect(() => {
    if (initialized && user) {
      dispatch(fetchMembership()).then((result) => {
        if (
          result.meta.requestStatus === "rejected" &&
          !result.meta.condition
        ) {
          toast.error(
            getUserFacingError(
              result.payload ?? result.error,
              "Unable to load your membership profile.",
            ),
          );
        }
      });
    }
  }, [dispatch, initialized, user]);

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
      const certName = profile?.certificateNumber || "Official_Membership_Certificate";
      link.setAttribute("download", `${certName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      toast.error(getUserFacingError(err, "Unable to download certificate."));
    } finally {
      setDownloadingCert(false);
    }
  }

  return (
    <section className="mx-2 md:px-6 py-2 sm:px-10 lg:px-16 bg-[#faf8f5]">
      <div className="mx-auto max-w-4xl">
        <div className="border-b border-stone-200 pb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Foundation Membership
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-stone-900">
            Become an Official Member
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            Join the Shiv Gorakh Welfare Foundation as a registered member. Your membership dues power emergency animal rescues, veterinary treatments, and shelter operations.
          </p>
        </div>

        {!initialized ? (
          <p className="mt-8 text-sm text-stone-600" role="status">
            Checking your sign-in...
          </p>
        ) : !user ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              Create an Account or Sign In to Apply
            </h3>
            <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">
              Membership registration requires an active account so your official Certificate and status can be linked and verified.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-xl bg-brand-orange px-6 text-sm font-bold text-white transition hover:bg-orange-700 shadow-sm"
                href="/register?redirect=%2Fmembership"
              >
                Create an account to join
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-6 text-sm font-bold text-stone-800 transition hover:bg-stone-50"
                href="/login?redirect=%2Fmembership"
              >
                Sign in
              </Link>
            </div>
          </div>
        ) : profileStatus === "loading" || profileStatus === "idle" ? (
          <div className="mt-8 py-12 text-center text-sm text-stone-500 animate-pulse">
            Loading your membership status...
          </div>
        ) : profileStatus === "failed" ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-800">
              {getUserFacingError(
                error,
                "Unable to load your membership profile.",
              )}
            </p>
            <button
              className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900"
              type="button"
              onClick={() => dispatch(fetchMembership())}
            >
              Try again
            </button>
          </div>
        ) : profile && !reapplying ? (
          <div className="mt-8 space-y-6">
            {/* Status 1: PENDING VERIFICATION */}
            {profile.status === "Pending" && (
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-8 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-500 p-2.5 text-white shadow-md">
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-amber-200 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                        Under Admin Review
                      </span>
                      <span className="text-xs text-stone-500">
                        Submitted: {formatDate(profile.createdAt)}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-2xl font-bold text-stone-900">
                      Payment Verification In Progress
                    </h3>
                    <p className="mt-1 text-sm text-stone-700 leading-relaxed">
                      Thank you for applying for the{" "}
                      <strong className="text-stone-900">{profile.membershipType}</strong> tier{" "}
                      {profile.amount ? `(${formatCurrency(profile.amount)})` : ""}.
                      Our administration team is currently verifying your payment screenshot and reference ID:
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-white/80 p-4 border border-amber-200/80 text-xs font-mono text-stone-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block font-sans">Payment Method</span>
                        <span>{profile.paymentMethod || "UPI"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block font-sans">Transaction / UTR ID</span>
                        <span className="font-bold text-brand-orange">{profile.transactionId || "Provided"}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-stone-600">
                      📜 <strong className="text-stone-900">Certificate Generation:</strong> As soon as an administrator verifies your payment, your official signed Certificate PDF will be generated and automatically emailed to <strong className="text-stone-900">{user.email}</strong>.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/profile"
                        className="inline-flex items-center rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-black"
                      >
                        View Profile Status
                      </Link>
                      <button
                        type="button"
                        onClick={() => setReapplying(true)}
                        className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100/50"
                      >
                        Edit Application or Re-upload Proof
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status 2: REJECTED */}
            {profile.status === "Rejected" && (
              <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-6 sm:p-8 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-rose-500 p-2.5 text-white shadow-md">
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="rounded-full bg-rose-200 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-rose-900">
                      Application Revision Needed
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-rose-950">
                      Payment Proof Not Approved
                    </h3>
                    <p className="mt-2 text-sm text-rose-800">
                      Reason provided by admin:{" "}
                      <strong className="font-semibold underline">
                        {profile.rejectionReason || "Transaction reference or screenshot could not be matched."}
                      </strong>
                    </p>
                    <p className="mt-2 text-xs text-rose-700">
                      You can submit an updated payment screenshot or new reference details below to resubmit for verification.
                    </p>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => setReapplying(true)}
                        className="inline-flex items-center rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700"
                      >
                        Update & Re-Submit Application
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status 3: ACTIVE APPROVED MEMBER */}
            {profile.status === "Active" && (
              <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 size-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                        ✓ Verified Foundation Member
                      </span>
                    </div>
                    <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-white">
                      {profile.membershipType} Member
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-emerald-200/80">
                      Shiv Gorakh Welfare Foundation Official Credential
                    </p>
                  </div>

                  {profile.certificateNumber && (
                    <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                        Certificate No.
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {profile.certificateNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3 border-t border-white/10 pt-6 text-xs">
                  <div>
                    <span className="text-white/60 block uppercase text-[10px]">Holder Name</span>
                    <span className="font-bold text-white text-sm">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block uppercase text-[10px]">Registered Email</span>
                    <span className="font-medium text-white/90">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block uppercase text-[10px]">Validity</span>
                    <span className="font-bold text-white">
                      {profile.endDate ? formatDate(profile.endDate) : "Active Lifetime"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-extrabold text-stone-950 transition hover:bg-amber-300 shadow-md disabled:opacity-60"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{downloadingCert ? "Generating PDF..." : "Download Official Certificate (PDF)"}</span>
                  </button>

                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur px-5 py-3 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <span>Go to Member Profile</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 md:mt-8 rounded-2xl border border-stone-200 bg-white p-2 md:p-4 shadow-sm">
            <MembershipRegistrationForm
              initialProfile={reapplying ? profile : null}
              onSuccess={() => {
                setReapplying(false);
                dispatch(fetchMembership());
              }}
              onCancel={reapplying ? () => setReapplying(false) : null}
            />
          </div>
        )}
      </div>
    </section>
  );
}
