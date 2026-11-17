import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.BUILD_OUTPUT_DIR || ".next",
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  poweredByHeader: false,
  experimental: { cpus: 1 },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
