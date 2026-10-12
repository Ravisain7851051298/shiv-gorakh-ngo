"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiCamera,
  FiCheckCircle,
  FiEdit2,
  FiKey,
  FiMail,
  FiPhone,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { getContentImageUrl } from "@/lib/authApi";
import { forgotPassword, updateProfile } from "@/store/authSlice";

export default function AdminProfileManagement() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  function startEditing() {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setAvatarFile(null);
    setAvatarPreview(user?.profilePicture ? getContentImageUrl(user.profilePicture) : "");
    setRemoveAvatar(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(false);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Profile picture size must be under 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  }

  function handleRemovePhoto() {
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("email", form.email.trim());
    formData.append("phone", form.phone.trim());

    if (avatarFile) {
      formData.append("profilePicture", avatarFile);
    } else if (removeAvatar) {
      formData.append("removeProfilePicture", "true");
    }

    const result = await dispatch(updateProfile(formData));
    setSaving(false);

    if (updateProfile.fulfilled.match(result)) {
      toast.success("Administrator profile updated successfully.");
      setIsEditing(false);
    } else {
      toast.error(result.payload || "Failed to update profile. Please try again.");
    }
  }

  async function handleSendResetEmail() {
    if (!user?.email) return;

    setSendingReset(true);
    const result = await dispatch(forgotPassword({ email: user.email }));
    setSendingReset(false);

    if (forgotPassword.fulfilled.match(result)) {
      setResetSent(true);
      if (result.payload?.devResetUrl) {
        setDevResetUrl(result.payload.devResetUrl);
      }
      toast.success("Password reset link sent to your email!");
    } else {
      toast.error(result.payload || "Could not send reset email.");
    }
  }

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Administrator Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your administrative credentials, personal contact info, and profile avatar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {/* Banner Background */}
            <div className="h-28 bg-gradient-to-r from-[#172d3a] to-[#28495c] relative">
              <span className="absolute right-4 top-4 rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[11px] font-bold text-orange-200 border border-orange-400/30">
                Super Admin
              </span>
            </div>

            {/* Avatar & User Meta */}
            <div className="px-6 pb-6 pt-0 text-center -mt-14 relative">
              <div className="mx-auto size-24 overflow-hidden rounded-full border-4 border-white bg-orange-100 shadow-md">
                {user?.profilePicture ? (
                  <img
                    src={getContentImageUrl(user.profilePicture)}
                    alt={user.name || "Administrator"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center font-bold text-2xl text-orange-600 uppercase">
                    {user?.name ? user.name.slice(0, 2) : "AD"}
                  </div>
                )}
              </div>

              <h2 className="mt-3 text-lg font-bold text-slate-800">
                {user?.name || "Administrator"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1.5">
                <FiMail className="text-slate-400" />
                {user?.email}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                  <FiShield size={12} />
                  Administrator
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Full Access
                </span>
              </div>

              {user?.phone && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
                  <FiPhone className="text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </section>

          {/* Security & Password Card */}
          <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800 mb-2">
              <span className="grid size-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
                <FiKey />
              </span>
              <span>Password & Security</span>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Need to change your admin password? We can send a secure reset link to your email address.
            </p>

            {resetSent ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                  <FiCheckCircle className="text-emerald-600" />
                  <span>Reset link dispatched</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-700">
                  Check your inbox for <strong>{user?.email}</strong>. The link is valid for 1 hour.
                </p>
                {devResetUrl && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60">
                    <span className="text-[10px] uppercase font-bold text-emerald-900">Dev Shortcut:</span>
                    <a
                      href={devResetUrl}
                      className="block font-medium text-emerald-900 underline mt-0.5 truncate"
                    >
                      Open Password Reset Link →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={sendingReset}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                <FiKey />
                <span>{sendingReset ? "Sending link..." : "Send Reset Link via Email"}</span>
              </button>
            )}
          </section>
        </div>

        {/* Right Column: Account Details or Edit Form */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Edit Administrator Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your display name, email address, phone number, and profile picture.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Cancel edit"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-6 space-y-6">
                {/* Profile Picture (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Profile Picture <span className="font-normal normal-case text-slate-400">(optional)</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-orange-400 bg-slate-100 shadow-inner">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-bold text-2xl text-slate-400 uppercase">
                          {form.name ? form.name.slice(0, 2) : <FiUser />}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                          <FiCamera size={14} className="text-orange-500" />
                          <span>{avatarPreview ? "Change photo" : "Upload photo"}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>

                        {(avatarPreview || user?.profilePicture) && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
                          >
                            <FiTrash2 size={14} />
                            <span>Remove photo</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, or WebP up to 5MB. Profile picture is not mandatory.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Administrator name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@organization.org"
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Your email address is used for signing in to the admin dashboard.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Phone number <span className="font-normal normal-case text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 rounded-lg bg-orange-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
                  >
                    {saving ? "Saving changes..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your personal profile information associated with this admin account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600"
                >
                  <FiEdit2 size={13} />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                <div className="py-3.5 grid sm:grid-cols-3 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Full Name
                  </span>
                  <span className="sm:col-span-2 text-sm font-semibold text-slate-800">
                    {user?.name || "Not provided"}
                  </span>
                </div>

                <div className="py-3.5 grid sm:grid-cols-3 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <span className="sm:col-span-2 text-sm font-semibold text-slate-800">
                    {user?.email || "Not provided"}
                  </span>
                </div>

                <div className="py-3.5 grid sm:grid-cols-3 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Phone Number
                  </span>
                  <span className="sm:col-span-2 text-sm font-semibold text-slate-800">
                    {user?.phone || "Not provided"}
                  </span>
                </div>

                <div className="py-3.5 grid sm:grid-cols-3 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Role
                  </span>
                  <span className="sm:col-span-2 text-sm font-semibold text-orange-600 capitalize">
                    {user?.role || "Administrator"}
                  </span>
                </div>

                <div className="py-3.5 grid sm:grid-cols-3 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Profile Picture
                  </span>
                  <span className="sm:col-span-2 text-sm font-semibold text-slate-800 flex items-center gap-2">
                    {user?.profilePicture ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <FiCheckCircle /> Custom Photo Uploaded
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal">
                        Default Avatar (optional)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
