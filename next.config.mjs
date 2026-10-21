/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      // photo (5 MB) and document (10 MB) uploads go through Server Actions
      bodySizeLimit: "12mb",
    },
  },
  // Google still lists the old vercel.app copies of the public pages. A 308 on
  // that one host retires them faster than canonicals alone. Only the exact
  // production alias — preview deployments keep working — and never /admin or
  // /api, so existing OS sessions and auth callbacks are untouched.
  async redirects() {
    const has = [{ type: "host", value: "chalkboard-tuitions.vercel.app" }];
    const destination = "https://www.chalkboardlearning.in";
    return [
      { source: "/", has, destination, permanent: true },
      { source: "/:path((?!admin|api|_next).*)", has, destination: `${destination}/:path`, permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
