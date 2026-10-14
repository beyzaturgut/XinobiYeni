"use client";
import {useEffect,useRef,useState,type Ref} from 'react';
import type {RenderingInputs} from '../../app/urunler/cay-makinesi-101/editor/accepted-surface-api';
import EditorWorkspace from '../../app/urunler/cay-makinesi-101/editor/editor-workspace';
import {prepareLocalPattern} from './local-pattern-image';
import styles from '../../app/xinobi-u/studio.module.css';
import type {PlacementTransferHandle} from './preview-placement-transfer';
export default function LocalPatternPreview({inputs,initialPatternSrc,xinobiPreview=false,placementRef}:{inputs:RenderingInputs;initialPatternSrc?:string;xinobiPreview?:boolean;placementRef?:Ref<PlacementTransferHandle>}){
 const [pattern,setPattern]=useState<string|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const activeUrl=useRef<string|null>(null),generation=useRef(0),fileInput=useRef<HTMLInputElement>(null);
 const processing=useRef<AbortController|null>(null),pending=useRef<Promise<void>>(Promise.resolve());
 useEffect(()=>()=>{generation.current++;processing.current?.abort();if(activeUrl.current){URL.revokeObjectURL(activeUrl.current);activeUrl.current=null}},[]);
 async function select(file:File){
  processing.current?.abort();const controller=new AbortController();processing.current=controller;
  const ticket=++generation.current;setBusy(true);setError('');
  try{
   // Serialize decoders; a cancelled old selection cannot overwrite the new one.
   const task=pending.current.then(()=>prepareLocalPattern(file,controller.signal));pending.current=task.then(()=>{},()=>{});
   const prepared=await task;
   if(ticket!==generation.current)return;
   const next=URL.createObjectURL(prepared),previous=activeUrl.current;
   activeUrl.current=next;setPattern(next);if(previous)URL.revokeObjectURL(previous);
  }catch(e){if(ticket===generation.current)setError(e instanceof Error?e.message:'Görsel doğrulanamadı.');}
  finally{if(ticket===generation.current)setBusy(false)}
 }
 function remove(){generation.current++;processing.current?.abort();if(activeUrl.current)URL.revokeObjectURL(activeUrl.current);activeUrl.current=null;setPattern(null);setError('');setBusy(false);}
 // Only AI/demo XINOBI previews compose artwork over the pattern. The standalone
 // own-image flow and shopping editor retain their single-artwork behaviour.
 const composeArtwork=xinobiPreview&&Boolean(initialPatternSrc);
 const previewPattern=composeArtwork?initialPatternSrc:pattern??initialPatternSrc;
 return <>
  <div className={styles.localImageSelection}>
   <label htmlFor="local-pattern">{pattern?'Başka bir görsel seç':'Görsel seç'}</label>
   <input ref={fileInput} id="local-pattern" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} aria-describedby="local-image-help" onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void select(file)}}/>
   {pattern&&<button type="button" className={styles.secondary} onClick={remove}>Görseli kaldır</button>}
   <p id="local-image-help">PNG, JPEG veya WebP · Büyük görseller önizleme için otomatik optimize edilir. İşlenmiş görsel en fazla 4096 piksel/kenar, 8 megapiksel ve 8 MiB olur. Görsel yalnız bu tarayıcı önizlemesinde geçici kullanılır; sunucuya yüklenmez veya kalıcı kaydedilmez.</p>
   {busy&&<p role="status">Görsel hazırlanıyor…</p>}{error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>
  {previewPattern&&<EditorWorkspace key={composeArtwork?'composed':pattern?'artwork':'pattern'} renderingInputs={inputs} patternSrc={previewPattern} placementMode={!composeArtwork&&pattern?'artwork':'pattern'} artworkSrc={composeArtwork?pattern??undefined:undefined} onUpload={()=>fileInput.current?.click()} uploadBusy={busy} xinobiPreview={xinobiPreview} placementRef={placementRef}/>}
 </>;
}
