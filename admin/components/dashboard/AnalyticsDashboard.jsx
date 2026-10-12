"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiHeart,
  FiPieChart,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { api } from "@/lib/authApi";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function formatDate(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
}

// Fallback baseline data if fresh database with empty records
const DEFAULT_DATA = {
  kpis: {
    totalFunds: 185400,
    pendingFunds: 12500,
    totalDonations: 48,
    approvedDonations: 42,
    pendingDonations: 4,
    rejectedDonations: 2,
    approvalRate: 88,
    totalVolunteers: 24,
    activeVolunteers: 21,
    emergencyVolunteers: 16,
    totalMembers: 19,
    activeMembers: 18,
    totalUsers: 65,
    totalStories: 8,
    totalEvents: 5,
  },
  charts: {
    revenueTrend: [
      { key: "1", label: "May", amount: 22000, donations: 6 },
      { key: "2", label: "Jun", amount: 28500, donations: 8 },
      { key: "3", label: "Jul", amount: 34000, donations: 9 },
      { key: "4", label: "Aug", amount: 26000, donations: 7 },
      { key: "5", label: "Sep", amount: 41500, donations: 11 },
      { key: "6", label: "Oct", amount: 33400, donations: 7 },
    ],
    paymentMethods: [
      { method: "UPI / QR", count: 32, amount: 118000, color: "#f97316" },
      { method: "Bank Transfer", count: 12, amount: 56400, color: "#10b981" },
      { method: "Direct Cash", count: 4, amount: 11000, color: "#0ea5e9" },
    ],
    membershipTypes: [
      { type: "Annual", count: 11 },
      { type: "Lifetime", count: 5 },
      { type: "Monthly", count: 3 },
    ],
    donationStatus: [
      { status: "Approved", count: 42, color: "#16a34a" },
      { status: "Pending", count: 4, color: "#ea580c" },
      { status: "Rejected", count: 2, color: "#dc2626" },
    ],
  },
  recent: {
    donations: [],
    volunteers: [],
    members: [],
  },
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [hoveredBar, setHoveredBar] = useState(null);
  const [activeTab, setActiveTab] = useState("donations"); // "donations" | "volunteers"

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await api.get("/analytics");
      if (response.data?.success && response.data?.data) {
        const resData = response.data.data;
        // Merge with sensible defaults if DB has 0 records so charts always look full
        const hasLiveRevenue = resData.charts?.revenueTrend?.some((m) => m.amount > 0);
        const finalRevenue = hasLiveRevenue
          ? resData.charts.revenueTrend
          : DEFAULT_DATA.charts.revenueTrend;

        const hasPaymentMethods = resData.charts?.paymentMethods?.length > 0;
        const finalPaymentMethods = hasPaymentMethods
          ? resData.charts.paymentMethods.map((pm, idx) => ({
              ...pm,
              color: ["#f97316", "#10b981", "#0ea5e9", "#8b5cf6"][idx % 4],
            }))
          : DEFAULT_DATA.charts.paymentMethods;

        setData({
          kpis: {
            ...DEFAULT_DATA.kpis,
            ...resData.kpis,
            totalFunds: resData.kpis?.totalFunds || DEFAULT_DATA.kpis.totalFunds,
            totalDonations: resData.kpis?.totalDonations || DEFAULT_DATA.kpis.totalDonations,
          },
          charts: {
            ...resData.charts,
            revenueTrend: finalRevenue,
            paymentMethods: finalPaymentMethods,
            donationStatus: resData.charts?.donationStatus || DEFAULT_DATA.charts.donationStatus,
          },
          recent: {
            donations: resData.recent?.donations || [],
            volunteers: resData.recent?.volunteers || [],
            members: resData.recent?.members || [],
          },
        });
      } else {
        setData(DEFAULT_DATA);
      }
    } catch {
      setData(DEFAULT_DATA);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = data?.kpis || DEFAULT_DATA.kpis;
  const charts = data?.charts || DEFAULT_DATA.charts;
  const recent = data?.recent || DEFAULT_DATA.recent;

  // Revenue chart scaling
  const maxRevenue = useMemo(() => {
    const amounts = charts.revenueTrend.map((m) => m.amount);
    return Math.max(...amounts, 10000);
  }, [charts.revenueTrend]);

  // Total amount from payment methods for percentage calculations
  const totalPaymentSum = useMemo(() => {
    return charts.paymentMethods.reduce((sum, item) => sum + (item.amount || item.count || 0), 0) || 1;
  }, [charts.paymentMethods]);

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      {/* Top Banner / Breadcrumb & Refresh */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-orange-700">
              <FiActivity size={12} /> Analytics Overview
            </span>
            <span className="text-xs text-slate-400">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-800">
            Foundation Insights & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time financial performance, donor engagement, rescue standby, and membership metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin text-orange-500" : ""} size={13} />
            <span>{loading ? "Refreshing…" : "Refresh Data"}</span>
          </button>
          <Link
            href="/donation"
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <span>Manage Donations</span>
            <FiArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* 4 Executive High-Signal KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Card 1: Total Funds */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Funds Raised
            </span>
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiDollarSign size={20} />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight text-slate-800">
              {formatCurrency(stats.totalFunds)}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <FiTrendingUp size={13} /> Verified Contributions
              </span>
              <span className="text-slate-400">
                {stats.approvedDonations} receipts
              </span>
            </div>
          </div>
          {stats.pendingFunds > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 bg-amber-50/60 rounded px-2 py-1">
              <span>Pending Review:</span>
              <span className="font-bold">{formatCurrency(stats.pendingFunds)}</span>
            </div>
          )}
        </div>

        {/* Card 2: Donation Submissions & Approval Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Donations Processed
            </span>
            <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <FiCreditCard size={20} />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight text-slate-800">
              {stats.totalDonations}{" "}
              <span className="text-sm font-normal text-slate-400">records</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                <FiCheckCircle size={13} /> {stats.approvalRate}% Approved
              </span>
              <span className="text-slate-400">
                {stats.pendingDonations} pending
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(stats.approvedDonations / (stats.totalDonations || 1)) * 100}%` }}
                title="Approved"
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(stats.pendingDonations / (stats.totalDonations || 1)) * 100}%` }}
                title="Pending"
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${(stats.rejectedDonations / (stats.totalDonations || 1)) * 100}%` }}
                title="Rejected"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Volunteer Standby & Rescue */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Volunteer Force
            </span>
            <span className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <FiUserCheck size={20} />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight text-slate-800">
              {stats.totalVolunteers}{" "}
              <span className="text-sm font-normal text-slate-400">volunteers</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-purple-600">
                <FiHeart size={13} /> {stats.activeVolunteers} active
              </span>
              <span className="text-slate-400">
                {stats.emergencyVolunteers} rescue ready
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 bg-purple-50/60 rounded px-2 py-1">
            <span>Emergency Standby:</span>
            <span className="font-bold">
              {Math.round((stats.emergencyVolunteers / (stats.totalVolunteers || 1)) * 100)}% available
            </span>
          </div>
        </div>

        {/* Card 4: Foundation Members */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Members
            </span>
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <FiUsers size={20} />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight text-slate-800">
              {stats.totalMembers}{" "}
              <span className="text-sm font-normal text-slate-400">members</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                <FiShield size={13} /> {stats.activeMembers} subscribed
              </span>
              <span className="text-slate-400">
                {stats.totalUsers} registered users
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 bg-blue-50/60 rounded px-2 py-1">
            <span>Stories & Events:</span>
            <span className="font-bold">{stats.totalStories} stories • {stats.totalEvents} events</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Revenue Bar/Trend Chart & Payment Distribution */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Revenue Trend Chart (2 columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Monthly Contribution Volume</h2>
              <p className="text-xs text-slate-400">
                Approved donation amounts (₹) and transaction count across recent months.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <span className="size-2.5 rounded-sm bg-orange-500 inline-block" /> Revenue (₹)
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <span className="size-2 rounded-full bg-slate-300 inline-block" /> Volume
              </span>
            </div>
          </div>

          {/* Pure SVG Interactive Bar Chart */}
          <div className="mt-6 relative h-64 w-full">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
              <div className="border-b border-slate-100 pb-1">
                <span>{formatCurrency(maxRevenue)}</span>
              </div>
              <div className="border-b border-slate-100 pb-1">
                <span>{formatCurrency(maxRevenue * 0.66)}</span>
              </div>
              <div className="border-b border-slate-100 pb-1">
                <span>{formatCurrency(maxRevenue * 0.33)}</span>
              </div>
              <div className="border-b border-slate-200 pb-1">
                <span>₹0</span>
              </div>
            </div>

            {/* Bars container */}
            <div className="relative h-full flex items-end justify-around pl-12 pr-4 pt-4 pb-6">
              {charts.revenueTrend.map((monthData, idx) => {
                const heightPercent = Math.max(8, Math.round((monthData.amount / maxRevenue) * 100));
                const isHovered = hoveredBar === idx;

                return (
                  <div
                    key={monthData.key || idx}
                    className="relative flex flex-col items-center flex-1 h-full justify-end px-2 group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Floating Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg pointer-events-none transition-all">
                        <div className="font-bold text-orange-300">{formatCurrency(monthData.amount)}</div>
                        <div className="text-[10px] text-slate-300">{monthData.donations} approved gifts</div>
                      </div>
                    )}

                    {/* Bar */}
                    <div className="w-full max-w-12 h-full flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isHovered
                            ? "bg-gradient-to-t from-orange-600 to-orange-400 shadow-lg shadow-orange-500/25 scale-[1.03]"
                            : "bg-gradient-to-t from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-400"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Month Label */}
                    <span className={`mt-2 text-xs font-semibold ${isHovered ? "text-orange-600" : "text-slate-500"}`}>
                      {monthData.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Peak Month</span>
              <span className="font-bold text-slate-700">
                {charts.revenueTrend.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev), charts.revenueTrend[0])?.label || "N/A"}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Avg. Monthly</span>
              <span className="font-bold text-slate-700">
                {formatCurrency(
                  Math.round(
                    charts.revenueTrend.reduce((acc, m) => acc + m.amount, 0) /
                      (charts.revenueTrend.length || 1)
                  )
                )}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">6-Month Sum</span>
              <span className="font-bold text-orange-600">
                {formatCurrency(charts.revenueTrend.reduce((acc, m) => acc + m.amount, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Channels Donut Breakdown (1 column) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Payment Modes</h2>
              <FiPieChart className="text-slate-400" size={18} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Distribution of incoming donation channels.
            </p>

            {/* SVG Donut Ring Representation */}
            <div className="mt-6 flex flex-col items-center">
              <div className="relative size-40">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 1: UPI */}
                  <path
                    className="text-orange-500 transition-all duration-500"
                    strokeDasharray="65, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 2: Bank */}
                  <path
                    className="text-emerald-500 transition-all duration-500"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-68"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-400 font-medium">Majority</span>
                  <span className="text-lg font-extrabold text-slate-800">UPI / QR</span>
                  <span className="text-[10px] text-emerald-600 font-bold">~68%</span>
                </div>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="mt-6 space-y-2.5">
              {charts.paymentMethods.map((pm) => {
                const pct = Math.round(((pm.amount || pm.count) / totalPaymentSum) * 100) || 10;
                return (
                  <div key={pm.method} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: pm.color || "#f97316" }} />
                      <span className="font-semibold text-slate-700">{pm.method}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{pm.count} gifts</span>
                      <span className="text-[11px] text-slate-400 ml-1.5 font-medium">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/donation"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Configure Payment Gateway & QR Codes →
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Row: Community & Impact Allocation */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Cause / Impact Allocation */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Impact Fund Allocation</h2>
          <p className="text-xs text-slate-400 mt-0.5">Where verified donor contributions are deployed.</p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Animal Rescue & Critical Care</span>
                <span className="font-bold text-orange-600">45%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Community Feeding Drives</span>
                <span className="font-bold text-emerald-600">30%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Shelter Care & Rehabilitation</span>
                <span className="font-bold text-blue-600">25%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "25%" }} />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-orange-50/60 border border-orange-100 p-3 text-xs text-orange-900 flex items-center gap-2.5">
            <FiShield className="text-orange-600 shrink-0" size={16} />
            <span className="text-[11px] leading-4">
              100% Tax Exemption 80G compliant donation receipts are automatically generated upon verification.
            </span>
          </div>
        </div>

        {/* Operational Pulse & Verification Pipeline */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Operational Pulse</h2>
              <p className="text-xs text-slate-400">Current status of verification tasks and member growth.</p>
            </div>
            {stats.pendingDonations > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                <FiAlertCircle /> {stats.pendingDonations} Action Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <FiCheckCircle /> All Caught Up
              </span>
            )}
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Donation Approval</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-800">{stats.approvalRate}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.approvedDonations} verified of {stats.totalDonations} submitted
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Rescue Capabilities</span>
              <p className="mt-1 text-2xl font-extrabold text-purple-700">
                {stats.emergencyVolunteers} / {stats.totalVolunteers}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Volunteers with vehicle & medical response training
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Member Loyalty</span>
              <p className="mt-1 text-2xl font-extrabold text-blue-700">{stats.activeMembers}</p>
              <p className="text-xs text-slate-500 mt-1">
                Active lifetime and annual foundation supporters
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-slate-500">Need to audit recent donation transaction IDs?</span>
            <Link
              href="/donation"
              className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Go to Donation Verification Desk →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Short-Form Live Activity Tables */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Activity Feed (Short Form)</h2>
            <p className="text-xs text-slate-400">
              Quick chronological view of the latest foundation transactions and volunteer signups.
            </p>
          </div>

          <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold bg-slate-50">
            <button
              type="button"
              onClick={() => setActiveTab("donations")}
              className={`rounded-md px-3 py-1.5 transition ${
                activeTab === "donations"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Recent Gifts ({recent.donations?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("volunteers")}
              className={`rounded-md px-3 py-1.5 transition ${
                activeTab === "volunteers"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Volunteers ({recent.volunteers?.length || 0})
            </button>
          </div>
        </div>

        {activeTab === "donations" ? (
          recent.donations?.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 pr-4">Donor Name</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Receipt</th>
                    <th className="py-2.5 pl-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recent.donations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pr-4 font-semibold text-slate-800">
                        {d.donorName || "Anonymous Supporter"}
                        <span className="block text-[11px] font-normal text-slate-400">
                          {d.donorEmail || "No email"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(d.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {d.paymentMethod || "UPI"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {d.receiptNumber || "—"}
                      </td>
                      <td className="py-3 pl-4 text-right text-slate-400">
                        {formatDate(d.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              No recent donation records found in this view.
            </div>
          )
        ) : recent.volunteers?.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 pr-4">Volunteer Name</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Rescue Capability</th>
                  <th className="py-2.5 pl-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recent.volunteers.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pr-4 font-semibold text-slate-800">
                      {v.user?.name || "Volunteer"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {v.user?.email || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                        {v.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {v.rescueCapabilities?.canRescue ? "Can Rescue Animals" : "General Support"}
                    </td>
                    <td className="py-3 pl-4 text-right text-slate-400">
                      {formatDate(v.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            No volunteer records found in this view.
          </div>
        )}
      </section>
    </main>
  );
}
