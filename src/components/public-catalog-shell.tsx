import type { Locale } from "@/domain/schemas";
import { PublicHeader } from "./public-header";
import { Footer } from "./footer";
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
        <CatalogPage kind={kind} locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
