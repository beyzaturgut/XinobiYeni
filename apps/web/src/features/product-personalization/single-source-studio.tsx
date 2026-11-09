"use client";
import {useEffect,useState} from 'react';
import PlacementStudio from '../../app/xinobi-u/kendi-gorselin/placement-studio';
import SaveDesignButton from '../../components/save-design-button';
import {commerceApi} from '../../lib/commerce';
import type {DesignPlacement} from '../../lib/design-placement';
import type {SurfaceBinding,MyDesignConfiguration} from '../../lib/demo-commerce';
import type {ProductSurface} from './single-source';
import type {ComponentProps} from 'react';
type StudioProps=ComponentProps<typeof PlacementStudio>;
type Source=ComponentProps<typeof SaveDesignButton>['source'];
type Purchase={status:string;binding:SurfaceBinding|null;priceMinor:number|null;stock:number|null;variantId:string|null};
export default function SingleSourceStudio({inputs,saveSource,configuration,cartTarget,...props}:Omit<StudioProps,'singleSource'|'variants'|'surfaces'|'active'|'onActiveChange'|'actions'> & {inputs:ProductSurface;saveSource:Source;configuration?:MyDesignConfiguration;cartTarget?:string}){
 const [purchase,setPurchase]=useState<Purchase|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const [placement,setPlacement]=useState<DesignPlacement>(),[canvas,setCanvas]=useState<HTMLCanvasElement|null>(null);
 const [reposition,setReposition]=useState(false);
 const productId=props.product.id;
 useEffect(()=>{let active=true;const abort=new AbortController();
  const origin=/^https?:\/\//.test(commerceApi)?new URL(commerceApi).origin:'';
  fetch(origin+'/api/v1/product-surfaces/'+encodeURIComponent(productId)+'/purchase',{cache:'no-store',signal:abort.signal})
   .then(async response=>{if(!response.ok)throw Error('Satış bilgisi doğrulanamadı.');return response.json() as Promise<Purchase>})
   .then(value=>{
    if(!value||!['source_missing','commercial_binding_missing','price_missing','out_of_stock','ready'].includes(value.status)||
       (value.priceMinor!==null&&(!Number.isSafeInteger(value.priceMinor)||value.priceMinor<=0))||
       (value.stock!==null&&(!Number.isSafeInteger(value.stock)||value.stock<0))||
       (value.binding!==null&&(!value.binding||!Number.isSafeInteger(value.binding.profileRevision)||value.binding.profileRevision<1||typeof value.binding.fulfillmentVariantId!=='string')))
     throw Error('Satış bilgisi doğrulanamadı.');
    if(active){setPurchase(value);setError('')}
   }).catch(e=>{if(active)setError(e instanceof Error?e.message:'Satış bilgisi alınamadı.')});
  return()=>{active=false;abort.abort()};
 },[productId,inputs.surfaceId,retry]);
 const binding=purchase?.binding;
 const matched=!!binding&&binding.productId===productId&&binding.surfaceId===inputs.surfaceId&&binding.sourceRevision===inputs.sourceRevision&&binding.productSourceSha256===inputs.sourceMediaVersion&&binding.maskSha256===inputs.surfaceVersion&&binding.width===inputs.width&&binding.height===inputs.height&&binding.fulfillmentVariantId===purchase?.variantId;
 const stale=configuration&&(!binding||!configuration.surfaceBinding||(Object.keys(binding) as (keyof SurfaceBinding)[]).some(key=>configuration.surfaceBinding?.[key]!==binding[key]));
 if(configuration&&stale&&!reposition&&purchase)return <section role="alert"><p>Ürün kaynağı veya ticari eşleme değişti. Eski yerleşim otomatik aktarılmaz.</p><button onClick={()=>setReposition(true)}>Güncel yüzeye yeniden yerleştir</button></section>;
 const ready=matched&&purchase?.status==='ready'&&typeof purchase.priceMinor==='number'&&purchase.priceMinor>0&&typeof purchase.stock==='number'&&purchase.stock>0;
 const source={...saveSource,variantId:binding?.fulfillmentVariantId??''};
 const actions=error?<p role="alert">{error} <button onClick={()=>setRetry(value=>value+1)}>Tekrar dene</button></p>:!purchase?<p role="status">Satış bilgisi doğrulanıyor…</p>:!ready?<p role="status">{purchase.status==='commercial_binding_missing'?'Bu ürünün kişiselleştirme için satış SKU’su henüz tanımlanmadı.':purchase.status==='price_missing'?'Ürünün satış fiyatı henüz tanımlanmadı.':purchase.status==='out_of_stock'?'Bu ürün şu anda stokta yok.':'Ürün yüzeyi değişti. Güncel ürünü yeniden aç.'}</p>:<SaveDesignButton source={source} surfaceBinding={binding!} configuration={configuration} cartTarget={cartTarget} placement={placement} previewCanvas={canvas} stacked/>;
 return <PlacementStudio {...props} singleSource variants={[]} active={{id:inputs.surfaceId,color:''}} onActiveChange={()=>{}} surfaces={{[inputs.surfaceId]:inputs}} price={ready?purchase?.priceMinor??undefined:undefined} initialPlacement={reposition?undefined:configuration?.placement??props.initialPlacement} onDraftChange={setPlacement} onRendered={setCanvas} actions={actions}/>;
}
