"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiCheckCircle, FiEye, FiEyeOff, FiHeart, FiLock, FiShield } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/store/authSlice";

function AdminResetPasswordContent() {
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

  async function submit(event) {
    event.preventDefault();

    if (!token) {
      toast.error("Password reset token is missing.");
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

    if (resetPassword.fulfilled.match(result)) {
      setSuccess(true);
      toast.success("Admin password reset successfully.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
      return;
    }

    toast.error(result.payload || "Failed to reset password. Link may have expired.");
  }

  if (!token) {
    return (
      <section className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_24px_70px_rgba(32,42,53,0.09)] sm:p-9 text-center">
        <h1 className="text-xl font-bold text-slate-800">Invalid Recovery Link</h1>
        <p className="mt-2 text-sm text-slate-500">
          The reset link is invalid or expired. Please request a new link.
        </p>
        <Link
          className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          href="/forgot-password"
        >
          Request new reset link
        </Link>
      </section>
    );
  }

  return (
    <section className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_24px_70px_rgba(32,42,53,0.09)] sm:p-9">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-lg text-white">
          <FiHeart />
        </span>
        <span>Shiv Gorakh <span className="font-normal text-slate-400">Foundation</span></span>
      </div>

      {success ? (
        <div className="my-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <FiCheckCircle size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">
            Password updated!
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your admin password has been changed. Redirecting you to the sign in portal...
          </p>
          <div className="mt-6">
            <Link
              className="inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
              href="/login"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-7 mt-9">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-orange-700">
              <FiShield /> PASSWORD RECOVERY
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
              Create new password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your new administrative password below.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              New password
              <span className="relative block">
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  autoComplete="new-password"
                  minLength={6}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 hover:text-slate-700"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  type="button"
                >
                  {passwordVisible ? <FiEyeOff /> : <FiEye />}
                </button>
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-600">
              Confirm new password
              <span className="relative block">
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  autoComplete="new-password"
                  minLength={6}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  type={confirmVisible ? "text" : "password"}
                  value={confirmPassword}
                />
                <button
                  aria-label={confirmVisible ? "Hide confirm password" : "Show confirm password"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 hover:text-slate-700"
                  onClick={() => setConfirmVisible(!confirmVisible)}
                  type="button"
                >
                  {confirmVisible ? <FiEyeOff /> : <FiEye />}
                </button>
              </span>
            </label>

            <button
              className="mt-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              <FiLock />
              {loading ? "Updating password…" : "Reset password"}
            </button>
          </form>

          <p className="my-5 text-center text-sm text-slate-500">
            <Link className="font-semibold text-orange-700 hover:text-orange-800" href="/login">
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </section>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f8fa] px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <AdminResetPasswordContent />
      </Suspense>
    </main>
  );
}
