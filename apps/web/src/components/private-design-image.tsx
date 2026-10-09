'use client';
import {useEffect,useState} from 'react';
import {privateImageUrl} from '../lib/demo-commerce';

/** A customer's design image (saved or on an order line), loaded with the session and always marked as representative (K-12). */
export default function PrivateDesignImage({path,alt,className}:{path:string;alt:string;className?:string}){
  const [src,setSrc]=useState<string|null>(null);
  useEffect(()=>{let url:string|null=null;let active=true;privateImageUrl(path).then(value=>{url=value;if(active)setSrc(value);else URL.revokeObjectURL(value)}).catch(()=>{});return()=>{active=false;if(url)URL.revokeObjectURL(url)}},[path]);
  return <span className={className} style={{position:'relative',display:'inline-block'}}>
    {/* eslint-disable-next-line @next/next/no-img-element -- object URL of a private image */}
    {src?<img src={src} alt={alt} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>:<span aria-hidden="true"/>}
    <small style={{position:'absolute',left:4,bottom:4,background:'rgba(0,0,0,.6)',color:'#fff',fontSize:10,padding:'1px 4px',borderRadius:4}}>Temsilidir</small>
  </span>;
}
