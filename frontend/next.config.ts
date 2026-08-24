import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.56.1",
    "starfish-overlaid-jellied.ngrok-free.dev",
    "*.ngrok-free.dev",
  ],

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination:
          process.env.BACKEND_INTERNAL_URL ??
          "http://127.0.0.1:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;