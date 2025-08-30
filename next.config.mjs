/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 no longer needs experimental.appDir - it's enabled by default
  // Disable Next.js dev tools indicator
  devIndicators: {
    position: 'bottom-right',
  },
  // Optimize for production (swcMinify is enabled by default in Next.js 15)
  // Reduce context usage by disabling strict mode
  reactStrictMode: false,
}

export default nextConfig
