"use client";
import { Moon, Sun } from "lucide-react";
import { setThemePreference, useDarkTheme } from "./theme-setting";

export function ThemeToggle({locale = "en"}: {locale?: "ru" | "en"}) {
  const dark=useDarkTheme();
  return <button type="button" onClick={()=>setThemePreference(dark ? "light" : "dark")} className="icon-button" aria-label={locale === "ru" ? (dark ? "Светлая тема" : "Тёмная тема") : (dark ? "Use light theme" : "Use dark theme")}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}
