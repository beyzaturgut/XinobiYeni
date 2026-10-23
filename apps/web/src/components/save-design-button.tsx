'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {saveConfigurationPreview,setDesignConfigurationFavorite,saveDesignConfiguration,type MyDesignConfiguration,saveDesignFromSession,uploadDesign,useDemoCommerce,type MyDesign} from '../lib/demo-commerce';
import {useCommerce} from '../lib/commerce';
import {addToCart,flushNativeCart,useCartReady} from '../lib/cart';
import {saveDesignPlacement,type DesignPlacement} from '../lib/design-placement';
import DesignAccountAccess from './design-account-access';
import styles from './save-design.module.css';

type Source={sessionId:string;variantId?:string;productId?:string}|{file:Blob;productId:string;variantId:string|null};

/** "Sepete ekle" and "Tasarımımı kaydet" for an AI result (session) or an own image (file). A cart line needs a saved
 *  design, so adding saves it first, once. Signed-out shoppers are sent to sign in. */
export default function SaveDesignButton({source,placement,stacked=false,previewCanvas}:{source:Source;placement?:DesignPlacement;stacked?:boolean;previewCanvas?:HTMLCanvasElement|null}){
  const {user,ready}=useDemoCommerce();
  const cartReady=useCartReady();
  if(!ready||!cartReady)return <p role="status">Hesap ve sepet hazırlanıyor…</p>;
  // The stacked layout (XINOBI U placement step) already says why above; it keeps a full-width way to sign in.
  if(!user)return <DesignAccountAccess stacked={stacked}/>;
  return <SaveForAccount key={user.id+':'+('sessionId' in source?source.sessionId:source.productId+':'+source.variantId)} source={source} placement={placement} stacked={stacked} previewCanvas={previewCanvas}/>;
}
function SaveForAccount({source,placement,stacked,previewCanvas}:{source:Source;placement?:DesignPlacement;stacked:boolean;previewCanvas?:HTMLCanvasElement|null}){
  const active=useRef(true),running=useRef(false);
  useEffect(()=>{active.current=true;return()=>{active.current=false}},[]);
  const router=useRouter();
  const config=useRef<MyDesignConfiguration|null>(null);
  const {state}=useCommerce();
  const [design,setDesign]=useState<MyDesign|null>(null),[busy,setBusy]=useState(false),[added,setAdded]=useState(''),[error,setError]=useState('');
  async function save(){
    const saved=design??('sessionId' in source?await saveDesignFromSession(source.sessionId):await uploadDesign(source.file,source.productId,source.variantId));
    if(!active.current)throw new Error('Oturum değişti. Tasarımı yeniden aç.');
    setDesign(saved);
    const variantId=source.variantId??saved.variantId;
    if(placement&&variantId){
      if(!config.current||config.current.variantId!==variantId||JSON.stringify(config.current.placement)!==JSON.stringify(placement))config.current=await saveDesignConfiguration(saved.id,variantId,placement,config.current?.variantId===variantId?config.current:undefined);
      if(previewCanvas)await saveConfigurationPreview(config.current,previewCanvas);
      saveDesignPlacement(saved.id,saved.productId,variantId,placement);
    }
    return saved;
  }
  async function run(action:()=>Promise<void>){if(running.current)return;running.current=true;setBusy(true);setError('');setAdded('');try{await action()}catch(e){if(active.current)setError(e instanceof Error?e.message:'İşlem tamamlanamadı.')}finally{running.current=false;if(active.current)setBusy(false)}}
  const add=()=>run(async()=>{
    const saved=await save();
    if(!active.current)return;
    if(!placement){router.push('/hesap/tasarimlarim/onizleme?'+new URLSearchParams({id:saved.id,...(saved.variantId?{variant:saved.variantId}:{})}));return;}
    const product=state?.products.find(item=>item.id===saved.productId);
    const variant=product?.variants.find(item=>item.id===(source.variantId??saved.variantId)&&item.stock>0)??(placement?undefined:product?.variants.find(item=>item.stock>0));
    if(!product?.active||!variant)throw new Error('Bu ürün şu anda stokta yok.');
    addToCart(product.id,variant.id,variant.stock,{id:saved.id,name:saved.name,placement,configurationId:config.current?.id,configurationRevision:config.current?.revision});
    await flushNativeCart();
    setAdded(`“${saved.name}” tasarımlı ${product.name} (${variant.color}) sepete eklendi.`);
  });
  return <div className={`${styles.wrap} ${stacked?styles.stacked:''}`}>
    <div className={styles.actions}>
      <button type="button" className={`${styles.button} ${styles.primary}`} disabled={busy||!state||Boolean(placement&&previewCanvas===null)} onClick={add}>{busy?'Hazırlanıyor…':placement?'Sepete ekle':'Üründe yerleştir ve sepete ekle'}</button>
      {placement&&<button type="button" className={styles.button} disabled={busy||previewCanvas===null} onClick={()=>run(async()=>{await save();if(!config.current)throw new Error('Yerleşim henüz hazır değil.');await setDesignConfigurationFavorite(config.current.id,true);config.current={...config.current,favorite:true};setAdded('Tasarım favorilerine kaydedildi.')})}>Favorilere ekle</button>}
      <button type="button" className={styles.button} disabled={busy||Boolean(placement&&previewCanvas===null)} onClick={()=>run(async()=>{await save()})}>{design?'Yerleşimi kaydet':'Tasarımımı kaydet'}</button>
    </div>
    {added&&<p className={styles.saved} role="status">{added} <Link href={added.includes("favorilerine")?"/favoriler":"/sepet"}>{added.includes("favorilerine")?"Favorilere git →":"Sepete git →"}</Link></p>}
    {design&&!added&&<p className={styles.saved} role="status">Tasarım hesabına kaydedildi. <Link href="/hesap/tasarimlarim">Tasarımlarım →</Link></p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
