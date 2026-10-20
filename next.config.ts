import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
    ];
    return [
      { source: "/:path*", headers: common },
      // Admin must never be framed. /display stays embeddable for FreeShow.
      { source: "/admin", headers: [{ key: "X-Frame-Options", value: "DENY" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
