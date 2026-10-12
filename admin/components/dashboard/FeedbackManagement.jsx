"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiEye,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
  FiUser,
  FiX,
  FiXCircle,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import { contentApi, getContentImageUrl } from "@/lib/authApi";
import { useDashboardLayout } from "../dashboard/DashboardLayout";

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
}

function StarRating({ rating = 5, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300"
          }
        />
      ))}
    </div>
  );
}

export default function FeedbackManagement() {
  const { ngoSetting } = useDashboardLayout();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ all: 0, approved: 0, pending: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState("all"); // "all" | "Approved" | "Pending" | "Rejected"
  const [ratingFilter, setRatingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Forms state
  const [editForm, setEditForm] = useState({
    rating: 5,
    message: "",
    status: "Approved",
    isFeatured: false,
    adminReply: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    userRole: "donor",
    rating: 5,
    message: "",
    status: "Approved",
    adminReply: "",
    isFeatured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadFeedbacks() {
    setLoading(true);
    try {
      const res = await contentApi.get("/feedbacks/admin/all", {
        params: { limit: 100 },
      });
      if (res.data?.success) {
        setFeedbacks(res.data.feedbacks || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load feedback records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      // Tab filter
      if (activeTab !== "all" && item.status !== activeTab) {
        return false;
      }
      // Rating filter
      if (ratingFilter !== "all" && Number(item.rating) !== Number(ratingFilter)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const userName = (item.user?.name || item.name || "").toLowerCase();
        const userEmail = (item.user?.email || item.email || "").toLowerCase();
        const userPhone = (item.user?.phone || item.phone || "").toLowerCase();
        const userMsg = (item.message || "").toLowerCase();
        if (
          !userName.includes(q) &&
          !userEmail.includes(q) &&
          !userPhone.includes(q) &&
          !userMsg.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [feedbacks, activeTab, ratingFilter, searchQuery]);

  // Average Rating
  const avgRating = useMemo(() => {
    if (!feedbacks.length) return 5.0;
    const sum = feedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  // Admin Quick Status Toggle
  async function handleQuickStatus(item, newStatus) {
    try {
      const res = await contentApi.patch(`/feedbacks/${item._id}`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`Feedback status marked as ${newStatus}`);
        loadFeedbacks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  }

  // Open Edit Form
  function openEdit(item) {
    setEditModal(item);
    setEditForm({
      rating: item.rating || 5,
      message: item.message || "",
      status: item.status || "Approved",
      isFeatured: Boolean(item.isFeatured),
      adminReply: item.adminReply || "",
    });
  }

  // Submit Edit Form
  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editModal) return;
    setSubmitting(true);
    try {
      const res = await contentApi.patch(`/feedbacks/${editModal._id}`, editForm);
      if (res.data?.success) {
        toast.success("Feedback updated successfully!");
        setEditModal(null);
        loadFeedbacks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save feedback changes");
    } finally {
      setSubmitting(false);
    }
  }

  // Submit Create Form
  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.message.trim()) {
      toast.error("Name and feedback message are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await contentApi.post("/feedbacks/admin/create", createForm);
      if (res.data?.success) {
        toast.success("Feedback created successfully!");
        setCreateModalOpen(false);
        setCreateForm({
          name: "",
          email: "",
          phone: "",
          userRole: "donor",
          rating: 5,
          message: "",
          status: "Approved",
          adminReply: "",
          isFeatured: false,
        });
        loadFeedbacks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create feedback");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Feedback
  async function handleDelete(item) {
    const name = item.user?.name || item.name || "this user";
    if (!window.confirm(`Permanently delete feedback from "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await contentApi.delete(`/feedbacks/${item._id}`);
      if (res.data?.success) {
        toast.success("Feedback deleted successfully.");
        loadFeedbacks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete feedback");
    }
  }

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      {/* Top Banner / Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-orange-800">
              <FiMessageSquare size={13} /> User Reviews & Community Feedback
            </span>
            {counts.pending > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 animate-pulse">
                <FiClock size={12} /> {counts.pending} Pending Review
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            Reviews & Feedback Management Desk
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Audit public reviews with verified user account details, moderate community feedback, manage ratings, and publish official responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={loadFeedbacks}
            type="button"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 active:scale-95"
            onClick={() => setCreateModalOpen(true)}
            type="button"
          >
            <FiPlus /> Add Verified Feedback
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Feedbacks</span>
          <p className="mt-1 text-2xl font-black text-slate-800">{counts.all || feedbacks.length}</p>
          <span className="text-[11px] text-slate-400">Community submissions</span>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Approved Reviews</span>
          <p className="mt-1 text-2xl font-black text-emerald-800">{counts.approved}</p>
          <span className="text-[11px] text-emerald-600">Active on NGO site</span>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
          <p className="mt-1 text-2xl font-black text-amber-800">{counts.pending}</p>
          <span className="text-[11px] text-amber-600">Awaiting moderation</span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Rating</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800">{avgRating}</span>
            <StarRating rating={Number(avgRating)} size={15} />
          </div>
          <span className="text-[11px] text-slate-400">Overall score out of 5</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Reviews", count: counts.all || feedbacks.length },
            { id: "Approved", label: "Approved", count: counts.approved },
            { id: "Pending", label: "Pending", count: counts.pending },
            { id: "Rejected", label: "Rejected", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Rating and Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rating filter dropdown */}
          <select
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-orange-400 focus:bg-white"
              placeholder="Search user, email, review..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                onClick={() => setSearchQuery("")}
              >
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main List / Table */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500 animate-pulse">
          Loading feedback and user account details...
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FiMessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-base font-semibold text-slate-700">No feedbacks found</p>
          <p className="mt-1 text-xs text-slate-400">
            {searchQuery || activeTab !== "all" || ratingFilter !== "all"
              ? "Try adjusting your search filters."
              : "Submissions from the NGO website will appear here with full account credentials."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((item) => {
            const userName = item.user?.name || item.name || "Anonymous Supporter";
            const userEmail = item.user?.email || item.email || "No email provided";
            const userPhone = item.user?.phone || item.phone || "";
            const userRole = (item.user?.role || item.userRole || "supporter").toLowerCase();
            const avatarUrl = item.user?.profilePicture || item.profilePicture;

            return (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Account Information Card Section */}
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-orange-200 bg-orange-100 text-orange-800 shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={getContentImageUrl(avatarUrl)}
                          alt={userName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-bold text-sm">
                          {userName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Account Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{userName}</h3>
                        {/* Role Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${userRole === "admin"
                              ? "bg-slate-900 text-amber-300"
                              : userRole === "member"
                                ? "bg-blue-100 text-blue-800"
                                : userRole === "volunteer"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                        >
                          {userRole}
                        </span>

                        {item.user ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                            <FiCheck size={11} /> Verified Account
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                            Guest
                          </span>
                        )}

                        {item.isFeatured && (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            ⭐ Featured
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        {userEmail && (
                          <span className="inline-flex items-center gap-1">
                            <FiMail size={12} className="text-slate-400" /> {userEmail}
                          </span>
                        )}
                        {userPhone && (
                          <span className="inline-flex items-center gap-1">
                            <FiPhone size={12} className="text-slate-400" /> {userPhone}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <FiClock size={12} /> {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* 2. Then Her Star Rating */}
                <div className="mt-3 flex items-center gap-2 sm:ml-16">
                  <StarRating rating={item.rating} size={15} />
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                    {Number(item.rating || 5).toFixed(1)} / 5.0
                  </span>
                </div>

                {/* 3. Then Feedback Message */}
                <div className="mt-3 sm:ml-16 rounded-xl bg-slate-50/90 p-4 border border-slate-100">
                  <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-normal">
                    &ldquo;{item.message}&rdquo;
                  </p>
                </div>

                {/* 4. Then Arrow and Reply Who Reply */}
                {item.adminReply && (
                  <div className="mt-3.5 sm:ml-16 border-t border-slate-100 pt-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-orange-50/80 border border-orange-200/90 p-3.5 sm:p-4">
                      {/* The Arrow */}
                      <span className="text-orange-600 font-bold text-lg leading-none select-none pt-0.5">↳</span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <div className="size-5 shrink-0 overflow-hidden rounded-full border border-orange-300 bg-white shadow-xs">
                            {ngoSetting?.logo ? (
                              <img
                                src={getContentImageUrl(ngoSetting.logo)}
                                alt="Admin"
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="grid size-full place-items-center bg-slate-900 text-[8px] font-black text-amber-300">
                                {ngoSetting?.logoInitials || "SG"}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-xs text-slate-900">
                            {ngoSetting?.ngoName || "Shiv Gorakh Welfare Foundation"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[9px] font-extrabold uppercase tracking-wider">
                            <FiCheckCircle size={9} /> Official Reply
                          </span>
                          {item.adminRepliedAt && (
                            <span className="text-[10px] text-slate-400">
                              • {formatDate(item.adminRepliedAt)}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-800 italic leading-relaxed">
                          &ldquo;{item.adminReply}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Quick Moderation Toggles */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Status:</span>
                    {item.status !== "Approved" && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(item, "Approved")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        <FiCheckCircle size={12} /> Approve
                      </button>
                    )}
                    {item.status !== "Pending" && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(item, "Pending")}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 hover:bg-amber-100 transition"
                      >
                        <FiClock size={12} /> Pending
                      </button>
                    )}
                    {item.status !== "Rejected" && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(item, "Rejected")}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-100 transition"
                      >
                        <FiXCircle size={12} /> Reject
                      </button>
                    )}
                  </div>

                  {/* View, Edit, Delete CRUD actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewModal(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <FiEye size={13} /> View Account
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-1.5 font-semibold text-orange-700 hover:bg-orange-100 transition"
                    >
                      <FiEdit2 size={13} /> Edit / Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      <FiTrash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* VIEW ACCOUNT & REVIEW DETAILS MODAL */}
      {viewModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">User Account & Feedback Profile</h3>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200"
                onClick={() => setViewModal(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-orange-300 bg-orange-100 text-orange-800">
                  {viewModal.user?.profilePicture || viewModal.profilePicture ? (
                    <img
                      src={getContentImageUrl(viewModal.user?.profilePicture || viewModal.profilePicture)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-bold text-xl">
                      {(viewModal.user?.name || viewModal.name || "SG").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{viewModal.user?.name || viewModal.name}</h4>
                  <p className="text-xs text-slate-500">{viewModal.user?.email || viewModal.email || "No email"}</p>
                  <p className="text-xs text-slate-500">{viewModal.user?.phone || viewModal.phone || "No phone"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                      Role: {viewModal.user?.role || viewModal.userRole || "supporter"}
                    </span>
                    {viewModal.user?._id && (
                      <span className="text-[10px] font-mono text-slate-400">UID: {viewModal.user._id}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Flow: Star Rating, Message, Arrow & Reply */}
              <div className="space-y-3">
                {/* 2. Star Rating */}
                <div className="flex items-center gap-2">
                  <StarRating rating={viewModal.rating} size={16} />
                  <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {Number(viewModal.rating || 5).toFixed(1)} / 5.0
                  </span>
                </div>

                {/* 3. Feedback Message */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">
                  &ldquo;{viewModal.message}&rdquo;
                </div>

                {/* 4. Arrow and Reply Who Reply */}
                {viewModal.adminReply ? (
                  <div className="rounded-2xl border border-orange-200/90 bg-orange-50/80 p-3.5 sm:p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-orange-600 font-bold text-lg select-none leading-none pt-0.5">↳</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            Shiv Gorakh Welfare Foundation
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[9px] font-extrabold uppercase">
                            <FiCheckCircle size={9} /> Official Reply
                          </span>
                          {viewModal.adminRepliedAt && (
                            <span className="text-[10px] text-slate-400">
                              • {formatDate(viewModal.adminRepliedAt)}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-800 italic leading-relaxed">
                          &ldquo;{viewModal.adminReply}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-400">
                    No official reply added yet. Click &quot;Edit / Reply&quot; to write a response.
                  </div>
                )}

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Created: {formatDate(viewModal.createdAt)}</span>
                  <span>Status: <strong>{viewModal.status}</strong></span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setViewModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = viewModal;
                    setViewModal(null);
                    openEdit(item);
                  }}
                  className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700"
                >
                  Edit / Reply
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* EDIT FEEDBACK & ADMIN REPLY MODAL */}
      {editModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-orange-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Review & Compose Response</h3>
                <p className="text-xs text-slate-500">For review submitted by {editModal.user?.name || editModal.name}</p>
              </div>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200"
                onClick={() => setEditModal(null)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Rating Selector */}
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Star Rating (1 to 5)
                <select
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400"
                  value={editForm.rating}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Exceptional)</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars (Good)</option>
                  <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
                  <option value={2}>⭐⭐ 2 Stars (Needs Improvement)</option>
                  <option value={1}>⭐ 1 Star (Poor)</option>
                </select>
              </label>

              {/* Moderation Status */}
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Moderation Status
                <select
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400"
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Approved">Approved (Publicly displayed on NGO site)</option>
                  <option value="Pending">Pending (Under moderation review)</option>
                  <option value="Rejected">Rejected (Hidden from public)</option>
                </select>
              </label>

              {/* Message */}
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Review Message
                <textarea
                  className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-orange-400 focus:bg-white"
                  value={editForm.message}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, message: e.target.value }))}
                  required
                />
              </label>

              {/* Foundation Official Response */}
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Official Foundation Reply / Gratitude Note
                <textarea
                  className="min-h-20 rounded-xl border border-orange-200 bg-orange-50/40 p-3 text-xs outline-none focus:border-orange-400 focus:bg-white placeholder:text-slate-400"
                  placeholder="e.g. Thank you for your continued support! Our animal rescue team truly appreciates your compassion..."
                  value={editForm.adminReply}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, adminReply: e.target.value }))}
                />
              </label>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded text-orange-600 focus:ring-orange-500"
                  checked={editForm.isFeatured}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                />
                Feature this testimonial on top of public site
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* CREATE VERIFIED FEEDBACK MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-orange-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Verified Feedback / Testimonial</h3>
                <p className="text-xs text-slate-500">Publish verified feedback from a foundation patron or partner</p>
              </div>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200"
                onClick={() => setCreateModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                  Reviewer Name *
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400 focus:bg-white"
                    placeholder="e.g. Ramesh Chandra"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                  Role Title
                  <select
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400"
                    value={createForm.userRole}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, userRole: e.target.value }))}
                  >
                    <option value="donor">Philanthropic Donor</option>
                    <option value="volunteer">Field Volunteer</option>
                    <option value="member">Foundation Member</option>
                    <option value="supporter">Community Supporter</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                  Email (optional)
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400 focus:bg-white"
                    placeholder="e.g. ramesh@example.com"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                  Phone (optional)
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400 focus:bg-white"
                    placeholder="e.g. +91 9876543210"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                  Rating
                  <select
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400"
                    value={createForm.rating}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </label>

                <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                  Status
                  <select
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-orange-400"
                    value={createForm.status}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Approved">Approved (Visible on site)</option>
                    <option value="Pending">Pending</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Feedback Message *
                <textarea
                  className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-orange-400 focus:bg-white"
                  placeholder="Share feedback or quote about Shiv Gorakh Welfare Foundation..."
                  required
                  value={createForm.message}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, message: e.target.value }))}
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded text-orange-600 focus:ring-orange-500"
                  checked={createForm.isFeatured}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                />
                Feature this testimonial on top of public site
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Publish Feedback"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
