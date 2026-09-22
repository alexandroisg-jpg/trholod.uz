import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Header,Footer} from '../../../shared';
import {publicProducts} from '@/lib/seo-server';
import {absoluteUrl,catalogSections,categoryPath,jsonLd,productPath} from '@/lib/seo';
import {ProductCards,SectionLinks} from '../../components';
import '../../catalog.css';

export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
async function sectionFor({params}:Props){const {slug}=await params;const section=catalogSections.find(s=>s.slug===slug);if(!section)notFound();return section;}
export async function generateMetadata(props:Props):Promise<Metadata>{const s=await sectionFor(props);const title=`${s.name} в Ташкенте`;return {title,description:s.description,alternates:{canonical:categoryPath(s.name)},openGraph:{title,description:s.description,url:absoluteUrl(categoryPath(s.name)),type:'website'}};}
export default async function CategoryPage(props:Props){
  const section=await sectionFor(props);const products=(await publicProducts()).filter(p=>p.category===section.name);
  return <><Header/><main className="wrap page-main public-catalog"><nav className="catalog-breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><a href="/catalog">Каталог</a><span>/</span><span>{section.name}</span></nav><p className="eyebrow">TR HOLOD · КАТАЛОГ</p><h1>{section.name}</h1><p className="catalog-lead">{section.description}</p><SectionLinks current={section.name}/><h2>Модели в каталоге · {products.length}</h2><ProductCards products={products}/><p className="catalog-disclaimer">Демонстрационные цены и остатки. Подбор выполняется по паспорту оборудования; точное исполнение и условия поставки требуют подтверждения.</p><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'CollectionPage',name:section.name,description:section.description,url:absoluteUrl(categoryPath(section.name)),mainEntity:{'@type':'ItemList',itemListElement:products.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.title,url:absoluteUrl(productPath(p))}))}})}}/></main><Footer/></>;
}
