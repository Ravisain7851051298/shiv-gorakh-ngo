"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBell, FiLogOut, FiMenu, FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import { DASHBOARD_NAVIGATION } from "@/constants/dashboard";
import { useDashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getContentImageUrl } from "@/lib/authApi";

export default function DashboardHeader() {
  const pathname = usePathname();
  const { loggingOut, openMobileNavigation, signOut, ngoSetting } = useDashboardLayout();
  const user = useSelector((state) => state.auth.user);
  const activePage = DASHBOARD_NAVIGATION.find(
    ({ href }) =>
      href === pathname ||
      (href === "/feedback" && pathname === "/reviews") ||
      (href === "/team-members" && pathname === "/team")
  );
  const activeNav = activePage?.label || "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-17.5 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          onClick={openMobileNavigation}
          type="button"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <div>
          <p className="mb-1 text-[11px] text-slate-400">
            Workspace <span className="px-1.5 text-slate-300">/</span>
            <span className="text-slate-600">{activeNav}</span>
          </p>
          <h1 className="text-base font-bold tracking-tight text-slate-800">{activeNav}</h1>
        </div>
      </div>

      {/* Dynamic Organization Header Branding */}
      <div className="hidden md:flex items-center gap-3 rounded-full border border-orange-100 bg-orange-50/70 px-3.5 py-1.5 shadow-2xs">
        {ngoSetting?.logo ? (
          <img
            src={getContentImageUrl(ngoSetting.logo)}
            alt={ngoSetting.ngoName || "NGO Logo"}
            className="size-7.5 rounded-full object-cover ring-2 ring-orange-400/40 bg-white shadow-2xs shrink-0"
          />
        ) : (
          <span className="grid size-7.5 place-items-center rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-2xs shrink-0">
            {ngoSetting?.logoInitials || "SG"}
          </span>
        )}
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">
              {ngoSetting?.shortName || ngoSetting?.ngoName || "Shiv Gorakh"}
            </span>
            {ngoSetting?.suffix && (
              <span className="text-[11px] font-medium text-slate-500 hidden xl:inline">
                {ngoSetting.suffix}
              </span>
            )}
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-emerald-800">
              Admin
            </span>
          </div>
          {ngoSetting?.registrationNumber ? (
            <span className="text-[9.5px] font-medium text-slate-400">
              Reg: {ngoSetting.registrationNumber}
            </span>
          ) : (
            <span className="text-[9.5px] font-medium text-orange-600/80">
              Official Administration
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden h-8 w-px bg-slate-200 sm:block" />
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-slate-50 transition"
          title="View profile"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 overflow-hidden">
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
          <span className="hidden max-w-28 truncate text-xs font-semibold text-slate-700 sm:block">
            {user?.name || "Admin"}
          </span>
        </Link>
        <button
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          disabled={loggingOut}
          onClick={signOut}
          title="Sign out"
          type="button"
        >
          <FiLogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
