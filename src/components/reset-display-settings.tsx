"use client";
import type {Locale} from "@/domain/schemas";
import {setThemePreference} from "./theme-setting";
export function ResetDisplaySettings({locale,onResetDensity}:{locale:Locale;onResetDensity:()=>void}) {
  const reset=()=>{
    onResetDensity(); setThemePreference("system");
    document.documentElement.dataset.textSize="standard";
    document.documentElement.dataset.contrast="standard";
    try{localStorage.removeItem("pmwork-text-size");localStorage.removeItem("pmwork-contrast");}catch{/* Defaults still apply for this session. */}
    window.dispatchEvent(new Event("pmwork-text-size"));window.dispatchEvent(new Event("pmwork-contrast"));
  };
  return <button type="button" className="button small" onClick={reset}>{locale==="ru"?"Сбросить настройки отображения":"Reset display settings"}</button>;
}
