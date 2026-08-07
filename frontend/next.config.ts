import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Repo gốc cũng có pnpm-lock.yaml (cho bộ lệnh vận hành) — ghim tracing root
  // về frontend/ để Next không tự suy ra nhầm workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
