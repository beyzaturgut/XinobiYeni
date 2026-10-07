"use client";
import {Suspense} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import styles from "./studio.module.css";
function Entry(){
 const query=useSearchParams(),product=query.get("product"),variant=query.get("variant")??"blue";
 const identity=new URLSearchParams({variant});if(product)identity.set("product",product);
 const supported=product?product==="DEMO-P101"&&variant==="DEMO-V101-B":variant==="blue";
 // Fixed Tea Maker development entry only; this is not a surface/variant alias.
 const questionnaireIdentity=product?identity:new URLSearchParams({product:"DEMO-P101",variant:"DEMO-V101-B"});
 if(!supported)return <section className={styles.actionPanel} role="status"><h1>Bu renk için geliştirme önizlemesi kullanılamıyor.</h1><p>Başka bir rengin maskesi kullanılmaz.</p><Link href="/urunler/cay-makinesi-101">Ürüne dön</Link></section>;
 return <section className={styles.actionPanel}><h1>Çay Makinesi 101’i sana özel tasarla.</h1><p>Beş soruyu yanıtla, tasarımını seçtiğin üründe keşfet.</p><Link href={"/xinobi-u/sorular?"+questionnaireIdentity}>Soruları yanıtla →</Link><Link href={"/urunler/cay-makinesi-101/editor?"+identity}>Gelişmiş editörde devam et ↗</Link><p>Geliştirme görsel önizlemesi; fiziksel baskı veya üretim onayı değildir.</p></section>;
}
export default function PersonalizationStudio(){return <Suspense fallback={<p role="status">Önizleme yükleniyor…</p>}><Entry/></Suspense>}
