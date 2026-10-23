"use client";
import Image from "next/image";
import PersonalizationMethods from "../../../components/personalization-methods";
import {useCommerce,mediaUrl,commerceApi} from "../../../lib/commerce";
import {Suspense,useEffect,useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {loadAcceptedSurface,type RenderingInputs} from "../../urunler/cay-makinesi-101/editor/accepted-surface-api";
import styles from "../studio.module.css";
import LocalPatternPreview from "../../../features/product-personalization/local-pattern-preview";
import editorStyles from "../../urunler/cay-makinesi-101/editor/editor.module.css";
function Selection({product,variant,mode}:{product:string;variant:string;mode:"pattern"|"artwork"}){
 const {state}=useCommerce();
 const selected=state?.products.find(item=>item.id===product&&item.active),color=selected?.variants.find(item=>item.id===variant);
 const [dirty,setDirty]=useState(false),[retry,setRetry]=useState(0);
 const [inputs,setInputs]=useState<RenderingInputs|null>(null);
 const [status,setStatus]=useState<"loading"|"ready"|"unavailable"|"error">("loading");
 useEffect(()=>{const controller=new AbortController();
  if(!product||!variant)return()=>controller.abort();
  loadAcceptedSurface(variant,controller.signal,product).then(inputs=>{if(!controller.signal.aborted){setInputs(inputs);setStatus(inputs?"ready":"unavailable")}}).catch(()=>{if(!controller.signal.aborted)setStatus("error")});
  return()=>controller.abort();
 },[product,variant,retry]);
 const identity=new URLSearchParams({product,variant});
 return <main className={styles.main} data-product-reference={product} data-variant-reference={variant}>
  <section className={styles.intro}><p className={styles.kicker}>XINOBI U · {mode==='pattern'?'Kendi desenin':'Kendi görselin'}</p><h1>{mode==='pattern'?'Kendi deseninizi yükleyin':'Kendi görselinizi ekleyin'}</h1><p>{mode==='pattern'?'Yüklediğiniz desen, seçtiğiniz ürünün onaylı kişiselleştirme alanını kaplar.':'Dilediğiniz fotoğrafı veya görseli yükleyerek ürününüzü kişiselleştirin.'}</p></section>
  {selected&&color&&<div className={styles.productContext}>{(color.image||selected.originalImage)&&<Image src={mediaUrl(color.image||selected.originalImage||'',commerceApi)} alt="" width={96} height={96}/>}<div><strong>{selected.name}</strong><p>Seçili renk: {color.color}</p></div></div>}
  <PersonalizationMethods product={product} variant={variant} mode={mode} dirty={dirty}/>
  <section role="status">
   {!product||!variant?<p>Devam etmek için bir ürün ve varyant seçin.</p>:status==="loading"?<p>Ürün hazırlanıyor…</p>:status==="ready"?null:status==="error"?<><p>Ürün önizlemesi yüklenemedi.</p><button type="button" onClick={()=>{setStatus("loading");setRetry(value=>value+1)}}>Önizlemeyi yeniden yükle</button></>:<><p>Bu renk için onaylı yüzey henüz hazır değil.</p><p>Başka bir ürünün veya rengin maskesi kullanılmaz.</p></>}
  </section>
  {selected?.personalizable===true&&status==="ready"&&inputs&&<LocalPatternPreview key={mode} uploadMode={mode} onDirtyChange={setDirty} xinobiPreview inputs={inputs} product={product} variant={variant}/>}
  {selected&&selected.personalizable!==true&&<p role="alert">Bu ürün kişiselleştirme programında değil.</p>}
  <div className={styles.entryActions}><Link href="/xinobi-u">Başka ürün seç →</Link>{product&&variant&&<Link href={"/xinobi-u/sorular?"+identity}>Tarzını Keşfet →</Link>}</div>
 </main>;
}
function Entry(){const query=useSearchParams();const product=query.get("product")??"",variant=query.get("variant")??"";return <div className={query.get('mobile')==='1'?editorStyles.mobilePreviewPage:undefined}><Selection key={product+":"+variant} product={product} variant={variant} mode={query.get("mode")==="pattern"?"pattern":"artwork"}/></div>}
export default function OwnImageEntry(){return <Suspense fallback={<p role="status">Seçim yükleniyor…</p>}><Entry/></Suspense>}
