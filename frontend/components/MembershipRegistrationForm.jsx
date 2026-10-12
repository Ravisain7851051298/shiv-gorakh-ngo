"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import getUserFacingError from "@/lib/getUserFacingError";
import api, { getApiImageUrl } from "@/lib/authApi";
import {
  registerMembership,
  updateMembership,
} from "@/store/membershipSlice";

const inputClassName =
  "mt-2 w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 rounded-lg";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function getDefaultDates() {
  const start = new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export default function MembershipRegistrationForm({
  initialProfile,
  onSuccess,
  onCancel,
}) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.membership);
  const { user } = useSelector((state) => state.auth);
  const isEditing = Boolean(initialProfile);

  // Settings & Tiers from API
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [tiers, setTiers] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [instructions, setInstructions] = useState("");

  // Form state
  const [selectedTier, setSelectedTier] = useState(initialProfile?.membershipType || "");
  const [paymentMethod, setPaymentMethod] = useState(initialProfile?.paymentMethod || "UPI");
  const [transactionId, setTransactionId] = useState(initialProfile?.transactionId || "");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(
    initialProfile?.paymentScreenshot ? getApiImageUrl(initialProfile.paymentScreenshot) : null
  );
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [addressValues, setAddressValues] = useState({
    address: initialProfile?.address || "",
    city: initialProfile?.city || "",
    state: initialProfile?.state || "",
    zipCode: initialProfile?.zipCode || "",
  });

  // Fetch settings from server
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const { data } = await api.get("/api/v1/membership/settings");
        if (isMounted && data?.success && data?.data) {
          const fetchedTiers = data.data.membershipTypes || [];
          setTiers(fetchedTiers);
          setPaymentDetails(data.data.paymentDetails);
          setInstructions(data.data.instructions || "");

          if (!selectedTier && fetchedTiers.length > 0) {
            setSelectedTier(fetchedTiers[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load membership pricing settings:", err);
      } finally {
        if (isMounted) setLoadingSettings(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeTierObj = tiers.find(
    (t) => t.name.toLowerCase() === selectedTier.toLowerCase()
  ) || tiers[0];

  function updateAddress(e) {
    const { name, value } = e.target;
    setAddressValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB");
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2500);
  }

  async function submitMembership(e) {
    e.preventDefault();

    if (!isEditing && !screenshotFile && !initialProfile?.paymentScreenshot) {
      toast.error("Please upload your payment screenshot proof before submitting.");
      return;
    }

    if (!isEditing && !transactionId.trim()) {
      toast.error("Please provide the Transaction ID or UTR reference number.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("membershipType", selectedTier || "Annual");
      if (activeTierObj?.price) {
        formData.append("amount", activeTierObj.price);
      }
      formData.append("address", addressValues.address);
      formData.append("city", addressValues.city);
      formData.append("state", addressValues.state);
      formData.append("zipCode", addressValues.zipCode);
      formData.append("paymentMethod", paymentMethod);
      formData.append("transactionId", transactionId.trim());

      if (screenshotFile) {
        formData.append("paymentScreenshot", screenshotFile);
      }

      let result;
      if (isEditing) {
        // If editing existing profile without file update, standard json update
        result = await dispatch(
          updateMembership({
            membershipType: selectedTier,
            ...addressValues,
            paymentMethod,
            transactionId: transactionId.trim(),
          })
        );
      } else {
        result = await dispatch(registerMembership(formData));
      }

      if (result.meta.requestStatus === "fulfilled") {
        toast.success(
          isEditing
            ? "Your membership details have been updated."
            : "Membership application submitted! Admin will verify your payment and email your official Certificate PDF."
        );
        onSuccess?.(result.payload);
      } else {
        toast.error(
          getUserFacingError(
            result.payload,
            "Unable to submit membership registration."
          )
        );
      }
    } catch (err) {
      toast.error(getUserFacingError(err, "An unexpected error occurred."));
    }
  }

  return (
    <form className="space-y-8" onSubmit={submitMembership}>
      {/* Step 1: Select Membership Tier */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block font-serif text-lg font-bold text-stone-900">
            1. Select Membership Tier
          </label>
          {loadingSettings && (
            <span className="text-xs text-stone-400">Loading updated tiers…</span>
          )}
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Choose a membership duration and fee level set by foundation leadership.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tiers.map((tier) => {
            const isSelected = (selectedTier || "").toLowerCase() === tier.name.toLowerCase();
            return (
              <div
                key={tier.name}
                onClick={() => setSelectedTier(tier.name)}
                className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${isSelected
                  ? tier.name === "Monthly"
                    ? "border-stone-400 bg-stone-100 shadow-md ring-2 ring-stone-300/40"
                    : tier.name === "Annual"
                      ? "border-green-500 bg-green-50 shadow-md ring-2 ring-green-400/30"
                      : tier.name === "Lifetime"
                        ? "border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/30"
                        : "border-stone-300 bg-white shadow-md"
                  : tier.name === "Monthly"
                    ? "border-stone-200 bg-stone-50 hover:border-stone-300 hover:shadow-sm"
                    : tier.name === "Annual"
                      ? "border-green-200 bg-green-50/40 hover:border-green-400 hover:shadow-sm"
                      : tier.name === "Lifetime"
                        ? "border-amber-200 bg-amber-50/40 hover:border-amber-400 hover:shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                  }`}              >
                {isSelected && (
                  <div
                    className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${tier.name === "Monthly"
                      ? "bg-stone-500"
                      : tier.name === "Annual"
                        ? "bg-green-600"
                        : tier.name === "Lifetime"
                          ? "bg-amber-500"
                          : "bg-stone-500"
                      }`}
                  >
                    Selected
                  </div>
                )}

                <h4 className="font-serif text-lg font-bold text-stone-900">
                  {tier.name}
                </h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-stone-950">
                    {formatCurrency(tier.price)}
                  </span>
                  <span className="text-xs text-stone-500">
                    / {tier.periodMonths >= 120 ? "Lifetime" : `${tier.periodMonths} Mo`}
                  </span>
                </div>
                {tier.description && (
                  <p className="mt-2 text-xs text-stone-600 line-clamp-2">
                    {tier.description}
                  </p>
                )}
                {Array.isArray(tier.benefits) && tier.benefits.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-[11px] text-stone-600">
                    {tier.benefits.slice(0, 3).map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="truncate">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Payment Credentials & Transfer Instructions */}
      {!isEditing && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Step 2 · Transfer Membership Dues
              </span>
              <h3 className="mt-1 font-serif text-xl font-bold text-stone-900">
                Foundation Official Payment Accounts
              </h3>
              <p className="mt-1 text-xs text-stone-600">
                Please transfer exactly{" "}
                <span className="font-bold text-stone-900">
                  {formatCurrency(activeTierObj?.price || 0)}
                </span>{" "}
                using any UPI app or Net Banking, then enter the transaction ID and screenshot below.
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 px-3 py-1.5 text-right">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Total Due</span>
              <span className="text-lg font-black text-stone-900">
                {formatCurrency(activeTierObj?.price || 0)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* UPI Section */}
            <div className="rounded-xl border border-amber-200 bg-white p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Option A: Pay via UPI / QR Code
              </span>

              {paymentDetails?.qrCode ? (
                <div className="mt-3 flex justify-center">
                  <img
                    src={getApiImageUrl(paymentDetails.qrCode)}
                    alt="Foundation UPI QR Code"
                    className="size-44 rounded-lg border border-stone-200 object-contain shadow-sm bg-white"
                  />
                </div>
              ) : (
                <div className="mt-3 flex size-44 mx-auto items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 text-center text-xs text-stone-400">
                  Scan QR via UPI App
                </div>
              )}

              {paymentDetails?.upiId && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 border border-stone-200">
                  <div className="truncate">
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">UPI VPA</span>
                    <span className="font-mono text-xs font-bold text-stone-800">{paymentDetails.upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentDetails.upiId)}
                    className="ml-2 rounded-md bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-stone-800"
                  >
                    {copiedUpi ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            {/* Bank Transfer Section */}
            <div className="rounded-xl border border-amber-200 bg-white p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Option B: Direct Bank Transfer (NEFT / IMPS)
              </span>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-100 py-1.5">
                  <span className="text-stone-500">Beneficiary Name</span>
                  <span className="font-semibold text-stone-900 text-right">
                    {paymentDetails?.accountHolderName || "Shiv Gorakh Welfare Foundation"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1.5">
                  <span className="text-stone-500">Bank Name</span>
                  <span className="font-semibold text-stone-900">
                    {paymentDetails?.bankName || "State Bank of India"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1.5">
                  <span className="text-stone-500">Account Number</span>
                  <span className="font-mono font-bold text-stone-900">
                    {paymentDetails?.accountNumber || "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1.5">
                  <span className="text-stone-500">IFSC Code</span>
                  <span className="font-mono font-bold text-stone-900">
                    {paymentDetails?.ifscCode || "—"}
                  </span>
                </div>
                {paymentDetails?.branchName && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-500">Branch</span>
                    <span className="text-stone-800">{paymentDetails.branchName}</span>
                  </div>
                )}
              </div>

              {instructions && (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-[11px] text-amber-900">
                  <p className="font-semibold">Note from Admin:</p>
                  <p className="mt-0.5">{instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Payment Verification Proofs */}
      {!isEditing && (
        <div>
          <label className="block font-serif text-lg font-bold text-stone-900">
            3. Payment Verification & Receipt Proof
          </label>
          <p className="mt-1 text-xs text-stone-500">
            Upload your payment confirmation screenshot and enter the transaction reference so our administration can verify and issue your certificate.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700" htmlFor="payment-method">
                Payment Mode Used *
              </label>
              <select
                id="payment-method"
                className={inputClassName}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Other">Other / Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700" htmlFor="transaction-id">
                Transaction ID / UTR / Reference No. *
              </label>
              <input
                id="transaction-id"
                className={inputClassName}
                placeholder="e.g. UPI Ref 328491823910 or UTR..."
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Screenshot Upload Dropzone */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-stone-700">
              Payment Screenshot Proof *
            </label>
            <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-6 text-center transition hover:border-brand-orange">
              {screenshotPreview ? (
                <div className="space-y-3">
                  <img
                    src={screenshotPreview}
                    alt="Uploaded payment proof"
                    className="max-h-56 mx-auto rounded-lg border border-stone-200 object-contain shadow-sm"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <label className="cursor-pointer rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-800">
                      Change Screenshot
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotFile(null);
                        setScreenshotPreview(null);
                      }}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto size-12 text-stone-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <label className="mt-3 inline-block cursor-pointer rounded-full bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-orange-700">
                    Upload Payment Screenshot
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="mt-2 text-[11px] text-stone-500">
                    PNG, JPG, or WebP up to 10MB (Ensure amount & transaction ID are legible)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Member Address & Contact Verification */}
      <div>
        <label className="block font-serif text-lg font-bold text-stone-900">
          {isEditing ? "Member Information" : "4. Member Mailing & Official Details"}
        </label>
        <p className="mt-1 text-xs text-stone-500">
          This address will be officially registered on your certificate and foundation records.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700" htmlFor="member-address">
              Street Address *
            </label>
            <input
              id="member-address"
              name="address"
              className={inputClassName}
              placeholder="e.g. 42 Gandhi Road, Near Civil Lines"
              value={addressValues.address}
              onChange={updateAddress}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700" htmlFor="member-city">
                City *
              </label>
              <input
                id="member-city"
                name="city"
                className={inputClassName}
                placeholder="Rampur"
                value={addressValues.city}
                onChange={updateAddress}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700" htmlFor="member-state">
                State *
              </label>
              <input
                id="member-state"
                name="state"
                className={inputClassName}
                placeholder="Uttar Pradesh"
                value={addressValues.state}
                onChange={updateAddress}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700" htmlFor="member-zip">
                PIN / Postal Code *
              </label>
              <input
                id="member-zip"
                name="zipCode"
                className={inputClassName}
                placeholder="244901"
                value={addressValues.zipCode}
                onChange={updateAddress}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notice & Email Delivery info */}
      <div className="rounded-xl bg-stone-100 p-4 text-xs text-stone-600">
        <p className="font-semibold text-stone-900">
          📜 Certificate Delivery by Email:
        </p>
        <p className="mt-1">
          Once your payment proof is reviewed and approved by the foundation administrator, your official signed{" "}
          <strong className="text-stone-900">Membership Certificate (PDF)</strong> with a unique verification number will be automatically generated and emailed to{" "}
          <strong className="text-stone-900">{user?.email || "your email address"}</strong>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="min-h-12 flex-1 rounded-xl bg-brand-orange px-6 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-orange-900/10"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Submitting application..."
            : isEditing
              ? "Save membership changes"
              : `Submit Application & Proof (${formatCurrency(activeTierObj?.price || 0)})`}
        </button>
        {onCancel ? (
          <button
            className="min-h-12 rounded-xl border border-stone-300 px-6 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
