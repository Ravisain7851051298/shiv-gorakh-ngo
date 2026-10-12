"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheckCircle, FiHeart, FiMail, FiShield } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { forgotPassword } from "@/store/authSlice";

export default function AdminForgotPasswordPage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const result = await dispatch(forgotPassword({ email: email.trim() }));
    setSubmitting(false);

    if (forgotPassword.fulfilled.match(result)) {
      setSubmitted(true);
      if (result.payload?.devResetUrl) {
        setDevResetUrl(result.payload.devResetUrl);
      }
      toast.success(result.payload?.message || "Password reset link sent.");
      return;
    }

    toast.error(result.payload || "Unable to send password reset link.");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f8fa] px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
      <section className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_24px_70px_rgba(32,42,53,0.09)] sm:p-9">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-lg text-white">
            <FiHeart />
          </span>
          <span>Shiv Gorakh <span className="font-normal text-slate-400">Foundation</span></span>
        </div>

        {submitted ? (
          <div className="my-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <FiCheckCircle size={32} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              If an administrator account exists for <strong className="text-slate-700">{email}</strong>, a password reset link has been dispatched.
            </p>

            {devResetUrl && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-900">
                <span className="font-bold">Dev Helper:</span>
                <p className="mt-1">Local reset link:</p>
                <Link className="mt-1 block font-semibold text-orange-600 underline" href={devResetUrl}>
                  Open Reset Password Link →
                </Link>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                className="h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => { setSubmitted(false); setDevResetUrl(""); }}
                type="button"
              >
                Send to different email
              </button>
              <Link className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700" href="/login">
                <FiArrowLeft /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-7 mt-9">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-orange-700">
                <FiShield /> SECURE RECOVERY
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
                Reset admin password
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your administrative email address to receive password reset instructions.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={submit}>
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                Email address
                <input
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  autoComplete="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@organization.org"
                  required
                  type="email"
                  value={email}
                />
              </label>

              <button
                className="mt-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                <FiMail />
                {submitting ? "Sending reset link…" : "Send recovery link"}
              </button>
            </form>

            <p className="my-5 text-center text-sm text-slate-500">
              <Link className="inline-flex items-center gap-2 font-semibold text-orange-700 hover:text-orange-800" href="/login">
                <FiArrowLeft /> Back to sign in
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
