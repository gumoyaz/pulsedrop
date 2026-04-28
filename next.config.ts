import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle dev.db (seeded at build time) into every serverless function so
  // instrumentation.ts can copy it to /tmp at startup on Vercel.
  outputFileTracingIncludes: {
    "\\*": ["./dev.db"],
  },
};

export default nextConfig;
