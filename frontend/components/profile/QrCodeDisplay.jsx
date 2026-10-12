"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCodeDisplay({
  value,
  size = 180,
  darkColor = "#0f172a",
  lightColor = "#ffffff",
  className = "",
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2, // 2x for retina display
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        setQrDataUrl(url);
        setError(false);
      })
      .catch((err) => {
        console.error("Failed to generate QR code:", err);
        setError(true);
      });
  }, [value, size, darkColor, lightColor]);

  if (error || !qrDataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-[10px] text-slate-400 font-mono ${className}`}
      >
        <div className="text-center p-2">
          <span className="block animate-pulse">Generating QR…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden rounded-xl bg-white p-1.5 shadow-sm border border-slate-200/90 flex items-center justify-center ${className}`}
    >
      <img
        src={qrDataUrl}
        alt="Official Credential Verification QR Code"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
