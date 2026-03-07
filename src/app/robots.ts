import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://classcribe.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/docs/*',
          '/lectures/*',
          '/settings',
          '/settings/*',
          '/onboarding',
          '/onboarding/*',
          '/reset-password',
          '/reset-password/*',
          '/verify-email',
          '/verify-email/*',
          '/auth/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
