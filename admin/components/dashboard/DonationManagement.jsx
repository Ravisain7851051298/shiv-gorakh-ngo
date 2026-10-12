"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiEdit3,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiImage,
  FiInfo,
  FiKey,
  FiMail,
  FiMaximize2,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSettings,
  FiTrash2,
  FiUpload,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { MdQrCode } from "react-icons/md";
import { contentApi, getContentImageUrl } from "@/lib/authApi";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

export default function DonationManagement() {
  const [activeTab, setActiveTab] = useState("donations"); // 'donations' | 'settings' | 'email'

  // ==========================================
  // Credentials (UPI & Bank) State
  // ==========================================
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [deleteSettingsModalOpen, setDeleteSettingsModalOpen] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    upiId: "",
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    branchName: "",
    accountType: "Savings",
    instructions: "",
    isActive: true,
  });
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");
  const [removeExistingQr, setRemoveExistingQr] = useState(false);

  // ==========================================
  // Email / Nodemailer Settings State
  // ==========================================
  const [emailSettings, setEmailSettings] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [resendingReceiptId, setResendingReceiptId] = useState(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [receiptSigFile, setReceiptSigFile] = useState(null);
  const [receiptSigPreview, setReceiptSigPreview] = useState("");
  const [removeReceiptSig, setRemoveReceiptSig] = useState(false);

  const [emailForm, setEmailForm] = useState({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    user: "",
    pass: "",
    senderName: "Shiv Gorakh Welfare Foundation",
    senderEmail: "",
    replyTo: "info@shivgorakh.org.in",
    receiptPrefix: "SG-REC-",
    emailSubject: "Donation Receipt & Thank You — Shiv Gorakh Welfare Foundation",
    emailBodyTemplate: "",
    signatoryName: "Hari Om",
    signatoryRole: "Authorized Signatory",
    authorizedSignature: "",
  });

  // ==========================================
  // Donations Submissions State
  // ==========================================
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals & Action States
  const [previewImage, setPreviewImage] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deleteDonationItem, setDeleteDonationItem] = useState(null);
  const [isDeletingDonation, setIsDeletingDonation] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ==========================================
  // Fetch Functions
  // ==========================================
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const { data } = await contentApi.get("/donations/settings");
      if (data?.data) {
        setSettings(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load donation settings.");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const fetchEmailSettings = useCallback(async () => {
    setEmailLoading(true);
    try {
      const { data } = await contentApi.get("/donations/email-settings");
      if (data?.data) {
        setEmailSettings(data.data);
        setEmailForm({
          host: data.data.host || "smtp.gmail.com",
          port: data.data.port || 465,
          secure: data.data.secure ?? true,
          user: data.data.user || "",
          pass: data.data.isPasswordSet ? "••••••••••••••••" : "",
          senderName: data.data.senderName || "Shiv Gorakh Welfare Foundation",
          senderEmail: data.data.senderEmail || "",
          replyTo: data.data.replyTo || "info@shivgorakh.org.in",
          receiptPrefix: data.data.receiptPrefix || "SG-REC-",
          emailSubject: data.data.emailSubject || "Donation Receipt & Thank You",
          emailBodyTemplate: data.data.emailBodyTemplate || "",
          signatoryName: data.data.signatoryName || "Hari Om",
          signatoryRole: data.data.signatoryRole || "Authorized Signatory",
          authorizedSignature: data.data.authorizedSignature || "",
        });
        setReceiptSigPreview(data.data.authorizedSignature ? getContentImageUrl(data.data.authorizedSignature) : "");
        setReceiptSigFile(null);
        setRemoveReceiptSig(false);
      }
    } catch (err) {
      console.error("Failed to load email settings:", err);
    } finally {
      setEmailLoading(false);
    }
  }, []);

  const fetchDonations = useCallback(
    async (page = 1) => {
      setDonationsLoading(true);
      try {
        const params = { page, limit: 10 };
        if (statusFilter !== "All") params.status = statusFilter;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

        const { data } = await contentApi.get("/donations/admin", { params });
        if (data?.data) {
          setDonations(data.data.donations || []);
          if (data.data.pagination) setPagination(data.data.pagination);
          if (data.data.counts) setCounts(data.data.counts);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load donations list.");
      } finally {
        setDonationsLoading(false);
      }
    },
    [statusFilter, debouncedSearch]
  );

  useEffect(() => {
    fetchSettings();
    fetchEmailSettings();
  }, [fetchSettings, fetchEmailSettings]);

  useEffect(() => {
    fetchDonations(1);
  }, [fetchDonations]);

  // ==========================================
  // Credential Handlers
  // ==========================================
  const openEditSettingsModal = () => {
    setSettingsForm({
      upiId: settings?.upiId || "",
      accountHolderName: settings?.accountHolderName || "",
      accountNumber: settings?.accountNumber || "",
      bankName: settings?.bankName || "",
      ifscCode: settings?.ifscCode || "",
      branchName: settings?.branchName || "",
      accountType: settings?.accountType || "Savings",
      instructions: settings?.instructions || "",
      isActive: settings?.isActive ?? true,
    });
    setQrFile(null);
    setQrPreview(settings?.qrCode ? getContentImageUrl(settings.qrCode) : "");
    setRemoveExistingQr(false);
    setSettingsModalOpen(true);
  };

  const handleQrFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("QR Code image must be under 5MB.");
      return;
    }

    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
    setRemoveExistingQr(false);
  };

  const handleRemoveQr = () => {
    setQrFile(null);
    setQrPreview("");
    setRemoveExistingQr(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const formData = new FormData();
      Object.entries(settingsForm).forEach(([key, val]) => {
        formData.append(key, val);
      });
      if (qrFile) {
        formData.append("qrCode", qrFile);
      } else if (removeExistingQr) {
        formData.append("removeQrCode", "true");
      }

      const { data } = await contentApi.post("/donations/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(data?.message || "Donation credentials saved successfully!");
      if (data?.data) setSettings(data.data);
      setSettingsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update donation credentials.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteSettings = async () => {
    try {
      await contentApi.delete("/donations/settings");
      toast.success("Donation credentials deleted.");
      setSettings(null);
      setDeleteSettingsModalOpen(false);
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete donation credentials.");
    }
  };

  // ==========================================
  // Email / Nodemailer Handlers
  // ==========================================
  const handleSaveEmailSettings = async (e) => {
    e.preventDefault();
    setSavingEmailSettings(true);
    try {
      const formData = new FormData();
      Object.entries(emailForm).forEach(([key, val]) => {
        formData.append(key, val);
      });
      if (receiptSigFile) {
        formData.append("authorizedSignature", receiptSigFile);
      } else if (removeReceiptSig) {
        formData.append("removeAuthorizedSignature", "true");
      }

      const { data } = await contentApi.post("/donations/email-settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data?.message || "Email credentials & signature verified and saved!");
      if (data?.data) setEmailSettings(data.data);
      fetchEmailSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify and save email credentials.");
    } finally {
      setSavingEmailSettings(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setSendingTestEmail(true);
    try {
      const { data } = await contentApi.post("/donations/email-settings/test", {
        testRecipient: testRecipient.trim() || emailForm.user,
      });
      toast.success(data?.message || "Test email sent successfully!");
      setTestModalOpen(false);
      setTestRecipient("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send test email. Check credentials.");
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleResendReceipt = async (id, donorEmail) => {
    setResendingReceiptId(id);
    try {
      const { data } = await contentApi.post(`/donations/admin/${id}/resend-receipt`);
      toast.success(data?.message || `Receipt successfully emailed to ${donorEmail}!`);
      fetchDonations(pagination.currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend email receipt.");
    } finally {
      setResendingReceiptId(null);
    }
  };

  const handleDownloadReceipt = async (donation) => {
    setDownloadingReceiptId(donation._id);
    try {
      const response = await contentApi.get(`/donations/admin/${donation._id}/receipt`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const recNum = donation.receiptNumber || donation._id;
      link.setAttribute("download", `Donation_Receipt_${recNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download receipt PDF.");
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  // ==========================================
  // Donation Status & Delete Handlers
  // ==========================================
  const handleUpdateStatus = async (id, status, notes = "") => {
    setUpdatingStatusId(id);
    try {
      const { data } = await contentApi.patch(`/donations/admin/${id}/status`, {
        status,
        reviewNotes: notes,
      });

      toast.success(data?.message || `Donation ${status.toLowerCase()} successfully!`);

      // Refresh list to update receipt number & status
      fetchDonations(pagination.currentPage);

      if (previewImage?._id === id) {
        setPreviewImage((prev) => (prev ? { ...prev, ...data?.data } : null));
      }

      setRejectModalItem(null);
      setRejectReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update donation status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteDonation = async () => {
    if (!deleteDonationItem) return;
    setIsDeletingDonation(true);
    try {
      await contentApi.delete(`/donations/admin/${deleteDonationItem._id}`);
      toast.success("Donation record deleted successfully.");
      setDeleteDonationItem(null);
      if (previewImage?._id === deleteDonationItem._id) {
        setPreviewImage(null);
      }
      fetchDonations(pagination.currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete donation.");
    } finally {
      setIsDeletingDonation(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      {/* Page Title & Navigation Tabs */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Donation Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Verify payment submissions, manage UPI/bank details, and configure automated PDF email receipts.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("donations")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "donations"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiCreditCard className="text-base text-orange-500" />
            <span>Submissions & Verifications</span>
            {counts.pending > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                {counts.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "settings"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MdQrCode className="text-base text-orange-500" />
            <span>UPI & Bank Details</span>
            {settings?.upiId || settings?.accountNumber ? (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Configured" />
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-amber-500" title="Not configured" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "email"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiMail className="text-base text-orange-500" />
            <span>Email & Receipt (Nodemailer)</span>
            {emailSettings?.isConfigured ? (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Mail service active" />
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-amber-500" title="Mail service not configured" />
            )}
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: SUBMISSIONS & VERIFICATIONS */}
      {/* ==================================================== */}
      {activeTab === "donations" && (
        <div className="space-y-6">
          {/* Email Receipt Status Notice */}
          {!emailSettings?.isConfigured && (
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800">
              <div className="flex items-center gap-2.5">
                <FiAlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <span>
                  <strong>Nodemailer is not configured yet.</strong> When you approve a donation, an official PDF receipt will not be automatically emailed until you set up your Gmail / SMTP credentials in the &quot;Email &amp; Receipt&quot; tab.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("email")}
                className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white transition hover:bg-amber-700"
              >
                Configure Mailer
              </button>
            </div>
          )}

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
                <FiDollarSign className="text-lg text-slate-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">{counts.total}</p>
              <p className="mt-0.5 text-xs text-slate-400">All submissions</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                <FiClock className="text-lg" />
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-700">{counts.pending}</p>
              <p className="mt-0.5 text-xs text-amber-600">Awaiting verification</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
                <FiCheckCircle className="text-lg" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-700">{counts.approved}</p>
              <p className="mt-0.5 text-xs text-emerald-600">Receipts dispatched</p>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
                <FiXCircle className="text-lg" />
              </div>
              <p className="mt-2 text-2xl font-bold text-rose-700">{counts.rejected}</p>
              <p className="mt-0.5 text-xs text-rose-600">Declined / invalid</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    statusFilter === status
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Input & Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search donor, email, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => fetchDonations(pagination.currentPage)}
                disabled={donationsLoading}
                title="Refresh list"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 ${donationsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Donations Table (Latest First) */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {donationsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
                  Loading submissions (latest first)…
                </div>
              </div>
            ) : donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <FiCreditCard className="mb-3 h-12 w-12 text-slate-300" />
                <h3 className="text-base font-semibold text-slate-700">No donations found</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  {statusFilter !== "All" || searchQuery
                    ? "Try adjusting your filter or search query."
                    : "No donor has submitted a payment proof yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-4 pl-6 pr-3">Proof Screenshot</th>
                      <th className="py-4 px-4">Donor Information</th>
                      <th className="py-4 px-4">Donation Amount</th>
                      <th className="py-4 px-4">Txn / UTR Reference</th>
                      <th className="py-4 px-4">Submission Date</th>
                      <th className="py-4 px-4">Audit Status</th>
                      <th className="py-4 pr-6 text-right">Official Receipt</th>
                    </tr>
                  </thead>
                  {donations.map((item) => {
                    const hasScreenshot = Boolean(item.screenshot);
                    const isPending = item.status === "Pending";
                    const isApproved = item.status === "Approved";
                    const isRejected = item.status === "Rejected";
                    const isProcessing =
                      updatingStatusId === item._id ||
                      downloadingReceiptId === item._id ||
                      resendingReceiptId === item._id;

                    return (
                      <tbody
                        key={item._id}
                        className={`group/row transition-colors border-b border-slate-200/80 ${
                          isProcessing ? "bg-orange-50/40" : "hover:bg-slate-50/70"
                        }`}
                      >
                        <tr className="transition-colors">
                          {/* 1. Screenshot Column */}
                          <td className="py-4 pl-6 pr-3">
                            {hasScreenshot ? (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(item)}
                                className="group relative block h-14 w-14 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 hover:border-orange-400 transition-all shadow-2xs cursor-pointer"
                                title="Click to view full payment screenshot proof"
                              >
                                <Image
                                  src={getContentImageUrl(item.screenshot)}
                                  alt="Donation proof"
                                  fill
                                  sizes="56px"
                                  className="object-cover transition group-hover:scale-108"
                                  unoptimized
                                />
                                <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100 text-white">
                                  <FiMaximize2 size={16} />
                                </span>
                              </button>
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                                <FiImage className="h-5 w-5" />
                              </div>
                            )}
                          </td>

                          {/* 2. Donor Info */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900 text-sm block">
                              {item.donorName}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span>{item.donorEmail}</span>
                              {item.donorEmail && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(item.donorEmail, "Donor Email")}
                                  className="text-slate-400 hover:text-slate-700"
                                  title="Copy Email"
                                >
                                  <FiCopy size={11} />
                                </button>
                              )}
                            </div>
                            {item.donorPhone && (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold mt-0.5">
                                <FiPhone size={11} className="text-emerald-600" />
                                <span>{item.donorPhone}</span>
                              </div>
                            )}
                            {(item.campaignTitle || item.campaign?.title) && (
                              <div className="mt-1.5">
                                <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-900 border border-orange-200">
                                  🎯 {item.campaignTitle || item.campaign?.title}
                                </span>
                              </div>
                            )}
                            {item.notes && (
                              <p className="mt-1 line-clamp-1 max-w-xs text-[11px] italic text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                &ldquo;{item.notes}&rdquo;
                              </p>
                            )}
                          </td>

                          {/* 3. Amount */}
                          <td className="py-4 px-4">
                            <span className="inline-block rounded-lg bg-orange-100 px-3 py-1 font-serif text-sm font-black text-orange-900 border border-orange-300">
                              ₹{Number(item.amount).toLocaleString("en-IN")}
                            </span>
                            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              via {item.paymentMethod || "UPI"}
                            </span>
                          </td>

                          {/* 4. Transaction / UTR ID */}
                          <td className="py-4 px-4">
                            {item.transactionId ? (
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 w-max">
                                <span>{item.transactionId}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(item.transactionId, "Transaction ID")}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  title="Copy UTR / Transaction ID"
                                >
                                  <FiCopy size={12} />
                                </button>
                              </div>
                            ) : (
                              <span className="italic text-slate-400 text-xs">Not provided</span>
                            )}
                          </td>

                          {/* 5. Date */}
                          <td className="whitespace-nowrap py-4 px-4 text-slate-600">
                            <p className="font-bold text-slate-800 text-xs">
                              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>

                          {/* 6. Status */}
                          <td className="whitespace-nowrap py-4 px-4">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black text-amber-900 border border-amber-300">
                                <span className="size-1.5 animate-ping rounded-full bg-amber-600" />
                                Pending Review
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-900 border border-emerald-300">
                                <FiCheck size={13} className="text-emerald-700" />
                                Verified &amp; Approved
                              </span>
                            )}
                            {isRejected && (
                              <span
                                className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-black text-rose-900 border border-rose-300"
                                title={item.reviewNotes || "Rejected"}
                              >
                                <FiX size={13} className="text-rose-700" />
                                Rejected
                              </span>
                            )}
                          </td>

                          {/* 7. Email Receipt Status */}
                          <td className="whitespace-nowrap py-4 pr-6 text-right">
                            {isApproved ? (
                              item.receiptSent ? (
                                <div className="inline-block space-y-1 text-left">
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                      <FiCheckCircle size={11} className="text-emerald-600" />
                                      <span>Receipt Emailed</span>
                                    </span>
                                  </div>
                                  <span className="block font-mono text-[10px] font-bold text-slate-500">
                                    {item.receiptNumber}
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-block text-left">
                                  <span
                                    className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200"
                                    title={item.receiptError || "Receipt not sent"}
                                  >
                                    <FiAlertCircle size={11} className="text-amber-600" />
                                    <span>Not Emailed</span>
                                  </span>
                                </div>
                              )
                            ) : (
                              <span className="text-xs text-slate-400 italic">—</span>
                            )}
                          </td>
                        </tr>

                        {/* ── Action Toolbar (Reveals on Row Hover at the Bottom of Row) ── */}
                        <tr className="transition-all">
                          <td colSpan={7} className="p-0">
                            <div
                              className={`overflow-hidden transition-all duration-200 ease-out bg-slate-100/90 border-t border-dashed border-slate-300/80 px-6 ${
                                isProcessing
                                  ? "max-h-24 opacity-100 py-2.5"
                                  : "max-h-0 opacity-0 py-0 group-hover/row:max-h-24 group-hover/row:opacity-100 group-hover/row:py-2.5 group-focus-within/row:max-h-24 group-focus-within/row:opacity-100 group-focus-within/row:py-2.5"
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                {/* Left: Summary */}
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="inline-block size-2 rounded-full bg-orange-500 animate-pulse" />
                                  <span className="font-bold text-slate-700">
                                    Actions for <span className="text-slate-900 underline decoration-orange-400">{item.donorName || "Donor"}</span>:
                                  </span>
                                  <span className="font-serif font-black text-orange-950 bg-orange-100 px-2 py-0.5 rounded text-[11px] border border-orange-300">
                                    ₹{Number(item.amount).toLocaleString("en-IN")}
                                  </span>
                                  {item.transactionId && (
                                    <span className="font-mono text-[10px] text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                                      UTR: {item.transactionId}
                                    </span>
                                  )}
                                </div>

                                {/* Right: Actions */}
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  {isPending && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStatus(item._id, "Approved")}
                                        disabled={updatingStatusId === item._id}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition cursor-pointer disabled:opacity-50"
                                        title="Approve donation & automatically generate and mail official 80G tax receipt"
                                      >
                                        <FiCheck size={14} />
                                        <span>{updatingStatusId === item._id ? "Approving…" : "Approve & Mail Receipt"}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRejectModalItem(item);
                                          setRejectReason(item.reviewNotes || "");
                                        }}
                                        disabled={updatingStatusId === item._id}
                                        className="inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition cursor-pointer disabled:opacity-50"
                                        title="Reject donation submission"
                                      >
                                        <FiX size={14} />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                  )}

                                  {isApproved && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadReceipt(item)}
                                        disabled={downloadingReceiptId === item._id}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer disabled:opacity-50"
                                        title="Download official PDF receipt"
                                      >
                                        <FiDownload size={13} className="text-slate-600" />
                                        <span>{downloadingReceiptId === item._id ? "Downloading…" : "Receipt PDF"}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleResendReceipt(item._id, item.donorEmail)}
                                        disabled={resendingReceiptId === item._id}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 text-xs font-bold text-orange-800 shadow-2xs transition cursor-pointer disabled:opacity-50"
                                        title="Resend receipt email to donor"
                                      >
                                        <FiMail size={13} className="text-orange-700" />
                                        <span>{resendingReceiptId === item._id ? "Sending…" : "Resend Email"}</span>
                                      </button>
                                    </>
                                  )}

                                  {hasScreenshot && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewImage(item)}
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
                                      onClick={() => handleUpdateStatus(item._id, "Approved")}
                                      disabled={updatingStatusId === item._id}
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                    >
                                      <FiCheck size={13} />
                                      <span>Re-approve</span>
                                    </button>
                                  )}

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteDonationItem(item)}
                                    className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition cursor-pointer"
                                    title="Delete donation record"
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
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(pagination.currentPage - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-700">{pagination.totalItems}</span>{" "}
                  donations (latest first)
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fetchDonations(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage || donationsLoading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - pagination.currentPage) <= 1
                    )
                    .map((page, idx, arr) => {
                      const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                      return (
                        <span key={page} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-slate-400">…</span>}
                          <button
                            type="button"
                            onClick={() => fetchDonations(page)}
                            className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                              pagination.currentPage === page
                                ? "bg-orange-500 text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      );
                    })}

                  <button
                    type="button"
                    onClick={() => fetchDonations(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage || donationsLoading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: UPI & BANK CREDENTIALS */}
      {/* ==================================================== */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-800">Foundation Donation Credentials</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                These credentials and QR scanner image will be shown on the public donation page for donors to scan and pay.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openEditSettingsModal}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700"
              >
                <FiEdit3 className="h-4 w-4" />
                <span>
                  {settings?.upiId || settings?.accountNumber
                    ? "Update Credentials"
                    : "Add Credentials"}
                </span>
              </button>
              {(settings?.upiId || settings?.accountNumber || settings?.qrCode) && (
                <button
                  type="button"
                  onClick={() => setDeleteSettingsModalOpen(true)}
                  className="rounded-xl border border-rose-200 p-2.5 text-rose-600 hover:bg-rose-50"
                  title="Delete credentials"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {settingsLoading ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
                Loading credentials…
              </div>
            </div>
          ) : !settings?.upiId && !settings?.accountNumber && !settings?.qrCode ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <MdQrCode className="mb-3 h-12 w-12 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">No credentials configured</h4>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Set up your UPI ID, QR Scanner image, and Bank details so supporters can transfer funds to the foundation account.
              </p>
              <button
                type="button"
                onClick={openEditSettingsModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-700"
              >
                <FiPlus className="h-4 w-4" />
                <span>Configure Donation Credentials</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* UPI & Scanner Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-100 text-orange-600">
                      <MdQrCode className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">UPI Payment & Scanner</h4>
                      <p className="text-[11px] text-slate-400">Direct mobile scan-and-pay</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      settings.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {settings.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center text-center">
                  {settings.qrCode ? (
                    <div className="relative h-56 w-56 overflow-hidden rounded-2xl border-4 border-slate-100 bg-white p-2 shadow-inner">
                      <Image
                        src={getContentImageUrl(settings.qrCode)}
                        alt="NGO UPI Scanner QR Code"
                        fill
                        sizes="224px"
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 w-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                      <FiImage className="h-10 w-10 text-slate-300" />
                      <span className="mt-2 text-xs">No QR Code Image</span>
                    </div>
                  )}

                  <div className="mt-5 w-full rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Foundation UPI ID (VPA)
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800">
                        {settings.upiId || "Not specified"}
                      </span>
                      {settings.upiId && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.upiId, "UPI ID")}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                          title="Copy UPI ID"
                        >
                          <FiCopy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details Card */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-100 text-orange-600">
                      <FiCreditCard className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Bank Account Details</h4>
                      <p className="text-[11px] text-slate-400">For NEFT / RTGS / IMPS wire transfers</p>
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-3">
                    <div className="rounded-lg bg-slate-50 px-3.5 py-2.5">
                      <dt className="text-[11px] font-semibold uppercase text-slate-400">Account Holder</dt>
                      <dd className="mt-0.5 text-xs font-bold text-slate-800">
                        {settings.accountHolderName || "—"}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">Account Number</dt>
                        <dd className="mt-0.5 font-mono text-xs font-bold text-slate-800">
                          {settings.accountNumber || "—"}
                        </dd>
                      </div>
                      {settings.accountNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.accountNumber, "Account Number")}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                          title="Copy Account Number"
                        >
                          <FiCopy className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 px-3.5 py-2.5">
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">Bank Name</dt>
                        <dd className="mt-0.5 text-xs font-bold text-slate-800">
                          {settings.bankName || "—"}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
                        <div>
                          <dt className="text-[11px] font-semibold uppercase text-slate-400">IFSC Code</dt>
                          <dd className="mt-0.5 font-mono text-xs font-bold text-slate-800">
                            {settings.ifscCode || "—"}
                          </dd>
                        </div>
                        {settings.ifscCode && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.ifscCode, "IFSC Code")}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                            title="Copy IFSC Code"
                          >
                            <FiCopy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 px-3.5 py-2.5">
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">Account Type</dt>
                        <dd className="mt-0.5 text-xs font-bold text-slate-800">
                          {settings.accountType || "Savings"}
                        </dd>
                      </div>

                      <div className="rounded-lg bg-slate-50 px-3.5 py-2.5">
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">Branch Name</dt>
                        <dd className="mt-0.5 text-xs font-bold text-slate-800">
                          {settings.branchName || "—"}
                        </dd>
                      </div>
                    </div>

                    {settings.instructions && (
                      <div className="rounded-lg bg-orange-50/70 p-3">
                        <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-orange-700">
                          <FiInfo className="h-3.5 w-3.5" />
                          <span>Donor Instructions</span>
                        </dt>
                        <dd className="mt-1 text-xs text-orange-950">{settings.instructions}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 text-right">
                  <button
                    type="button"
                    onClick={openEditSettingsModal}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    <FiEdit3 className="h-3.5 w-3.5" />
                    <span>Edit Bank &amp; UPI Details</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: EMAIL & NODEMAILER (RECEIPT DISPATCH) */}
      {/* ==================================================== */}
      {activeTab === "email" && (
        <div className="space-y-6">
          {/* Status Overview Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                  emailSettings?.isConfigured
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <FiMail className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">Nodemailer SMTP Mailer</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      emailSettings?.isConfigured
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {emailSettings?.isConfigured ? "Connected & Ready" : "Not Configured"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  When you approve any donation in the dashboard, an official 80G PDF receipt is compiled with donor details and emailed automatically via this SMTP account.
                </p>
              </div>
            </div>

            {emailSettings?.isConfigured && (
              <button
                type="button"
                onClick={() => {
                  setTestRecipient(emailForm.user);
                  setTestModalOpen(true);
                }}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-center"
              >
                <FiSend className="h-3.5 w-3.5 text-orange-500" />
                <span>Send Test Email</span>
              </button>
            )}
          </div>

          {/* Configuration Form Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h4 className="text-sm font-bold text-slate-800">SMTP Credentials Configuration</h4>
              <p className="mt-0.5 text-xs text-slate-500">
                Works with Gmail, Google Workspace, Outlook, or custom SMTP servers.
              </p>
            </div>

            {/* Gmail Notice Helper */}
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900">
              <p className="font-bold text-blue-950">How to use your Gmail address with Nodemailer:</p>
              <ol className="mt-1.5 list-inside list-decimal space-y-1 text-blue-800">
                <li>Enable <strong>2-Step Verification</strong> on your Google Account.</li>
                <li>Go to Google Account Security &rarr; search for <strong>&quot;App Passwords&quot;</strong>.</li>
                <li>Create an App Password (name it &quot;NGO Dashboard&quot;) and copy the 16-character code.</li>
                <li>Paste the 16-character code in the <strong>App Password</strong> field below (without spaces).</li>
              </ol>
            </div>

            <form onSubmit={handleSaveEmailSettings} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* SMTP Host */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="smtp.gmail.com"
                    value={emailForm.host}
                    onChange={(e) => setEmailForm({ ...emailForm, host: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                {/* Port & SSL */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Port
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="465"
                      value={emailForm.port}
                      onChange={(e) => setEmailForm({ ...emailForm, port: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Security
                    </label>
                    <select
                      value={emailForm.secure ? "true" : "false"}
                      onChange={(e) =>
                        setEmailForm({ ...emailForm, secure: e.target.value === "true" })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    >
                      <option value="true">SSL (Port 465)</option>
                      <option value="false">TLS / STARTTLS (Port 587)</option>
                    </select>
                  </div>
                </div>

                {/* Email / Username */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Gmail / SMTP Username
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourngo@gmail.com"
                    value={emailForm.user}
                    onChange={(e) => setEmailForm({ ...emailForm, user: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                {/* Password / App Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Gmail App Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="16-character App Password"
                      value={emailForm.pass}
                      onChange={(e) => setEmailForm({ ...emailForm, pass: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 font-mono text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Sender Display Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Shiv Gorakh Welfare Foundation"
                    value={emailForm.senderName}
                    onChange={(e) => setEmailForm({ ...emailForm, senderName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                {/* Sender Email (From address) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Defaults to SMTP username"
                    value={emailForm.senderEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                {/* Receipt Number Prefix */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Receipt Number Prefix
                  </label>
                  <input
                    type="text"
                    placeholder="SG-REC-"
                    value={emailForm.receiptPrefix}
                    onChange={(e) => setEmailForm({ ...emailForm, receiptPrefix: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                {/* Reply To Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Reply-To Address
                  </label>
                  <input
                    type="email"
                    placeholder="info@shivgorakh.org.in"
                    value={emailForm.replyTo}
                    onChange={(e) => setEmailForm({ ...emailForm, replyTo: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  placeholder="Donation Receipt & Thank You — Shiv Gorakh Welfare Foundation"
                  value={emailForm.emailSubject}
                  onChange={(e) => setEmailForm({ ...emailForm, emailSubject: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </div>

              {/* Official Receipt Authorized Signature */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                      80G Tax Receipt Credential
                    </span>
                    <h4 className="font-serif text-sm font-bold text-slate-900">
                      Authorized Signatory &amp; Stamp
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Appears directly on generated PDF receipts
                  </span>
                </div>

                <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_1.5fr]">
                  {/* Signature Simulation Box */}
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      PDF Preview
                    </span>
                    <div className="mx-auto h-20 max-w-[200px] flex flex-col items-center justify-end border-b border-slate-400 pb-1">
                      {receiptSigPreview ? (
                        <img
                          src={receiptSigPreview}
                          alt="Receipt Signature"
                          className="max-h-16 w-auto object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs italic text-slate-400">
                          Text signature fallback
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-900">
                      {emailForm.signatoryName || "Hari Om"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {emailForm.signatoryRole || "Authorized Signatory"}
                    </p>
                  </div>

                  {/* Inputs & Upload Button */}
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Signatory Printed Name
                        </label>
                        <input
                          type="text"
                          value={emailForm.signatoryName}
                          onChange={(e) => setEmailForm({ ...emailForm, signatoryName: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Signatory Title
                        </label>
                        <input
                          type="text"
                          value={emailForm.signatoryRole}
                          onChange={(e) => setEmailForm({ ...emailForm, signatoryRole: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black transition">
                        <FiUpload />
                        <span>{receiptSigPreview ? "Change Signature" : "Upload Signature Image"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Signature image must be under 5MB.");
                              return;
                            }
                            setReceiptSigFile(file);
                            setReceiptSigPreview(URL.createObjectURL(file));
                            setRemoveReceiptSig(false);
                          }}
                        />
                      </label>

                      {receiptSigPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptSigFile(null);
                            setReceiptSigPreview("");
                            setRemoveReceiptSig(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                        >
                          <FiTrash2 />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload transparent PNG signature for crystal-clear 80G PDF receipts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={savingEmailSettings}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  {savingEmailSettings ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Verifying &amp; Saving…</span>
                    </>
                  ) : (
                    <>
                      <FiKey />
                      <span>Verify &amp; Save Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: TEST EMAIL */}
      {/* ==================================================== */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FiSend className="text-orange-500" />
                <h3 className="text-sm font-bold text-slate-800">Send Test Email</h3>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter recipient email..."
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  A confirmation message will be sent to this email via your Nodemailer settings.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  disabled={sendingTestEmail}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTestEmail}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {sendingTestEmail ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <FiSend />
                      <span>Send Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDIT / ADD CREDENTIALS */}
      {/* ==================================================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {settings?.upiId || settings?.accountNumber
                    ? "Update Donation Credentials"
                    : "Configure Donation Credentials"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Enter UPI ID, upload QR scanner image, and bank account information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. shivgorkh@oksbi or 9876543210@paytm"
                  value={settingsForm.upiId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </div>

              {/* QR Scanner Image Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  UPI Scanner QR Code Image
                </label>

                {qrPreview ? (
                  <div className="mt-2 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <Image
                        src={qrPreview}
                        alt="QR preview"
                        fill
                        sizes="80px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700">QR Code Image Selected</p>
                      <p className="text-[11px] text-slate-400">Donors can scan this to pay directly.</p>
                      <button
                        type="button"
                        onClick={handleRemoveQr}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        <span>Remove QR Code</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-5 text-center transition hover:border-orange-400 hover:bg-orange-50/30">
                    <FiUpload className="h-7 w-7 text-slate-400" />
                    <span className="mt-1 text-xs font-semibold text-slate-700">
                      Click to upload UPI QR Scanner image
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WebP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleQrFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Bank Details Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Shiv Gorakh Welfare Foundation"
                    value={settingsForm.accountHolderName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, accountHolderName: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789012"
                    value={settingsForm.accountNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, accountNumber: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India"
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={settingsForm.ifscCode}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, ifscCode: e.target.value.toUpperCase() })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs uppercase text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Account Type
                  </label>
                  <select
                    value={settingsForm.accountType}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, accountType: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Branch Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Branch"
                    value={settingsForm.branchName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, branchName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Instructions for Donors
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please share transaction screenshot and reference number after transfer."
                  value={settingsForm.instructions}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, instructions: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={settingsForm.isActive}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-700">
                  Publish credentials (visible on public donation page)
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  disabled={savingSettings}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>Save Credentials</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: DELETE CREDENTIALS CONFIRMATION */}
      {/* ==================================================== */}
      {deleteSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <FiAlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">Delete Donation Credentials?</h3>
            <p className="mt-1 text-xs text-slate-500">
              This will remove the UPI ID, QR scanner image, and bank account information from the database and public donation portal.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteSettingsModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSettings}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: FULL SCREENSHOT PREVIEW LIGHTBOX */}
      {/* ==================================================== */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Payment Proof — {previewImage.donorName}
                </h3>
                <p className="text-xs text-slate-500">
                  Amount:{" "}
                  <span className="font-bold text-orange-600">
                    ₹{Number(previewImage.amount).toLocaleString("en-IN")}
                  </span>{" "}
                  • UTR:{" "}
                  <span className="font-mono">{previewImage.transactionId || "N/A"}</span>
                </p>
                {(previewImage.campaignTitle || previewImage.campaign?.title) && (
                  <p className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800 border border-orange-200">
                      🎯 Campaign: {previewImage.campaignTitle || previewImage.campaign?.title}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {previewImage.status !== "Approved" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(previewImage._id, "Approved")}
                    disabled={updatingStatusId === previewImage._id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <FiCheck />
                    <span>Approve &amp; Mail Receipt</span>
                  </button>
                )}

                {previewImage.status !== "Rejected" && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalItem(previewImage);
                      setRejectReason(previewImage.reviewNotes || "");
                    }}
                    disabled={updatingStatusId === previewImage._id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <FiX />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Image viewer */}
            <div className="relative flex min-h-[350px] max-h-[70vh] flex-1 items-center justify-center overflow-auto bg-slate-900 p-4">
              {previewImage.screenshot ? (
                <div className="relative h-full min-h-[400px] w-full">
                  <Image
                    src={getContentImageUrl(previewImage.screenshot)}
                    alt="Proof screenshot"
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400">No screenshot image available.</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-600">
              <span>
                Submitted on:{" "}
                {new Date(previewImage.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>

              {previewImage.screenshot && (
                <a
                  href={getContentImageUrl(previewImage.screenshot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:underline"
                >
                  <span>Open original in new tab</span>
                  <FiExternalLink />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: REJECT DONATION REASON */}
      {/* ==================================================== */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Reject Donation Submission</h3>
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600">
                Are you sure you want to reject the donation from{" "}
                <span className="font-semibold text-slate-800">{rejectModalItem.donorName}</span>{" "}
                for{" "}
                <span className="font-bold text-orange-600">
                  ₹{Number(rejectModalItem.amount).toLocaleString("en-IN")}
                </span>
                ?
              </p>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Reason for Rejection (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. UTR number could not be verified against bank statement, or payment screenshot unreadable."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(rejectModalItem._id, "Rejected", rejectReason)}
                disabled={updatingStatusId === rejectModalItem._id}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: DELETE DONATION RECORD */}
      {/* ==================================================== */}
      {deleteDonationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <FiTrash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">Delete Donation Record?</h3>
            <p className="mt-1 text-xs text-slate-500">
              This will permanently delete this donation record and remove the uploaded payment proof image from disk.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteDonationItem(null)}
                disabled={isDeletingDonation}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDonation}
                disabled={isDeletingDonation}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeletingDonation ? "Deleting…" : "Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
