"use client";
import { useSyncExternalStore } from "react";
import type { Locale } from "@/domain/schemas";

type ThemePreference = "system" | "light" | "dark";
function preference(): ThemePreference {
  const value=document.documentElement.dataset.themePreference;
  if(value === "light" || value === "dark" || value === "system") return value;
  try { const saved=localStorage.getItem("pmwork-theme"); return saved === "light" || saved === "dark" ? saved : "system"; } catch { return "system"; }
}
export function applyThemePreference(value: ThemePreference) {
  const dark=value === "dark" || (value === "system" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root=document.documentElement, theme=dark?"dark":"light";
  if(root.dataset.theme!==theme){
    const focused=document.activeElement, display=root.style.display;
    root.dataset.theme=theme;
    root.style.display="none"; void root.offsetHeight; root.style.display=display;
    if(focused instanceof HTMLElement) focused.focus({preventScroll:true});
  }
}
export function setThemePreference(value: ThemePreference) {
  try { if(value === "system") localStorage.removeItem("pmwork-theme"); else localStorage.setItem("pmwork-theme",value); } catch { /* Theme still applies for this session. */ }
  document.documentElement.dataset.themePreference=value;
  applyThemePreference(value);
  window.dispatchEvent(new Event("pmwork-theme"));
}
function subscribe(notify:()=>void) {
  const media=typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const changed=()=>{applyThemePreference(preference());notify();};
  const storage=(event:StorageEvent)=>{if(event.key === "pmwork-theme" || event.key === null) {document.documentElement.dataset.themePreference=event.newValue === "light" || event.newValue === "dark" ? event.newValue : "system"; changed();}};
  window.addEventListener("pmwork-theme",notify); window.addEventListener("storage",storage); media?.addEventListener("change",changed);
  return ()=>{window.removeEventListener("pmwork-theme",notify);window.removeEventListener("storage",storage);media?.removeEventListener("change",changed);};
}
export function useThemePreference() { return useSyncExternalStore(subscribe,preference,()=>"system" as const); }
export function useDarkTheme() { return useSyncExternalStore(subscribe,()=>document.documentElement.dataset.theme === "dark",()=>false); }
export function ThemeSetting({locale}:{locale:Locale}) {
  const value=useThemePreference(),ru=locale === "ru";
  return <label className="field"><span>{ru?"Тема":"Theme"}</span><select value={value} onChange={event=>setThemePreference(event.target.value as ThemePreference)}><option value="system">{ru?"Как в системе":"System"}</option><option value="light">{ru?"Светлая":"Light"}</option><option value="dark">{ru?"Тёмная":"Dark"}</option></select></label>;
}
