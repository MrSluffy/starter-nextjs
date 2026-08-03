import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Playwright/e2e uses 127.0.0.1; without this, webpack-hmr is blocked as cross-origin.
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@mrsluffy/generator-core"],
};

export default nextConfig;
