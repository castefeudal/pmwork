import type { NextConfig } from "next";

const isPages = process.env.PMWORK_BASE_PATH === "github";
const nextConfig: NextConfig = {
  output: "export",
  env: { NEXT_PUBLIC_PMWORK_BASE_PATH: isPages ? "/pmwork" : "" },
  trailingSlash: true,
  basePath: isPages ? "/pmwork" : "",
  assetPrefix: isPages ? "/pmwork/" : undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Keep the 497-page bilingual export reliable on memory-constrained runners
  // and Windows, where the default worker pool can terminate native workers.
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
  },
};

export default nextConfig;
