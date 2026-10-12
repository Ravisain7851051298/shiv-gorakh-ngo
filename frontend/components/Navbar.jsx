"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getApiImageUrl } from "@/lib/authApi";
import { useNgoSettings } from "@/context/NgoSettingsContext";
import { motion, AnimatePresence } from "motion/react";
import {
  FiHome,
  FiTarget,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiImage,
  FiStar,
  FiBook,
  FiUserPlus,
  FiAward,
  FiFileText,
  FiInfo,
  FiShield,
  FiHeart,
  FiChevronDown,
  FiMenu,
  FiX,
  FiPhone,
  FiArrowUpRight,
  FiUser,
  FiActivity,
  FiGrid,
} from "react-icons/fi";

// ─── Nav Data ───────────────────────────────────────────────────────────────

const primaryLinks = [
  { label: "Home", href: "/", icon: FiHome },
  { label: "Campaigns", href: "/campaigns", icon: FiTarget },
];

const aboutUsLinks = [
  { label: "Who We Are", href: "/about-us#who-we-are", icon: FiInfo, desc: "Our story and mission" },
  { label: "Our Team Members", href: "/team-members", icon: FiUsers, desc: "Meet our dedicated team" },
  { label: "Mission & Vision", href: "/about-us#mission-vision", icon: FiActivity, desc: "What drives us" },
  { label: "Our Impact", href: "/about-us#impact", icon: FiHeart, desc: "Lives changed" },
  { label: "Why Choose Us", href: "/about-us#why-choose-us", icon: FiShield, desc: "Trust & transparency" },
];

const pageLinks = [
  { label: "Programs & Drives", href: "/programs", icon: FiGrid, desc: "Active welfare programs" },
  { label: "News & Blogs", href: "/news", icon: FiBook, desc: "Latest updates" },
  { label: "Testimonials", href: "/reviews", icon: FiStar, desc: "Community voices" },
  { label: "Events", href: "/events", icon: FiCalendar, desc: "Upcoming & past events" },
  { label: "Gallery", href: "/gallery", icon: FiImage, desc: "Field photos & videos" },
  { label: "Success Stories", href: "/stories", icon: FiBookOpen, desc: "Rescue stories" },
];

const joinLinks = [
  { label: "Join as a Member", href: "/membership", icon: FiUsers, desc: "Official foundation member" },
  { label: "Join as a Volunteer", href: "/volunteer/register", icon: FiUserPlus, desc: "Field volunteer corps" },
  { label: "Attend an Event", href: "/events", icon: FiCalendar, desc: "Participate in drives" },
];

const credentialLinks = [
  { label: "Get a Certificate", href: "/membership", icon: FiAward, desc: "Official recognition" },
  { label: "Get Your 80G Receipt", href: "/donate", icon: FiFileText, desc: "Tax exemption proof" },
  { label: "View NGO Credentials", href: "/certificates", icon: FiShield, desc: "Govt. registrations" },
];

// ─── Dropdown Menu ──────────────────────────────────────────────────────────

