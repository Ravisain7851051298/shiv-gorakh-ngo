"use client";

import { useState } from "react";
import {
  FiAlertCircle,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiFileText,
  FiHeart,
  FiHome,
  FiLogOut,
  FiMenu,
  FiRefreshCw,
  FiUser,
  FiX,
  FiExternalLink,
} from "react-icons/fi";
import Link from "next/link";
import DigitalIdCard from "./DigitalIdCard";
import AppointmentLetterView from "./AppointmentLetterView";
import CertificatesVault from "./CertificatesVault";
import JoinedEventsSection from "./JoinedEventsSection";
import ComplaintsSection from "./ComplaintsSection";
import QrCodeDisplay from "./QrCodeDisplay";
import VolunteerRegistrationForm from "@/components/VolunteerRegistrationForm";
import MembershipRegistrationForm from "@/components/MembershipRegistrationForm";
import { getApiImageUrl } from "@/lib/authApi";

export default function MemberVolunteerDashboard({
  user,
  volunteer,
  membership,
  donations = [],
  joinedEvents = [],
  allEvents = [],
  complaints = [],
  onLogout,
  onSaveAccount,
  onRefreshData,
  onDownloadReceipt,
  downloadingReceiptId,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Profile Edit States
  const [editingVolunteer, setEditingVolunteer] = useState(false);
  const [editingMembership, setEditingMembership] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
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
  const [savingAccount, setSavingAccount] = useState(false);

  // Roles
  const isVolunteer =
    Boolean(volunteer && (volunteer.status === "ACTIVE" || (!volunteer.status && volunteer.volunteerId))) ||
    user?.role === "volunteer";
  const isMember = Boolean(membership && membership.status === "Active") || user?.role === "member";

  // Role toggle if user has both roles
  const [rolePerspective, setRolePerspective] = useState(isVolunteer ? "volunteer" : "member");
  const currentRole = rolePerspective;

  const idNumber = currentRole === "member"
    ? membership?.memberId || membership?.certificateNumber || `SG-MEM-2026-${String(user?._id || "").slice(-5).toUpperCase()}`
    : volunteer?.volunteerId || `SG-VOL-2026-${String(user?._id || "").slice(-5).toUpperCase()}`;

  const roleBadgeTitle = isVolunteer && isMember
    ? "Foundation Member & Field Volunteer"
    : isVolunteer
      ? "Authorized Field Volunteer"
      : "Official Foundation Member";

  const totalDonationsSum = donations
    .filter((d) => d.status === "Approved")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Exact 8 sidebar links requested by user
  const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: FiHome, badge: null },
    { id: "profile", label: "My Profile", icon: FiUser, badge: null },
    { id: "qr-id", label: "My QR ID Card", icon: FiCreditCard, badge: "Live QR" },
    { id: "donations", label: "My Donations", icon: FiHeart, badge: donations.length ? `${donations.length}` : null },
    { id: "certificates", label: "MY Certificates", icon: FiAward, badge: null },
    { id: "appointment", label: "Appointment letter", icon: FiFileText, badge: "Official" },
    { id: "events", label: "My joined Events", icon: FiCalendar, badge: joinedEvents.length ? `${joinedEvents.length}` : null },
    { id: "complaints", label: "My complains", icon: FiAlertCircle, badge: complaints.length ? `${complaints.length}` : null },
  ];

  async function handleRefreshClick() {
    setIsRefreshing(true);
    try {
      if (onRefreshData) await onRefreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }

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

  const verificationPayload = JSON.stringify({
    org: "Shiv Gorakh Welfare Foundation",
    id: idNumber,
    name: user?.name,
    role: roleBadgeTitle,
    status: "ACTIVE",
  });

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-800 flex flex-col lg:flex-row antialiased">
      {/* ======================================================== */}
      {/* MOBILE TOP BAR (Anchored safely below main Navbar)        */}
      {/* ======================================================== */}
      <div className="lg:hidden sticky top-[68px] z-30 flex items-center justify-between border-b border-orange-200/80 bg-white/95 px-4 pt-2.5 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-8 place-items-center rounded-lg bg-brand-orange text-white shadow-xs transition hover:opacity-90 active:scale-95"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
          <span className="text-xs font-bold text-stone-900 capitalize">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </span>
        </div>

        <button
          type="button"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-2xs hover:bg-orange-50 transition"
        >
          <FiRefreshCw size={11} className={isRefreshing ? "animate-spin text-brand-orange" : ""} />
          <span>{isRefreshing ? "Updating…" : "Refresh"}</span>
        </button>
      </div>

      {/* Backdrop for mobile drawer (Placed safely below Navbar) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[68px] z-35 bg-stone-950/50 backdrop-blur-2xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ======================================================== */}
      {/* COMPACT SIDEBAR NAVIGATION (Small, clean, below Navbar)   */}
      {/* ======================================================== */}
      <aside
        className={`fixed top-[68px] bottom-0 left-0 z-40 bg-brand-orange text-white shadow-xl transition-all duration-300 ease-in-out lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] flex flex-col justify-between shrink-0 ${
          // Mobile state
          mobileMenuOpen ? "translate-x-0 w-56" : "-translate-x-full lg:translate-x-0"
          } ${
          // Desktop small vs collapsed state
          isCollapsed ? "lg:w-16" : "lg:w-56"
          }`}
      >
        {/* Top Header & Navigation Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 scrollbar-none">
          {/* Minimal Header Toggle: No logo, no id card, no mini profile */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/20">
            {!isCollapsed ? (
              <>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/85 px-1.5">
                  Menu
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    className="hidden lg:grid size-7 place-items-center rounded-lg bg-white/15 text-white hover:bg-white/25 active:scale-95 transition"
                    title="Collapse sidebar"
                    aria-label="Collapse sidebar"
                  >
                    <FiChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="lg:hidden grid size-7 place-items-center rounded-lg bg-white/15 text-white hover:bg-white/25 transition"
                    aria-label="Close menu"
                  >
                    <FiX size={15} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(false)}
                  className="hidden lg:grid size-7 place-items-center rounded-lg bg-white/20 text-white hover:bg-white/30 active:scale-95 transition"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items (The exact 8 links requested) */}
          <nav className="space-y-1" aria-label="Dashboard Sidebar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`transition-all duration-200 ${isCollapsed
                      ? `w-11 h-11 mx-auto flex items-center justify-center rounded-xl ${isActive
                        ? "bg-white text-brand-orange font-bold shadow-md ring-2 ring-white/40 scale-105"
                        : "text-white/85 hover:bg-white/20 hover:text-white"
                      }`
                      : `w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold ${isActive
                        ? "bg-white text-brand-orange font-bold shadow-sm ring-1 ring-white/30"
                        : "text-white/85 hover:bg-white/15 hover:text-white"
                      }`
                      }`}
                    title={isCollapsed ? item.label : undefined}
                    aria-label={item.label}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                      <Icon
                        size={isCollapsed ? 18 : 16}
                        className={`shrink-0 transition-transform ${isActive ? "text-brand-orange" : "text-white group-hover:scale-105"
                          }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${isActive ? "bg-brand-orange/15 text-brand-orange" : "bg-white/20 text-white"
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Floating tooltip only when sidebar is collapsed */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 whitespace-nowrap rounded-xl bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 animate-in fade-in duration-150">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-1.5 rounded-full bg-brand-orange px-1 py-0.2 text-[9px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Compact Sidebar Footer Area */}
        <div className="p-2 border-t border-white/15 bg-black/10">
          {!isCollapsed ? (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-black/20 hover:bg-black/35 py-2 text-xs font-bold text-white transition active:scale-98"
            >
              <FiLogOut size={13} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="relative group flex justify-center">
              <button
                type="button"
                onClick={onLogout}
                className="size-10 grid place-items-center rounded-xl bg-black/20 hover:bg-black/35 text-white transition active:scale-98"
                aria-label="Sign Out"
              >
                <FiLogOut size={16} />
              </button>
              <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 whitespace-nowrap rounded-xl bg-stone-900 px-2.5 py-1 text-xs font-semibold text-rose-300 shadow-xl ring-1 ring-white/10">
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-y-auto px-2 py-2 sm:px-4 lg:px-6 max-w-7xl">
        {/* Top Page Heading Strip (Breadcrumb removed) */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4 border-b border-orange-200/60 pb-2">
          <div className="flex items-center gap-3">
            {/* Desktop Expand / Collapse Sidebar Toggle */}
            {/* <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-orange-50 hover:border-brand-orange/40 hover:text-brand-orange transition"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <FiChevronRight size={13} /> : <FiChevronLeft size={13} />}
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </button> */}

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Dual Role Switcher if user has both roles */}
            {isVolunteer && isMember && (
              <div className="flex rounded-xl bg-stone-100 p-0.5 border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => setRolePerspective("volunteer")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${rolePerspective === "volunteer"
                    ? "bg-brand-orange text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                    }`}
                >
                  Volunteer
                </button>
                <button
                  type="button"
                  onClick={() => setRolePerspective("member")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${rolePerspective === "member"
                    ? "bg-brand-orange text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                    }`}
                >
                  Member
                </button>
              </div>
            )}

            {/* Standing Badge */}
            {/* <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
              <FiCheckCircle size={13} className="text-emerald-600" />
              <span>Verified Standing</span>
            </span> */}

            {/* Refresh Data Button */}
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:bg-orange-50 hover:text-brand-orange hover:border-brand-orange/40 transition disabled:opacity-50"
              title="Refresh portal records"
            >
              <FiRefreshCw size={13} className={isRefreshing ? "animate-spin text-brand-orange" : ""} />
              <span>{isRefreshing ? "Updating…" : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW                                          */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Welcome Greeting Banner */}
            {/* <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green via-[#1a3d31] to-stone-900 p-6 sm:p-8 text-white shadow-xl">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 size-64 rounded-full bg-brand-orange/20 blur-3xl" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-orange px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                      {roleBadgeTitle}
                    </span>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-mono text-emerald-200">
                      ID: {idNumber}
                    </span>
                  </div>

                  <h2 className="mt-3 font-serif text-2xl sm:text-4xl font-bold text-white">
                    Welcome back, {user?.name || "Friend"}! 👋
                  </h2>
                  <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                    Thank you for standing at the frontlines of compassion. Your verified association empowers
                    emergency animal rescues, critical medicine, and neighborhood feeding across Rampur.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("qr-id")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-stone-900 shadow-md hover:bg-orange-50 hover:text-brand-orange transition"
                  >
                    <FiCreditCard size={15} className="text-brand-orange" />
                    <span>View Digital QR ID Card →</span>
                  </button>
                </div>
              </div>
            </div> */}

            {/* Quick KPI Metric Strip */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-brand-orange/40 transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Official Status
                </span>
                <p className="mt-2 font-serif text-2xl font-black text-brand-orange">
                  Active & Verified
                </p>
                <p className="mt-1 text-xs text-stone-500 font-mono truncate">
                  {idNumber}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-brand-orange/40 transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Total Contributions
                </span>
                <p className="mt-2 font-serif text-2xl font-black text-stone-900">
                  ₹{totalDonationsSum.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {donations.length} gifts • 80G tax receipt ready
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-brand-orange/40 transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Joined Camps
                </span>
                <p className="mt-2 font-serif text-2xl font-black text-stone-900">
                  {joinedEvents.length} Drives
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Community rescue & feeding rounds
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-brand-orange/40 transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Grievance Tickets
                </span>
                <p className="mt-2 font-serif text-2xl font-black text-stone-900">
                  {complaints.length} Tickets
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {complaints.filter((c) => c.status === "Resolved").length} resolved by trustees
                </p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">
                Quick Member & Volunteer Actions
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "My QR ID Card",
                    desc: "Official Digital ID with scannable QR verification badge",
                    tab: "qr-id",
                    icon: FiCreditCard,
                    color: "text-brand-orange bg-orange-50",
                  },
                  {
                    title: "Appointment Letter",
                    desc: "Official signed Offer & Appointment Letter with letterhead",
                    tab: "appointment",
                    icon: FiFileText,
                    color: "text-blue-700 bg-blue-50",
                  },
                  {
                    title: "Joined Events",
                    desc: "View camps & RSVP for community drives and rounds",
                    tab: "events",
                    icon: FiCalendar,
                    color: "text-purple-700 bg-purple-50",
                  },
                  {
                    title: "Support & Grievances",
                    desc: "Log inquiries or emergency rescue bottlenecks directly",
                    tab: "complaints",
                    icon: FiAlertCircle,
                    color: "text-rose-700 bg-rose-50",
                  },
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveTab(action.tab)}
                      className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-5 text-left shadow-2xs hover:border-brand-orange hover:shadow-md hover:-translate-y-0.5 transition duration-200 group"
                    >
                      <div className={`grid size-11 place-items-center rounded-2xl ${action.color} group-hover:scale-105 transition`}>
                        <Icon size={20} />
                      </div>
                      <div className="mt-4">
                        <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-brand-orange transition">
                          {action.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">
                          {action.desc}
                        </p>
                      </div>
                      <span className="mt-3 text-[11px] font-bold text-brand-orange group-hover:translate-x-1 transition inline-flex items-center gap-1">
                        Open Desk →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Row: Digital ID Preview + 24/7 Dispatch Card */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left 2 Cols: Compact ID Pass */}
              <div className="lg:col-span-2 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                      Digital Credential Summary
                    </span>
                    <h3 className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                      Identity & Standing Pass
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("qr-id")}
                    className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
                  >
                    <span>Full Card & Print</span>
                    <FiExternalLink size={12} />
                  </button>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-stone-900 text-white p-5">
                  <div className="size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-brand-orange bg-stone-800 shadow">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-serif text-2xl font-bold uppercase text-white">
                        {user?.name ? user.name.slice(0, 2) : "SG"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <span className="inline-block rounded bg-brand-orange px-2.5 py-0.5 text-[9px] font-black uppercase text-white">
                      {roleBadgeTitle}
                    </span>
                    <h4 className="mt-1 font-serif text-xl font-bold text-white truncate">
                      {user?.name}
                    </h4>
                    <p className="font-mono text-xs text-amber-300 font-bold mt-0.5">
                      ID: {idNumber}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate mt-1">
                      {user?.email} {user?.phone ? `• ${user.phone}` : ""}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-center">
                    <QrCodeDisplay
                      value={verificationPayload}
                      size={76}
                      darkColor="#020617"
                      lightColor="#ffffff"
                      className="rounded-lg shadow-sm"
                    />
                    <span className="mt-1 text-[8px] font-bold text-stone-400 uppercase tracking-wider">
                      Verified QR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY PROFILE                                        */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Account Details Card */}
            <section className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                    Personal Identity
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                    Account & Contact Details
                  </h2>
                </div>

                {!editingAccount && (
                  <button
                    type="button"
                    onClick={() => setEditingAccount(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-orange hover:opacity-95 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
                  >
                    <span>Edit Account Info</span>
                  </button>
                )}
              </div>

              {editingAccount ? (
                <form onSubmit={handleAccountSubmit} className="mt-6 space-y-5">
                  {/* Photo picker */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-2">
                      Profile Photo (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="size-16 rounded-full overflow-hidden border-2 border-brand-orange bg-stone-100">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center font-bold text-stone-400">
                            SG
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <label className="cursor-pointer rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition">
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
                            className="rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs text-stone-900 outline-none focus:border-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={accountForm.email}
                      onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs text-stone-900 outline-none focus:border-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs text-stone-900 outline-none focus:border-brand-orange"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingAccount(false)}
                      className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingAccount}
                      className="rounded-xl bg-brand-orange hover:opacity-95 text-white px-5 py-2 text-xs font-bold transition disabled:opacity-50"
                    >
                      {savingAccount ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-5 grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="font-bold text-stone-400 uppercase text-[10px] block">Full Name:</span>
                    <span className="font-semibold text-stone-900 text-sm mt-0.5 block">{user?.name}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="font-bold text-stone-400 uppercase text-[10px] block">Email Address:</span>
                    <span className="font-semibold text-stone-900 text-sm mt-0.5 block">{user?.email}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="font-bold text-stone-400 uppercase text-[10px] block">Contact Phone:</span>
                    <span className="font-semibold text-stone-900 text-sm mt-0.5 block">{user?.phone || "Not provided"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="font-bold text-stone-400 uppercase text-[10px] block">Assigned ID:</span>
                    <span className="font-mono font-bold text-brand-orange text-sm mt-0.5 block">{idNumber}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Volunteer Profile Details */}
            {volunteer && (
              <section className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Rescue Roster
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                      Volunteer Field Capabilities & Availability
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingVolunteer(!editingVolunteer)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <span>{editingVolunteer ? "Close Form" : "Edit Volunteer Details"}</span>
                  </button>
                </div>

                {editingVolunteer ? (
                  <div className="mt-6">
                    <VolunteerRegistrationForm
                      initialValues={volunteer}
                      mode="edit"
                      onCancel={() => setEditingVolunteer(false)}
                      onSuccess={() => {
                        setEditingVolunteer(false);
                        if (onRefreshData) onRefreshData();
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Status:</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">{volunteer.status || "ACTIVE"}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Emergency Available:</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {volunteer.availability?.emergencyAvailable ? "Yes (24/7 Dispatch)" : "Scheduled only"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Transport Capabilities:</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {volunteer.rescueCapabilities?.canTransport
                          ? `Equipped (${volunteer.rescueCapabilities?.vehicleType || "General"})`
                          : "Foot / Support"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Core Skills:</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {volunteer.skills?.join(", ") || "General Care"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Animals Handled:</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {volunteer.animalTypes?.join(", ") || "All species"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Emergency Contact:</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">
                        {volunteer.emergencyContact?.name} ({volunteer.emergencyContact?.phone || "—"})
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Membership Profile Details */}
            {membership && (
              <section className="rounded-3xl border border-blue-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-blue-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Foundation Membership
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                      Membership Registry & Governance Record
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingMembership(!editingMembership)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 transition"
                  >
                    <span>{editingMembership ? "Close Form" : "Edit Membership Details"}</span>
                  </button>
                </div>

                {editingMembership ? (
                  <div className="mt-6">
                    <MembershipRegistrationForm
                      initialValues={membership}
                      mode="edit"
                      onCancel={() => setEditingMembership(false)}
                      onSuccess={() => {
                        setEditingMembership(false);
                        if (onRefreshData) onRefreshData();
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Tier:</span>
                      <span className="font-bold text-blue-800 mt-0.5 block">{membership.membershipType || "Annual"}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Application Standing:</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">{membership.status}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Dues Paid:</span>
                      <span className="font-bold text-stone-900 mt-0.5 block">
                        ₹{Number(membership.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Payment Txn / UTR:</span>
                      <span className="font-mono text-stone-700 mt-0.5 block truncate">{membership.transactionId || "—"}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 sm:col-span-2">
                      <span className="text-stone-400 uppercase font-bold text-[10px] block">Registered Address:</span>
                      <span className="text-stone-800 mt-0.5 block">
                        {[membership.address, membership.city, membership.state, membership.zipCode].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MY QR ID CARD                                     */}
        {/* ======================================================== */}
        {activeTab === "qr-id" && (
          <div className="animate-in fade-in duration-200">
            <DigitalIdCard
              user={user}
              volunteer={volunteer}
              membership={membership}
              role={currentRole}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MY DONATIONS                                      */}
        {/* ======================================================== */}
        {activeTab === "donations" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 border border-stone-200/90 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Philanthropy Ledger
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  My Giving History & 80G Receipts
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Total Contributions: <strong className="text-stone-800">₹{totalDonationsSum.toLocaleString("en-IN")}</strong> across {donations.length} gifts.
                </p>
              </div>

              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-orange hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold shadow-md transition"
              >
                <span>Make a Contribution →</span>
              </Link>
            </div>

            {donations.length > 0 ? (
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/60 text-stone-400 font-bold uppercase tracking-wider">
                        <th className="py-3.5 pl-6 pr-4">Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Mode & Txn ID</th>
                        <th className="py-3.5 px-4">80G Receipt #</th>
                        <th className="py-3.5 pr-6 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                      {donations.map((d) => (
                        <tr key={d._id} className="hover:bg-stone-50/50 transition">
                          <td className="py-4 pl-6 pr-4 font-bold text-stone-900 text-sm">
                            ₹{Number(d.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${d.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : d.status === "Rejected"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                                }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-stone-800 font-semibold">{d.paymentMethod || "UPI"}</div>
                            <div className="font-mono text-[11px] text-stone-400 truncate max-w-[130px]">
                              {d.transactionId || "—"}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px]">
                            {d.status === "Approved" ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-700">{d.receiptNumber || `SG-REC-${d._id}`}</span>
                                <button
                                  type="button"
                                  onClick={() => onDownloadReceipt(d)}
                                  disabled={downloadingReceiptId === d._id}
                                  className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-black transition disabled:opacity-50"
                                >
                                  {downloadingReceiptId === d._id ? "…" : "PDF"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-stone-400">{d.status}</span>
                            )}
                          </td>
                          <td className="py-4 pr-6 text-right text-stone-400">
                            {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center text-xs text-stone-500">
                No donation records found. Contributions made through the portal appear here automatically.
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MY CERTIFICATES                                   */}
        {/* ======================================================== */}
        {activeTab === "certificates" && (
          <div className="animate-in fade-in duration-200">
            <CertificatesVault
              user={user}
              volunteer={volunteer}
              membership={membership}
              donations={donations}
              role={currentRole}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: MY APPOINTMENT LETTER                             */}
        {/* ======================================================== */}
        {activeTab === "appointment" && (
          <div className="animate-in fade-in duration-200">
            <AppointmentLetterView
              user={user}
              volunteer={volunteer}
              membership={membership}
              role={currentRole}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: MY JOINED EVENTS                                  */}
        {/* ======================================================== */}
        {activeTab === "events" && (
          <div className="animate-in fade-in duration-200">
            <JoinedEventsSection
              joinedEvents={joinedEvents}
              allEvents={allEvents}
              onRefresh={onRefreshData}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: MY COMPLAINS COMPLAIN                             */}
        {/* ======================================================== */}
        {activeTab === "complaints" && (
          <div className="animate-in fade-in duration-200">
            <ComplaintsSection
              complaints={complaints}
              onRefresh={onRefreshData}
            />
          </div>
        )}
      </main>
    </div>
  );
}
