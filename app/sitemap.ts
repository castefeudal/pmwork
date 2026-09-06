import {publicOrigin, publicBasePath} from "@/domain/public-metadata";
import { glossaryTerms } from "@/content/glossary";
import { methods, templates } from "@/content/catalog";
import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicOrigin + publicBasePath;
  const paths = [
    "",
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
    ...methods.flatMap(method => ["ru", "en"].map(locale => ({url:`${base}/${locale}/methods/${method.slug}/`,changeFrequency:"monthly" as const,priority:.7}))),
    ...templates.flatMap(template => ["ru", "en"].map(locale => ({url:`${base}/${locale}/templates/${template.slug}/`,changeFrequency:"monthly" as const,priority:.65}))),
    ...paths.flatMap((path) =>
      ["ru", "en"].map((locale) => ({
        url: `${base}/${locale}/${path ? path + "/" : ""}`,
        changeFrequency: "monthly" as const,
        priority: path === "" ? 1 : 0.7,
      })),
    ),
    {url: `${base}/`, changeFrequency: "monthly", priority: 0.8},
  ];
}
