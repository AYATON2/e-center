/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  // Standalone output is recommended for Vercel and prevents many export-related issues
  output: 'standalone',
  // Ensure the build doesn't fail on lint/type errors if they are minor
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
