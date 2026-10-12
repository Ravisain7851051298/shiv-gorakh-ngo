"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiHeart, FiShield } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin, adminRegister, refreshSession } from "@/store/authSlice";

function getRedirectPath() {
  const redirectPath = new URLSearchParams(window.location.search).get("redirect");
  if (
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//") &&
    redirectPath !== "/login" &&
    redirectPath !== "/register"
  ) {
    return redirectPath;
  }
  return "/dashboard";
}

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, initialized, loading, error } = useSelector((state) => state.auth);
  const [visibleFields, setVisibleFields] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminSecret: "",
  });

  useEffect(() => {
    if (!initialized) dispatch(refreshSession());
  }, [dispatch, initialized]);

  useEffect(() => {
    if (initialized && user) router.replace(getRedirectPath());
  }, [initialized, router, user]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function toggleFieldVisibility(field) {
    setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
  }

  async function submit(event) {
    event.preventDefault();
    const result = await dispatch(
      isRegister
        ? adminRegister({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          adminSecret: form.adminSecret,
        })
        : adminLogin({ email: form.email, password: form.password }),
    );

    if (adminLogin.fulfilled.match(result) || adminRegister.fulfilled.match(result)) {
      toast.success(isRegister ? "Admin account created." : "Welcome back.");
      router.replace(getRedirectPath());
      return;
    }

    toast.error(result.payload || "Unable to sign in. Please try again.");
  }

  if (!initialized || user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
          Loading your workspace…
        </div>
      </main>
    );
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

        <div className="mb-7 mt-9">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-orange-700">
            <FiShield /> SECURE ADMIN PORTAL
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
            {isRegister ? "Create your admin account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRegister
              ? "Set up administrator access to manage your foundation."
              : "Sign in to continue to your foundation dashboard."}
          </p>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          {isRegister && (
            <>
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                Full name
                <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" autoComplete="name" name="name" onChange={updateField} placeholder="Your name" required value={form.name} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                Phone
                <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" autoComplete="tel" name="phone" onChange={updateField} placeholder="Phone number" required value={form.phone} />
              </label>
            </>
          )}
          <label className="grid gap-1.5 text-sm font-medium text-slate-600">
            Email address
            <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" autoComplete="email" name="email" onChange={updateField} placeholder="you@organization.org" required type="email" value={form.email} />
          </label>
          <div className="grid gap-1.5 text-sm font-medium text-slate-600">
            <div className="flex items-center justify-between">
              <span>Password</span>
              {!isRegister && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <span className="relative block">
              <input className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" autoComplete={isRegister ? "new-password" : "current-password"} minLength={6} name="password" onChange={updateField} placeholder="At least 6 characters" required type={visibleFields.password ? "text" : "password"} value={form.password} />
              <button aria-label={visibleFields.password ? "Hide password" : "Show password"} aria-pressed={Boolean(visibleFields.password)} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-orange-500" onClick={() => toggleFieldVisibility("password")} type="button">
                {visibleFields.password ? <FiEyeOff /> : <FiEye />}
              </button>
            </span>
          </div>
          {isRegister && (
            <>
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                Confirm password
                <span className="relative block">
                  <input className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" autoComplete="new-password" minLength={6} name="confirmPassword" onChange={updateField} placeholder="Enter your password again" required type={visibleFields.confirmPassword ? "text" : "password"} value={form.confirmPassword} />
                  <button aria-label={visibleFields.confirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={Boolean(visibleFields.confirmPassword)} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-orange-500" onClick={() => toggleFieldVisibility("confirmPassword")} type="button">
                    {visibleFields.confirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </span>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                Admin setup key
                <span className="relative block">
                  <input className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100" autoComplete="off" name="adminSecret" onChange={updateField} placeholder="Organization setup key" required type={visibleFields.adminSecret ? "text" : "password"} value={form.adminSecret} />
                  <button aria-label={visibleFields.adminSecret ? "Hide admin setup key" : "Show admin setup key"} aria-pressed={Boolean(visibleFields.adminSecret)} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-orange-500" onClick={() => toggleFieldVisibility("adminSecret")} type="button">
                    {visibleFields.adminSecret ? <FiEyeOff /> : <FiEye />}
                  </button>
                </span>
              </label>
            </>
          )}
          {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <button className="mt-1 h-11 rounded-lg bg-orange-500 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60" disabled={loading} type="submit">
            {loading ? "Please wait…" : isRegister ? "Create admin account" : "Sign in to dashboard"}
          </button>
        </form>

        <p className="my-5 text-center text-sm text-slate-500">
          {isRegister ? "Already have an admin account?" : "Setting up the dashboard for the first time?"}{" "}
          <Link className="font-semibold text-orange-700 hover:text-orange-800" href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create account"}
          </Link>
        </p>
        <p className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <FiShield className="text-emerald-600" /> Refresh sessions are protected with an HttpOnly cookie
        </p>
      </section>
    </main>
  );
}
