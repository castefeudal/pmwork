import type { Locale } from "@/domain/schemas";
import { PublicHeader } from "./public-header";
import { Footer } from "./footer";
import { GlossaryBrowser } from "./glossary-browser";
import { glossaryTerms } from "@/content/glossary";
import { methods, playbooks, knowledgeDomains, sources } from "@/content/catalog";
import { CatalogPage } from "./catalog-page";
import { TemplateHub } from "./template-hub";
import { MethodHub } from "./method-hub";

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
        {kind === "glossary" ? (
          <GlossaryBrowser terms={glossaryTerms} locale={locale} />
        ) : kind === "templates" ? (
          <TemplateHub locale={locale} />
        ) : kind === "methods" ? (
          <MethodHub locale={locale} />
        ) : (
          <CatalogPage
            kind={kind}
            locale={locale}
            records={kind === "playbooks" ? { playbooks } : { knowledgeDomains, methods, sources }}
          />
        )}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
