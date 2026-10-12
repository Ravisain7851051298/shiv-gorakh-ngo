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
  FiDollarSign,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFileText,
  FiMail,
  FiMaximize2,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { contentApi, getContentImageUrl } from "@/lib/authApi";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

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

export default function MembershipManagement() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "Pending" | "Active" | "Rejected"
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [screenshotModal, setScreenshotModal] = useState(null); // url
  const [rejectModal, setRejectModal] = useState(null); // membership
  const [rejectReason, setRejectReason] = useState("");
  const [deleteModalItem, setDeleteModalItem] = useState(null); // membership to delete
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings & Tiers state
  const [tiers, setTiers] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Action loading states
  const [processingId, setProcessingId] = useState(null);
  const [actionType, setActionType] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [membersRes, settingsRes] = await Promise.all([
        contentApi.get("/membership/admin/all"),
        contentApi.get("/membership/settings"),
      ]);

      if (membersRes.data?.success) {
        setMemberships(membersRes.data.data || []);
      }
      if (settingsRes.data?.success && settingsRes.data?.data) {
        setTiers(settingsRes.data.data.allTiers || settingsRes.data.data.membershipTypes || []);
        setInstructions(settingsRes.data.data.instructions || "");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load membership records");
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

  // Filtered members
  const filteredMemberships = useMemo(() => {
    return memberships.filter((m) => {
      if (activeTab !== "all" && m.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const userName = m.user?.name?.toLowerCase() || "";
        const userEmail = m.user?.email?.toLowerCase() || "";
        const txnId = m.transactionId?.toLowerCase() || "";
        const type = m.membershipType?.toLowerCase() || "";
        const memId = m.memberId?.toLowerCase() || "";
        if (
          !userName.includes(q) &&
          !userEmail.includes(q) &&
          !txnId.includes(q) &&
          !type.includes(q) &&
          !memId.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [memberships, activeTab, searchQuery]);

  // Counts & Revenue
  const counts = useMemo(() => {
    const activeList = memberships.filter((m) => m.status === "Active");
    const totalCollected = activeList.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    return {
      all: memberships.length,
      pending: memberships.filter((m) => m.status === "Pending").length,
      active: activeList.length,
      rejected: memberships.filter((m) => m.status === "Rejected").length,
      totalCollected,
    };
  }, [memberships]);

  // Admin Actions
  async function handleApprove(member) {
    if (
      !window.confirm(
        `Verify payment and approve membership for "${member.user?.name || "this applicant"}"?\n\n✓ An official Member ID and ID Card will be generated.\n✓ Appointment Letter will be generated and emailed.\n✓ Certificate can be issued separately when you click "Issue Certificate".`
      )
    ) {
      return;
    }
    setProcessingId(member._id);
    setActionType("approve");
    try {
      const res = await contentApi.patch(`/membership/admin/${member._id}/approve`);
      if (res.data?.success) {
        toast.success(res.data.message || "Membership approved! Member ID & Appointment Letter issued.");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve membership");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectModal) return;
    setProcessingId(rejectModal._id);
    setActionType("reject");
    try {
      const res = await contentApi.patch(`/membership/admin/${rejectModal._id}/reject`, {
        reason: rejectReason,
      });
      if (res.data?.success) {
        toast.success("Membership application marked as rejected.");
        setRejectModal(null);
        setRejectReason("");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject application");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleSendCertificate(member) {
    setProcessingId(member._id);
    setActionType("cert-mail");
    try {
      const res = await contentApi.post(`/membership/admin/${member._id}/send-certificate`);
      if (res.data?.success) {
        toast.success(res.data.message || "Certificate sent to member by email!");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send certificate email");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleDownloadCertificate(member) {
    setProcessingId(member._id);
    setActionType("cert-dl");
    try {
      const res = await contentApi.get(`/membership/admin/${member._id}/certificate`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const certNum = member.certificateNumber || member.memberId || member._id;
      link.setAttribute("download", `Membership_Certificate_${certNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Membership Certificate downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download certificate PDF.");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleSendAppointmentLetter(member) {
    setProcessingId(member._id);
    setActionType("appt-mail");
    try {
      const res = await contentApi.post(`/membership/admin/${member._id}/send-appointment-letter`);
      if (res.data?.success) {
        toast.success(res.data.message || "Appointment Letter sent to member by email!");
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send appointment letter email");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleDownloadAppointmentLetter(member) {
    setProcessingId(member._id);
    setActionType("appt-dl");
    try {
      const res = await contentApi.get(`/membership/admin/${member._id}/appointment-letter`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const memId = member.memberId || member._id;
      link.setAttribute("download", `Appointment_Letter_${memId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Appointment Letter downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download appointment letter PDF.");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleDownloadIdCard(member) {
    setProcessingId(member._id);
    setActionType("idcard-dl");
    try {
      const res = await contentApi.get(`/membership/admin/${member._id}/id-card`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const memId = member.memberId || member._id;
      link.setAttribute("download", `Member_ID_Card_${memId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Member ID Card downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download Member ID card PDF.");
    } finally {
      setProcessingId(null);
      setActionType("");
    }
  }

  async function handleDeleteMember() {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    try {
      const res = await contentApi.delete(`/membership/admin/${deleteModalItem._id}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Member record deleted successfully.");
        setDeleteModalItem(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete membership record");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await contentApi.put("/membership/admin/settings", {
        membershipTypes: tiers,
        instructions,
      });
      if (res.data?.success) {
        toast.success("Membership tiers and prices saved successfully!");
        setPricingModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update pricing settings");
    } finally {
      setSavingSettings(false);
    }
  }

  function updateTierField(index, field, value) {
    setTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addTier() {
    setTiers((prev) => [
      ...prev,
      {
        name: "New Tier",
        price: 500,
        periodMonths: 12,
        description: "Membership description",
        benefits: ["Voting rights", "Official Certificate"],
        isActive: true,
      },
    ]);
  }

  function removeTier(index) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Admin Governance · Members Registry
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Membership Governance &amp; Verification Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit membership applications, verify payment screenshot proofs, approve credentials, and issue official ID cards &amp; certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPricingModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-800 shadow-sm hover:bg-blue-100 transition cursor-pointer"
          >
            <FiEdit2 size={13} className="text-blue-700" />
            <span>Update Tiers &amp; Pricing</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin text-orange-600" : ""} size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI Stats Cards with High Visibility ──────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Applications
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <FiUsers size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{counts.all}</p>
          <p className="mt-1 text-xs text-slate-500">All registered member submissions</p>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Review
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-amber-200/80 text-amber-900">
              <FiClock size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-amber-950">{counts.pending}</p>
          <p className="mt-1 text-xs font-semibold text-amber-800">Awaiting payment verification</p>
        </div>

        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Active Members
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-200/80 text-emerald-900">
              <FiUserCheck size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-950">{counts.active}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-800">Verified members with ID credentials</p>
        </div>

        <div className="rounded-2xl border border-blue-300 bg-blue-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Fees Collected
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-blue-200/80 text-blue-900">
              <FiDollarSign size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-blue-950">{formatCurrency(counts.totalCollected)}</p>
          <p className="mt-1 text-xs font-semibold text-blue-800">Total membership subscription fees</p>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
          {[
            { id: "all", label: `All (${counts.all})` },
            { id: "Pending", label: `Pending Review (${counts.pending})` },
            { id: "Active", label: `Active (${counts.active})` },
            { id: "Rejected", label: `Rejected (${counts.rejected})` },
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
            placeholder="Search name, email, txn ID, member ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-8 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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

      {/* ── Members Table (Clean, High Visibility) ───────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-3">
            <span className="size-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
            <span>Loading membership submissions…</span>
          </div>
        ) : filteredMemberships.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-4 pl-6 pr-4">Applicant Profile</th>
                  <th className="py-4 px-4">Tier &amp; Fee</th>
                  <th className="py-4 px-4">Payment &amp; UTR</th>
                  <th className="py-4 px-4">Proof Screenshot</th>
                  <th className="py-4 px-4">Standing</th>
                  <th className="py-4 pr-6 text-right">Credentials Status</th>
                </tr>
              </thead>
              {filteredMemberships.map((m) => {
                const isPending = m.status === "Pending";
                const isActive = m.status === "Active";
                const isRejected = m.status === "Rejected";
                const screenshotUrl = m.paymentScreenshot
                  ? getContentImageUrl(m.paymentScreenshot)
                  : "";
                const user = m.user || {};
                const isBusy = processingId === m._id;

                return (
                  <tbody
                    key={m._id}
                    className={`group/row transition-colors border-b border-slate-200/80 ${
                      isBusy ? "bg-blue-50/40" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <tr className="transition-colors">
                      {/* 1. Applicant Profile */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className="size-11 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 shadow-2xs">
                            {user.profilePicture ? (
                              <img
                                src={getContentImageUrl(user.profilePicture)}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="grid size-full place-items-center font-bold text-slate-600 text-xs bg-blue-100">
                                {user.name ? user.name.slice(0, 2).toUpperCase() : "MB"}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {user.name || "Member Applicant"}
                            </span>
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
                              <div className="flex items-center gap-1.5 text-[11px] text-blue-800 font-semibold mt-0.5">
                                <FiPhone size={11} className="text-blue-600" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Tier & Fee */}
                      <td className="py-4 px-4">
                        <span className="inline-block rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 border border-blue-200">
                          {m.membershipType || "Annual Member"}
                        </span>
                        <div className="mt-1 font-serif text-sm font-black text-slate-900">
                          {formatCurrency(m.amount)}
                        </div>
                        {m.memberId && (
                          <span className="font-mono text-[10px] text-emerald-800 font-bold block mt-0.5">
                            ID: {m.memberId}
                          </span>
                        )}
                      </td>

                      {/* 3. Payment & UTR */}
                      <td className="py-4 px-4">
                        <div className="text-slate-900 font-semibold text-xs">
                          {m.paymentMethod || "UPI"}
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 mt-0.5">
                          <span className="truncate max-w-[140px]" title={m.transactionId}>
                            {m.transactionId || "Direct Bank Credit"}
                          </span>
                          {m.transactionId && (
                            <button
                              type="button"
                              onClick={() => copyText(m.transactionId, "Transaction ID")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Txn ID"
                            >
                              <FiCopy size={11} />
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Submitted: {formatDate(m.createdAt)}
                        </span>
                      </td>

                      {/* 4. Proof Screenshot */}
                      <td className="py-4 px-4">
                        {screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setScreenshotModal(screenshotUrl)}
                            className="group relative size-14 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 hover:border-blue-400 transition cursor-pointer shadow-2xs"
                            title="Click to view full payment proof"
                          >
                            <img
                              src={screenshotUrl}
                              alt="Payment Proof"
                              className="size-full object-cover transition group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                              <FiMaximize2 size={16} />
                            </div>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No image</span>
                        )}
                      </td>

                      {/* 5. Standing */}
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
                          {isRejected && <FiXCircle size={12} className="text-rose-600" />}
                          <span>{m.status}</span>
                        </span>
                        {isActive && m.approvedAt && (
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Approved: {formatDate(m.approvedAt)}
                          </span>
                        )}
                        {isRejected && m.rejectionReason && (
                          <span
                            className="text-[10px] text-rose-700 mt-1 block max-w-[140px] truncate"
                            title={m.rejectionReason}
                          >
                            Reason: {m.rejectionReason}
                          </span>
                        )}
                      </td>

                      {/* 6. Credentials Status */}
                      <td className="py-4 pr-6 text-right">
                        {isActive ? (
                          <div className="inline-block space-y-1.5 min-w-[170px] text-left">
                            {/* ID Card */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800">🪪 ID Card:</span>
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                                Active
                              </span>
                            </div>

                            {/* Appointment Letter */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800">✉️ Appt Letter:</span>
                              <span className="text-slate-600 text-[10px]">
                                {m.appointmentLetterSentAt
                                  ? `Emailed (${formatDate(m.appointmentLetterSentAt)})`
                                  : "Generated"}
                              </span>
                            </div>

                            {/* Certificate */}
                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                              <span className="font-bold text-slate-800">📜 Certificate:</span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  m.certificateSentAt
                                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {m.certificateSentAt
                                  ? `Emailed (${formatDate(m.certificateSentAt)})`
                                  : "Not issued"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Pending approval</span>
                        )}
                      </td>
                    </tr>

                    {/* ── Action Toolbar (Reveals on Row Hover at the Bottom of Row) ── */}
                    <tr className="transition-all">
                      <td colSpan={6} className="p-0">
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
                              <span className="inline-block size-2 rounded-full bg-blue-500 animate-pulse" />
                              <span className="font-bold text-slate-700">
                                Actions for <span className="text-slate-900 underline decoration-blue-400">{user.name || "Member"}</span>:
                              </span>
                              <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                                {m.tierName || "Member"} ({formatCurrency(m.amount)})
                              </span>
                              {m.memberId && (
                                <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                  {m.memberId}
                                </span>
                              )}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(m)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition cursor-pointer disabled:opacity-50"
                                    title="Verify payment, approve membership, issue ID Card & email appointment letter"
                                  >
                                    <FiCheckCircle size={14} />
                                    <span>{isBusy && actionType === "approve" ? "Processing…" : "Verify & Approve"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectModal(m);
                                      setRejectReason("");
                                    }}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition cursor-pointer disabled:opacity-50"
                                    title="Reject application"
                                  >
                                    <FiX size={14} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {isActive && (
                                <>
                                  {/* Action: Issue Certificate */}
                                  <div className="inline-flex rounded-lg border border-blue-300 bg-blue-50 shadow-2xs overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleSendCertificate(m)}
                                      disabled={isBusy}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition cursor-pointer disabled:opacity-50"
                                      title="Issue and email official Certificate PDF to member"
                                    >
                                      <FiAward size={13} className="text-blue-700" />
                                      <span>{isBusy && actionType === "cert-mail" ? "Sending…" : "Issue Certificate"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadCertificate(m)}
                                      disabled={isBusy}
                                      className="px-2 py-1.5 border-l border-blue-200 text-blue-800 hover:bg-blue-200 transition cursor-pointer"
                                      title="Download Certificate PDF"
                                    >
                                      <FiDownload size={13} />
                                    </button>
                                  </div>

                                  {/* Action: Appointment Letter */}
                                  <div className="inline-flex rounded-lg border border-orange-300 bg-orange-50 shadow-2xs overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleSendAppointmentLetter(m)}
                                      disabled={isBusy}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-orange-800 hover:bg-orange-100 transition cursor-pointer disabled:opacity-50"
                                      title="Email Appointment Letter PDF"
                                    >
                                      <FiMail size={13} className="text-orange-700" />
                                      <span>{isBusy && actionType === "appt-mail" ? "Sending…" : "Appt Letter"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadAppointmentLetter(m)}
                                      disabled={isBusy}
                                      className="px-2 py-1.5 border-l border-orange-200 text-orange-800 hover:bg-orange-200 transition cursor-pointer"
                                      title="Download Appointment Letter PDF"
                                    >
                                      <FiDownload size={13} />
                                    </button>
                                  </div>

                                  {/* Action: ID Card PDF */}
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadIdCard(m)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                                    title="Download official Member ID Card PDF"
                                  >
                                    <FiDownload size={13} />
                                    <span>ID Card PDF</span>
                                  </button>
                                </>
                              )}

                              {screenshotUrl && (
                                <button
                                  type="button"
                                  onClick={() => setScreenshotModal(screenshotUrl)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                  title="View payment proof screenshot"
                                >
                                  <FiEye size={13} />
                                  <span>Proof</span>
                                </button>
                              )}

                              {isRejected && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(m)}
                                  disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                >
                                  <FiCheckCircle size={13} />
                                  <span>Re-approve</span>
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => setDeleteModalItem(m)}
                                className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition cursor-pointer"
                                title="Delete membership record"
                              >
                                <FiTrash2 size={14} />
                              </button>
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
              ? "No membership records found matching your search query."
              : "No membership applications found in this category."}
          </div>
        )}
      </div>

      {/* ── Modal 1: Proof Screenshot Viewer ──────────────────── */}
      {screenshotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={() => setScreenshotModal(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-2xl w-full rounded-2xl bg-white p-5 shadow-2xl overflow-hidden flex flex-col items-center border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Payment Proof Screenshot</span>
              <button
                type="button"
                onClick={() => setScreenshotModal(null)}
                className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="mt-4 max-h-[75vh] overflow-auto w-full flex justify-center">
              <img
                src={screenshotModal}
                alt="Payment Proof Zoomed"
                className="max-h-full max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Reject Membership Form ───────────────────── */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-base">Reject Application</span>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                Provide a reason for rejecting the membership application for{" "}
                <strong className="text-slate-900">{rejectModal.user?.name || "this applicant"}</strong>:
              </p>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Transaction ID / UTR not found on foundation bank statement or screenshot illegible."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectModal._id}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-60"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: Pricing & Tier Settings ──────────────────── */}
      {pricingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={() => setPricingModalOpen(false)}
        >
          <div
            className="relative max-h-[92vh] max-w-3xl w-full rounded-2xl bg-white p-6 sm:p-7 shadow-2xl overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Membership Types &amp; Pricing Configuration</h3>
                <p className="text-xs text-slate-500">Configure tier names, fee amounts (₹), and durations shown to users.</p>
              </div>
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="mt-5 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Membership Tiers
                  </span>
                  <button
                    type="button"
                    onClick={addTier}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <FiPlus size={14} />
                    <span>Add New Tier</span>
                  </button>
                </div>

                {tiers.map((tier, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Tier Name</label>
                        <input
                          type="text"
                          required
                          value={tier.name}
                          onChange={(e) => updateTierField(idx, "name", e.target.value)}
                          placeholder="e.g. Annual Member"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Price Fee (₹)</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={tier.price}
                          onChange={(e) => updateTierField(idx, "price", Number(e.target.value))}
                          placeholder="1200"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Validity (Months)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={tier.periodMonths}
                          onChange={(e) => updateTierField(idx, "periodMonths", Number(e.target.value))}
                          placeholder="12"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Description / Privileges</label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => updateTierField(idx, "description", e.target.value)}
                        placeholder="Description of membership benefits"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tier.isActive !== false}
                          onChange={(e) => updateTierField(idx, "isActive", e.target.checked)}
                          className="accent-blue-600 size-4"
                        />
                        <span>Active and visible on registration form</span>
                      </label>

                      {tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(idx)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          <FiTrash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Payment Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions displayed on user membership payment page"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPricingModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                >
                  {savingSettings ? "Saving…" : "Save Types & Prices"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 4: Delete Member Confirmation ───────────────── */}
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
              Delete Member Record?
            </h3>

            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the membership record for{" "}
              <strong className="text-slate-900">{deleteModalItem.user?.name || "this applicant"}</strong>
              {deleteModalItem.memberId ? ` (ID: ${deleteModalItem.memberId})` : ""}?
            </p>

            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-950">
                <FiAlertCircle size={14} className="shrink-0 text-rose-600" />
                <span>Permanent Actions:</span>
              </p>
              <ul className="list-disc pl-5 text-[11px] text-rose-800 space-y-0.5">
                <li>Membership tier ({deleteModalItem.membershipType || "Annual"}) will be revoked.</li>
                <li>Uploaded payment proof file will be permanently purged.</li>
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
                onClick={handleDeleteMember}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                <FiTrash2 size={13} />
                <span>{isDeleting ? "Deleting…" : "Delete Member"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
