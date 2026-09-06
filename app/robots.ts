import {publicOrigin, publicBasePath} from "@/domain/public-metadata";
import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [`${publicBasePath}/ru/workspace/`, `${publicBasePath}/en/workspace/`],
      },
    ],
    sitemap: `${publicOrigin}${publicBasePath}/sitemap.xml`,
  };
}
