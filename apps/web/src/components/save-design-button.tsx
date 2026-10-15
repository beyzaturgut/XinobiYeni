'use client';
import Link from 'next/link';
import {useState} from 'react';
import {saveDesignFromSession,uploadDesign,useDemoCommerce,type MyDesign} from '../lib/demo-commerce';
import {useCommerce} from '../lib/commerce';
import {addToCart} from '../lib/cart';
import type {DesignPlacement} from '../lib/design-placement';
import styles from './save-design.module.css';

type Source={sessionId:string}|{file:Blob;productId:string;variantId:string|null};

/** "Sepete ekle" and "Tasarımımı kaydet" for an AI result (session) or an own image (file). A cart line needs a saved
 *  design, so adding saves it first, once. Signed-out shoppers are sent to sign in. */
export default function SaveDesignButton({source,placement}:{source:Source;placement?:DesignPlacement}){
  const {user,ready}=useDemoCommerce();
  const {state}=useCommerce();
  const [design,setDesign]=useState<MyDesign|null>(null),[busy,setBusy]=useState(false),[added,setAdded]=useState(''),[error,setError]=useState('');
  if(!ready)return null;
  if(!user)return <p className={styles.note}><Link href="/hesap">Giriş yap</Link>, tasarımını sepete ekle ve hesabında sakla.</p>;
  async function save(){
    if(design)return design;
    const saved='sessionId' in source?await saveDesignFromSession(source.sessionId):await uploadDesign(source.file,source.productId,source.variantId);
    setDesign(saved);return saved;
  }
  async function run(action:()=>Promise<void>){setBusy(true);setError('');try{await action()}catch(e){setError(e instanceof Error?e.message:'İşlem tamamlanamadı.')}finally{setBusy(false)}}
  const add=()=>run(async()=>{
    const saved=await save();
    const product=state?.products.find(item=>item.id===saved.productId);
    const variant=product?.variants.find(item=>item.id===saved.variantId&&item.stock>0)??(placement?undefined:product?.variants.find(item=>item.stock>0));
    if(!product?.active||!variant)throw new Error('Bu ürün şu anda stokta yok.');
    addToCart(product.id,variant.id,variant.stock,{id:saved.id,name:saved.name,placement});
    setAdded(`“${saved.name}” tasarımlı ${product.name} (${variant.color}) sepete eklendi.`);
  });
  return <div className={styles.wrap}>
    <div className={styles.actions}>
      <button type="button" className={`${styles.button} ${styles.primary}`} disabled={busy||!state} onClick={add}>{busy?'Hazırlanıyor…':'Sepete ekle'}</button>
      {!design&&<button type="button" className={styles.button} disabled={busy} onClick={()=>run(async()=>{await save()})}>Tasarımımı kaydet</button>}
    </div>
    {added&&<p className={styles.saved} role="status">{added} <Link href="/sepet">Sepete git →</Link></p>}
    {design&&!added&&<p className={styles.saved} role="status">Tasarım hesabına kaydedildi. <Link href="/hesap/tasarimlarim">Tasarımlarım →</Link></p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
