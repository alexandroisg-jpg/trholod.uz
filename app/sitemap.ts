import type {MetadataRoute} from 'next';
import {publicProducts} from '@/lib/seo-server';
import {absoluteUrl,catalogSections,categoryPath,productPath} from '@/lib/seo';

export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const products=await publicProducts();
  return ['/', '/catalog', '/credits', ...catalogSections.map(s=>categoryPath(s.name)), ...products.map(productPath)].map(path=>({url:absoluteUrl(path)}));
}
