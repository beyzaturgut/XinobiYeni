'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {myDesignConfigurations,myDesigns,setDesignConfigurationFavorite,useDemoCommerce,designImagePath,type MyDesign,type MyDesignConfiguration} from '../lib/demo-commerce';
import {useCommerce} from '../lib/commerce';
import DesignOnProduct from './design-on-product';
import styles from '../app/favoriler/favorites.module.css';
export default function DesignFavorites(){const {user}=useDemoCommerce();return user?<Favorites key={user.id}/>:null}
function Favorites(){
 const {state}=useCommerce();
 const [items,setItems]=useState<MyDesignConfiguration[]>(),[designs,setDesigns]=useState<MyDesign[]>([]),[error,setError]=useState(''),[retry,setRetry]=useState(0),[busy,setBusy]=useState('');
 useEffect(()=>{let active=true;Promise.all([myDesignConfigurations(),myDesigns()]).then(([configs,designs])=>{if(active){setItems(configs.filter(item=>item.favorite));setDesigns(designs)}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Tasarım favorileri yüklenemedi.')});return()=>{active=false}},[retry]);
 return <section className={styles.content} aria-label="Kişisel tasarım favorileri"><h2>Tasarım favorilerim</h2><p>Ürün, renk ve kaydettiğin yerleşim hesabında birlikte saklanır.</p>{error&&<p role="alert">{error} <button onClick={()=>{setError('');setRetry(v=>v+1)}}>Tasarım favorilerini tekrar yükle</button></p>}{!items&&!error&&<p role="status">Tasarım favorileri yükleniyor…</p>}{items?.length===0&&<p>Önizlemede “Yerleşimi favorilere kaydet” ile tasarım ekleyebilirsin.</p>}
 <div className={styles.grid}>{items?.map(item=>{const design=designs.find(d=>d.id===item.designId);return <article key={item.id}><Link href={'/hesap/tasarimlarim/onizleme?'+new URLSearchParams({id:item.designId,configuration:item.id,variant:item.variantId})}><DesignOnProduct productId={item.productId} variantId={item.variantId} designPath={designImagePath(item.designId)} kind={design?.kind} placement={item.placement} alt={`${design?.name??'Tasarım'} ürün üzerinde · Temsilidir`}/><h3>{design?.name??'Tasarım kullanılamıyor'}</h3><p>{design?.productName} · {state?.products.find(p=>p.id===item.productId)?.variants.find(v=>v.id===item.variantId)?.color??'Renk kaydı kullanılamıyor'} · Yerleşim {item.revision}</p><span>Yerleşimi düzenle →</span></Link><button disabled={busy===item.id} onClick={async()=>{setBusy(item.id);setError('');try{await setDesignConfigurationFavorite(item.id,false);setItems(list=>list?.filter(i=>i.id!==item.id))}catch(e){setError(e instanceof Error?e.message:'Favori kaldırılamadı.')}finally{setBusy('')}}}>Tasarımı favorilerden çıkar</button></article>})}</div></section>;
}
