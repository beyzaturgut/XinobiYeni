'use client';
import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {designImageUrl,myDesigns,useDemoCommerce,type MyDesign} from '../../../../lib/demo-commerce';
import {useCommerce} from '../../../../lib/commerce';
import {readDesignPlacement,saveDesignPlacement,type DesignPlacement} from '../../../../lib/design-placement';
import {addToCart} from '../../../../lib/cart';
import AcceptedSurfaceEditor from '../../../urunler/cay-makinesi-101/editor/accepted-surface-editor';
import styles from '../../../xinobi-u/studio.module.css';

/** A saved design on its product's admin-approved surface; colours without an approved surface say so. */
export default function SavedDesignPreview(){
  const id=useSearchParams().get('id')??'';
  const {user,ready}=useDemoCommerce();
  const {state}=useCommerce();
  const [design,setDesign]=useState<MyDesign|null>(null),[src,setSrc]=useState<string|null>(null),[error,setError]=useState('');
  useEffect(()=>{
    if(!user)return;let active=true;let url:string|null=null;
    myDesigns().then(async list=>{const found=list.find(item=>item.id===id);if(!found)throw new Error('Tasarım bulunamadı.');url=await designImageUrl(found);if(active){setDesign(found);setSrc(url)}else URL.revokeObjectURL(url)}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Tasarım yüklenemedi.')});
    return()=>{active=false;if(url)URL.revokeObjectURL(url)};
  },[user,id]);
  const product=state?.products.find(item=>item.id===design?.productId);
  const [variant,setVariant]=useState(''),[notice,setNotice]=useState('');
  const [placement,setPlacement]=useState<DesignPlacement>();
  const chosen=variant||design?.variantId||product?.variants[0]?.id||'';
  useEffect(()=>{setPlacement(design?readDesignPlacement(design.id,design.productId,chosen):undefined)},[design,chosen]);
  const updatePlacement=useCallback((value:DesignPlacement)=>{setPlacement(value);if(design)saveDesignPlacement(design.id,design.productId,chosen,value)},[design,chosen]);
  if(!ready)return <main className={styles.main}><p role="status">Yükleniyor…</p></main>;
  if(!user)return <main className={styles.main}><Link href="/hesap">Giriş yap →</Link></main>;
  if(error)return <main className={styles.main}><p role="alert">{error}</p><Link href="/hesap/tasarimlarim">Tasarımlarıma dön</Link></main>;
  if(!design||!src)return <main className={styles.main}><p role="status">Tasarım yükleniyor…</p></main>;
  return <><header className={styles.main}><section className={styles.intro}><p className={styles.kicker}>Tasarımlarım</p><h1>{design.name}</h1><p>{design.productName}</p></section>
    {product&&product.variants.length>1&&<label>Renk <select value={chosen} onChange={event=>setVariant(event.target.value)}>{product.variants.map(item=><option key={item.id} value={item.id}>{item.color}</option>)}</select></label>}
    <p className={styles.note}>Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.</p>{product?.active&&<AddDesign product={product} variantId={chosen} design={design} placement={placement} onNotice={setNotice}/>}<p role="status">{notice}</p><Link href="/hesap/tasarimlarim">← Tasarımlarıma dön</Link></header>
    {chosen&&<AcceptedSurfaceEditor key={design.id+':'+chosen} commerceProduct={design.productId} commerceVariant={chosen} patternSrc={src} placementMode={design.kind==='upload'?'artwork':'pattern'} initialPlacement={readDesignPlacement(design.id,design.productId,chosen)} onPlacementChange={updatePlacement}/>}</>;
}

type StoreProduct=NonNullable<ReturnType<typeof useCommerce>['state']>['products'][number];
/** Puts the product in the chosen colour with this design in the cart; checkout re-checks ownership, product and stock. */
export function AddDesign({product,variantId,design,onNotice,placement}:{product:StoreProduct;variantId:string;design:MyDesign;onNotice:(text:string)=>void;placement?:DesignPlacement}){
  const variant=product.variants.find(item=>item.id===variantId);
  if(!variant)return null;
  return <p><button type="button" disabled={variant.stock<=0} onClick={()=>{try{addToCart(product.id,variant.id,variant.stock,{id:design.id,name:design.name,placement});onNotice(`“${design.name}” tasarımlı ${product.name} (${variant.color}) sepete eklendi.`)}catch(e){onNotice(e instanceof Error?e.message:'Sepete eklenemedi.')}}}>{variant.stock<=0?'Bu renk stokta yok':'Bu tasarımla sepete ekle'}</button> <Link href="/sepet">Sepete git →</Link></p>;
}
