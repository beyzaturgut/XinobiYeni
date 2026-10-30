'use client';
import {useState} from 'react';
import {addToCart} from '../lib/cart';
import styles from './add-to-cart.module.css';
/** Quantity stepper and "Sepete ekle"; the parent keys it by variant so a colour change starts again from one. */
export default function AddToCart({productId,variantId,stock,price}:{productId:string;variantId:string;stock:number;price?:number}){
 const [notice,setNotice]=useState('');const [quantity,setQuantity]=useState(1);const available=Number.isSafeInteger(stock)&&stock>0&&Number.isSafeInteger(price)&&price!==undefined&&price>0;
 const max=Number.isSafeInteger(stock)?Math.max(1,Math.min(stock,99)):1;
 const amount=Math.min(quantity,max);
 return <div className={styles.purchase}><div className={styles.row}>
  <div className={styles.stepper} role="group" aria-label="Adet"><button type="button" aria-label="Azalt" disabled={!available||amount<=1} onClick={()=>setQuantity(Math.max(1,amount-1))}>−</button><span aria-live="polite">{amount}</span><button type="button" aria-label="Artır" disabled={!available||amount>=max} onClick={()=>setQuantity(Math.min(max,amount+1))}>+</button></div>
  <button className={styles.add} type="button" disabled={!available} onClick={()=>{try{addToCart(productId,variantId,stock,undefined,amount);setNotice(amount>1?`Seçtiğin renkten ${amount} adet sepete eklendi.`:'Seçtiğin renk sepete eklendi.')}catch(error){setNotice(error instanceof Error?error.message:'Sepet kaydedilemedi.')}}}>{!(stock>0)?'Stokta yok':!available?'Fiyat bilgisi bekleniyor':'Sepete ekle'}</button>
 </div><p role="status">{notice}</p></div>
}
