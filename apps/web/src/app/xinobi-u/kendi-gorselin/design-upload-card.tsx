"use client";
import Image from 'next/image';
import Link from 'next/link';
import {mediaUrl,commerceApi} from '../../../lib/commerce';
import type {Product} from '../../../../../../packages/commerce/client';
import {useState,type DragEvent} from 'react';
import {fileMeta,useLocalPatternFile,type LocalPatternSource} from '../../../features/product-personalization/use-local-pattern-file';
import flow from '../flow.module.css';
import styles from './own-image.module.css';
export type UploadMode='pattern'|'artwork';
const accept='.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';
/** Shared upload step for a new design and for changing an existing cart/favorite design. */
export default function DesignUploadCard({mode,onModeChange,local,existing,onRemove,embedded=false}:{mode:UploadMode;onModeChange:(mode:UploadMode)=>void;local:ReturnType<typeof useLocalPatternFile>;existing?:{url:string;source:LocalPatternSource};onRemove?:()=>void;embedded?:boolean}){
 const [dragging,setDragging]=useState(false),[sampleError,setSampleError]=useState('');
 const pattern=mode==='pattern',url=local.url??existing?.url,source=local.source??existing?.source;
 const switchMode=onModeChange;
 const pick=async(file:File|undefined)=>{if(file){setSampleError('');await local.select(file)}};
 const remove=()=>{local.remove();onRemove?.()};
 async function trySample(){setSampleError('');try{const response=await fetch('/assets/personalization/sample-pattern.png');if(!response.ok)throw new Error();const blob=await response.blob();await local.select(new File([blob],'ornek-desen.png',{type:blob.type||'image/png'}))}catch{setSampleError('Örnek görsel yüklenemedi.')}}
 return <>
     <div className={styles.kinds} role="group" aria-label="Yükleme türü">{(['artwork','pattern'] as const).map(kind=><button type="button" key={kind} aria-pressed={mode===kind} onClick={()=>switchMode(kind)}>{kind==='pattern'?'Desen':'Görsel'}</button>)}</div>
     {url&&source?<div className={styles.fileCard}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
      <img src={url} alt={pattern?'Yüklenen desen':'Yüklenen görsel'}/>
      <div><p className={styles.fileReady}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>{pattern?'Desen hazır':'Görsel hazır'}</p><p className={styles.fileName}>{source.name}</p><p className={styles.fileMeta}>{source.size?fileMeta(source):'Kayıtlı tasarım'}</p></div>
      <div className={styles.fileActions}><label className={styles.pickSmall}>Değiştir<input id="local-pattern" type="file" accept={accept} disabled={local.busy} onChange={event=>{const input=event.currentTarget,file=input.files?.[0];void pick(file).finally(()=>{if(input.files?.[0]===file)input.value=''})}}/></label><button type="button" aria-label={pattern?'Deseni kaldır':'Görseli kaldır'} onClick={remove}>Kaldır</button></div>
     </div>:<div className={`${styles.drop} ${dragging?styles.dragging:''}`} onDragOver={(event:DragEvent)=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={(event:DragEvent)=>{event.preventDefault();setDragging(false);pick(event.dataTransfer.files?.[0])}}>
      <span className={styles.dropIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg></span>
      <p className={styles.dropTitle}>{pattern?'Desenini buraya sürükle':'Görselini buraya sürükle'}</p>
      <p>{embedded?'ya da cihazından bir dosya seç':'ya da bilgisayarından bir dosya seç'}</p>
      <div className={styles.dropActions}><label className={styles.pick}>Dosya seç<input id="local-pattern" type="file" accept={accept} disabled={local.busy} aria-describedby="local-image-help" onChange={event=>{const input=event.currentTarget,file=input.files?.[0];void pick(file).finally(()=>{if(input.files?.[0]===file)input.value=''})}}/></label><button type="button" className={styles.sample} disabled={local.busy} onClick={()=>void trySample()}>Örnek görselle dene</button></div>
     </div>}
     {local.busy&&<div className={styles.busy}><p role="status">Görsel hazırlanıyor…</p><button type="button" className={flow.secondary} onClick={local.cancel}>Hazırlamayı iptal et</button></div>}
     {(local.error||sampleError)&&<p role="alert" className={flow.error}>{local.error||sampleError}</p>}
     <ul className={styles.chips}><li>PNG, JPEG veya WebP</li><li>Boyut ve çözünürlük sınırı yok</li><li>Büyük görseller otomatik optimize edilir</li></ul>
     <div className={styles.privacy}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><p id="local-image-help">Görselin yalnızca bu tarayıcıda önizlenir. Kaydettiğinde, sepete veya favorilere eklediğinde hesabına yüklenir ve yalnızca sen görürsün.</p></div>
 </>;
}

export function DesignUploadAside({product,image,allowProductChange=true}:{product?:Product;image?:string|null;allowProductChange?:boolean}){return (
   <aside className={styles.aside} aria-label="Seçtiğin ürün">
    {product&&<div className={styles.productCard}>
     <div className={styles.productImage}>{image&&<Image src={mediaUrl(image,commerceApi)} alt={product.name} width={400} height={400}/>}</div>
     <div className={styles.productText}><p className={styles.productKicker}>Seçtiğin ürün</p><p className={styles.productName}>{product.name}</p><p>Rengi ve görselin yerleşimini bir sonraki adımda önizleme üzerinde ayarlayacaksın.</p>{allowProductChange&&<Link href="/xinobi-u">Başka ürün seç <span aria-hidden="true">→</span></Link>}</div>
    </div>}
    <div className={styles.tips}><p>İyi bir sonuç için</p><ul><li>Net ve yüksek çözünürlüklü bir görsel seç.</li><li>Önemli öğeleri görselin ortasına yakın tut.</li><li>Desenlerde kenarları birbirine uyan, tekrar eden görseller daha iyi sonuç verir.</li></ul></div>
   </aside>
);}
