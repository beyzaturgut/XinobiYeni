'use client';
import Link from 'next/link';
import styles from '../app/xinobi-u/studio.module.css';
/** One product/variant context for the three entry methods. Merely following a link never starts inference. */
export default function PersonalizationMethods({product,variant,mode,dirty=false}:{product:string;variant:string;mode:'pattern'|'artwork'|'ai';dirty?:boolean}){
 const identity=new URLSearchParams({product,...(variant?{variant}:{})});
 return <nav className={styles.uploadTabs} aria-label="Kişiselleştirme yöntemi">{([
  ['pattern','Desen yükle','/xinobi-u/kendi-gorselin?'+identity+'&mode=pattern'],
  ['artwork','Görsel yükle','/xinobi-u/kendi-gorselin?'+identity],
  ['ai','AI ile tasarla','/xinobi-u/sorular?'+identity],
 ] as const).map(([value,label,href])=><Link key={value} href={href} aria-current={mode===value?'page':undefined} onClick={event=>{if(value===mode||dirty&&!window.confirm('Kaydedilmemiş görseli bırakıp yöntem değiştirmek istiyor musun?'))event.preventDefault()}}>{label}</Link>)}</nav>;
}
