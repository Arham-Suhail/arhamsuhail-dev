import { MetadataRoute } from 'next';
import { siteData } from '../data/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteData.domain}/sitemap.xml`,
  };
}