function DropdownMenu({ label, items, isOpen, onOpen, onClose, icon: Icon, align = "left" }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, onClose]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ${isOpen
          ? "bg-brand-orange text-white shadow-md shadow-orange-500/30"
          : "text-current hover:bg-orange-500/10 hover:text-brand-orange"
          }`}
      >
        {Icon && <Icon size={13} />}
        {label}
        <FiChevronDown
          size={12}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute top-full z-50 mt-2 w-64 ${align === "right" ? "right-0" : "left-0"}`}
          >
            {/* Orange accent top line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-brand-orange via-amber-400 to-orange-600" />
            <div className="overflow-hidden rounded-b-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-900/15 backdrop-blur-xl">
              <div className="p-2 space-y-0.5">
                {items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-orange-50 text-brand-orange transition-colors group-hover/item:bg-brand-orange group-hover/item:text-white">
                        <ItemIcon size={14} />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[12px] font-bold text-stone-800 group-hover/item:text-brand-orange transition-colors">
                          {item.label}
                        </span>
                        {item.desc && (
                          <span className="block text-[10px] text-stone-400 leading-tight mt-0.5 truncate">
                            {item.desc}
                          </span>
                        )}
                      </div>
                      <FiArrowUpRight
                        size={12}
                        className="ml-auto shrink-0 text-stone-300 opacity-0 -translate-x-1 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:text-brand-orange"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Accordion ────────────────────────────────────────────────────────

function MobileSection({ label, items, icon: Icon, onClose }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-orange-100/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-stone-800"
      >
        <span className="flex items-center gap-2.5">
          {Icon && (
            <span className="grid size-7 place-items-center rounded-lg bg-orange-100 text-brand-orange">
              <Icon size={13} />
            </span>
          )}
          {label}
        </span>
        <FiChevronDown
          size={14}
          className={`text-brand-orange transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 px-2 pb-3">
              {items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setOpen(false); onClose(); }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-orange-50"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-orange-50 text-brand-orange">
                      <ItemIcon size={12} />
                    </span>
                    <div>
                      <span className="block text-[12px] font-semibold text-stone-800">{item.label}</span>
                      {item.desc && (
                        <span className="block text-[10px] text-stone-400">{item.desc}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Navbar ─────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const user = useSelector((state) => state.auth.user);
  const { settings } = useNgoSettings();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Desktop dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);

  const isHomeAtTop = pathname === "/" && !hasScrolled;

  useEffect(() => {
    const updateScroll = () => setHasScrolled(window.scrollY > 20);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const emergencyPhone = settings?.phone || "+91 93369 50578";
  const ngoName = settings?.ngoName || "Shiv Gorakh Welfare Foundation";

  function openDrop(key) { setOpenDropdown(key); }
  function closeDrop() { setOpenDropdown(null); }

  return (
    <>
      <header
        className={`${pathname === "/" ? "fixed inset-x-0 top-0" : "sticky top-0"
          } z-50 transition-all duration-500 ${isHomeAtTop
            ? "border-transparent bg-transparent"
            : "border-b border-orange-100/80 bg-white/95 shadow-lg shadow-orange-900/5 backdrop-blur-xl"
          }`}
      >
        {/* Top emergency strip — only when scrolled in */}
        <AnimatePresence>
          {!isHomeAtTop && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-orange-100 bg-gradient-to-r from-orange-600 via-brand-orange to-amber-500"
            >
              <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-1.5 sm:px-10 lg:px-16">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-white">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                  </span>
                  24/7 Animal Emergency Rescue Active — Rampur, U.P.
                </div>
                <a
                  href={`tel:${emergencyPhone}`}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-orange"
                >
                  <FiPhone size={11} />
                  {emergencyPhone}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main nav bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-10 lg:px-16">
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label={`${ngoName} home`}
            onClick={() => { setMenuOpen(false); setOpenDropdown(null); }}
          >
            {settings?.logo ? (
              <img
                src={getApiImageUrl(settings.logo)}
                alt={ngoName}
                className="size-10 rounded-full object-cover ring-2 ring-brand-orange/60 shadow-sm transition group-hover:ring-brand-orange"
              />
            ) : (
              <div className="relative grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 font-serif text-sm font-bold text-white shadow-md shadow-orange-500/40 transition group-hover:shadow-orange-500/60">
                {settings?.logoInitials || "SG"}
                <span className="absolute -right-1 -top-1 text-xs text-emerald-400">✳</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span
                className={`block font-serif text-[15px] font-bold leading-tight tracking-tight transition-colors ${isHomeAtTop ? "text-white" : "text-stone-900"
                  }`}
              >
                {settings?.shortName || "Shiv Gorakh"}
              </span>
              <span
                className={`block font-sans text-[9px] font-semibold uppercase tracking-[0.15em] transition-colors ${isHomeAtTop ? "text-orange-300" : "text-brand-orange"
                  }`}
              >
                {settings?.suffix || "Welfare Foundation"}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            className={`hidden items-center gap-1 md:flex ${isHomeAtTop ? "text-white/90" : "text-stone-700"
              }`}
            aria-label="Main navigation"
          >
            {primaryLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 hover:bg-orange-500/10 hover:text-brand-orange ${pathname === href
                  ? "bg-orange-500/10 text-brand-orange"
                  : ""
                  }`}
                onClick={() => setOpenDropdown(null)}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}

            <DropdownMenu
              label="About Us"
              items={aboutUsLinks}
              isOpen={openDropdown === "about"}
              onOpen={() => openDrop("about")}
              onClose={closeDrop}
              icon={FiInfo}
              align="left"
            />

            <DropdownMenu
              label="Explore"
              items={pageLinks}
              isOpen={openDropdown === "explore"}
              onOpen={() => openDrop("explore")}
              onClose={closeDrop}
              icon={FiGrid}
              align="left"
            />

            <DropdownMenu
              label="Join Us"
              items={joinLinks}
              isOpen={openDropdown === "join"}
              onOpen={() => openDrop("join")}
              onClose={closeDrop}
              icon={FiUserPlus}
              align="right"
            />

            <DropdownMenu
              label="Certificates"
              items={credentialLinks}
              isOpen={openDropdown === "certs"}
              onOpen={() => openDrop("certs")}
              onClose={closeDrop}
              icon={FiAward}
              align="right"
            />
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/profile"
                className={`hidden sm:inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 px-3.5 text-[12px] font-bold transition-all hover:bg-brand-orange hover:text-white hover:border-brand-orange ${isHomeAtTop
                  ? "border-white/50 text-white bg-white/10 backdrop-blur-sm"
                  : "border-stone-300 text-stone-700 bg-white"
                  }`}
                onClick={() => setOpenDropdown(null)}
              >
                {user.profilePicture ? (
                  <img src={getApiImageUrl(user.profilePicture)} alt="" className="size-5 rounded-full object-cover" />
                ) : (
                  <FiUser size={13} />
                )}
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 px-3.5 text-[12px] font-bold transition-all hover:bg-stone-900 hover:text-white hover:border-stone-900 ${isHomeAtTop
                  ? "border-white/50 text-white bg-white/10 backdrop-blur-sm"
                  : "border-stone-300 text-stone-700 bg-white"
                  }`}
                onClick={() => setOpenDropdown(null)}
              >
                Sign in
              </Link>
            )}

            <Link
              href="/donate"
              className="inline-flex min-h-9 items-center gap-2 rounded-full bg-brand-orange px-4 text-[12px] font-bold text-white shadow-lg shadow-orange-500/40 transition-all hover:bg-orange-600 hover:shadow-orange-500/60 hover:scale-105 active:scale-95"
              onClick={() => { setMenuOpen(false); setOpenDropdown(null); }}
            >
              <FiHeart size={13} className="fill-white animate-pulse" />
              Donate Now
            </Link>

            {/* Mobile burger */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className={`inline-flex size-9 flex-col items-center justify-center gap-1.5 rounded-full border-2 transition-all md:hidden ${menuOpen || !isHomeAtTop
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-white/60 text-white bg-white/10 backdrop-blur-sm"
                }`}
            >
              <motion.div
                animate={menuOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                className="h-0.5 w-4 bg-current rounded-full"
              />
              <motion.div
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                className="h-0.5 w-4 bg-current rounded-full"
              />
              <motion.div
                animate={menuOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                className="h-0.5 w-4 bg-current rounded-full"
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-brand-orange to-amber-500 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-white/20 font-serif text-sm font-bold text-white">
                    {settings?.logoInitials || "SG"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{settings?.shortName || "Shiv Gorakh"}</p>
                    <p className="text-[10px] font-medium text-orange-100">{settings?.suffix || "Welfare Foundation"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="grid size-8 place-items-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                  aria-label="Close menu"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Emergency strip */}
              <a
                href={`tel:${emergencyPhone}`}
                className="flex items-center justify-center gap-2 border-b border-orange-100 bg-orange-50 px-5 py-2.5 text-[11px] font-bold text-brand-orange"
                onClick={() => setMenuOpen(false)}
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-rose-500" />
                </span>
                <FiPhone size={12} />
                24/7 Hotline: {emergencyPhone}
              </a>

              {/* Nav links */}
              <div className="pb-6">
                {/* Primary */}
                <div className="border-b border-orange-100/70">
                  {primaryLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 border-b border-orange-50 px-4 py-3.5 text-sm font-semibold text-stone-800 last:border-0 transition-colors hover:bg-orange-50 hover:text-brand-orange"
                    >
                      <span className="grid size-7 place-items-center rounded-lg bg-orange-100 text-brand-orange">
                        <Icon size={13} />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>

                <MobileSection label="About Us" items={aboutUsLinks} icon={FiInfo} onClose={() => setMenuOpen(false)} />
                <MobileSection label="Explore" items={pageLinks} icon={FiGrid} onClose={() => setMenuOpen(false)} />
                <MobileSection label="Join Us" items={joinLinks} icon={FiUserPlus} onClose={() => setMenuOpen(false)} />
                <MobileSection label="Certificates" items={credentialLinks} icon={FiAward} onClose={() => setMenuOpen(false)} />

                {/* Auth + donate */}
                <div className="mt-4 space-y-2 px-4">
                  {user ? (
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-stone-200 py-3 text-sm font-bold text-stone-800 transition hover:border-brand-orange hover:text-brand-orange"
                    >
                      <FiUser size={14} />
                      My Profile
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-stone-200 py-3 text-sm font-bold text-stone-800 transition hover:border-brand-orange hover:text-brand-orange"
                    >
                      Sign In
                    </Link>
                  )}
                  <Link
                    href="/donate"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/40 transition hover:bg-orange-600"
                  >
                    <FiHeart size={14} className="fill-white" />
                    Donate & Save a Life
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
