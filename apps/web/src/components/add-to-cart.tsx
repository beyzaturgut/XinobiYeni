'use client';
import {useState} from 'react';
import Link from 'next/link';
import {addToCart} from '../lib/cart';
import styles from './add-to-cart.module.css';
export default function AddToCart({productId,variantId,stock,price}:{productId:string;variantId:string;stock:number;price?:number}){
 const [notice,setNotice]=useState('');const available=stock>0&&price!==undefined&&price>0;
 return <div className={styles.actions}><button disabled={!available} onClick={()=>{try{addToCart(productId,variantId,stock);setNotice('Seçtiğin renk sepete eklendi.')}catch(error){setNotice(error instanceof Error?error.message:'Sepet kaydedilemedi.')}}}>{stock===0?'Stokta yok':!available?'Fiyat bilgisi bekleniyor':'Sepete ekle'}</button><Link href="/sepet">Sepetim →</Link><p role="status">{notice}</p></div>
}
