import type { Locale } from "@/domain/schemas";
import { PublicHeader } from "./public-header";
import { Footer } from "./footer";
import { GlossaryBrowser } from "./glossary-browser";
import { glossaryTerms } from "@/content/glossary";
import { methods, templates, playbooks, knowledgeDomains, sources } from "@/content/catalog";
import { CatalogPage } from "./catalog-page";
export function PublicCatalogShell({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "methods" | "templates" | "playbooks" | "knowledge" | "glossary";
}) {
  return (
    <div className="catalog-layout">
      <PublicHeader locale={locale} />
      <main id="main">
        {kind === "glossary" ? <GlossaryBrowser terms={glossaryTerms} locale={locale} /> : <CatalogPage kind={kind} locale={locale} records={kind === "methods" ? { methods, sources } : kind === "templates" ? { templates } : kind === "playbooks" ? { playbooks } : { knowledgeDomains }} />}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
