"use client";
import { useEffect } from "react";
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const base = location.pathname.startsWith("/pmwork/") ? "/pmwork" : "";
      navigator.serviceWorker.register(`${base}/sw.js`).catch(() => undefined);
    }
  }, []);
  return null;
}
