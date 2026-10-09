'use client';
import {useSyncExternalStore} from 'react';

/** Products picked for comparison (ids), kept on this device and shared by every page. */
export const compareStorageKey='xinobi-compare';
export const maxCompare=4;
const listeners=new Set<()=>void>();
let cached:string[]|null=null;
const empty:string[]=[];

function read():string[]{
  if(cached)return cached;
  try{const value=JSON.parse(localStorage.getItem(compareStorageKey)||'[]');cached=Array.isArray(value)?value.filter((id):id is string=>typeof id==='string').slice(0,maxCompare):[]}
  catch{cached=[]}
  return cached;
}
function write(ids:string[]){
  cached=ids.slice(0,maxCompare);
  try{localStorage.setItem(compareStorageKey,JSON.stringify(cached))}catch{}
  listeners.forEach(listener=>listener());
}
function subscribe(callback:()=>void){
  listeners.add(callback);
  const onStorage=(event:StorageEvent)=>{if(event.key===compareStorageKey){cached=null;callback()}};
  window.addEventListener('storage',onStorage);
  return()=>{listeners.delete(callback);window.removeEventListener('storage',onStorage)};
}
export function useCompare(){return useSyncExternalStore(subscribe,read,()=>empty)}
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
