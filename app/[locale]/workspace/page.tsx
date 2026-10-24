import "../../workspace.css";
import "../../management.css";
import { notFound } from "next/navigation";
import type { Locale } from "@/domain/schemas";
import { WorkspaceEntry } from "@/components/workspace-entry";
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
  return <WorkspaceEntry locale={locale as Locale} />;
}
