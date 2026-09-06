import {MethodHub} from "@/components/method-hub";
import {methods} from "@/content/catalog";
import { catalogMetadata } from "@/domain/public-metadata";
export const generateMetadata = ({params}: {params: Promise<{locale:string}>}) => catalogMetadata(params, "methods");
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
  return <PublicCatalogShell locale={locale as Locale}><MethodHub locale={locale as Locale} methods={methods.map(({slug,version,title,summary,bestFit,limitations})=>({slug,version,title,summary,bestFit,limitations}))}/></PublicCatalogShell>;
}
