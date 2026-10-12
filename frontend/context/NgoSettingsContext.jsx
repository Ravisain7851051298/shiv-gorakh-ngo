"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getNgoSettings } from "@/lib/contentService";

const NgoSettingsContext = createContext({
  settings: null,
  loading: true,
  refreshSettings: () => {},
});

export function NgoSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await getNgoSettings();
      if (res?.success && res?.data) {
        setSettings(res.data);
      }
    } catch (e) {
      console.error("Failed to load NGO settings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <NgoSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </NgoSettingsContext.Provider>
  );
}

export function useNgoSettings() {
  const context = useContext(NgoSettingsContext);
  return context || { settings: null, loading: false, refreshSettings: () => {} };
}
