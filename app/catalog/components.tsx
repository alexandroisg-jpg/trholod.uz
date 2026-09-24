import type {Product} from '@/lib/catalog';
import {ProductCard} from '../product-card';
import {catalogSections,categoryPath} from '@/lib/seo';

export function SectionLinks({current}:{current?:string}){return <nav className="catalog-section-links" aria-label="Разделы каталога"><a href="/catalog" aria-current={!current?'page':undefined}>Все товары</a>{catalogSections.map(s=><a key={s.slug} href={categoryPath(s.name)} aria-current={s.name===current?'page':undefined}>{s.name}</a>)}</nav>}
export function ProductCards({products}:{products:Product[]}){return <div className="shop-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>}
