"use client";
import {Suspense,useEffect,useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {loadAcceptedSurface} from "../../urunler/cay-makinesi-101/editor/accepted-surface-api";
import {previewUnavailableMessage} from "../../../features/product-personalization/variant-preview-readiness";
import styles from "../studio.module.css";
function Selection({product,variant}:{product:string;variant:string}){
 const [status,setStatus]=useState<"loading"|"ready"|"unavailable"|"error">("loading");
 useEffect(()=>{const controller=new AbortController();
  if(!product||!variant)return()=>controller.abort();
  loadAcceptedSurface(variant,controller.signal,product).then(inputs=>{if(!controller.signal.aborted)setStatus(inputs?"ready":"unavailable")}).catch(()=>{if(!controller.signal.aborted)setStatus("error")});
  return()=>controller.abort();
 },[product,variant]);
 const identity=new URLSearchParams({product,variant});
 return <main className={styles.main} data-product-reference={product} data-variant-reference={variant}>
  <section className={styles.intro}><p className={styles.kicker}>XINOBI U · Kendi görselin</p><h1>Kendi görselini kullan</h1><p>İstediğiniz görseli ekleyebilirsiniz. Bu yol, hazır görselinizi seçtiğiniz ürün/varyant üzerinde denemek içindir.</p></section>
  <p>Seçim: {product || "Ürün seçilmedi"} · {variant || "Varyant seçilmedi"}</p>
  <section role="status">
   {!product||!variant?<p>Devam etmek için bir ürün ve varyant seçin.</p>:status==="loading"?<p>Geliştirme önizleme uygunluğu kontrol ediliyor…</p>:status==="ready"?<><h2>Seçili varyantın geliştirme önizlemesi hazır.</h2><p>Görsel ekleme adımı henüz kullanıma açık değil. Şu anda dosya seçilmez veya yüklenmez; ürün üzerinde görsel uygulanmaz.</p></>:status==="error"?<p>Geliştirme ürün önizlemesi şu anda doğrulanamıyor.</p>:<><p>{previewUnavailableMessage}</p><p>Başka bir ürünün veya rengin maskesi kullanılmaz.</p></>}
  </section>
  <div className={styles.entryActions}><Link href="/xinobi-u">Başka ürün seç →</Link>{product&&variant&&<Link href={"/xinobi-u/sorular?"+identity}>Tarzını Keşfet →</Link>}</div>
 </main>;
}
function Entry(){const query=useSearchParams();const product=query.get("product")??"",variant=query.get("variant")??"";return <Selection key={product+":"+variant} product={product} variant={variant}/>}
export default function OwnImageEntry(){return <Suspense fallback={<p role="status">Seçim yükleniyor…</p>}><Entry/></Suspense>}
