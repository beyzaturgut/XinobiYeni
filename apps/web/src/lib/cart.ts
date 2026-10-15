'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {validDesignPlacement,readDesignPlacement,type DesignPlacement} from './design-placement';
/** A cart row; [designId]/[designName] make it a personalised line with one of the customer's saved designs. */
export type CartLine={productId:string;variantId:string;quantity:number;designId?:string;designName?:string;designPlacement?:DesignPlacement};
export type CartDesign={id:string;name:string;placement?:DesignPlacement};
const key='xinobi-cart-v1',changed='xinobi-cart-changed';
function snapshot(){try{return localStorage.getItem(key)||'[]'}catch{return '[]'}}
const text=(value:unknown,max:number)=>typeof value==='string'&&value.length>0&&value.length<=max;
function parse(raw:string):CartLine[]{try{const rows=JSON.parse(raw);if(!Array.isArray(rows))return [];return rows.filter(row=>row&&typeof row.productId==='string'&&typeof row.variantId==='string'&&Number.isInteger(row.quantity)&&row.quantity>0&&row.quantity<=99&&(row.designId===undefined||text(row.designId,64)&&text(row.designName,60))).slice(0,100).map(row=>{const {designPlacement,...rest}=row;return {...rest,...(validDesignPlacement(designPlacement)?{designPlacement}:{})}})}catch{return []}}
function write(rows:CartLine[]){localStorage.setItem(key,JSON.stringify(rows));window.dispatchEvent(new Event(changed))}
function subscribe(callback:()=>void){window.addEventListener(changed,callback);window.addEventListener('storage',callback);return()=>{window.removeEventListener(changed,callback);window.removeEventListener('storage',callback)}}
/** The same colour with another design (or none) is a separate line. */
export const sameLine=(row:CartLine,productId:string,variantId:string,designId?:string)=>row.productId===productId&&row.variantId===variantId&&(row.designId??'')===(designId??'');
export const cartLineKey=(row:CartLine)=>`${row.productId}:${row.variantId}:${row.designId??''}`;
/** Units of one colour across all its lines; stock limits the colour, not each design. */
export const variantUnits=(rows:CartLine[],variantId:string)=>rows.filter(row=>row.variantId===variantId).reduce((sum,row)=>sum+row.quantity,0);
export function useCart(){const raw=useSyncExternalStore(subscribe,snapshot,()=>'[]');return useMemo(()=>parse(raw),[raw])}
export function addToCart(productId:string,variantId:string,stock:number,design?:CartDesign){if(design&&!design.placement)design={...design,placement:readDesignPlacement(design.id,productId,variantId)};const rows=parse(snapshot());const existing=rows.find(row=>sameLine(row,productId,variantId,design?.id));if(variantUnits(rows,variantId)>=Math.min(stock,99)||(existing?.quantity||0)>=99)throw new Error('Bu renk için sepetteki adet mevcut stok sınırına ulaştı.');write(existing?rows.map(row=>row===existing?{...row,quantity:row.quantity+1,...(design?.placement?{designPlacement:design.placement}:{})}:row):[...rows,{productId,variantId,quantity:1,...(design?{designId:design.id,designName:design.name,...(design.placement?{designPlacement:design.placement}:{})}:{})}])}
export function setCartQuantity(productId:string,variantId:string,quantity:number,designId?:string){if(!Number.isInteger(quantity)||quantity<0||quantity>99)throw new Error('Geçerli adet girin.');const rows=parse(snapshot());write(quantity===0?rows.filter(row=>!sameLine(row,productId,variantId,designId)):rows.map(row=>sameLine(row,productId,variantId,designId)?{...row,quantity}:row))}
export function clearCart(){write([])}
