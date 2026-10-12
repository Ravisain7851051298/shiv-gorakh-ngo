"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiEdit3,
  FiGlobe,
  FiImage,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiShield,
  FiTrash2,
  FiUpload,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { contentApi, getContentImageUrl } from "@/lib/authApi";
import { useDashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function NgoSettingsManagement() {
  const { refreshNgoSetting } = useDashboardLayout();
  const [activeTab, setActiveTab] = useState("identity"); // 'identity' | 'founders' | 'contact' | 'social' | 'signatures'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ngoName: "",
    shortName: "",
    suffix: "",
    tagline: "",
    description: "",
    logoInitials: "SG",
    founderName: "",
    founderRole: "",
    founderBio: "",
    coFounderName: "",
    coFounderRole: "",
    coFounderBio: "",
    signatoryName: "Hari Om",
    signatoryRole: "Authorized Signatory",
    email: "",
    phone: "",
    alternatePhone: "",
    whatsapp: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    mapUrl: "",
    registrationNumber: "",
    taxExemption80G: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  });

  // Current Images from DB
  const [currentLogo, setCurrentLogo] = useState("");
  const [currentFounderImage, setCurrentFounderImage] = useState("");
  const [currentCoFounderImage, setCurrentCoFounderImage] = useState("");
  const [currentAuthorizedSignature, setCurrentAuthorizedSignature] = useState("");
  const [currentPresidentSignature, setCurrentPresidentSignature] = useState("");
  const [currentSecretarySignature, setCurrentSecretarySignature] = useState("");
  const [currentStampImage, setCurrentStampImage] = useState("");

  // New Uploaded Files & Previews
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [removeLogo, setRemoveLogo] = useState(false);

  const [founderFile, setFounderFile] = useState(null);
  const [founderPreview, setFounderPreview] = useState("");
  const [removeFounderImage, setRemoveFounderImage] = useState(false);

  const [coFounderFile, setCoFounderFile] = useState(null);
  const [coFounderPreview, setCoFounderPreview] = useState("");
  const [removeCoFounderImage, setRemoveCoFounderImage] = useState(false);

  // Signatures & Stamp Upload State
  const [authorizedSigFile, setAuthorizedSigFile] = useState(null);
  const [authorizedSigPreview, setAuthorizedSigPreview] = useState("");
  const [removeAuthorizedSignature, setRemoveAuthorizedSignature] = useState(false);

  const [presidentSigFile, setPresidentSigFile] = useState(null);
  const [presidentSigPreview, setPresidentSigPreview] = useState("");
  const [removePresidentSignature, setRemovePresidentSignature] = useState(false);

  const [secretarySigFile, setSecretarySigFile] = useState(null);
  const [secretarySigPreview, setSecretarySigPreview] = useState("");
  const [removeSecretarySignature, setRemoveSecretarySignature] = useState(false);

  const [stampFile, setStampFile] = useState(null);
  const [stampPreview, setStampPreview] = useState("");
  const [removeStampImage, setRemoveStampImage] = useState(false);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contentApi.get("/ngo-settings");
      if (data?.data) {
        const d = data.data;
        setFormData({
          ngoName: d.ngoName || "",
          shortName: d.shortName || "",
          suffix: d.suffix || "",
          tagline: d.tagline || "",
          description: d.description || "",
          logoInitials: d.logoInitials || "SG",
          founderName: d.founderName || "",
          founderRole: d.founderRole || "",
          founderBio: d.founderBio || "",
          coFounderName: d.coFounderName || "",
          coFounderRole: d.coFounderRole || "",
          coFounderBio: d.coFounderBio || "",
          email: d.email || "",
          phone: d.phone || "",
          alternatePhone: d.alternatePhone || "",
          whatsapp: d.whatsapp || "",
          addressLine: d.addressLine || "",
          city: d.city || "",
          state: d.state || "",
          pincode: d.pincode || "",
          country: d.country || "India",
          mapUrl: d.mapUrl || "",
          registrationNumber: d.registrationNumber || "",
          taxExemption80G: d.taxExemption80G || "",
          facebook: d.facebook || "",
          instagram: d.instagram || "",
          twitter: d.twitter || "",
          youtube: d.youtube || "",
          linkedin: d.linkedin || "",
        });

        setCurrentLogo(d.logo || "");
        setCurrentFounderImage(d.founderImage || "");
        setCurrentCoFounderImage(d.coFounderImage || "");
        setCurrentAuthorizedSignature(d.authorizedSignature || "");
        setCurrentPresidentSignature(d.presidentSignature || "");
        setCurrentSecretarySignature(d.secretarySignature || "");
        setCurrentStampImage(d.stampImage || "");
        if (d.signatoryName) setFormData((prev) => ({ ...prev, signatoryName: d.signatoryName }));
        if (d.signatoryRole) setFormData((prev) => ({ ...prev, signatoryRole: d.signatoryRole }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load NGO settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Image Upload Handlers
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file must be under 5MB.");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  };

  const handleFounderChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file must be under 8MB.");
      return;
    }
    setFounderFile(file);
    setFounderPreview(URL.createObjectURL(file));
    setRemoveFounderImage(false);
  };

  const handleCoFounderChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file must be under 8MB.");
      return;
    }
    setCoFounderFile(file);
    setCoFounderPreview(URL.createObjectURL(file));
    setRemoveCoFounderImage(false);
  };

  const handleAuthorizedSigChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Signature file must be under 5MB.");
      return;
    }
    setAuthorizedSigFile(file);
    setAuthorizedSigPreview(URL.createObjectURL(file));
    setRemoveAuthorizedSignature(false);
  };

  const handlePresidentSigChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Signature file must be under 5MB.");
      return;
    }
    setPresidentSigFile(file);
    setPresidentSigPreview(URL.createObjectURL(file));
    setRemovePresidentSignature(false);
  };

  const handleSecretarySigChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Signature file must be under 5MB.");
      return;
    }
    setSecretarySigFile(file);
    setSecretarySigPreview(URL.createObjectURL(file));
    setRemoveSecretarySignature(false);
  };

  const handleStampChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Stamp/Seal file must be under 5MB.");
      return;
    }
    setStampFile(file);
    setStampPreview(URL.createObjectURL(file));
    setRemoveStampImage(false);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        payload.append(key, val);
      });

      if (logoFile) {
        payload.append("logo", logoFile);
      } else if (removeLogo) {
        payload.append("removeLogo", "true");
      }

      if (founderFile) {
        payload.append("founderImage", founderFile);
      } else if (removeFounderImage) {
        payload.append("removeFounderImage", "true");
      }

      if (coFounderFile) {
        payload.append("coFounderImage", coFounderFile);
      } else if (removeCoFounderImage) {
        payload.append("removeCoFounderImage", "true");
      }

      if (authorizedSigFile) {
        payload.append("authorizedSignature", authorizedSigFile);
      } else if (removeAuthorizedSignature) {
        payload.append("removeAuthorizedSignature", "true");
      }

      if (presidentSigFile) {
        payload.append("presidentSignature", presidentSigFile);
      } else if (removePresidentSignature) {
        payload.append("removePresidentSignature", "true");
      }

      if (secretarySigFile) {
        payload.append("secretarySignature", secretarySigFile);
      } else if (removeSecretarySignature) {
        payload.append("removeSecretarySignature", "true");
      }

      if (stampFile) {
        payload.append("stampImage", stampFile);
      } else if (removeStampImage) {
        payload.append("removeStampImage", "true");
      }

      const { data } = await contentApi.post("/ngo-settings", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(data?.message || "Settings saved successfully!");
      if (data?.data) {
        setCurrentLogo(data.data.logo || "");
        setCurrentFounderImage(data.data.founderImage || "");
        setCurrentCoFounderImage(data.data.coFounderImage || "");
        setCurrentAuthorizedSignature(data.data.authorizedSignature || "");
        setCurrentPresidentSignature(data.data.presidentSignature || "");
        setCurrentSecretarySignature(data.data.secretarySignature || "");
        setCurrentStampImage(data.data.stampImage || "");
      }
      refreshNgoSetting?.();
      setLogoFile(null);
      setFounderFile(null);
      setCoFounderFile(null);
      setAuthorizedSigFile(null);
      setPresidentSigFile(null);
      setSecretarySigFile(null);
      setStampFile(null);
      setRemoveLogo(false);
      setRemoveFounderImage(false);
      setRemoveCoFounderImage(false);
      setRemoveAuthorizedSignature(false);
      setRemovePresidentSignature(false);
      setRemoveSecretarySignature(false);
      setRemoveStampImage(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Resolve image display URL
  const getDisplayLogo = () => {
    if (removeLogo) return "";
    if (logoPreview) return logoPreview;
    if (currentLogo) return getContentImageUrl(currentLogo);
    return "";
  };

  const getDisplayFounder = () => {
    if (removeFounderImage) return "/founders/HariOm.jpeg";
    if (founderPreview) return founderPreview;
    if (currentFounderImage) {
      return currentFounderImage.startsWith("/uploads/")
        ? getContentImageUrl(currentFounderImage)
        : currentFounderImage;
    }
    return "/founders/HariOm.jpeg";
  };

  const getDisplayCoFounder = () => {
    if (removeCoFounderImage) return "/founders/AnkitPandey.jpeg";
    if (coFounderPreview) return coFounderPreview;
    if (currentCoFounderImage) {
      return currentCoFounderImage.startsWith("/uploads/")
        ? getContentImageUrl(currentCoFounderImage)
        : currentCoFounderImage;
    }
    return "/founders/AnkitPandey.jpeg";
  };

  const getDisplayAuthorizedSig = () => {
    if (removeAuthorizedSignature) return "";
    if (authorizedSigPreview) return authorizedSigPreview;
    if (currentAuthorizedSignature) {
      return currentAuthorizedSignature.startsWith("/uploads/")
        ? getContentImageUrl(currentAuthorizedSignature)
        : currentAuthorizedSignature;
    }
    return "";
  };

  const getDisplayPresidentSig = () => {
    if (removePresidentSignature) return "";
    if (presidentSigPreview) return presidentSigPreview;
    if (currentPresidentSignature) {
      return currentPresidentSignature.startsWith("/uploads/")
        ? getContentImageUrl(currentPresidentSignature)
        : currentPresidentSignature;
    }
    return "";
  };

  const getDisplaySecretarySig = () => {
    if (removeSecretarySignature) return "";
    if (secretarySigPreview) return secretarySigPreview;
    if (currentSecretarySignature) {
      return currentSecretarySignature.startsWith("/uploads/")
        ? getContentImageUrl(currentSecretarySignature)
        : currentSecretarySignature;
    }
    return "";
  };

  const getDisplayStamp = () => {
    if (removeStampImage) return "";
    if (stampPreview) return stampPreview;
    if (currentStampImage) {
      return currentStampImage.startsWith("/uploads/")
        ? getContentImageUrl(currentStampImage)
        : currentStampImage;
    }
    return "";
  };

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            NGO Profile &amp; Contact Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dynamically manage organization name, logo, founders, contact helpline, address, and social links displayed across the client website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-slate-200/70 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "identity"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <FiShield className="text-orange-500" />
          <span>Identity &amp; Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("founders")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "founders"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <FiUsers className="text-orange-500" />
          <span>Founders &amp; Leadership</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "contact"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <FiPhone className="text-orange-500" />
          <span>Contact &amp; Address</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "social"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <FiGlobe className="text-orange-500" />
          <span>Social &amp; Legal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("signatures")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "signatures"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <FiEdit3 className="text-orange-500" />
          <span>Official Signatures &amp; Seals</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
            Loading NGO profile settings…
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ==================================================== */}
          {/* TAB 1: IDENTITY & BRANDING */}
          {/* ==================================================== */}
          {activeTab === "identity" && (
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">Foundation Identity &amp; Names</h3>
                  <p className="text-xs text-slate-500">
                    Controls the title, header brand, and descriptions across the NGO website.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Full NGO Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Shiv Gorakh Welfare Foundation"
                      value={formData.ngoName}
                      onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Short Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="Shiv Gorakh"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Brand Suffix / Tag
                    </label>
                    <input
                      type="text"
                      placeholder="Welfare Foundation"
                      value={formData.suffix}
                      onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Tagline / Motto
                    </label>
                    <input
                      type="text"
                      placeholder="Care, dignity, and hope—made stronger when we do it together."
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      About Description (Mission Statement)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the foundation's purpose, local community roots, and welfare missions..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Logo & Initials Section */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Logo &amp; Brand Icon
                  </h4>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:items-center">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Default Logo Initials
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="SG"
                        value={formData.logoInitials}
                        onChange={(e) =>
                          setFormData({ ...formData, logoInitials: e.target.value.toUpperCase() })
                        }
                        className="mt-1 w-24 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-bold uppercase text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">
                        Displayed when no custom logo image is uploaded.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Upload Custom Logo (PNG / JPG / SVG)
                      </label>
                      <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50/50">
                        <FiUpload className="text-orange-500" />
                        <span>Choose logo image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Website Header Preview
                  </h4>

                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-orange-100 bg-[#fffaf4] p-4 shadow-sm">
                    {getDisplayLogo() ? (
                      <div className="relative h-11 w-11 overflow-hidden rounded-full border border-orange-200 bg-white">
                        <Image
                          src={getDisplayLogo()}
                          alt="NGO Logo"
                          fill
                          sizes="44px"
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="relative grid h-10 w-10 place-items-center rounded-full bg-orange-600 font-serif text-sm font-bold text-white shadow-sm">
                        {formData.logoInitials || "SG"}
                        <span className="absolute -right-1 -top-1 text-xs text-emerald-400">✳</span>
                      </div>
                    )}

                    <div>
                      <span className="font-serif text-base font-bold text-stone-900">
                        {formData.shortName || "Shiv Gorakh"}
                      </span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-500">
                        {formData.suffix || "Welfare Foundation"}
                      </span>
                    </div>
                  </div>

                  {getDisplayLogo() && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview("");
                        setRemoveLogo(true);
                      }}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                    >
                      <FiTrash2 />
                      <span>Remove custom logo &amp; use initials</span>
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-stone-900 p-5 text-orange-50 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
                    Website Footer Preview
                  </h4>
                  <p className="mt-2 text-xs italic text-stone-300">
                    &quot;{formData.tagline || "Care, dignity, and hope—made stronger when we do it together."}&quot;
                  </p>
                  <p className="mt-3 text-[11px] text-stone-400">
                    © {new Date().getFullYear()} {formData.ngoName || "Shiv Gorakh Welfare Foundation"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: FOUNDERS & LEADERSHIP */}
          {/* ==================================================== */}
          {activeTab === "founders" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Founder 1 Card */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-orange-500" />
                    <h3 className="text-sm font-bold text-slate-800">Primary Founder Profile</h3>
                  </div>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800">
                    Leadership
                  </span>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-orange-200 bg-slate-100 shadow-md">
                    <Image
                      src={getDisplayFounder()}
                      alt="Founder profile"
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Founder Profile Picture
                    </label>
                    <label className="mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                      <FiUpload className="text-orange-500" />
                      <span>Upload Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFounderChange}
                        className="hidden"
                      />
                    </label>
                    {(founderPreview || (currentFounderImage && currentFounderImage.startsWith("/uploads/"))) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFounderFile(null);
                          setFounderPreview("");
                          setRemoveFounderImage(true);
                        }}
                        className="ml-3 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Founder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Hari Om"
                    value={formData.founderName}
                    onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="Founder, Shiv Gorakh Welfare Foundation"
                    value={formData.founderRole}
                    onChange={(e) => setFormData({ ...formData, founderRole: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Bio / Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short vision or dedicated work note..."
                    value={formData.founderBio}
                    onChange={(e) => setFormData({ ...formData, founderBio: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Co-Founder Card */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-orange-500" />
                    <h3 className="text-sm font-bold text-slate-800">Co-Founder Profile</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                    Co-Founder
                  </span>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-orange-200 bg-slate-100 shadow-md">
                    <Image
                      src={getDisplayCoFounder()}
                      alt="Co-Founder profile"
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Co-Founder Profile Picture
                    </label>
                    <label className="mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                      <FiUpload className="text-orange-500" />
                      <span>Upload Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoFounderChange}
                        className="hidden"
                      />
                    </label>
                    {(coFounderPreview || (currentCoFounderImage && currentCoFounderImage.startsWith("/uploads/"))) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoFounderFile(null);
                          setCoFounderPreview("");
                          setRemoveCoFounderImage(true);
                        }}
                        className="ml-3 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Co-Founder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Ankit Pandey"
                    value={formData.coFounderName}
                    onChange={(e) => setFormData({ ...formData, coFounderName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="Co-Founder, Shiv Gorakh Welfare Foundation"
                    value={formData.coFounderRole}
                    onChange={(e) => setFormData({ ...formData, coFounderRole: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Bio / Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short vision or dedicated work note..."
                    value={formData.coFounderBio}
                    onChange={(e) => setFormData({ ...formData, coFounderBio: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: CONTACT & ADDRESS */}
          {/* ==================================================== */}
          {activeTab === "contact" && (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Official Communication &amp; Physical Address
                </h3>
                <p className="text-xs text-slate-500">
                  Updated here, these phone numbers, emails, and address dynamically sync across the website footer, contact section, and donation page.
                </p>
              </div>

              {/* Communication Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Official Email Address
                  </label>
                  <div className="relative mt-1">
                    <FiMail className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="info@shivgorakh.org.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Primary Helpline Phone
                  </label>
                  <div className="relative mt-1">
                    <FiPhone className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="+91 93369 50578"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Alternate Phone
                  </label>
                  <div className="relative mt-1">
                    <FiPhone className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+91 97590 57143"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    WhatsApp Helpline
                  </label>
                  <div className="relative mt-1">
                    <FiPhone className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+91 93369 50578"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Address Grid */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Head Office / Registered Address
                </h4>

                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Street / Village Address
                    </label>
                    <input
                      type="text"
                      placeholder="Mohammad Pur Jadied, Keorar, Milak"
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      City / District
                    </label>
                    <input
                      type="text"
                      placeholder="Rampur"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="Uttar Pradesh"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      placeholder="244701"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: SOCIAL & LEGAL */}
          {/* ==================================================== */}
          {activeTab === "social" && (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Social Media Links &amp; Registration Details
                </h3>
                <p className="text-xs text-slate-500">
                  Connect your foundation&apos;s verified public social channels and official registration details.
                </p>
              </div>

              {/* Registration & Legal */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="244701/SG-2022"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationNumber: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    80G Tax Exemption Note
                  </label>
                  <input
                    type="text"
                    placeholder="Eligible for 80G Tax Exemption"
                    value={formData.taxExemption80G}
                    onChange={(e) =>
                      setFormData({ ...formData, taxExemption80G: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Social Media Links (URLs)
                </h4>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/shivgorakhfoundation"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/shivgorakhfoundation"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@shivgorakh"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Twitter / X URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://x.com/shivgorakh"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: OFFICIAL SIGNATURES & SEALS                   */}
          {/* ==================================================== */}
          {activeTab === "signatures" && (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs text-amber-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📜</span>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">
                      Official Document Signatures &amp; Seals Architecture
                    </h4>
                    <p className="mt-1 leading-relaxed text-stone-700">
                      Signatures uploaded here are dynamically embedded into all official PDF documents generated by the system:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-stone-600">
                      <li>
                        <strong>80G Donation Tax Receipts (PDF)</strong> use the <em>Authorized Signatory Signature</em>.
                      </li>
                      <li>
                        <strong>Membership Certificates (PDF)</strong> use the <em>President Signature</em>, <em>General Secretary Signature</em>, and optional <em>Foundation Stamp / Seal</em>.
                      </li>
                      <li>
                        <strong>Recommended Format:</strong> PNG image with transparent background (clean scan, minimum 300x120px) for crisp printing.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Authorized Signatory (Donation Receipts) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                          Used in 80G Donation Receipts
                        </span>
                        <h4 className="font-serif text-base font-bold text-slate-900">
                          Authorized Signatory Signature
                        </h4>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        Primary
                      </span>
                    </div>

                    {/* Live Preview Box */}
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                        Receipt Preview Simulation
                      </span>
                      <div className="mx-auto h-24 max-w-xs flex flex-col items-center justify-end border-b border-slate-400 pb-1">
                        {getDisplayAuthorizedSig() ? (
                          <img
                            src={getDisplayAuthorizedSig()}
                            alt="Authorized Signature"
                            className="max-h-20 w-auto object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs italic text-slate-400">
                            No signature uploaded (Text fallback used)
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs font-bold text-slate-900">
                        {formData.signatoryName || "Hari Om"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formData.signatoryRole || "Authorized Signatory"}
                      </p>
                    </div>

                    {/* Inputs */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Signatory Printed Name
                        </label>
                        <input
                          type="text"
                          value={formData.signatoryName}
                          onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-400 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Designation / Title
                        </label>
                        <input
                          type="text"
                          value={formData.signatoryRole}
                          onChange={(e) => setFormData({ ...formData, signatoryRole: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-400 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black transition">
                      <FiUpload />
                      <span>{getDisplayAuthorizedSig() ? "Change Signature" : "Upload Signature"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAuthorizedSigChange}
                        className="hidden"
                      />
                    </label>

                    {getDisplayAuthorizedSig() && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthorizedSigFile(null);
                          setAuthorizedSigPreview("");
                          setRemoveAuthorizedSignature(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        <FiTrash2 />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. President Signature (Certificate - Left) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Used in Membership Certificate
                        </span>
                        <h4 className="font-serif text-base font-bold text-slate-900">
                          President / Founder Signature
                        </h4>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        Left Signatory
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                        Certificate Preview Simulation
                      </span>
                      <div className="mx-auto h-24 max-w-xs flex flex-col items-center justify-end border-b border-slate-400 pb-1">
                        {getDisplayPresidentSig() ? (
                          <img
                            src={getDisplayPresidentSig()}
                            alt="President Signature"
                            className="max-h-20 w-auto object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs italic text-slate-400">
                            No president signature (uses default fallback)
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs font-bold text-slate-900">
                        {formData.founderName || "Hari Om"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formData.founderRole || "Founder & President"}
                      </p>
                    </div>

                    <p className="mt-3 text-[11px] text-slate-500">
                      Linked to Founder profile details. To edit name and bio, visit the <em>Founders &amp; Leadership</em> tab.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black transition">
                      <FiUpload />
                      <span>{getDisplayPresidentSig() ? "Change Signature" : "Upload President Signature"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePresidentSigChange}
                        className="hidden"
                      />
                    </label>

                    {getDisplayPresidentSig() && (
                      <button
                        type="button"
                        onClick={() => {
                          setPresidentSigFile(null);
                          setPresidentSigPreview("");
                          setRemovePresidentSignature(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        <FiTrash2 />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Secretary Signature (Certificate - Right) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          Used in Membership Certificate
                        </span>
                        <h4 className="font-serif text-base font-bold text-slate-900">
                          Secretary / Co-Founder Signature
                        </h4>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        Right Signatory
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                        Certificate Preview Simulation
                      </span>
                      <div className="mx-auto h-24 max-w-xs flex flex-col items-center justify-end border-b border-slate-400 pb-1">
                        {getDisplaySecretarySig() ? (
                          <img
                            src={getDisplaySecretarySig()}
                            alt="Secretary Signature"
                            className="max-h-20 w-auto object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs italic text-slate-400">
                            No secretary signature uploaded
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs font-bold text-slate-900">
                        {formData.coFounderName || "Ankit Pandey"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formData.coFounderRole || "Co-Founder & Secretary"}
                      </p>
                    </div>

                    <p className="mt-3 text-[11px] text-slate-500">
                      Linked to Co-Founder profile details. To edit name and bio, visit the <em>Founders &amp; Leadership</em> tab.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black transition">
                      <FiUpload />
                      <span>{getDisplaySecretarySig() ? "Change Signature" : "Upload Secretary Signature"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleSecretarySigChange}
                        className="hidden"
                      />
                    </label>

                    {getDisplaySecretarySig() && (
                      <button
                        type="button"
                        onClick={() => {
                          setSecretarySigFile(null);
                          setSecretarySigPreview("");
                          setRemoveSecretarySignature(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        <FiTrash2 />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Official Foundation Stamp / Round Seal (Center) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                          Used in Receipts &amp; Certificates
                        </span>
                        <h4 className="font-serif text-base font-bold text-slate-900">
                          Official Stamp / Round Seal Image
                        </h4>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        Center Seal
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                        Official Seal Preview
                      </span>
                      <div className="mx-auto size-24 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-inner">
                        {getDisplayStamp() ? (
                          <img
                            src={getDisplayStamp()}
                            alt="Official Stamp"
                            className="size-20 object-contain rounded-full"
                          />
                        ) : (
                          <div className="text-center">
                            <span className="text-[10px] font-bold text-amber-700 block">OFFICIAL</span>
                            <span className="text-[9px] text-emerald-800 font-bold block">SEAL</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-900">
                        Shiv Gorakh Welfare Foundation
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Rampur, Uttar Pradesh
                      </p>
                    </div>

                    <p className="mt-3 text-[11px] text-slate-500">
                      When uploaded, replaces the generic vector seal with your organization&apos;s physical registered stamp.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black transition">
                      <FiUpload />
                      <span>{getDisplayStamp() ? "Change Stamp Image" : "Upload Stamp / Seal"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleStampChange}
                        className="hidden"
                      />
                    </label>

                    {getDisplayStamp() && (
                      <button
                        type="button"
                        onClick={() => {
                          setStampFile(null);
                          setStampPreview("");
                          setRemoveStampImage(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        <FiTrash2 />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Save Bar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FiInfo className="text-orange-500" />
              <span>Changes made here take effect across the entire public NGO website immediately upon saving.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Saving Settings…</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
