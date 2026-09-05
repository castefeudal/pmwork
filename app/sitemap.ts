import { glossaryTerms } from "@/content/glossary";
import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://castefeudal.github.io/pmwork";
  const paths = [
    "",
    "workspace",
    "methods",
    "templates",
    "playbooks",
    "tools",
    "knowledge",
    "glossary",
    "sources",
    "about",
    "privacy",
  ];
  return [
    ...glossaryTerms.flatMap(term => ["ru", "en"].map(locale => ({url: `${base}/${locale}/glossary/${term.slug}/`, lastModified: new Date(term.reviewedAt)}))),
    ...paths.flatMap((path) =>
      ["ru", "en"].map((locale) => ({
        url: `${base}/${locale}/${path}`,
        
        changeFrequency:
          path === "workspace" ? ("never" as const) : ("monthly" as const),
        priority: path === "" ? 1 : path === "workspace" ? 0.4 : 0.7,
      })),
    ),
    {
      url: `${base}/`,
      
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
