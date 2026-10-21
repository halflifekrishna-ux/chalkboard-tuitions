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
  //
  // The vercel.app homepage is deliberately NOT redirected: Search Console
  // verifies that host's URL-prefix property by reading the
  // google-site-verification tag on its homepage, and keeps re-checking it.
  // Its canonical already points at www, so it stays out of results anyway.
  async redirects() {
    const has = [{ type: "host", value: "chalkboard-tuitions.vercel.app" }];
    const destination = "https://www.chalkboardlearning.in";
    return [
      { source: "/:path((?!admin|api|_next).+)", has, destination: `${destination}/:path`, permanent: true },
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
