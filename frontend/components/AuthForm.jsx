"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { clearAuthError, login, register } from "@/store/authSlice";
import getUserFacingError from "@/lib/getUserFacingError";
import { getSafeRedirect } from "@/lib/safeRedirect";

export default function AuthForm({ mode, redirectTo }) {
  const isRegister = mode === "register";
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, error } = useSelector((state) => state.auth);
  const destination = getSafeRedirect(redirectTo);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  useEffect(() => {
    if (user) router.replace(destination);
  }, [destination, router, user]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) dispatch(clearAuthError());
  }

  async function submit(event) {
    event.preventDefault();
    const action = isRegister
      ? register({
          name: form.name,
          email: form.email,
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
          password: form.password,
          confirmPassword: form.confirmPassword,
        })
      : login({ email: form.email, password: form.password });
    const result = await dispatch(action);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isRegister ? "Account created successfully." : "Signed in successfully.");
      router.replace(destination);
    } else {
      toast.error(getUserFacingError(result.payload, "Unable to complete the request."));
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
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-stone-900">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {isRegister
            ? "Join our community and stay connected with your impact."
            : "Sign in to view your account and stay connected."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={submit}>
          {isRegister && (
            <label className="block text-sm font-semibold text-stone-700">
              Full name
              <input
                className={inputClass}
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={updateField}
                required
              />
            </label>
          )}

          <label className="block text-sm font-semibold text-stone-700">
            Email address
            <input
              className={inputClass}
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>

          {isRegister && (
            <label className="block text-sm font-semibold text-stone-700">
              Phone <span className="font-normal text-stone-400">(optional)</span>
              <input
                className={inputClass}
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={updateField}
              />
            </label>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-stone-700" htmlFor="password">
                Password
              </label>
              {!isRegister && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-brand-orange hover:text-orange-800 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                className={`${inputClass} pr-12`}
                id="password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={6}
                value={form.password}
                onChange={updateField}
                required
              />
              <button
                className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-stone-500 hover:text-brand-orange"
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                aria-pressed={passwordVisible}
              >
                {passwordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-stone-700" htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-12`}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmationVisible ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-stone-500 hover:text-brand-orange"
                  type="button"
                  onClick={() => setConfirmationVisible((visible) => !visible)}
                  aria-label={confirmationVisible ? "Hide confirmation password" : "Show confirmation password"}
                  aria-pressed={confirmationVisible}
                >
                  {confirmationVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
          )}

          <button
            className="w-full bg-brand-orange px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          {isRegister ? "Already have an account?" : "New to the community?"}{" "}
          <Link
            className="font-bold text-brand-orange hover:text-orange-800"
            href={{
              pathname: isRegister ? "/login" : "/register",
              query: redirectTo ? { redirect: destination } : undefined,
            }}
          >
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
