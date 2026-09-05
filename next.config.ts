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
};

export default nextConfig;
