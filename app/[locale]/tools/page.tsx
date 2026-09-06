import { catalogMetadata } from "@/domain/public-metadata";
export const generateMetadata = ({params}: {params: Promise<{locale:string}>}) => catalogMetadata(params, "tools");
import { notFound } from "next/navigation";
import type { Locale } from "@/domain/schemas";
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
import { ToolsLab } from "@/components/tools-lab";
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
  return (
    <div>
      <PublicHeader locale={locale as Locale} />
      <main id="main">
        <ToolsLab locale={locale as Locale} />
      </main>
      <Footer locale={locale as Locale} />
    </div>
  );
}
