import {GlossaryBrowser} from "@/components/glossary-browser";
import {glossaryTerms} from "@/content/glossary";
import { catalogMetadata } from "@/domain/public-metadata";
export const generateMetadata = ({params}: {params: Promise<{locale:string}>}) => catalogMetadata(params, "glossary");
import { notFound } from "next/navigation";
import type { Locale } from "@/domain/schemas";
import { PublicCatalogShell } from "@/components/public-catalog-shell";
export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "en") notFound();
  return <PublicCatalogShell locale={locale as Locale}><GlossaryBrowser locale={locale as Locale} terms={glossaryTerms}/></PublicCatalogShell>;
}
