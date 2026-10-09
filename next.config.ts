import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./public/cyber/notes/**/*.md"],
  },
};

export default nextConfig;
