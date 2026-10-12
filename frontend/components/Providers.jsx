"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store";
import { refreshSession } from "@/store/authSlice";

import { NgoSettingsProvider } from "@/context/NgoSettingsContext";

function SessionLoader({ children }) {
  useEffect(() => {
    if (!store.getState().auth.initialized) {
      store.dispatch(refreshSession());
    }
  }, []);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <SessionLoader>
        <NgoSettingsProvider>
          {children}
        </NgoSettingsProvider>
      </SessionLoader>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#292524",
            color: "#fff",
          },
        }}
      />
    </Provider>
  );
}
