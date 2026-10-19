"use client";
import { useSyncExternalStore } from "react";
import type { Locale } from "@/domain/schemas";

const sizes = ["standard", "large", "extra-large"] as const;
function valid(value: string | null | undefined) {
  return sizes.find(size => size === value) ?? "standard";
}
function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === "pmwork-text-size" || event.key === null) {
      document.documentElement.dataset.textSize = valid(event.newValue);
      notify();
    }
  };
  window.addEventListener("pmwork-text-size", notify);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener("pmwork-text-size", notify);
    window.removeEventListener("storage", storage);
  };
}
export function TextSizeSetting({ locale }: { locale: Locale }) {
  const value = useSyncExternalStore(subscribe, () => valid(document.documentElement.dataset.textSize), () => "standard");
  const labels = locale === "ru" ? ["Стандартный", "Увеличенный", "Крупный"] : ["Standard", "Enlarged", "Large"];
  return <label className="field"><span>{locale === "ru" ? "Размер текста" : "Text size"}</span><select value={value} onChange={event => {
    const next = valid(event.target.value);
    document.documentElement.dataset.textSize = next;
    try { localStorage.setItem("pmwork-text-size", next); } catch { /* The session preference remains available. */ }
    window.dispatchEvent(new Event("pmwork-text-size"));
  }}>{sizes.map((size, index) => <option key={size} value={size}>{labels[index]}</option>)}</select></label>;
}
