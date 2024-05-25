/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Content-Security-Policy: frame-ancestors 'self' example.com *.example.com
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' localhost:3000 http://localhost:3000",
          },
        ],
      },
    ];
  },
};

export default config;
