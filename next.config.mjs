/** @type {import('next').NextConfig} */

// A subset of CSP that doesn't need nonces: Next's inline scripts still run.
// Flutterwave is allowed as a form target for the wallet checkout script.
const csp = [
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.flutterwave.com https://*.flutterwave.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  // Only API_URL is inlined: the browser-side gift upload still reads it.
  // NEXTAUTH_SECRET and NEXTAUTH_URL are read at runtime on the server.
  env: {
    API_URL: process.env.API_URL,
  },
  // Images load straight from their hosts; no /_next/image proxy.
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
