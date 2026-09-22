import type {MetadataRoute} from 'next';
import {absoluteUrl,siteUrl} from '@/lib/seo';

export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/orders','/api/','/login','/logout','/cdn-cgi/','/*?']},sitemap:absoluteUrl('/sitemap.xml'),host:siteUrl};}
