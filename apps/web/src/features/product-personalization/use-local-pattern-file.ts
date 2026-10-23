"use client";
import {useEffect,useRef,useState} from 'react';
import {prepareLocalPattern} from './local-pattern-image';

export type LocalPatternSource={name:string;type:string;size:number};

/** One locally prepared image: validation/optimisation, cancellation and the object URL lifecycle.
 *  Nothing leaves the browser; [source] describes the file the customer picked. */
export function useLocalPatternFile(onDirtyChange?:(dirty:boolean)=>void){
 const [file,setFile]=useState<File|null>(null),[source,setSource]=useState<LocalPatternSource|null>(null);
 const [url,setUrl]=useState<string|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const activeUrl=useRef<string|null>(null),generation=useRef(0);
 const processing=useRef<AbortController|null>(null),pending=useRef<Promise<void>>(Promise.resolve());
 useEffect(()=>()=>{generation.current++;processing.current?.abort();if(activeUrl.current){URL.revokeObjectURL(activeUrl.current);activeUrl.current=null}},[]);
 async function select(picked:File){
  processing.current?.abort();const controller=new AbortController();processing.current=controller;
  const ticket=++generation.current;setBusy(true);setError('');
  try{
   // Queue preparation; cancelled native decoders are disposed when they settle.
   const task=pending.current.then(()=>prepareLocalPattern(picked,controller.signal));pending.current=task.then(()=>{},()=>{});
   const prepared=await task;
   if(ticket!==generation.current)return;
   const next=URL.createObjectURL(prepared),previous=activeUrl.current;
   activeUrl.current=next;setUrl(next);setFile(prepared);setSource({name:picked.name,type:picked.type,size:picked.size});onDirtyChange?.(true);if(previous)URL.revokeObjectURL(previous);
  }catch(e){if(ticket===generation.current)setError(e instanceof Error?e.message:'Görsel doğrulanamadı.');}
  finally{if(ticket===generation.current)setBusy(false)}
 }
 function remove(){generation.current++;processing.current?.abort();if(activeUrl.current)URL.revokeObjectURL(activeUrl.current);activeUrl.current=null;setUrl(null);setFile(null);setSource(null);setError('');setBusy(false);onDirtyChange?.(false);}
 function cancel(){generation.current++;processing.current?.abort();setBusy(false);setError('');}
 return {file,source,url,error,busy,select,remove,cancel};
}

/** "PNG · 1,2 MB" for the picked file. */
export function fileMeta(source:LocalPatternSource){
 const type=(source.type.split('/')[1]||'').toUpperCase();
 const size=source.size>1048576?(source.size/1048576).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(source.size/1024))+' KB';
 return (type?type+' · ':'')+size;
}
