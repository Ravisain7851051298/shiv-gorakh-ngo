"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </Provider>
  );
}
