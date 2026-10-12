"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiClock,
  FiCopy,
  FiCreditCard,
  FiHeart,
  FiImage,
  FiInfo,
  FiLock,
  FiSend,
  FiShield,
  FiUploadCloud,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { MdQrCode } from "react-icons/md";
import api, { getApiImageUrl } from "@/lib/authApi";

const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000, 10000];

export default function DonationPortal({ initialAmount: propInitialAmount = "" }) {
  const user = useSelector((state) => state.auth.user);
  const searchParams = useSearchParams();

  const initialCampaignId = searchParams?.get("campaignId") || "";
  const initialCampaignTitle = searchParams?.get("campaignTitle") || "";

  // Retrieve amount from URL search query (e.g. /donate?amount=500) or prop
  const rawParamAmount = searchParams?.get("amount") || propInitialAmount || "";
  const cleanParamAmount = rawParamAmount ? String(rawParamAmount).replace(/[^0-9]/g, "") : "";
  const isParamPreset = cleanParamAmount ? PRESET_AMOUNTS.includes(Number(cleanParamAmount)) : false;

  // Campaign linkage state
  const [campaignsList, setCampaignsList] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState(initialCampaignTitle);

  // Donation Credentials (from admin)
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Donation Form State
  const [amount, setAmount] = useState(cleanParamAmount || "1000");
  const [customAmount, setCustomAmount] = useState(
    cleanParamAmount && !isParamPreset ? cleanParamAmount : ""
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // User's History State
  const [myDonations, setMyDonations] = useState([]);
  const [loadingMyDonations, setLoadingMyDonations] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const { data } = await api.get("/api/v1/donations/settings");
      if (data?.data) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error("Failed to load donation settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // Fetch Current User Donations
  const fetchMyDonations = useCallback(async () => {
    if (!user) return;
    setLoadingMyDonations(true);
    try {
      const { data } = await api.get("/api/v1/donations/my");
      if (data?.data) {
        setMyDonations(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user donations:", err);
    } finally {
      setLoadingMyDonations(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const { data } = await api.get("/api/v1/campaigns/all");
        if (data?.campaigns) {
          setCampaignsList(data.campaigns);
          if (initialCampaignId) {
            const found = data.campaigns.find((c) => c._id === initialCampaignId);
            if (found) {
              setSelectedCampaignTitle(found.title);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load campaigns list:", err);
      }
    }
    loadCampaigns();
  }, [initialCampaignId]);

  useEffect(() => {
    if (user) {
      fetchMyDonations();
    }
  }, [user, fetchMyDonations]);

  // Sync amount when URL query parameter changes (e.g. /donate?amount=500)
  useEffect(() => {
    const rawVal = searchParams?.get("amount") || propInitialAmount;
    if (rawVal) {
      const cleanVal = String(rawVal).replace(/[^0-9]/g, "");
      if (cleanVal) {
        setAmount(cleanVal);
        if (PRESET_AMOUNTS.includes(Number(cleanVal))) {
          setCustomAmount("");
        } else {
          setCustomAmount(cleanVal);
        }
      }
    }
  }, [searchParams, propInitialAmount]);

  // Handle Preset Amount Select
  const handleSelectAmount = (val) => {
    setAmount(String(val));
    setCustomAmount("");
  };

  // Handle Custom Amount Input
  const handleCustomAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setAmount(val);
  };

  // Handle Screenshot File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP screenshot.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB.");
      return;
    }

    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    setScreenshotFile(null);
    setScreenshotPreview("");
  };

  // Copy Helper
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Submit Donation Proof
  const handleSubmitDonation = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit your donation proof.");
      return;
    }

    const finalAmount = Number(amount);
    if (!finalAmount || finalAmount <= 0) {
      toast.error("Please enter a valid donation amount.");
      return;
    }

    if (!screenshotFile && !transactionId.trim()) {
      toast.error("Please provide either a payment screenshot or transaction ID.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", finalAmount);
      formData.append("paymentMethod", paymentMethod);
      formData.append("transactionId", transactionId.trim());
      formData.append("notes", notes.trim());
      formData.append("donorName", user.name || "");
      formData.append("donorEmail", user.email || "");
      if (user.phone) formData.append("donorPhone", user.phone);

      if (selectedCampaignId) {
        formData.append("campaignId", selectedCampaignId);
      }
      if (selectedCampaignTitle) {
        formData.append("campaignTitle", selectedCampaignTitle);
      }

      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const { data } = await api.post("/api/v1/donations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(data?.message || "Donation proof submitted successfully!");
      setSubmissionSuccess(true);
      setTransactionId("");
      setNotes("");
      removeSelectedFile();
      fetchMyDonations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit donation proof.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-16">
      {/* ========================================================= */}
      {/* SECTION 1: HOW TO DONATE & CREDENTIALS DISPLAY */}
      {/* ========================================================= */}
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <FiHeart className="fill-current text-xs" />
            <span>Direct Foundation Contribution</span>
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Choose Your Way to Give
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Scan our official UPI QR code or transfer directly to our bank account. Every single rupee
            fuels rescue operations, care, and welfare efforts.
          </p>
        </div>

        {loadingSettings ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
              Loading verified donation credentials…
            </div>
          </div>
        ) : !settings || (!settings.upiId && !settings.accountNumber && !settings.qrCode) ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-200 bg-orange-50/50 p-8 text-center text-stone-600">
            <FiInfo className="mx-auto mb-2 h-8 w-8 text-brand-orange" />
            <h3 className="text-base font-bold text-stone-800">Donation Details Updating</h3>
            <p className="mt-1 text-xs text-stone-500">
              The foundation is currently updating its verified banking credentials. Please contact
              us directly at{" "}
              <a href="mailto:info@shivgorakh.org.in" className="font-semibold text-brand-orange">
                info@shivgorakh.org.in
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* OPTION A: UPI & SCANNER QR */}
            <div className="flex flex-col justify-between rounded-2xl border border-orange-100 bg-brand-cream/60 p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between border-b border-orange-200/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-orange text-white">
                      <MdQrCode className="text-2xl" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        Scan & Pay via UPI
                      </h3>
                      <p className="text-xs text-stone-500">GPay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    Instant
                  </span>
                </div>

                {/* QR Scanner Display */}
                <div className="mt-6 flex flex-col items-center">
                  {settings.qrCode ? (
                    <div className="relative h-60 w-60 overflow-hidden rounded-2xl border-4 border-white bg-white p-2 shadow-md">
                      <Image
                        src={getApiImageUrl(settings.qrCode)}
                        alt="Foundation UPI QR Code"
                        fill
                        sizes="240px"
                        className="object-contain p-2"
                        priority
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 w-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-white text-stone-400">
                      <MdQrCode className="h-12 w-12 text-stone-300" />
                      <span className="mt-2 text-xs">QR Scanner not available</span>
                    </div>
                  )}

                  <p className="mt-3 text-center text-xs font-medium text-stone-500">
                    Open any UPI application on your smartphone and scan this code
                  </p>

                  {/* UPI ID Pill with Copy */}
                  {settings.upiId && (
                    <div className="mt-4 flex w-full items-center justify-between rounded-xl border border-orange-200 bg-white p-3 shadow-sm">
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Official UPI ID (VPA)
                        </p>
                        <p className="truncate font-mono text-xs font-bold text-stone-900 sm:text-sm">
                          {settings.upiId}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.upiId, "UPI ID")}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-bold text-brand-orange transition hover:bg-brand-orange hover:text-white"
                        title="Copy UPI ID"
                      >
                        <FiCopy className="text-xs" />
                        <span>Copy</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {settings.instructions && (
                <div className="mt-6 rounded-xl bg-orange-100/60 p-3 text-xs text-stone-700">
                  <span className="font-bold text-brand-orange">Note: </span>
                  {settings.instructions}
                </div>
              )}
            </div>

            {/* OPTION B: BANK ACCOUNT DETAILS */}
            <div className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green text-white">
                      <FiCreditCard className="text-xl" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        Direct Bank Transfer
                      </h3>
                      <p className="text-xs text-stone-500">NEFT / RTGS / IMPS</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold text-stone-700">
                    Wire Transfer
                  </span>
                </div>

                <dl className="mt-6 space-y-3.5">
                  <div className="rounded-xl bg-stone-50 p-3 sm:px-4">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Account Name
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-stone-900">
                      {settings.accountHolderName || "Shiv Gorakh Welfare Foundation"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 sm:px-4">
                    <div className="min-w-0 pr-2">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Account Number
                      </dt>
                      <dd className="mt-0.5 font-mono text-sm font-bold text-stone-900">
                        {settings.accountNumber || "—"}
                      </dd>
                    </div>
                    {settings.accountNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.accountNumber, "Account Number")}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                        title="Copy Account Number"
                      >
                        <FiCopy className="text-xs" />
                        <span>Copy</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-stone-50 p-3 sm:px-4">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Bank Name
                      </dt>
                      <dd className="mt-0.5 text-sm font-bold text-stone-900">
                        {settings.bankName || "—"}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 sm:px-4">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                          IFSC Code
                        </dt>
                        <dd className="mt-0.5 font-mono text-sm font-bold text-stone-900">
                          {settings.ifscCode || "—"}
                        </dd>
                      </div>
                      {settings.ifscCode && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.ifscCode, "IFSC Code")}
                          className="rounded-lg p-1 text-stone-400 hover:text-stone-800"
                          title="Copy IFSC Code"
                        >
                          <FiCopy className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-stone-50 p-3 sm:px-4">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Account Type
                      </dt>
                      <dd className="mt-0.5 text-sm font-bold text-stone-900">
                        {settings.accountType || "Savings"}
                      </dd>
                    </div>

                    <div className="rounded-xl bg-stone-50 p-3 sm:px-4">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Branch
                      </dt>
                      <dd className="mt-0.5 text-sm font-bold text-stone-900">
                        {settings.branchName || "Main Branch"}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-stone-500">
                <FiShield className="text-base text-brand-green" />
                <span>Verified Foundation Banking Credential</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: DONATION PROOF SUBMISSION FORM */}
      {/* ========================================================= */}
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-green">
            <FiShield className="text-xs" />
            <span>Step 2: Submit Payment Proof</span>
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-stone-900">
            Upload Your Donation Receipt
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Once you have transferred funds using the UPI QR code or bank details above, submit your
            transaction receipt or screenshot below so our admin team can verify and approve your
            donation.
          </p>
        </div>

        {/* AUTH CHECK BANNER */}
        {!user ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-8 text-center sm:p-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-brand-orange">
              <FiLock className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-serif text-2xl font-bold text-stone-900">
              Sign In to Submit Your Donation Proof
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              To associate your payment with your donor profile, track verification status, and receive
              official confirmation, please log in with your account.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?redirect=/donate"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-bold text-white shadow-md transition hover:bg-orange-700"
              >
                <FiUserCheck />
                <span>Sign In to Continue</span>
              </Link>
              <Link
                href="/register?redirect=/donate"
                className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-6 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
              >
                Create New Account
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitDonation} className="mt-8 space-y-8">
            {/* Logged in donor banner */}
            <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-orange/20 font-bold text-brand-orange">
                {user.name?.slice(0, 1)?.toUpperCase() || "D"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-stone-500">Submitting contribution as</p>
                <p className="truncate text-sm font-bold text-stone-900">
                  {user.name} <span className="font-normal text-stone-500">({user.email})</span>
                </p>
              </div>
            </div>

            {/* Campaign Allocation Selector */}
            <div className="rounded-2xl border border-orange-200/80 bg-orange-50/60 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                  Direct Campaign / Cause Fund Allocation
                </label>
                {selectedCampaignTitle && (
                  <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Linked to Campaign
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <select
                  value={selectedCampaignId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedCampaignId(id);
                    const found = campaignsList.find((c) => c._id === id);
                    setSelectedCampaignTitle(found ? found.title : "");
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">General Animal Welfare Fund (Unrestricted)</option>
                  {campaignsList.map((c) => (
                    <option key={c._id} value={c._id}>
                      🎯 {c.title} (Goal: ₹{Number(c.targetAmount || 0).toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>

                {selectedCampaignId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaignId("");
                      setSelectedCampaignTitle("");
                    }}
                    className="shrink-0 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] text-stone-600 leading-relaxed">
                {selectedCampaignTitle ? (
                  <>
                    Your contribution will be officially credited to the{" "}
                    <strong className="text-brand-orange">{selectedCampaignTitle}</strong> campaign fund
                    and verified on approval.
                  </>
                ) : (
                  "Contributions without a specific campaign will directly fund medical ambulances, sterilizations, and daily animal food supplies."
                )}
              </p>
            </div>

            {/* Donation Amount Selection */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Donation Amount (INR ₹)
                </label>
                {amount && (
                  <span className="rounded-full bg-orange-100/80 px-2.5 py-0.5 text-xs font-extrabold text-brand-orange border border-orange-200">
                    Selected: ₹{Number(amount).toLocaleString("en-IN") || amount}
                  </span>
                )}
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectAmount(val)}
                    className={`rounded-xl border py-2.5 text-center text-sm font-bold transition ${
                      amount === String(val) && !customAmount
                        ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                        : "border-stone-200 bg-white text-stone-700 hover:border-brand-orange hover:bg-orange-50/50"
                    }`}
                  >
                    ₹{val.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mt-3">
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-stone-400">₹</span>
                  <input
                    type="text"
                    placeholder="Enter custom amount..."
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 pl-8 pr-4 text-sm font-semibold text-stone-900 outline-none transition focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method & Transaction ID Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Payment Method Used
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-brand-orange focus:bg-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="Other">Other Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Transaction / UTR Reference ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 402819284918 or UTR123456"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 font-mono text-sm font-semibold text-stone-800 outline-none transition focus:border-brand-orange focus:bg-white"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  You can find the 12-digit UTR/UPI reference ID in your payment app receipt.
                </p>
              </div>
            </div>

            {/* Screenshot Upload Dropzone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Payment Screenshot / Receipt Image
              </label>

              {screenshotPreview ? (
                <div className="mt-2.5 flex items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white">
                    <Image
                      src={screenshotPreview}
                      alt="Uploaded preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-stone-900">
                      {screenshotFile?.name || "Payment Screenshot"}
                    </p>
                    <p className="text-xs text-stone-400">
                      {(screenshotFile?.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                    </p>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                    >
                      <FiX />
                      <span>Remove & choose another</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/70 p-8 text-center transition hover:border-brand-orange hover:bg-orange-50/40">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-brand-orange">
                    <FiUploadCloud className="h-6 w-6" />
                  </div>
                  <span className="mt-3 text-sm font-bold text-stone-800">
                    Click to select payment screenshot
                  </span>
                  <span className="mt-0.5 text-xs text-stone-500">
                    Supports PNG, JPG, or WebP up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Note / Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Message / Dedication (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Share a note of encouragement or specify a cause (e.g. Animal Feeding Drive)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm font-normal text-stone-800 outline-none transition focus:border-brand-orange focus:bg-white"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-brand-orange px-8 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-700 disabled:opacity-60 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Uploading & Submitting…</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Submit Donation Proof (₹{Number(amount || 0).toLocaleString("en-IN")})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: MY RECENT CONTRIBUTIONS (FOR LOGGED-IN DONOR) */}
      {/* ========================================================= */}
      {user && (
        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                My Contribution History
              </h3>
              <p className="text-xs text-stone-500">
                Track verification status for all your submitted payments.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchMyDonations}
              className="text-xs font-bold text-brand-orange hover:underline"
            >
              Refresh Status
            </button>
          </div>

          {loadingMyDonations ? (
            <div className="flex h-32 items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
            </div>
          ) : myDonations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center text-xs text-stone-500">
              You haven&apos;t submitted any payment proofs yet. Your submissions will appear here.
            </div>
          ) : (
            <div className="mt-6 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200">
              {myDonations.map((item) => {
                const isPending = item.status === "Pending";
                const isApproved = item.status === "Approved";
                const isRejected = item.status === "Rejected";

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 p-4 transition hover:bg-stone-50/80 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {item.screenshot ? (
                        <button
                          type="button"
                          onClick={() => setPreviewModalImage(item.screenshot)}
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
                          title="Click to view screenshot"
                        >
                          <Image
                            src={getApiImageUrl(item.screenshot)}
                            alt="Donation proof"
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      ) : (
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-orange-100 text-brand-orange">
                          <FiCreditCard className="text-xl" />
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-base font-bold text-stone-900">
                            ₹{Number(item.amount).toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                            {item.paymentMethod || "UPI"}
                          </span>
                          {(item.campaignTitle || item.campaign?.title) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-orange border border-orange-200">
                              🎯 {item.campaignTitle || item.campaign?.title}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-stone-500">
                          UTR: {item.transactionId || "Not specified"} •{" "}
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          <FiClock />
                          <span>Pending Verification</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          <FiCheck />
                          <span>Approved & Verified</span>
                        </span>
                      )}
                      {isRejected && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
                          title={item.reviewNotes || "Rejected"}
                        >
                          <FiX />
                          <span>Verification Declined</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* LIGHTBOX MODAL FOR DONOR TO VIEW SCREENSHOT */}
      {/* ========================================================= */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <FiX className="h-5 w-5" />
            </button>
            <div className="relative h-[60vh] w-full min-w-[320px]">
              <Image
                src={getApiImageUrl(previewModalImage)}
                alt="Proof enlarged"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
