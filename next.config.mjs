/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = (process.env.BACKEND_URL || 'http://localhost:5001').replace(/\/$/, '');
    return [{ source: '/api/backend/:path*', destination: `${backend}/api/:path*` }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
