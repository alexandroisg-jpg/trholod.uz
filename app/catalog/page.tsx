import type {Metadata} from 'next';
import {Header,Footer} from '../shared';
import {publicProducts} from '@/lib/seo-server';
import {absoluteUrl,jsonLd,productPath} from '@/lib/seo';
import {ProductCards,SectionLinks} from './components';
import './catalog.css';

export const dynamic='force-dynamic';
const title='Каталог холодильного оборудования в Ташкенте';
const description='Хладагенты TR Gas, холодильные и кондиционерные компрессоры, комплектующие и инструменты VALUE. Модели, характеристики и фотографии в каталоге TR HOLOD.';
export const metadata:Metadata={title,description,alternates:{canonical:'/catalog'},openGraph:{title,description,url:absoluteUrl('/catalog'),type:'website'}};
export default async function CatalogPage(){
  const products=await publicProducts();
  return <><Header/><main className="wrap page-main public-catalog"><nav className="catalog-breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><span>Каталог</span></nav><p className="eyebrow">TR HOLOD · ТАШКЕНТ</p><h1>{title}</h1><p className="catalog-lead">{description} Подберите оборудование по модели и назначению. Цену и наличие уточняйте при обращении.</p><SectionLinks/><h2>Все товары · {products.length}</h2><ProductCards products={products}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'CollectionPage',name:title,url:absoluteUrl('/catalog'),mainEntity:{'@type':'ItemList',itemListElement:products.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.title,url:absoluteUrl(productPath(p))}))}})}}/></main><Footer/></>;
}
