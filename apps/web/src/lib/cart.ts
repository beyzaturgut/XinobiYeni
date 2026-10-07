'use client';
import {useMemo,useSyncExternalStore} from 'react';
export type CartLine={productId:string;variantId:string;quantity:number};
const key='xinobi-cart-v1',changed='xinobi-cart-changed';
function snapshot(){try{return localStorage.getItem(key)||'[]'}catch{return '[]'}}
function parse(raw:string):CartLine[]{try{const rows=JSON.parse(raw);if(!Array.isArray(rows))return [];return rows.filter(row=>row&&typeof row.productId==='string'&&typeof row.variantId==='string'&&Number.isInteger(row.quantity)&&row.quantity>0&&row.quantity<=99).slice(0,100)}catch{return []}}
function write(rows:CartLine[]){localStorage.setItem(key,JSON.stringify(rows));window.dispatchEvent(new Event(changed))}
function subscribe(callback:()=>void){window.addEventListener(changed,callback);window.addEventListener('storage',callback);return()=>{window.removeEventListener(changed,callback);window.removeEventListener('storage',callback)}}
export function useCart(){const raw=useSyncExternalStore(subscribe,snapshot,()=>'[]');return useMemo(()=>parse(raw),[raw])}
export function addToCart(productId:string,variantId:string,stock:number){const rows=parse(snapshot());const existing=rows.find(row=>row.productId===productId&&row.variantId===variantId);if((existing?.quantity||0)>=Math.min(stock,99))throw new Error('Bu renk için sepetteki adet mevcut stok sınırına ulaştı.');write(existing?rows.map(row=>row===existing?{...row,quantity:row.quantity+1}:row):[...rows,{productId,variantId,quantity:1}])}
export function setCartQuantity(productId:string,variantId:string,quantity:number){if(!Number.isInteger(quantity)||quantity<0||quantity>99)throw new Error('Geçerli adet girin.');const rows=parse(snapshot());write(quantity===0?rows.filter(row=>row.productId!==productId||row.variantId!==variantId):rows.map(row=>row.productId===productId&&row.variantId===variantId?{...row,quantity}:row))}
export function clearCart(){write([])}
