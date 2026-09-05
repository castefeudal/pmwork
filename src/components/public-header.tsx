"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
const PublicSearch = dynamic(() => import("./public-search"), { ssr: false });
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/domain/schemas";
import { ui } from "@/content/ui";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";

export function PublicHeader({ locale }: { locale: Locale }) {
  const t = ui(locale),
    path = usePathname(),
    other = locale === "ru" ? "en" : "ru",
    switched = path.replace(`/${locale}`, `/${other}`),
    [open, setOpen] = useState(false),
    [search, setSearch] = useState(false),
    firstLink = useRef<HTMLAnchorElement>(null);
  const links = [
    [t.nav.methods, "methods"],
    [t.nav.templates, "templates"],
    [t.nav.playbooks, "playbooks"],
    [t.nav.tools, "tools"],
    [t.nav.knowledge, "knowledge"],
    [t.nav.glossary, "glossary"],
  ] as const;
  const isActive = (slug: string) => path === `/${locale}/${slug}` || path.startsWith(`/${locale}/${slug}/`);
  const workspaceActive = isActive("workspace");

  useEffect(() => {
    const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearch(true); } };
    addEventListener("keydown", key); return () => removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [open]);


  return (
    <>
      {search && <PublicSearch locale={locale} onClose={() => setSearch(false)} />}
      <a className="skip-link" href="#main">
        {locale === "ru" ? "К содержанию" : "Skip to content"}
      </a>
      <header className="topbar">
        <Link
          href={`/${locale}`}
          aria-label={locale === "ru" ? "PMWORK — главная" : "PMWORK home"}
        >
          <Brand />
        </Link>
        <nav
          className="topnav"
          aria-label={locale === "ru" ? "Основная навигация" : "Primary navigation"}
        >
          <div className="desktop-nav">
            {[[locale === "ru" ? "Изучить" : "Learn", ["knowledge", "methods", "glossary"]], [locale === "ru" ? "Практика" : "Practice", ["templates", "playbooks"]]].map(([title, slugs]) => <details className="public-nav-group" key={String(title)}><summary>{title}</summary><div>{links.filter(([,slug]) => (slugs as string[]).includes(slug)).map(([label,slug]) => <Link key={slug} href={`/${locale}/${slug}/`} aria-current={isActive(slug) ? "page" : undefined}>{label}</Link>)}</div></details>)}
            <Link href={`/${locale}/tools/`}>{t.nav.tools}</Link>
          </div>
          <Link
            className="workspace-cta desktop-only"
            href={`/${locale}/workspace`}
            aria-current={workspaceActive ? "page" : undefined}
          >
            {t.nav.workspace}
          </Link>
          <Link
            className="language-link"
            href={switched}
            aria-label={locale === "ru" ? "Switch to English" : "Переключить на русский"}
          >
            {other.toUpperCase()}
          </Link>
          <button className="button small" onClick={() => setSearch(true)} aria-haspopup="dialog">{locale === "ru" ? "Поиск" : "Search"}</button>
          <ThemeToggle locale={locale} />
          <button
            type="button"
            className="mobile-menu"
            aria-label={
              open
                ? locale === "ru"
                  ? "Закрыть меню"
                  : "Close menu"
                : locale === "ru"
                  ? "Открыть меню"
                  : "Open menu"
            }
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>
      {open && (
        <>
          <button
            type="button"
            className="mobile-nav-backdrop"
            aria-label={locale === "ru" ? "Закрыть меню" : "Close menu"}
            onClick={() => setOpen(false)}
          />
          <nav
            onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}
            id="mobile-navigation"
            className="mobile-nav"
            aria-label={locale === "ru" ? "Мобильная навигация" : "Mobile navigation"}
          >
            <Link
              ref={firstLink}
              href={`/${locale}/workspace`}
              aria-current={workspaceActive ? "page" : undefined}
            >
              {t.nav.workspace}
              <span aria-hidden="true">→</span>
            </Link>
            {links.map(([label, slug]) => (
              <Link
                key={slug}
                href={`/${locale}/${slug}`}
                aria-current={isActive(slug) ? "page" : undefined}
              >
                {label}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
            <Link href={`/${locale}/about`} aria-current={isActive("about") ? "page" : undefined}>
              {t.nav.about}
              <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
