'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useCommerce,commerceApi,mediaUrl} from '../../../lib/commerce';
import {sessionKey} from '../../../lib/design-studio';
import styles from '../studio.module.css';
export default function ColorSelection(){
 const id=useSearchParams().get('product');const {state,error}=useCommerce();const [selected,setSelected]=useState('');
 const product=state?.products.find(product=>product.id===id&&product.active&&(product.personalizable??(product.category.includes('Çay')||product.category.includes('Kahve'))));
 const variant=product?.variants.find(variant=>variant.id===selected);
 if(!state)return <main className={styles.main}><p role="status">{error||'Ürün yükleniyor…'}</p></main>;
 if(!product)return <main className={styles.main}><p>Bu ürün kişiselleştirmeye açık değil.</p><Link href="/xinobi-u">Ürünleri keşfet</Link></main>;
 return <main className={styles.main}><div className={styles.questionLayout}><div><div className={styles.selectionImage}><Image src={mediaUrl(variant?.image||product.originalImage||product.variants.find(v=>v.image)?.image||'',commerceApi)} alt={`${product.name}${variant?' · '+variant.color:''}`} width={600} height={600}/></div></div><section className={styles.questionPanel}><Link href="/xinobi-u">← Ürünler</Link><h1>{product.name}</h1><p>Tasarımının uygulanacağı ürün rengini seç.</p><fieldset className={styles.colorSelection}><legend>Ürün rengi</legend>{product.variants.filter(variant=>variant.image).map(variant=><label key={variant.id}><input type="radio" name="color" value={variant.id} checked={selected===variant.id} onChange={()=>setSelected(variant.id)}/><span style={{background:variant.hex&&/^#[a-fA-F0-9]{6}$/.test(variant.hex)?variant.hex:undefined}}/><strong>{variant.color}</strong></label>)}</fieldset>{variant?<Link className={styles.primary} onClick={()=>sessionStorage.removeItem(sessionKey(product.id,variant.id))} href={`/xinobi-u/sorular?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(variant.id)}`}>Sorulara başla →</Link>:<button className={styles.primary} disabled>Önce rengini seç</button>}</section></div></main>
}
