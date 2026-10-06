"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
function applyTheme(dark: boolean) {
  const root = document.documentElement;
  const theme = dark ? "dark" : "light";
  if (root.dataset.theme === theme) return;
  const focused = document.activeElement;
  const display = root.style.display;
  root.dataset.theme = theme;
  // Rebuild style inheritance: WebKit can retain light panel variables
  // while updating descendant text after a theme attribute change.
  root.style.display = "none";
  void root.offsetHeight;
  root.style.display = display;
  if (focused instanceof HTMLElement) focused.focus({preventScroll:true});
}
export function ThemeToggle({locale = "en"}: {locale?: "ru" | "en"}) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("pmwork-theme");
    } catch {}
    const system =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      value = saved ? saved === "dark" : system;
    applyTheme(value);
    const frame =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame(() => setDark(value))
        : 0;
    return () => {
      if (frame && typeof cancelAnimationFrame === "function")
        cancelAnimationFrame(frame);
    };
  }, []);
  const toggle = () => {
    const value = !dark;
    setDark(value);
    applyTheme(value);
    try {
      localStorage.setItem("pmwork-theme", value ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-button"
      aria-label={locale === "ru" ? (dark ? "Светлая тема" : "Тёмная тема") : (dark ? "Use light theme" : "Use dark theme")}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
