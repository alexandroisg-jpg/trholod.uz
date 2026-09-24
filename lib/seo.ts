import type { Product } from './catalog';

export const siteUrl = 'https://trholod.uz';
export const catalogSections = [
  {slug:'refrigerants', name:'Хладагенты', description:'Хладагенты TR Gas: R134a, R410A, R32, R404A, R407C, R600a и R290. Выбор по марке хладагента и назначению.'},
  {slug:'refrigeration-compressors', name:'Холодильные компрессоры', description:'Холодильные компрессоры Danfoss / Secop и Embraco: серии, заводские модели, хладагенты и технические характеристики.'},
  {slug:'air-conditioning-compressors', name:'Кондиционерные компрессоры', description:'Компрессоры для кондиционеров Toshiba, GMCC, Highly и Panasonic. Подбор по точной модели и хладагенту.'},
  {slug:'components', name:'Комплектующие', description:'Комплектующие для холодильного оборудования: соединения, термостаты и электрические компоненты.'},
  {slug:'tools', name:'Инструменты', description:'Инструменты VALUE для обслуживания холодильного оборудования и кондиционеров: коллекторы, труборезы и вакуумные насосы.'},
] as const;

export function productPath(p:Pick<Product,'id'|'brand'|'model'>){
  const label=[p.brand,p.model].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return `/catalog/${label ? label+'--' : ''}${encodeURIComponent(p.id)}`;
}
export function productIdFromSlug(slug:string){return slug.split('--').at(-1) || '';}
export function categoryPath(name:string){const section=catalogSections.find(s=>s.name===name);return section?`/catalog/category/${section.slug}`:'/catalog';}
export function absoluteUrl(path:string){return new URL(path,siteUrl).href;}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
