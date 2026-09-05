import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/domain/schemas";
import { LocaleLang } from "@/components/locale-lang";
export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}): Promise<Metadata> {
  const { locale } = await params,
    ru = locale === "ru",
    publicBase = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";
  return {
    title: ru
      ? "PMWORK — практическая система управления проектами"
      : "PMWORK — practical project management system",
    description: ru
      ? "Рабочее пространство, методы, шаблоны, практические сценарии и инструменты управления проектами."
      : "Workspace, methods, templates, playbooks, and project-management tools.",
    manifest: `${publicBase}/manifest-${locale}.webmanifest`,
    icons: {
      icon: [
        { url: `${publicBase}/icon.svg`, type: "image/svg+xml" },
        {
          url: `${publicBase}/icon-192.png`,
          sizes: "192x192",
          type: "image/png",
        },
      ],
      apple: `${publicBase}/apple-touch-icon.png`,
    },
  };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "en") notFound();
  return (
    <div lang={locale as Locale}>
      <LocaleLang locale={locale as Locale} />
      {children}
    </div>
  );
}
