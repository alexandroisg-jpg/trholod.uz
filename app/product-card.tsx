import {ArrowUpRight,Plus,ZoomIn} from 'lucide-react';
import type {Product} from '@/lib/catalog';
import {imageCaption,productPrice,storefrontProduct} from '@/lib/catalog';
import {productPath} from '@/lib/seo';
import {ProductVisual} from './product-visual';

type Props={product:Product;onInspect?:(product:Product)=>void;onAdd?:(product:Product)=>void;inCart?:number};
export function ProductCard({product,onInspect,onAdd,inCart=0}:Props){
 const p=storefrontProduct(product);
 const gas=p.category==='Хладагенты';
 const picture=<><ProductVisual product={p} alt={`${p.title}. ${imageCaption(p.image)}`} width="480" height="480" loading="lazy"/><span className="shop-card-zoom" aria-hidden="true"><ZoomIn size={18}/></span></>;
 return <article className={`shop-card${gas?' shop-card-gas':''}`} data-product-id={p.id}>
  {onInspect?<button type="button" className="shop-card-image" onClick={()=>onInspect(p)} aria-label={`Рассмотреть ${p.title}`}>{picture}</button>:<a className="shop-card-image" href={productPath(p)} aria-label={p.title}>{picture}</a>}
  <div className="shop-card-body">
   <div className="shop-card-brand"><span>{p.brand||'TR HOLOD'}</span><span>{gas?'Хладагент':p.category==='Инструменты'?'Инструмент':p.category.includes('компрессоры')?'Компрессор':'Комплектующие'}</span></div>
   <h3><a className="shop-card-title" href={productPath(p)}>{p.title}</a></h3>
   {!gas&&<p className="shop-card-spec">{p.specification}</p>}
   {gas&&<p className="shop-card-spec">Для систем на {p.refrigerant}</p>}
   <div className="shop-card-price"><strong>{productPrice(p)}</strong><span>{p.price>0?'Цена и наличие уточняются':'Уточните стоимость и наличие'}</span></div>
   <div className="shop-card-actions">
    <a href={productPath(p)} className="shop-card-link">Подробнее <ArrowUpRight size={17}/></a>
    {onAdd&&p.price>0&&p.stock>0&&<button type="button" className="shop-card-add" onClick={()=>onAdd(p)} disabled={inCart>=p.stock} aria-label={`Добавить в корзину: ${p.title}`}><Plus size={21}/></button>}
   </div>
  </div>
 </article>;
}
