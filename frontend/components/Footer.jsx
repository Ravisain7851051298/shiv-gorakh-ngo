"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa6";
import { FiMail, FiPhone, FiMapPin, FiArrowUp } from "react-icons/fi";
import { getNgoSettings } from "@/lib/contentService";
import { getApiImageUrl } from "@/lib/authApi";
import { useNgoSettings } from "@/context/NgoSettingsContext";

const DEFAULT_SETTINGS = {
  ngoName: "Shiv Gorakh Welfare Foundation",
  shortName: "Shiv Gorakh",
  suffix: "Welfare Foundation",
  tagline: "Care, dignity, and hope—made stronger when we do it together.",
  logoInitials: "SG",
  email: "info@shivgorakh.org.in",
  phone: "+91 93369 50578",
  alternatePhone: "+91 97590 57143",
  whatsapp: "+91 93369 50578",
  addressLine: "Mohammad Pur Jadied, Keorar, Milak",
  city: "Rampur",
  state: "Uttar Pradesh",
  pincode: "244701",
  country: "India",
  mapUrl: "",
  registrationNumber: "244701/SG-2022",
  taxExemption80G: "Eligible for 80G Tax Exemption",
  facebook:
    "https://www.facebook.com/p/%E0%A4%B6%E0%A4%BF%E0%A4%B5-%E0%A4%97%E0%A5%8B%E0%A4%B0%E0%A4%96-%E0%A4%B5%E0%A5%87%E0%A4%B2%E0%A4%AB%E0%A5%87%E0%A4%AF%E0%A4%B0-%E0%A4%AB%E0%A4%BE%E0%A4%89%E0%A4%82%E0%A4%A1%E0%A5%87%E0%A4%B6%E0%A4%A8-61557318729252/",
  instagram: "",
  twitter: "",
  youtube: "",
  linkedin: "",
};

function cleanPhoneForTel(phone) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

