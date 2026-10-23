'use client';
import {useState} from 'react';
import {addToCart} from '../lib/cart';
import styles from './add-to-cart.module.css';
/** Quantity stepper and "Sepete ekle"; the parent keys it by variant so a colour change starts again from one. */
export default function AddToCart({productId,variantId,stock,price}:{productId:string;variantId:string;stock:number;price?:number}){
 const [notice,setNotice]=useState('');const [quantity,setQuantity]=useState(1);const available=stock>0&&price!==undefined&&price>0;
 const max=Math.max(1,Math.min(stock,99));
 return <div className={styles.purchase}><div className={styles.row}>
  <div className={styles.stepper} role="group" aria-label="Adet"><button type="button" aria-label="Azalt" disabled={!available||quantity<=1} onClick={()=>setQuantity(value=>Math.max(1,value-1))}>−</button><span aria-live="polite">{quantity}</span><button type="button" aria-label="Artır" disabled={!available||quantity>=max} onClick={()=>setQuantity(value=>Math.min(max,value+1))}>+</button></div>
  <button className={styles.add} type="button" disabled={!available} onClick={()=>{try{addToCart(productId,variantId,stock,undefined,quantity);setNotice(quantity>1?`Seçtiğin renkten ${quantity} adet sepete eklendi.`:'Seçtiğin renk sepete eklendi.')}catch(error){setNotice(error instanceof Error?error.message:'Sepet kaydedilemedi.')}}}>{stock===0?'Stokta yok':!available?'Fiyat bilgisi bekleniyor':'Sepete ekle'}</button>
 </div><p role="status">{notice}</p></div>
}
