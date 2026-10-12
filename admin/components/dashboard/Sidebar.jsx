"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiHeart, FiLogOut } from "react-icons/fi";
import { DASHBOARD_BRAND, DASHBOARD_NAVIGATION } from "@/constants/dashboard";
import { useDashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getContentImageUrl } from "@/lib/authApi";
import { useSelector } from "react-redux";

export default function Sidebar() {
  const pathname = usePathname();
  const { expanded, loggingOut, mobileOpen, closeMobileNavigation, signOut, toggleExpanded } = useDashboardLayout();
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-slate-950/30 md:hidden"
          onClick={closeMobileNavigation}
          type="button"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#172d3a] px-3 py-3 text-slate-200 shadow-xl transition-[width,transform] duration-700 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 ${expanded ? "w-64" : "w-[76px]"}`}>
        {/* <div className={`flex h-10 items-center gap-3 px-2 ${expanded ? "" : "justify-center"}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500 text-lg text-white">
            <FiHeart />
          </span>
          {expanded && (
            <span className="whitespace-nowrap text-sm font-semibold text-white">
              {DASHBOARD_BRAND.name}{" "}
              <span className="font-normal text-slate-400">{DASHBOARD_BRAND.suffix}</span>
            </span>
          )}
        </div> */}

        {/* <p className={`mb-3 mt-10 px-2 text-[10px] font-bold tracking-[0.18em] text-slate-500 ${expanded ? "" : "text-center"}`}>
          {expanded ? "WORKSPACE" : "MENU"}
        </p> */}
        <nav aria-label="Dashboard navigation" className="grid gap-1.5">
          {DASHBOARD_NAVIGATION.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href === "/feedback" && pathname === "/reviews") ||
              (href === "/team-members" && pathname === "/team") ||
              (href === "/services" && pathname === "/our-services");
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                className={`flex h-10.5 w-full items-center gap-2 rounded-lg text-left transition ${isActive ? "bg-[#254350] text-white shadow-[inset_3px_0_#ef754b]" : "text-slate-400 hover:bg-white/5 hover:text-white"} ${expanded ? "px-4" : "justify-center"}`}
                href={href}
                key={href}
                onClick={closeMobileNavigation}
                title={expanded ? undefined : label}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {expanded && <span className="text-sm">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* <div className="mt-auto border-t border-white/10 pt-4">
          <div className={`flex min-h-12 items-center gap-2.5 px-1 ${expanded ? "" : "justify-center"}`}>
            <Link
              href="/profile"
              onClick={closeMobileNavigation}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition hover:bg-white/5"
              title="View profile"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-white/40 bg-[#f2d3b6] text-sm font-bold text-[#694634] overflow-hidden">
                {user?.profilePicture ? (
                  <img
                    src={getContentImageUrl(user.profilePicture)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.slice(0, 1)?.toUpperCase() || "A"
                )}
              </span>
              {expanded && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-white">{user?.name || "Administrator"}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">Administrator</span>
                </span>
              )}
            </Link>
            {expanded && (
              <button
                className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                disabled={loggingOut}
                onClick={signOut}
                title="Sign out"
                type="button"
              >
                <FiLogOut />
              </button>
            )}
          </div>
        </div> */}
        <button
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute -right-3 top-24 hidden h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 md:grid"
          onClick={toggleExpanded}
          type="button"
        >
          {expanded ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
      </aside>
    </>
  );
}