function cleanPhoneForWhatsapp(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

export default function Footer() {
  const { settings: contextSettings } = useNgoSettings();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (contextSettings) {
      setSettings((prev) => ({
        ...prev,
        ...contextSettings,
      }));
    }
  }, [contextSettings]);

  useEffect(() => {
    async function fetchSettings() {
      const res = await getNgoSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    }
    fetchSettings();
  }, []);

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Format Address lines dynamically
  const addressParts = [
    settings.addressLine,
    [settings.city, settings.state, settings.pincode].filter(Boolean).join(", "),
    settings.country && settings.country !== "India" ? settings.country : "",
  ].filter(Boolean);

  // Social Links list
  const socialLinks = [
    {
      name: "Facebook",
      href: settings.facebook,
      icon: FaFacebookF,
      color: "hover:bg-[#1877F2] hover:text-white",
    },
    {
      name: "Instagram",
      href: settings.instagram,
      icon: FaInstagram,
      color: "hover:bg-[#E4405F] hover:text-white",
    },
    {
      name: "Twitter / X",
      href: settings.twitter,
      icon: FaXTwitter,
      color: "hover:bg-black hover:text-white",
    },
    {
      name: "YouTube",
      href: settings.youtube,
      icon: FaYoutube,
      color: "hover:bg-[#FF0000] hover:text-white",
    },
    {
      name: "LinkedIn",
      href: settings.linkedin,
      icon: FaLinkedinIn,
      color: "hover:bg-[#0A66C2] hover:text-white",
    },
    {
      name: "WhatsApp",
      href: settings.whatsapp
        ? `https://wa.me/${cleanPhoneForWhatsapp(settings.whatsapp)}`
        : "",
      icon: FaWhatsapp,
      color: "hover:bg-[#25D366] hover:text-white",
    },
  ].filter((item) => Boolean(item.href && item.href.trim()));

  return (
    <footer className="bg-stone-900 text-orange-50 border-t border-stone-800">
      {/* Main Footer Container */}
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 md:gap-6 lg:gap-8">
          {/* ==================================================== */}
          {/* Column 1: Brand, Tagline, Socials                     */}
          {/* ==================================================== */}
          <div className="space-y-4">
            <Link
              className="group inline-flex items-center gap-3"
              href="/"
              aria-label={`${settings.ngoName || "Shiv Gorakh Welfare Foundation"} home`}
            >
              {settings.logo ? (
                <span className="relative size-11 shrink-0">
                  <img
                    src={getApiImageUrl(settings.logo)}
                    alt={settings.ngoName || "NGO Logo"}
                    className="size-11 rounded-full object-cover shadow-md transition-transform group-hover:scale-105 shrink-0 ring-2 ring-brand-orange/60 bg-white"
                  />
                </span>
              ) : (
                <span className="relative grid size-11 place-items-center rounded-full bg-brand-orange font-serif text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105 shrink-0">
                  {settings.logoInitials || "SG"}
                  <span className="absolute -right-1 -top-1 text-sm text-brand-green">✳</span>
                </span>
              )}
              <span className="font-serif text-lg font-bold leading-tight tracking-tight text-white">
                {settings.shortName || "Shiv Gorakh"}
                <span className="mt-0.5 block font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400">
                  {settings.suffix || "Welfare Foundation"}
                </span>
              </span>
            </Link>

            <p className="max-w-sm font-serif text-xs sm:text-sm leading-6 text-stone-300">
              {settings.tagline || "Care, dignity, and hope—made stronger when we do it together."}
            </p>

            {/* Social Links Icons */}
            {socialLinks.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300 mb-2">
                  Follow &amp; Connect
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {socialLinks.map(({ name, href, icon: Icon, color }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow on ${name}`}
                      title={name}
                      className={`grid size-8 sm:size-9 place-items-center rounded-full border border-stone-700 bg-stone-800/90 text-stone-300 transition-all duration-200 hover:-translate-y-0.5 ${color}`}
                    >
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Registration / Trust details */}
            {/* {(settings.registrationNumber || settings.taxExemption80G) && (
              <div className="pt-2 text-[11px] text-stone-400 space-y-1">
                {settings.registrationNumber && (
                  <p>
                    <span className="text-stone-500 font-semibold">Registration:</span>{" "}
                    <span className="font-mono text-stone-300">{settings.registrationNumber}</span>
                  </p>
                )}
                {settings.taxExemption80G && (
                  <p className="text-emerald-400/90 font-medium">
                    ✓ {settings.taxExemption80G}
                  </p>
                )}
              </div>
            )} */}
          </div>

          {/* ==================================================== */}
          {/* Column 2: Initiatives & Media                         */}
          {/* ==================================================== */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
              Initiatives &amp; Media
            </h2>
            <nav className="flex flex-col space-y-2 text-xs text-stone-300" aria-label="Initiatives links">
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all text-amber-300 font-semibold" href="/our-services">
                Our services &amp; rescue
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/programs">
                Welfare programs
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/campaigns">
                Fundraising appeals
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/events">
                Events &amp; drives
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/stories">
                Field stories
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/gallery">
                Photo gallery
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/news">
                News &amp; blogs
              </Link>
            </nav>
          </div>

          {/* ==================================================== */}
          {/* Column 3: Get Involved                                */}
          {/* ==================================================== */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
              Get Involved
            </h2>
            <nav className="flex flex-col space-y-2 text-xs text-stone-300" aria-label="Get involved links">
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/donate">
                Donation portal
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/volunteer/register">
                Volunteer register
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/membership">
                Membership portal
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/reviews">
                Reviews &amp; feedback
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/certificates">
                Certificates &amp; legal
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/about-us">
                About our mission
              </Link>
              <Link className="hover:text-orange-200 hover:translate-x-0.5 transition-all" href="/team-members">
                Our team members
              </Link>
            </nav>
          </div>

          {/* ==================================================== */}
          {/* Column 4: Contact, Address, Helpline                  */}
          {/* ==================================================== */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
                Contact &amp; Address
              </h2>
            </div>

            <div className="space-y-3 md:space-y-4 text-xs leading-relaxed text-stone-300">
              {/* Dynamic Email */}
              {settings.email && (
                <div className="flex items-start gap-2.5">
                  <FiMail className="mt-0.5 shrink-0 text-brand-orange" size={14} />
                  <a
                    className="break-all hover:text-orange-200 hover:underline transition"
                    href={`mailto:${settings.email}`}
                  >
                    {settings.email}
                  </a>
                </div>
              )}

              {/* Dynamic Phone Numbers */}
              {settings.phone && (
                <div className="flex items-start gap-2.5">
                  <FiPhone className="mt-0.5 shrink-0 text-brand-orange" size={14} />
                  <div className="space-y-0.5">
                    <a
                      className="block hover:text-orange-200 hover:underline transition"
                      href={`tel:${cleanPhoneForTel(settings.phone)}`}
                    >
                      {settings.phone}
                    </a>
                    {settings.alternatePhone && settings.alternatePhone !== settings.phone && (
                      <a
                        className="block text-stone-400 hover:text-orange-200 hover:underline transition"
                        href={`tel:${cleanPhoneForTel(settings.alternatePhone)}`}
                      >
                        {settings.alternatePhone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Address */}
              {addressParts.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <FiMapPin className="mt-0.5 shrink-0 text-brand-orange" size={14} />
                  <div>
                    <p className="whitespace-pre-line text-stone-300 leading-5">
                      {addressParts.join("\n")}
                    </p>
                    {settings.mapUrl && (
                      <a
                        href={settings.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange hover:underline"
                      >
                        Open Google Maps ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* WhatsApp Helpline Button */}
              {/* {settings.whatsapp && (
                <div className="flex items-center justify-between gap-10 pt-1">
                  <a
                    href={`https://wa.me/${cleanPhoneForWhatsapp(settings.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600/20 border border-emerald-500/40 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
                  >
                    <FaWhatsapp size={35} />
                    <span>Emergency Helpline</span>
                  </a>
                  <button
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Scroll back to top"
                    className="inline-flex border-1 rounded-full border-brand-orange items-center p-1 text-[11px] font-semibold text-stone-400 hover:text-orange-300 transition"
                  >
                    <FiArrowUp size={25} />
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* Footer Bottom Bar (Legal & Copyright)                 */}
        {/* ==================================================== */}
        <div className="pt-6 border-t border-stone-800 flex flex-col gap-3 text-[11px] text-stone-400 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {settings.ngoName || "Shiv Gorakh Welfare Foundation"}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1">
            <Link href="/about-us" className="hover:text-orange-200 transition">
              About Us
            </Link>
            <span>•</span>
            <Link href="/certificates" className="hover:text-orange-200 transition">
              Legal Transparency
            </Link>
            <span>•</span>
            <span>
              Designed & Maintained By{" "}
              <Link href="https://zdctechglobalsolutions.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-200 transition">
                ZDC Tech Global Solutions
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}