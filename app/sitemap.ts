import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/theme/', ...source.getPages().map((page) => `${page.url}/`)].map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
