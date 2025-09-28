import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "192.168.1.134",
        port: "5000",
        pathname: "/**"
      },
      
    ]
  }
};

export default nextConfig;
