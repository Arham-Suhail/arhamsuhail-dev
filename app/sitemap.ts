import { MetadataRoute } from 'next';
import { siteData } from '../data/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteData.domain,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteData.domain}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
