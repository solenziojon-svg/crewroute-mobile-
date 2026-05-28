/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevents Next.js from bundling the Anthropic SDK into
  // the Edge runtime. Forces Node.js runtime for API routes.
  // Required in Next.js 15 — replaces experimental.serverComponentsExternalPackages
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

module.exports = nextConfig;
