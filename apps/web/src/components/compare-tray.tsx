'use client';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {clearCompare,maxCompare,removeCompare,useCompare} from '../lib/compare';
import {commerceApi,mediaUrl,useCommerce} from '../lib/commerce';
import styles from './compare.module.css';

/** Floating bar on every page while products are picked for comparison. */
export default function CompareTray(){
  const ids=useCompare();
  const path=usePathname();
  const {state}=useCommerce();
  if(!ids.length||path?.startsWith('/karsilastir'))return null;
  const products=ids.map(id=>state?.products.find(product=>product.id===id)).filter(product=>product!==undefined);
  return <aside className={styles.tray} aria-label="Karşılaştırma listesi">
    <ul>{products.map(product=><li key={product.id}>{(product.originalImage||product.variants[0]?.image)?<Image src={mediaUrl(product.originalImage||product.variants[0].image,commerceApi)} alt="" width={44} height={44}/>:<span/>}<span>{product.name}</span><button type="button" aria-label={`${product.name} ürününü karşılaştırmadan çıkar`} onClick={()=>removeCompare(product.id)}>×</button></li>)}
      {Array.from({length:Math.max(0,Math.min(maxCompare,2)-ids.length)},(_,i)=><li key={'empty'+i} className={styles.slot}><Link href="/karsilastir?view=select">Bir ürün daha ekle</Link></li>)}</ul>
    <div><Link className={styles.trayCta} href={ids.length>=2?"/karsilastir?view=table":"/karsilastir?view=select"}>Karşılaştır ({ids.length})</Link><button type="button" onClick={clearCompare}>Temizle</button></div>
  </aside>;
}
