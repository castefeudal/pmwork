"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { Locale } from "@/domain/schemas";
import { ui } from "@/content/ui";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";

export function PublicHeader({locale}: {locale:Locale}){
 const t=ui(locale); const path=usePathname(); const other=locale==="ru"?"en":"ru"; const switched=path.replace(`/${locale}`,`/${other}`);
 return <><a className="skip-link" href="#main">{locale==="ru"?"К содержанию":"Skip to content"}</a><header className="topbar"><Link href={`/${locale}`}><Brand/></Link><nav className="topnav" aria-label={locale==="ru"?"Основная навигация":"Primary navigation"}>
  <Link href={`/${locale}/workspace`} className="keep">{t.nav.workspace}</Link><Link href={`/${locale}/methods`}>{t.nav.methods}</Link><Link href={`/${locale}/templates`}>{t.nav.templates}</Link><Link href={`/${locale}/playbooks`}>{t.nav.playbooks}</Link><Link href={`/${locale}/tools`}>{t.nav.tools}</Link><Link href={`/${locale}/knowledge`}>{t.nav.knowledge}</Link><Link href={`/${locale}/glossary`}>{t.nav.glossary}</Link>
  <Link href={switched} aria-label={locale==="ru"?"Switch to English":"Переключить на русский"}>{other.toUpperCase()}</Link><ThemeToggle/><button className="mobile-menu" aria-label="Menu"><Menu size={20}/></button>
 </nav></header></>;
}
