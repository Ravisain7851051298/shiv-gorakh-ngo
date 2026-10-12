"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiAward,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiDownload,
  FiEye,
  FiFileText,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiTrash2,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiX,
  FiXCircle,
  FiZap,
} from "react-icons/fi";
import { contentApi, getContentImageUrl } from "@/lib/authApi";

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "PENDING" | "ACTIVE" | "SUSPENDED"
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & details
  const [detailModal, setDetailModal] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [actionType, setActionType] = useState(""); // tracks what action is running
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await contentApi.get("/volunteer/admin/all");
      if (res.data?.success) {
        setVolunteers(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load volunteer records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function copyText(text, label = "Text") {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  }

  // Filtered volunteers
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      if (activeTab !== "all") {
        const vStatus = (v.status || "ACTIVE").toUpperCase();
        if (vStatus !== activeTab) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const userName = v.user?.name?.toLowerCase() || "";
        const userEmail = v.user?.email?.toLowerCase() || "";
        const userPhone = v.user?.phone?.toLowerCase() || "";
        const volId = v.volunteerId?.toLowerCase() || "";
        const skills = (v.skills || []).join(" ").toLowerCase();

        if (
          !userName.includes(q) &&
          !userEmail.includes(q) &&
          !userPhone.includes(q) &&
          !volId.includes(q) &&
          !skills.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [volunteers, activeTab, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: volunteers.length,
      pending: volunteers.filter((v) => (v.status || "").toUpperCase() === "PENDING").length,
      active: volunteers.filter((v) => (v.status || "").toUpperCase() === "ACTIVE").length,
      suspended: volunteers.filter((v) => (v.status || "").toUpperCase() === "SUSPENDED").length,
      emergency: volunteers.filter((v) => v.availability?.emergencyAvailable).length,
    };
  }, [volunteers]);

  // Admin Actions
  async function handleApprove(volunteer) {
    if (
      !window.confirm(
        `Approve volunteer application for "${volunteer.user?.name || "this user"}"?\n\n✓ An official Volunteer ID Card will be generated.\n✓ Offer & Appointment Letter will be generated and emailed.\n✓ Certificates are issued separately when you click "Issue Certificate".`
      )
    ) {
      return;
    }

    setProcessingId(volunteer._id);
    setActionType("approve");
    try {
      const res = await contentApi.patch(`/volunteer/admin/${volunteer._id}/approve`);
      if (res.data?.success) {
        toast.success(res.data.message || "Volunteer approved! ID Card & Offer Letter issued.");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve volunteer");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleReject(volunteer) {
    const reason = window.prompt("Reason for suspension / rejection (optional):");
    if (reason === null) return;

    setProcessingId(volunteer._id);
    setActionType("reject");
    try {
      const res = await contentApi.patch(`/volunteer/admin/${volunteer._id}/reject`, { reason });
      if (res.data?.success) {
        toast.success("Volunteer status updated to suspended/rejected.");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to suspend volunteer");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleSendCertificate(volunteer) {
    setProcessingId(volunteer._id);
    setActionType("cert-mail");
    try {
      const res = await contentApi.post(`/volunteer/admin/${volunteer._id}/send-certificate`);
      if (res.data?.success) {
        toast.success(res.data.message || "Certificate issued & emailed to volunteer!");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send certificate email");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleDownloadCertificate(volunteer) {
    setProcessingId(volunteer._id);
    setActionType("cert-dl");
    try {
      const res = await contentApi.get(`/volunteer/admin/${volunteer._id}/certificate`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const certNum = volunteer.certificateNumber || volunteer.volunteerId || volunteer._id;
      link.setAttribute("download", `Volunteer_Certificate_${certNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate PDF downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download certificate PDF.");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleSendOfferLetter(volunteer) {
    setProcessingId(volunteer._id);
    setActionType("offer-mail");
    try {
      const res = await contentApi.post(`/volunteer/admin/${volunteer._id}/send-appointment-letter`);
      if (res.data?.success) {
        toast.success(res.data.message || "Offer & Appointment Letter emailed to volunteer!");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send offer letter email");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleDownloadOfferLetter(volunteer) {
    setProcessingId(volunteer._id);
    setActionType("offer-dl");
    try {
      const res = await contentApi.get(`/volunteer/admin/${volunteer._id}/appointment-letter`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const volId = volunteer.volunteerId || volunteer._id;
      link.setAttribute("download", `Volunteer_Offer_Letter_${volId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Offer Letter PDF downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download offer letter PDF.");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleDownloadIdCard(volunteer) {
    setProcessingId(volunteer._id);
    setActionType("idcard-dl");
    try {
      const res = await contentApi.get(`/volunteer/admin/${volunteer._id}/id-card`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const volId = volunteer.volunteerId || volunteer._id;
      link.setAttribute("download", `Volunteer_ID_Card_${volId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Volunteer ID Card downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download Volunteer ID card PDF.");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  // Delete Volunteer Action
  async function handleDeleteVolunteer() {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    try {
      const res = await contentApi.delete(`/volunteer/admin/${deleteModalItem._id}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Volunteer profile deleted successfully.");
        setDeleteModalItem(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete volunteer profile");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Admin Operations · Field Force
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Volunteer Force &amp; Field Responders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review applicant profiles, approve volunteers, issue official ID Cards, and issue Certificates &amp; Appointment Letters.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin text-orange-600" : ""} size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── 4 KPI Stats Cards with High Visibility ──────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Force
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <FiUsers size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{counts.all}</p>
          <p className="mt-1 text-xs text-slate-500">Registered applicants &amp; volunteers</p>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Approval
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-amber-200/80 text-amber-900">
              <FiClock size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-amber-950">{counts.pending}</p>
          <p className="mt-1 text-xs font-semibold text-amber-800">Awaiting admin verification</p>
        </div>

        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Active Responders
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-200/80 text-emerald-900">
              <FiCheckCircle size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-950">{counts.active}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-800">ID Cards &amp; Offer Letters active</p>
        </div>

        <div className="rounded-2xl border border-rose-300 bg-rose-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              24/7 Emergency Dispatch
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-rose-200/80 text-rose-900">
              <FiZap size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-rose-950">{counts.emergency}</p>
          <p className="mt-1 text-xs font-semibold text-rose-800">Available for night/trauma emergencies</p>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
          {[
            { id: "all", label: `All (${counts.all})` },
            { id: "PENDING", label: `Pending Approval (${counts.pending})` },
            { id: "ACTIVE", label: `Active (${counts.active})` },
            { id: "SUSPENDED", label: `Suspended (${counts.suspended})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search name, email, phone, ID, skills…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-8 py-2 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Volunteers Table (Clean, High Visibility) ─────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-3">
            <span className="size-5 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
            <span>Loading volunteer records…</span>
          </div>
        ) : filteredVolunteers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-4 pl-6 pr-4">Volunteer Profile</th>
                  <th className="py-4 px-4">Volunteer ID</th>
                  <th className="py-4 px-4">Capabilities &amp; Fleet</th>
                  <th className="py-4 px-4">Approval Status</th>
                  <th className="py-4 pr-6 text-right">Official Documents</th>
                </tr>
              </thead>
              {filteredVolunteers.map((v) => {
                  const status = (v.status || "ACTIVE").toUpperCase();
                  const isPending = status === "PENDING";
                  const isActive = status === "ACTIVE";
                  const isSuspended = status === "SUSPENDED";
                  const user = v.user || {};
                  const isBusy = processingId === v._id;

                  return (
                    <tbody
                      key={v._id}
                      className={`group/row transition-colors border-b border-slate-200/80 ${
                        isBusy ? "bg-emerald-50/40" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <tr className="transition-colors">
                      {/* 1. Volunteer Profile & Contact */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className="size-11 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 shadow-2xs">
                            {user.profilePicture ? (
                              <img
                                src={getContentImageUrl(user.profilePicture)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center font-bold text-slate-600 text-xs bg-orange-100">
                                {user.name ? user.name.slice(0, 2).toUpperCase() : "VL"}
                              </div>
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setDetailModal(v)}
                              className="font-bold text-slate-900 hover:text-emerald-700 text-left text-sm transition"
                            >
                              {user.name || "Volunteer Applicant"}
                            </button>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span>{user.email || "No email"}</span>
                              {user.email && (
                                <button
                                  type="button"
                                  onClick={() => copyText(user.email, "Email")}
                                  className="text-slate-400 hover:text-slate-700"
                                  title="Copy Email"
                                >
                                  <FiCopy size={11} />
                                </button>
                              )}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold mt-0.5">
                                <FiPhone size={11} className="text-emerald-600" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Assigned Volunteer ID */}
                      <td className="py-4 px-4 font-mono">
                        {v.volunteerId ? (
                          <span className="font-bold text-emerald-900 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 text-xs block w-max">
                            {v.volunteerId}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300 block w-max">
                            Pending Verification
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 mt-1 block font-sans">
                          Applied: {formatDate(v.createdAt)}
                        </span>
                      </td>

                      {/* 3. Capabilities & Emergency */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                          {v.availability?.emergencyAvailable && (
                            <span className="rounded-md bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-black border border-rose-200 flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-rose-600 animate-ping" />
                              24/7 Dispatch
                            </span>
                          )}
                          {v.rescueCapabilities?.canTransport && (
                            <span className="rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                              Vehicle ({v.rescueCapabilities?.vehicleType || "General"})
                            </span>
                          )}
                          {(v.skills || []).slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] border border-slate-200 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 4. Approval Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ${
                            isActive
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isPending
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-rose-100 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {isActive && <FiCheckCircle size={12} className="text-emerald-600" />}
                          {isPending && <FiClock size={12} className="text-amber-600" />}
                          {isSuspended && <FiXCircle size={12} className="text-rose-600" />}
                          <span>{status}</span>
                        </span>
                        {isActive && v.approvedAt && (
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Approved: {formatDate(v.approvedAt)}
                          </span>
                        )}
                      </td>

                      {/* 5. Official Documents Status */}
                      <td className="py-4 pr-6 text-right">
                        {isActive ? (
                          <div className="inline-block space-y-1.5 min-w-[170px] text-left">
                            {/* ID Card Status */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <span>🪪 ID Card:</span>
                              </span>
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                                Active
                              </span>
                            </div>

                            {/* Offer Letter Status */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <span>✉️ Offer Letter:</span>
                              </span>
                              <span className="text-slate-600 text-[10px]">
                                {v.offerLetterSentAt ? `Emailed (${formatDate(v.offerLetterSentAt)})` : "Generated"}
                              </span>
                            </div>

                            {/* Certificate Status */}
                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <span>📜 Certificate:</span>
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  v.certificateSentAt
                                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {v.certificateSentAt ? `Emailed (${formatDate(v.certificateSentAt)})` : "Not issued"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Pending admin verification</span>
                        )}
                      </td>
                    </tr>

                    {/* ── Action Toolbar (Reveals on Row Hover at the Bottom of Row) ── */}
                    <tr className="transition-all">
                      <td colSpan={5} className="p-0">
                        <div
                          className={`overflow-hidden transition-all duration-200 ease-out bg-slate-100/90 border-t border-dashed border-slate-300/80 px-6 ${
                            isBusy
                              ? "max-h-24 opacity-100 py-2.5"
                              : "max-h-0 opacity-0 py-0 group-hover/row:max-h-24 group-hover/row:opacity-100 group-hover/row:py-2.5 group-focus-within/row:max-h-24 group-focus-within/row:opacity-100 group-focus-within/row:py-2.5"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Left: Summary */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="font-bold text-slate-700">
                                Actions for <span className="text-slate-900 underline decoration-emerald-400">{user.name || "Volunteer"}</span>:
                              </span>
                              {v.volunteerId && (
                                <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                  {v.volunteerId}
                                </span>
                              )}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(v)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition cursor-pointer disabled:opacity-50"
                                    title="Approve volunteer, issue ID card & email appointment offer letter"
                                  >
                                    <FiCheckCircle size={14} />
                                    <span>{isBusy && actionType === "approve" ? "Processing…" : "Verify & Approve"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleReject(v)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition cursor-pointer disabled:opacity-50"
                                    title="Reject application"
                                  >
                                    <FiX size={14} />
                                    <span>Reject</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDetailModal(v)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                    title="View dossier"
                                  >
                                    <FiEye size={13} />
                                    <span>View Dossier</span>
                                  </button>
                                </>
                              )}

                              {isActive && (
                                <>
                                  {/* Action: Issue Certificate */}
                                  <div className="inline-flex rounded-lg border border-blue-300 bg-blue-50 shadow-2xs overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleSendCertificate(v)}
                                      disabled={isBusy}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition cursor-pointer disabled:opacity-50"
                                      title="Issue and email official Certificate PDF to volunteer"
                                    >
                                      <FiAward size={13} className="text-blue-700" />
                                      <span>{isBusy && actionType === "cert-mail" ? "Sending…" : "Issue Certificate"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadCertificate(v)}
                                      disabled={isBusy}
                                      className="px-2 py-1.5 border-l border-blue-200 text-blue-800 hover:bg-blue-200 transition cursor-pointer"
                                      title="Download Certificate PDF"
                                    >
                                      <FiDownload size={13} />
                                    </button>
                                  </div>

                                  {/* Action: Offer Letter */}
                                  <div className="inline-flex rounded-lg border border-orange-300 bg-orange-50 shadow-2xs overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleSendOfferLetter(v)}
                                      disabled={isBusy}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-orange-800 hover:bg-orange-100 transition cursor-pointer disabled:opacity-50"
                                      title="Email Offer / Appointment Letter PDF"
                                    >
                                      <FiMail size={13} className="text-orange-700" />
                                      <span>{isBusy && actionType === "offer-mail" ? "Sending…" : "Offer Letter"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadOfferLetter(v)}
                                      disabled={isBusy}
                                      className="px-2 py-1.5 border-l border-orange-200 text-orange-800 hover:bg-orange-200 transition cursor-pointer"
                                      title="Download Offer Letter PDF"
                                    >
                                      <FiDownload size={13} />
                                    </button>
                                  </div>

                                  {/* Action: Download Official ID Card PDF */}
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadIdCard(v)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                                    title="Download official Volunteer ID Card PDF"
                                  >
                                    <FiDownload size={13} />
                                    <span>ID Card PDF</span>
                                  </button>

                                  {/* View Full Dossier */}
                                  <button
                                    type="button"
                                    onClick={() => setDetailModal(v)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                    title="View full volunteer profile details"
                                  >
                                    <FiEye size={13} />
                                    <span>Dossier</span>
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteModalItem(v)}
                                    className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition cursor-pointer"
                                    title="Delete volunteer record"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </>
                              )}

                              {isSuspended && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(v)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                  >
                                    <FiCheckCircle size={13} />
                                    <span>Re-approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDetailModal(v)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                  >
                                    <FiEye size={13} />
                                    <span>Dossier</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteModalItem(v)}
                                    className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Delete record"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-slate-500">
            {searchQuery
              ? "No volunteer records found matching your search query."
              : "No volunteers found in this category."}
          </div>
        )}
      </div>

      {/* ── Volunteer Detail Modal ────────────────────────────── */}
      {detailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-2xl w-full rounded-2xl bg-white p-6 sm:p-7 shadow-2xl overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
                  {detailModal.user?.profilePicture ? (
                    <img
                      src={getContentImageUrl(detailModal.user.profilePicture)}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center font-bold text-slate-700 text-sm bg-orange-100">
                      {detailModal.user?.name ? detailModal.user.name.slice(0, 2).toUpperCase() : "VL"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    {detailModal.user?.name || "Volunteer Profile"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      {detailModal.volunteerId || "Pending Verification"}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status: {detailModal.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px] uppercase block">Email Address:</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">
                    {detailModal.user?.email || "—"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px] uppercase block">Phone Number:</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                    {detailModal.user?.phone || "—"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block">
                  Field Skills &amp; Logistics
                </span>
                <div className="grid sm:grid-cols-2 gap-2 text-slate-800">
                  <div>
                    <span className="text-slate-400">Animals Handled: </span>
                    <span className="font-semibold">{detailModal.animalTypes?.join(", ") || "All species"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Transport: </span>
                    <span className="font-semibold">
                      {detailModal.rescueCapabilities?.canTransport
                        ? `Equipped (${detailModal.rescueCapabilities?.vehicleType || "Vehicle"})`
                        : "Foot Patrol / Assisting"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">24/7 Emergency Dispatch: </span>
                    <span className="font-bold text-rose-700">
                      {detailModal.availability?.emergencyAvailable ? "Yes (Available)" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Skills: </span>
                    <span className="font-semibold">{detailModal.skills?.join(", ") || "General volunteer"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block">
                  Address &amp; Emergency Contact
                </span>
                <p className="text-slate-700">
                  <strong className="text-slate-900">Residential Address: </strong>
                  {[
                    detailModal.address?.addressLine,
                    detailModal.address?.city,
                    detailModal.address?.state,
                    detailModal.address?.pincode,
                  ].filter(Boolean).join(", ") || "Not provided"}
                </p>
                <p className="text-slate-700">
                  <strong className="text-slate-900">Emergency Contact: </strong>
                  {detailModal.emergencyContact?.name} ({detailModal.emergencyContact?.phone || "—"})
                </p>
              </div>

              {/* Document Downloads Inside Modal */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-100/60 flex flex-wrap items-center justify-between gap-3">
                <span className="font-bold text-slate-700">Download Credentials:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadIdCard(detailModal)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <FiDownload size={12} />
                    <span>ID Card PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadOfferLetter(detailModal)}
                    className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 cursor-pointer"
                  >
                    <FiDownload size={12} />
                    <span>Offer Letter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadCertificate(detailModal)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    <FiDownload size={12} />
                    <span>Certificate</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const target = detailModal;
                  setDetailModal(null);
                  setDeleteModalItem(target);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                <FiTrash2 size={13} />
                <span>Delete Volunteer Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      {deleteModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={() => !isDeleting && setDeleteModalItem(null)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <FiTrash2 className="size-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              Permanently Delete Volunteer Profile?
            </h3>

            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the volunteer profile for{" "}
              <strong className="text-slate-900">{deleteModalItem.user?.name || "this volunteer"}</strong>
              {deleteModalItem.volunteerId ? ` (ID: ${deleteModalItem.volunteerId})` : ""}?
            </p>

            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-950">
                <FiAlertCircle size={14} className="shrink-0 text-rose-600" />
                <span>Permanent Actions:</span>
              </p>
              <ul className="list-disc pl-5 text-[11px] text-rose-800 space-y-0.5">
                <li>Volunteer ID card and appointment letter records will be purged.</li>
                <li>User account will revert back to standard supporter.</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVolunteer}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                <FiTrash2 size={13} />
                <span>{isDeleting ? "Deleting…" : "Delete Volunteer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
