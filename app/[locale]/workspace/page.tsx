export const metadata = { robots: { index: false, follow: false } };
import { notFound } from "next/navigation";
import type { Locale } from "@/domain/schemas";
import { WorkspaceApp } from "@/components/workspace-app";
export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "en") notFound();
  return <WorkspaceApp locale={locale as Locale} />;
}
