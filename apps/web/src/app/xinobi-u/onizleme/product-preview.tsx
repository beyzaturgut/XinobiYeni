'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {designRequest,type DesignSession} from '../../../lib/design-studio';
import AcceptedSurfaceEditor from '../../urunler/cay-makinesi-101/editor/accepted-surface-editor';
import styles from '../studio.module.css';
export default function ProductPreview(){
 const [session,setSession]=useState<DesignSession|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  let active=true;const id=sessionStorage.getItem('xinobi-u-selected-session');
  if(!id){Promise.resolve().then(()=>{if(active)setError('Önce bir ürün seçip tasarımını oluştur.')});return()=>{active=false}}
  designRequest<DesignSession>('/sessions/'+encodeURIComponent(id)).then(value=>{
   if(value.status!=='ready'||!value.imageUrl||!/^\/api\/v1\/design-studio\/sessions\/[a-f0-9]+\/image$/.test(value.imageUrl))throw new Error('Tamamlanmış bir tasarım gerekli.');
   if(active)setSession(value);
  }).catch(()=>{if(active)setError('Tasarım önizlemesi yüklenemedi.')});
  return()=>{active=false};
 },[]);
 if(error)return <main className={styles.main}><p role="alert">{error}</p><Link href="/xinobi-u">Ürününü seç ↗</Link></main>;
 if(!session)return <main className={styles.main}><p role="status">Tasarımın yükleniyor…</p></main>;
 return <><header className={styles.main}><p>{session.product.name} · {session.variant.color}</p><Link href={"/xinobi-u/sorular?product="+encodeURIComponent(session.product.id)+"&variant="+encodeURIComponent(session.variant.id)}>Tasarımıma dön</Link><p className={styles.note}>Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.</p></header><AcceptedSurfaceEditor commerceProduct={session.product.id} commerceVariant={session.variant.id} patternSrc={session.imageUrl!}/></>;
}
