import {TemplateHub} from "@/components/template-hub";
import {templates} from "@/content/catalog";
import { catalogMetadata } from "@/domain/public-metadata";
export const generateMetadata = ({params}: {params: Promise<{locale:string}>}) => catalogMetadata(params, "templates");
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
  return <PublicCatalogShell locale={locale as Locale}><TemplateHub locale={locale as Locale} templates={templates}/></PublicCatalogShell>;
}
