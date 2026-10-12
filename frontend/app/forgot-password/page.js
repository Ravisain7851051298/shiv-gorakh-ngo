"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";
import { forgotPassword } from "@/store/authSlice";
import getUserFacingError from "@/lib/getUserFacingError";

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const result = await dispatch(forgotPassword({ email: email.trim() }));
    setSubmitting(false);

    if (result.meta.requestStatus === "fulfilled") {
      setSubmitted(true);
      if (result.payload?.devResetUrl) {
        setDevResetUrl(result.payload.devResetUrl);
      }
      toast.success(
        result.payload?.message || "Password reset link sent to your email.",
      );
    } else {
      toast.error(
        getUserFacingError(
          result.payload,
          "Unable to send password reset link. Please try again.",
        ),
      );
    }
  }

  const inputClass =
    "mt-2 w-full border border-orange-100 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand-orange focus:ring-2 focus:ring-orange-100";

  return (
    <main className="min-h-[70vh] bg-brand-cream px-5 py-12 sm:px-8">
      <section className="mx-auto max-w-lg border border-orange-100 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
          Shiv Gorakh Welfare Foundation
        </p>

        {submitted ? (
          <div className="mt-6 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <FiCheckCircle size={32} />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-stone-900">
              Check your email
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              If an account exists with{" "}
              <strong className="text-stone-900">{email}</strong>, we have sent
              a password reset link. Please check your inbox and spam folder.
            </p>

            {devResetUrl && (
              <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900">
                <p className="font-bold uppercase tracking-wider text-amber-800">
                  Development Mode Helper
                </p>
                <p className="mt-1">
                  SMTP is not configured locally. Click the link below to test the reset flow:
                </p>
                <Link
                  className="mt-2 inline-block font-semibold text-brand-orange underline hover:text-orange-800"
                  href={devResetUrl}
                >
                  Proceed to Reset Password Page →
                </Link>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <button
                className="w-full border border-brand-orange px-5 py-3 text-sm font-bold text-brand-orange transition hover:bg-brand-orange hover:text-white"
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setDevResetUrl("");
                }}
              >
                Send to another email
              </button>

              <Link
                className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 transition hover:text-brand-orange"
                href="/login"
              >
                <FiArrowLeft /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-3 font-serif text-4xl tracking-tight text-stone-900">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              No problem. Enter your registered email address below, and we will
              send you a secure link to reset your password.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-stone-700">
                Email address
                <div className="relative mt-1">
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <button
                className="flex w-full items-center justify-center gap-2 bg-brand-orange px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                <FiMail size={18} />
                {submitting ? "Sending reset link..." : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange transition hover:text-orange-800"
                href="/login"
              >
                <FiArrowLeft /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
