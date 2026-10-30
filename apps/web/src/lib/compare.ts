'use client';
import {useEffect,useSyncExternalStore} from 'react';
import type {CommerceState} from '../../../../packages/commerce/client';

/** Products picked for comparison (ids), kept on this device and shared by every page. */
export const compareStorageKey='xinobi-compare';
export const maxCompare=4;
const listeners=new Set<()=>void>();
let cached:string[]|null=null;
const empty:string[]=[];

const normalize=(ids:string[])=>[...new Set(ids.filter(id=>typeof id==='string'&&id.trim().length>0))].slice(0,maxCompare);

function read():string[]{
  if(cached)return cached;
  try{const value=JSON.parse(localStorage.getItem(compareStorageKey)||'[]');cached=Array.isArray(value)?normalize(value):[]}
  catch{cached=[]}
  return cached;
}
function write(ids:string[]){
  cached=normalize(ids);
  try{localStorage.setItem(compareStorageKey,JSON.stringify(cached))}catch{}
  listeners.forEach(listener=>listener());
}
function subscribe(callback:()=>void){
  listeners.add(callback);
  const onStorage=(event:StorageEvent)=>{if(event.key===compareStorageKey||event.key===null){cached=null;callback()}};
  window.addEventListener('storage',onStorage);
  return()=>{listeners.delete(callback);window.removeEventListener('storage',onStorage)};
}
export function useCompare(){return useSyncExternalStore(subscribe,read,()=>empty)}
/** Only a successful catalog read may retire removed or unpublished selections. */
export function useCatalogCompare(state:CommerceState|null,error:string){
  const ids=useCompare();
  const available=state&&!error?new Set(state.products.filter(product=>product.active).map(product=>product.id)):null;
  const valid=available?ids.filter(id=>available.has(id)):ids;
  useEffect(()=>{
    if(state&&!error){
      const active=new Set(state.products.filter(product=>product.active).map(product=>product.id));
      const current=read(),next=current.filter(id=>active.has(id));
      if(next.length!==current.length)write(next);
    }
  },[state,error,ids]);
  return valid;
}
/** Adds or removes [id]; returns false when the list is already full. */
export function toggleCompare(id:string){
  const ids=read();
  if(ids.includes(id)){write(ids.filter(item=>item!==id));return true}
  if(ids.length>=maxCompare)return false;
  write([...ids,id]);return true;
}
export const removeCompare=(id:string)=>write(read().filter(item=>item!==id));
export const clearCompare=()=>write([]);
export const setCompare=(ids:string[])=>write([...new Set(ids)]);
