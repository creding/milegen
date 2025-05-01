/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  connect-src 'self' https://rmszfnofzuwvoxvkusak.supabase.co wss://rmszfnofzuwvoxvkusak.supabase.co https://www.googletagmanager.com https://va.vercel-scripts.com;
  font-src 'self';
  form-action 'self';
  frame-ancestors 'none';
  img-src 'self' data:;
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
`;

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

export default nextConfig;
