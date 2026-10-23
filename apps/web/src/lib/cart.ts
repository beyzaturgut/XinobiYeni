'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {validDesignPlacement,readDesignPlacement,type DesignPlacement} from './design-placement';
/** A cart row; [designId]/[designName] make it a personalised line with one of the customer's saved designs. */
export type CartLine={productId:string;variantId:string;quantity:number;designId?:string;designName?:string;designPlacement?:DesignPlacement;configurationId?:string;configurationRevision?:number};
export type CartDesign={id:string;name:string;placement?:DesignPlacement;configurationId?:string;configurationRevision?:number};
const key='xinobi-cart-v1',changed='xinobi-cart-changed';
function snapshot(){try{return localStorage.getItem(key)||'[]'}catch{return '[]'}}
const text=(value:unknown,max:number)=>typeof value==='string'&&value.length>0&&value.length<=max;
function parse(raw:string):CartLine[]{try{const rows=JSON.parse(raw);if(!Array.isArray(rows))return [];return rows.filter(row=>row&&typeof row.productId==='string'&&typeof row.variantId==='string'&&Number.isInteger(row.quantity)&&row.quantity>0&&row.quantity<=99&&(row.designId===undefined||text(row.designId,64)&&text(row.designName,60))&&(row.configurationId===undefined&&row.configurationRevision===undefined||row.designId&&typeof row.configurationId==='string'&&/^[a-f0-9]{32}$/.test(row.configurationId)&&Number.isInteger(row.configurationRevision)&&row.configurationRevision>0)).slice(0,100).map(row=>{const {designPlacement,...rest}=row;return {...rest,...(validDesignPlacement(designPlacement)?{designPlacement}:{})}})}catch{return []}}
function write(rows:CartLine[]){localStorage.setItem(key,JSON.stringify(rows));window.dispatchEvent(new Event(changed))}
function subscribe(callback:()=>void){window.addEventListener(changed,callback);window.addEventListener('storage',callback);return()=>{window.removeEventListener(changed,callback);window.removeEventListener('storage',callback)}}
/** The same colour with another design (or none) is a separate line. */
export const sameLine=(row:CartLine,productId:string,variantId:string,designId?:string,configurationId?:string,configurationRevision?:number)=>row.productId===productId&&row.variantId===variantId&&(row.designId??'')===(designId??'')&&(row.configurationId??'')===(configurationId??'')&&row.configurationRevision===configurationRevision;
export const cartLineKey=(row:CartLine)=>`${row.productId}:${row.variantId}:${row.designId??''}${row.configurationId?':'+row.configurationId+':'+row.configurationRevision:''}`;
/** Units of one colour across all its lines; stock limits the colour, not each design. */
export const variantUnits=(rows:CartLine[],variantId:string)=>rows.filter(row=>row.variantId===variantId).reduce((sum,row)=>sum+row.quantity,0);
export function useCart(){const raw=useSyncExternalStore(subscribe,snapshot,()=>'[]');return useMemo(()=>parse(raw),[raw])}
export function addToCart(productId:string,variantId:string,stock:number,design?:CartDesign){if(design&&!design.placement)design={...design,placement:readDesignPlacement(design.id,productId,variantId)};const rows=parse(snapshot());const existing=rows.find(row=>sameLine(row,productId,variantId,design?.id,design?.configurationId,design?.configurationRevision));if(variantUnits(rows,variantId)>=Math.min(stock,99)||(existing?.quantity||0)>=99)throw new Error('Bu renk için sepetteki adet mevcut stok sınırına ulaştı.');write(existing?rows.map(row=>row===existing?{...row,quantity:row.quantity+1,...(design?.configurationId?{configurationRevision:design.configurationRevision}:{}),...(design?.placement?{designPlacement:design.placement}:{})}:row):[...rows,{productId,variantId,quantity:1,...(design?{designId:design.id,designName:design.name,...(design.configurationId?{configurationId:design.configurationId,configurationRevision:design.configurationRevision}:{}),...(design.placement?{designPlacement:design.placement}:{})}:{})}])}
export function setCartQuantity(productId:string,variantId:string,quantity:number,designId?:string,configurationId?:string,configurationRevision?:number){if(!Number.isInteger(quantity)||quantity<0||quantity>99)throw new Error('Geçerli adet girin.');const rows=parse(snapshot());write(quantity===0?rows.filter(row=>!sameLine(row,productId,variantId,designId,configurationId,configurationRevision)):rows.map(row=>sameLine(row,productId,variantId,designId,configurationId,configurationRevision)?{...row,quantity}:row))}
export function clearCart(){write([])}

/** Updates exactly one existing row; optimistic revision check prevents a stale editor from recreating/overwriting it. */
export function updateCartDesign(target:string,expectedRevision:number|undefined,design:CartDesign){
 const rows=parse(snapshot()),row=rows.find(item=>cartLineKey(item)===target);
 if(!row)throw new Error('Düzenlediğin sepet satırı kaldırılmış. Sepete dön.');
 if(row.configurationRevision!==expectedRevision)throw new Error('Sepet satırı başka bir işlemde değişti. Yeniden aç.');
 if(row.designId!==design.id)throw new Error('Tasarım sepet satırıyla eşleşmiyor.');
 write(rows.map(item=>item===row?{...item,designName:design.name,designPlacement:design.placement,configurationId:design.configurationId,configurationRevision:design.configurationRevision}:item));
}
