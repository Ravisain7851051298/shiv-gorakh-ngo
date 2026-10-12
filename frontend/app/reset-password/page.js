"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { resetPassword } from "@/store/authSlice";
import getUserFacingError from "@/lib/getUserFacingError";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      toast.error("Password reset token is missing. Please request a new link.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await dispatch(
      resetPassword({
        token,
        password,
        confirmPassword,
      }),
    );
    setLoading(false);

    if (result.meta.requestStatus === "fulfilled") {
      setSuccess(true);
      toast.success("Password reset successfully! You can now sign in.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } else {
      toast.error(
        getUserFacingError(
          result.payload,
          "Failed to reset password. The link may have expired.",
        ),
      );
    }
  }

  const inputClass =
    "mt-2 w-full border border-orange-100 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand-orange focus:ring-2 focus:ring-orange-100";

  if (!token) {
    return (
      <section className="mx-auto max-w-lg border border-orange-100 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
          Shiv Gorakh Welfare Foundation
        </p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight text-stone-900">
          Invalid Reset Link
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          This password reset link is invalid or incomplete. Please request a
          new link using the forgot password form.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex min-h-11 items-center bg-brand-orange px-5 text-sm font-bold text-white transition hover:bg-orange-700"
            href="/forgot-password"
          >
            Request New Reset Link
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg border border-orange-100 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
        Shiv Gorakh Welfare Foundation
      </p>

      {success ? (
        <div className="mt-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <FiCheckCircle size={32} />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-stone-900">
            Password reset successful!
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Your password has been securely updated. Taking you to the sign in
            page...
          </p>
          <div className="mt-8">
            <Link
              className="inline-flex min-h-11 items-center bg-brand-orange px-6 text-sm font-bold text-white transition hover:bg-orange-700"
              href="/login"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-stone-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Choose a new strong password for your account.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-semibold text-stone-700"
                htmlFor="new-password"
              >
                New password
              </label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-12`}
                  id="new-password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-stone-500 hover:text-brand-orange"
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-stone-700"
                htmlFor="confirm-password"
              >
                Confirm new password
              </label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-12`}
                  id="confirm-password"
                  name="confirmPassword"
                  type={confirmVisible ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-stone-500 hover:text-brand-orange"
                  type="button"
                  onClick={() => setConfirmVisible((v) => !v)}
                  aria-label={confirmVisible ? "Hide password" : "Show password"}
                >
                  {confirmVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 bg-brand-orange px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              <FiLock size={18} />
              {loading ? "Updating password..." : "Reset password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Remembered your credentials?{" "}
            <Link
              className="font-bold text-brand-orange hover:text-orange-800"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[70vh] bg-brand-cream px-5 py-12 sm:px-8">
      <Suspense
        fallback={
          <section className="mx-auto max-w-lg border border-orange-100 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-10">
            <p className="text-sm text-stone-600">Loading password reset form...</p>
          </section>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
