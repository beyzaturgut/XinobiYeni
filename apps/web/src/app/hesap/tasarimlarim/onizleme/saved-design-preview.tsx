'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {designImageUrl,myDesigns,useDemoCommerce,type MyDesign} from '../../../../lib/demo-commerce';
import {useCommerce} from '../../../../lib/commerce';
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
  const [variant,setVariant]=useState('');
  const chosen=variant||design?.variantId||product?.variants[0]?.id||'';
  if(!ready)return <main className={styles.main}><p role="status">Yükleniyor…</p></main>;
  if(!user)return <main className={styles.main}><Link href="/hesap/giris">Giriş yap →</Link></main>;
  if(error)return <main className={styles.main}><p role="alert">{error}</p><Link href="/hesap/tasarimlarim">Tasarımlarıma dön</Link></main>;
  if(!design||!src)return <main className={styles.main}><p role="status">Tasarım yükleniyor…</p></main>;
  return <><header className={styles.main}><section className={styles.intro}><p className={styles.kicker}>Tasarımlarım</p><h1>{design.name}</h1><p>{design.productName}</p></section>
    {product&&product.variants.length>1&&<label>Renk <select value={chosen} onChange={event=>setVariant(event.target.value)}>{product.variants.map(item=><option key={item.id} value={item.id}>{item.color}</option>)}</select></label>}
    <p className={styles.note}>Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.</p><Link href="/hesap/tasarimlarim">← Tasarımlarıma dön</Link></header>
    {chosen&&<AcceptedSurfaceEditor key={chosen} commerceProduct={design.productId} commerceVariant={chosen} patternSrc={src}/>}</>;
}
