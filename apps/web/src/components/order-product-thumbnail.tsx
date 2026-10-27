'use client';
import {useEffect,useState} from 'react';
import OrderProductViewer from './order-product-viewer';
import {configurationPreviewPath,privateImageUrl,type OrderLine} from '../lib/demo-commerce';
import styles from './order-product-thumbnail.module.css';

/** The thumbnail and viewer share the order snapshot, falling back to its purchased revision. */
export default function OrderProductThumbnail({orderId,index,line}:{orderId:string;index:number;line:OrderLine}){
 const [src,setSrc]=useState<string|null>(null),[loading,setLoading]=useState(true),[open,setOpen]=useState(false);
 const personalized=Boolean(line.personalization),configurationId=line.personalization?.configurationId,revision=line.personalization?.configurationRevision;
 useEffect(()=>{
  let active=true,url:string|null=null;
  const paths=personalized?[`/api/v1/me/orders/${encodeURIComponent(orderId)}/lines/${index}/preview`,...(configurationId&&revision?[configurationPreviewPath(configurationId,revision)]:[])]:[];
  async function load(){
   for(const path of paths){
    let candidate:string|null=null;
    try{
     candidate=await privateImageUrl(path);const image=new window.Image();image.src=candidate;await image.decode();
     if(!active){URL.revokeObjectURL(candidate);return;}
     url=candidate;setSrc(candidate);setLoading(false);return;
    }catch{if(candidate)URL.revokeObjectURL(candidate);if(!active)return;}
   }
   if(active)setLoading(false);
  }
  void load();return()=>{active=false;if(url)URL.revokeObjectURL(url)};
 },[orderId,index,personalized,configurationId,revision]);
 const imageSrc=src??line.imageUrl;
 const image=<>
  {/* eslint-disable-next-line @next/next/no-img-element -- authenticated composition uses an object URL */}
  {imageSrc?<img src={imageSrc} alt={`${line.name}, ${src?'tasarladığın ürün':'ürün görseli'}`}/>:<span>Ürün görseli mevcut değil</span>}
  {personalized&&!src&&<small>{loading?'Önizleme yükleniyor…':'Tasarım önizlemesi mevcut değil'}</small>}
 </>;
 return <>
  <button type="button" className={styles.thumbnail} aria-label={`${line.name} ürün önizlemesini büyüt`} onClick={event=>{event.currentTarget.focus();setOpen(true)}}>{image}</button>
  {open&&<OrderProductViewer title={line.name} onClose={()=>setOpen(false)}>{image}</OrderProductViewer>}
 </>;
}
