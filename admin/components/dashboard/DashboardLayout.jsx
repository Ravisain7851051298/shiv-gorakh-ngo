"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import { DASHBOARD_NAVIGATION } from "@/constants/dashboard";
import { logout, refreshSession } from "@/store/authSlice";
import { contentApi } from "@/lib/authApi";


const DashboardLayoutContext = createContext(null);

const defaultContextValue = {
  expanded: true,
  mobileOpen: false,
  loggingOut: false,
  ngoSetting: null,
  refreshNgoSetting: async () => {},
  closeMobileNavigation: () => {},
  openMobileNavigation: () => {},
  toggleExpanded: () => {},
  signOut: async () => {},
};

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext);
  return context || defaultContextValue;
}

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
        Loading your workspace…
      </div>
    </main>
  );
}

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [ngoSetting, setNgoSetting] = useState(null);
  const isAuthRoute = Boolean(
    pathname && AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))
  );
  const isDashboardRoute = !isAuthRoute && pathname !== "/";

  const fetchNgoSetting = useCallback(async () => {
    try {
      const res = await contentApi.get("/ngo-settings");
      if (res.data?.success && res.data?.data) {
        setNgoSetting(res.data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNgoSetting();
  }, [fetchNgoSetting]);

  useEffect(() => {
    if (!isDashboardRoute) return;

    if (!initialized) {
      dispatch(refreshSession());
    } else if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [dispatch, initialized, isDashboardRoute, pathname, router, user]);

  const signOut = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const result = await dispatch(logout());
    if (logout.fulfilled.match(result)) {
      toast.success("You have been signed out.");
    } else {
      toast.error("Signed out locally, but the server session could not be invalidated.");
    }
    router.replace("/login");
  }, [dispatch, loggingOut, router]);

  const contextValue = useMemo(() => ({
    expanded,
    mobileOpen,
    loggingOut,
    ngoSetting,
    refreshNgoSetting: fetchNgoSetting,
    closeMobileNavigation: () => setMobileOpen(false),
    openMobileNavigation: () => setMobileOpen(true),
    toggleExpanded: () => setExpanded((current) => !current),
    signOut,
  }), [expanded, fetchNgoSetting, loggingOut, mobileOpen, ngoSetting, signOut]);

  if (!isDashboardRoute) return children;
  if (!initialized || !user) return <LoadingScreen />;

  return (
    <DashboardLayoutContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#f7f8fa]">
        <Sidebar />
        <div className={`min-h-screen transition-[margin] duration-200 ${expanded ? "md:ml-64" : "md:ml-[76px]"}`}>
          <DashboardHeader />
          {children}
        </div>
      </div>
    </DashboardLayoutContext.Provider>
  );
}
