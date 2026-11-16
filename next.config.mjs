/** @type {import('next').NextConfig} */
const https = Boolean(process.env.VERCEL || process.env.FORCE_HTTPS);
const CSP = "frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://*.sslcommerz.com https://*.paypal.com; object-src 'none'" + (https ? '; upgrade-insecure-requests' : '');
const PITCH_SANDBOX = 'sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-presentation allow-top-navigation-by-user-activation';
const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ...(https ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A new value on every build, so cached content never outlives a deploy.
  env: { CONTENT_BUILD_ID: String(Date.now()) },
  compress: true,
  serverExternalPackages: ['mongoose', 'bcryptjs', 'nodemailer'],
  // No next/image is used (plain <img>), so the image optimizer is switched off entirely.
  images: { unoptimized: true },
  // Common addresses for the Help center.
  async redirects() {
    return ['/support', '/help-center', '/helpcenter', '/knowledge-base'].map((source) => ({ source, destination: '/help', permanent: true }));
  },
  async headers() {
    return [
      { source: '/:path*', headers: security },
      // Page security policy: the home page and every address with two or more parts. One-part addresses get it from middleware.js.
      { source: '/', headers: [{ key: 'Content-Security-Policy', value: CSP }] },
      { source: '/:a/:rest+', headers: [{ key: 'Content-Security-Policy', value: CSP }] },
      // A pitch website opened by its internal address is always sandboxed too.
      { source: '/api/pitch-sites/page/:slug', headers: [{ key: 'Content-Security-Policy', value: `${CSP}; ${PITCH_SANDBOX}` }] },
      { source: '/seed/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
      { source: '/account/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'private, no-store' }] },
      { source: '/account', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'private, no-store' }] },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};
export default nextConfig;
