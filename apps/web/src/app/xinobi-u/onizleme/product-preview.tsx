'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { commerceApi, mediaUrl, useCommerce } from '../../../lib/commerce';
import { designRequest, studioAsset, type DesignSession } from '../../../lib/design-studio';
import { createProductSurface } from '../../../lib/product-surface';
import styles from '../studio.module.css';
function loadImage(src: string) { return new Promise<HTMLImageElement>((resolve, reject) => { const image = new window.Image(); image.crossOrigin = 'anonymous'; image.onload = () => resolve(image); image.onerror = () => reject(new Error('Önizleme görselleri yüklenemedi.')); image.src = src; }); }
export default function ProductPreview() {
  const [session,setSession]=useState<DesignSession|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  const [strength,setStrength]=useState(94),[offsetX,setOffsetX]=useState(0),[offsetY,setOffsetY]=useState(0),[scale,setScale]=useState(100);
  const {state}=useCommerce();
  const product=state?.products.find(product=>product.id===session?.product.id) ?? session?.product;
  const variant=product?.variants.find(variant=>variant.id===session?.variant.id) ?? session?.variant;
  const source=product?.originalImage || variant?.image;
  const canvas=useRef<HTMLCanvasElement>(null);
  const renderer=useRef<ReturnType<typeof createProductSurface>|null>(null);
  const [calibrated,setCalibrated]=useState(false),[showOriginal,setShowOriginal]=useState(false);
  useEffect(()=>{
    let active=true;
    const id=sessionStorage.getItem('xinobi-u-selected-session');
    if(!id){Promise.resolve().then(()=>{if(active){setError('Önce bir ürün seçip tasarımını oluştur.');setLoading(false)}});return()=>{active=false}}
    designRequest<DesignSession>(`/sessions/${id}`).then(async data=>{
      if(data.status!=='ready'||!data.imageUrl)throw new Error('Ürün önizlemesi için tamamlanmış bir tasarım gerekli.');
      if(active)setSession(data);
    }).catch(error=>{if(active){setError(error instanceof Error?error.message:'Önizleme yüklenemedi.');setLoading(false)}});
    return()=>{active=false};
  },[]);
  useEffect(()=>{
    if(!source||!session?.imageUrl)return;
    let active=true;
    Promise.all([loadImage(mediaUrl(source,commerceApi)),loadImage(studioAsset(session.imageUrl))]).then(([photo,art])=>{
      if(active){renderer.current=createProductSurface(photo,art,source);setCalibrated(renderer.current.calibrated);setLoading(false);setError('');setSession(current=>current&&{...current})}
    }).catch(error=>{if(active){setError(error instanceof Error?error.message:'Önizleme yüklenemedi.');setLoading(false)}});
    return()=>{active=false};
  },[source,session?.imageUrl]);
  useEffect(()=>{
    if(!canvas.current||!renderer.current||!session)return;
    renderer.current.render(canvas.current,{strength:showOriginal?0:strength,offsetX,offsetY,scale});
  },[session,strength,offsetX,offsetY,scale,showOriginal]);
  function download(){canvas.current?.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='xinobi-u-urun-onizlemesi.png';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png')}
  return <main className={styles.main}>{error?<div role="alert"><p>{error}</p><Link href="/xinobi-u">Ürününü seç ↗</Link></div>:loading?<p role="status">Tasarımın ürününe uygulanıyor…</p>:session&&<div className={styles.previewLayout}><div><p className={styles.kicker}>{showOriginal ? 'Orijinal ürün görseli' : 'Tasarımlı ürün önizlemesi'}</p><canvas ref={canvas} className={styles.canvas} role="img" aria-label={`${session.product.name} ${session.variant.color} üzerinde AI tasarımının dijital önizlemesi`} /></div><aside className={styles.previewInfo}><p className={styles.kicker}>XINOBI U · Ürününde dene</p><h1>Senin tasarımın.<br />Senin ürünün.</h1><p>{product?.name} · {variant?.color}</p><section className={styles.palette} aria-label="Ürün renk paleti"><h2>Ürün renk paleti</h2><ul>{product?.variants.map(item=><li key={item.id} aria-current={item.id===variant?.id?'true':undefined}><span className={styles.swatch} style={{background:item.hex&&/^#[a-fA-F0-9]{6}$/.test(item.hex)?item.hex:undefined}} aria-hidden="true"/><span>{item.color}<small>{item.hex || 'HEX kodu eklenmedi'}</small></span>{item.id===variant?.id&&<span className={styles.selectedColor}>Seçili</span>}</li>)}</ul></section><p>Desenin ürünün yüzeyine uyarlanır; kıvrımlar, ışık-gölge ve ürün ayrıntıları korunur. Bu önizleme ücretsizdir.</p>{session.imageUrl&&<Image className={styles.smallArt} src={studioAsset(session.imageUrl)} alt="Ürüne uygulanan AI tasarımı" width={100} height={100} unoptimized />}<button className={styles.secondary} aria-pressed={showOriginal} onClick={()=>setShowOriginal(value=>!value)}>{showOriginal?'Tasarımlı görünüm':'Orijinal ürünle karşılaştır'}</button><label>Tasarım görünürlüğü<input type="range" min="20" max="100" value={strength} onChange={event=>setStrength(Number(event.target.value))}/></label><label>Yatay konum<input type="range" min="-15" max="15" value={offsetX} onChange={event=>setOffsetX(Number(event.target.value))}/></label><label>Dikey konum<input type="range" min="-15" max="15" value={offsetY} onChange={event=>setOffsetY(Number(event.target.value))}/></label><label>Tasarım boyutu<input type="range" min="50" max="140" value={scale} onChange={event=>setScale(Number(event.target.value))}/></label><button className={styles.primary} onClick={download}>Ürün önizlemesini indir</button><Link className={styles.secondary} href={`/xinobi-u/sorular?product=${encodeURIComponent(session.product.id)}&variant=${encodeURIComponent(session.variant.id)}`}>Tasarımıma dön</Link>{!calibrated&&<p className={styles.note}>Bu fotoğraf için özel yüzey şablonu henüz yok; genel bir yüzey önizlemesi gösteriliyor.</p>}<p className={styles.note}>Tarayıcıda ücretsiz uygulanır · AI ile oluşturuldu · Dijital yüzey önizlemesi. Gerçek baskı konumu, renk ve malzeme sonucu üretim kontrolünde doğrulanır.</p></aside></div>}</main>;
}
