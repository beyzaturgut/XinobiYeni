'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {saveConfigurationPreview,setDesignConfigurationFavorite,saveDesignConfiguration,type MyDesignConfiguration,type SurfaceBinding,saveDesignFromSession,uploadDesign,useDemoCommerce,type MyDesign} from '../lib/demo-commerce';
import {commerceApi,useCommerce} from '../lib/commerce';
import {addToCart,updateCartDesign,flushNativeCart,useCartReady} from '../lib/cart';
import {saveDesignPlacement,type DesignPlacement} from '../lib/design-placement';
import DesignAccountAccess from './design-account-access';
import styles from './save-design.module.css';

type Source={sessionId:string;variantId?:string;productId?:string}|{file:Blob;productId:string;variantId:string|null}|{saved:MyDesign;variantId:string};
type Extra={surfaceBinding?:SurfaceBinding;configuration?:MyDesignConfiguration;cartTarget?:string};

/** "Sepete ekle" and "Tasarımımı kaydet" for an AI result (session) or an own image (file). A cart line needs a saved
 *  design, so adding saves it first, once. Signed-out shoppers are sent to sign in. */
export default function SaveDesignButton({source,placement,stacked=false,previewCanvas,surfaceBinding,configuration,cartTarget}:{source:Source;placement?:DesignPlacement;stacked?:boolean;previewCanvas?:HTMLCanvasElement|null}&Extra){
  const {user,ready}=useDemoCommerce();
  const cartReady=useCartReady();
  if(!ready||!cartReady)return <p role="status">Hesap ve sepet hazırlanıyor…</p>;
  // The stacked layout (XINOBI U placement step) already says why above; it keeps a full-width way to sign in.
  if(!user)return <DesignAccountAccess stacked={stacked}/>;
  return <SaveForAccount key={user.id+':'+('sessionId' in source?source.sessionId:('saved' in source?source.saved.id:source.productId)+':'+source.variantId)} source={source} placement={placement} stacked={stacked} previewCanvas={previewCanvas} surfaceBinding={surfaceBinding} configuration={configuration} cartTarget={cartTarget}/>;
}
function SaveForAccount({source,placement,stacked,previewCanvas,surfaceBinding,configuration,cartTarget}:{source:Source;placement?:DesignPlacement;stacked:boolean;previewCanvas?:HTMLCanvasElement|null}&Extra){
  const active=useRef(true),running=useRef(false);
  useEffect(()=>{active.current=true;return()=>{active.current=false}},[]);
  const router=useRouter();
  const config=useRef<MyDesignConfiguration|null>(configuration??null);
  const validatedSale=useRef<{stock:number;price:number}|null>(null);
  const {state}=useCommerce();
  const [complete,setComplete]=useState(false);
  const [design,setDesign]=useState<MyDesign|null>(null),[busy,setBusy]=useState(false),[added,setAdded]=useState(''),[error,setError]=useState('');
  async function save(){
    if(surfaceBinding){
      const origin=/^https?:\/\//.test(commerceApi)?new URL(commerceApi).origin:'';
      const response=await fetch(origin+'/api/v1/product-surfaces/'+encodeURIComponent(surfaceBinding.productId)+'/purchase',{cache:'no-store',signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw Error('Ürün satış bilgisi yeniden doğrulanamadı.');
      const current=await response.json();
      if(current.status!=='ready'||!current.binding||(Object.keys(surfaceBinding) as (keyof SurfaceBinding)[]).some(key=>surfaceBinding[key]!==current.binding[key]))
        throw Error('Ürün kaynağı, ticari eşleme veya satış durumu değişti. Güncel üründe yeniden yerleştir.');
      if(!Number.isSafeInteger(current.stock)||current.stock<1||!Number.isSafeInteger(current.priceMinor)||current.priceMinor<=0)throw Error('Ürün satış bilgisi doğrulanamadı.');
      validatedSale.current={stock:current.stock,price:current.priceMinor};
    }

    const saved=design??('saved' in source?source.saved:'sessionId' in source?await saveDesignFromSession(source.sessionId):await uploadDesign(source.file,source.productId,surfaceBinding?null:source.variantId));
    if(!active.current)throw new Error('Oturum değişti. Tasarımı yeniden aç.');
    setDesign(saved);
    const variantId=source.variantId??saved.variantId;
    if(placement&&variantId){
      // An order copies this revision's composition; a placement is never saved without its digital preview.
      if(!previewCanvas)throw new Error('Ürün önizlemesi henüz hazır değil. Biraz bekleyip tekrar dene.');
      if(!config.current||config.current.variantId!==variantId||JSON.stringify(config.current.placement)!==JSON.stringify(placement)||(surfaceBinding&&(Object.keys(surfaceBinding) as (keyof SurfaceBinding)[]).some(key=>config.current?.surfaceBinding?.[key]!==surfaceBinding[key])))config.current=await saveDesignConfiguration(saved.id,variantId,placement,config.current?.variantId===variantId?config.current:undefined,config.current?.favorite??false,surfaceBinding);
      await saveConfigurationPreview(config.current,previewCanvas);
      saveDesignPlacement(saved.id,saved.productId,variantId,placement);
    }
    return saved;
  }
  async function run(action:()=>Promise<void>){if(running.current)return;running.current=true;setBusy(true);setComplete(false);setError('');setAdded('');try{await action();if(active.current)setComplete(true)}catch(e){if(active.current)setError(e instanceof Error?e.message:'İşlem tamamlanamadı.')}finally{running.current=false;if(active.current)setBusy(false)}}
  const add=()=>run(async()=>{
    const saved=await save();
    if(!active.current)return;
    if(!placement){router.push('/hesap/tasarimlarim/onizleme?'+new URLSearchParams({id:saved.id,...(saved.variantId?{variant:saved.variantId}:{})}));return;}
    const product=state?.products.find(item=>item.id===saved.productId);
    const variant=product?.variants.find(item=>item.id===(source.variantId??saved.variantId)&&item.stock>0)??(placement?undefined:product?.variants.find(item=>item.stock>0));
    if(!product?.active||!variant)throw new Error('Bu ürün şu anda stokta yok.');
    if(placement&&!config.current)throw new Error('Yerleşim sunucuda doğrulanmadı.');
    if(surfaceBinding&&validatedSale.current?.price!==state?.prices[variant.id])throw Error('Ürün fiyatı değişti. Güncel kataloğu yükleyip yeniden dene.');
    const stock=surfaceBinding?validatedSale.current!.stock:variant.stock;
    const cartDesign={id:saved.id,name:saved.name,placement,configurationId:config.current?.id,configurationRevision:config.current?.revision};
    if(cartTarget){if(!configuration)throw Error('Düzenlenen revizyon bulunamadı.');updateCartDesign(cartTarget,configuration.revision,cartDesign,{variantId:variant.id,stock,expectedDesignId:saved.id})}
    else addToCart(product.id,variant.id,stock,cartDesign);
    await flushNativeCart();
    setAdded(`“${saved.name}” tasarımlı ${product.name}${surfaceBinding?'':` (${variant.color})`} sepete eklendi.`);
  });
  return <div className={`${styles.wrap} ${stacked?styles.stacked:''}`}>
    <div className={styles.actions}>
      <button type="button" className={`${styles.button} ${styles.primary}`} disabled={busy||!state||Boolean(placement&&previewCanvas===null)} onClick={add}>{busy?'Hazırlanıyor…':placement?'Sepete ekle':'Üründe yerleştir ve sepete ekle'}</button>
      {placement&&<button type="button" className={styles.button} disabled={busy||previewCanvas===null} onClick={()=>run(async()=>{await save();if(!config.current)throw new Error('Yerleşim henüz hazır değil.');await setDesignConfigurationFavorite(config.current.id,true);config.current={...config.current,favorite:true};setAdded('Tasarım favorilerine kaydedildi.')})}>Favorilere ekle</button>}
      <button type="button" className={styles.button} disabled={busy||Boolean(placement&&previewCanvas===null)} onClick={()=>run(async()=>{await save()})}>Tasarımımı kaydet</button>
    </div>
    {added&&<p className={styles.saved} role="status">{added} <Link href={added.includes("favorilerine")?"/favoriler":"/sepet"}>{added.includes("favorilerine")?"Favorilere git →":"Sepete git →"}</Link></p>}
    {complete&&design&&!added&&<p className={styles.saved} role="status">Tasarım hesabına kaydedildi. <Link href="/hesap/tasarimlarim">Tasarımlarım →</Link></p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
