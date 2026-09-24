import type {ImgHTMLAttributes} from 'react';
import {hasProductPhoto,imageCaption,largeProductImage,productImage} from '@/lib/catalog';
import type {Product} from '@/lib/catalog';

type Props={
  product:Pick<Product,'image'|'title'|'brand'|'model'|'refrigerant'>;
  large?:boolean;
  compact?:boolean;
}&Omit<ImgHTMLAttributes<HTMLImageElement>,'src'>;

export function ProductVisual({product,large=false,compact=false,alt,className,...imageProps}:Props){
  if(hasProductPhoto(product.image))return <img {...imageProps} className={className} src={large?largeProductImage(product.image):productImage(product.image)} alt={alt??product.title}/>;
  return <span className={['product-visual-pending',compact?'is-compact':'',className].filter(Boolean).join(' ')} aria-label={`${product.title}. ${imageCaption(product.image)}`}>
    {!compact&&<span className="product-visual-brand">{product.brand||'TR HOLOD'}</span>}
    <strong className="product-visual-model">{product.model||product.refrigerant||product.title}</strong>
    <span className="product-visual-status">{compact?'Фото готовится':imageCaption(product.image)}</span>
  </span>;
}
