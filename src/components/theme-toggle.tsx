"use client";
import { Moon,Sun } from "lucide-react";
import { useEffect,useState } from "react";
export function ThemeToggle(){
  const [dark,setDark]=useState(false);
  useEffect(()=>{let saved:string|null=null;try{saved=localStorage.getItem("pmwork-theme")}catch{}const system=typeof window!=="undefined"&&typeof window.matchMedia==="function"&&window.matchMedia("(prefers-color-scheme: dark)").matches,value=saved?saved==="dark":system;document.documentElement.dataset.theme=value?"dark":"light";const frame=typeof requestAnimationFrame==="function"?requestAnimationFrame(()=>setDark(value)):0;return()=>{if(frame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(frame)};},[]);
  const toggle=()=>{const value=!dark;setDark(value);document.documentElement.dataset.theme=value?"dark":"light";try{localStorage.setItem("pmwork-theme",value?"dark":"light")}catch{}};
  return <button type="button" onClick={toggle} aria-label={dark?"Use light theme":"Use dark theme"}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>;
}
