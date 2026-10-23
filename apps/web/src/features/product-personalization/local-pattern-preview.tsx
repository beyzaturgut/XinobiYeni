"use client";
import {useEffect,useRef,useState,type Ref} from 'react';
import type {RenderingInputs} from '../../app/urunler/cay-makinesi-101/editor/accepted-surface-api';
import EditorWorkspace from '../../app/urunler/cay-makinesi-101/editor/editor-workspace';
import {prepareLocalPattern} from './local-pattern-image';
import SaveDesignButton from '../../components/save-design-button';
import styles from '../../app/xinobi-u/studio.module.css';
import type {DesignPlacement} from '../../lib/design-placement';
import type {PlacementTransferHandle} from './preview-placement-transfer';
export default function LocalPatternPreview({inputs,initialPatternSrc,xinobiPreview=false,placementRef,product,variant,uploadMode="artwork",onDirtyChange}:{inputs:RenderingInputs;initialPatternSrc?:string;xinobiPreview?:boolean;placementRef?:Ref<PlacementTransferHandle>;product?:string;variant?:string;uploadMode?:"pattern"|"artwork";onDirtyChange?:(dirty:boolean)=>void}){
 const [savedPlacement,setSavedPlacement]=useState<DesignPlacement>();
 const [file,setFile]=useState<File|null>(null);
 const [pattern,setPattern]=useState<string|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const activeUrl=useRef<string|null>(null),generation=useRef(0),fileInput=useRef<HTMLInputElement>(null);
 const processing=useRef<AbortController|null>(null),pending=useRef<Promise<void>>(Promise.resolve());
 useEffect(()=>()=>{generation.current++;processing.current?.abort();if(activeUrl.current){URL.revokeObjectURL(activeUrl.current);activeUrl.current=null}},[]);
 async function select(file:File){
  processing.current?.abort();const controller=new AbortController();processing.current=controller;
  const ticket=++generation.current;setBusy(true);setError('');
  try{
   // Queue preparation; cancelled native decoders are disposed when they settle.
   const task=pending.current.then(()=>prepareLocalPattern(file,controller.signal));pending.current=task.then(()=>{},()=>{});
   const prepared=await task;
   if(ticket!==generation.current)return;
   const next=URL.createObjectURL(prepared),previous=activeUrl.current;
   activeUrl.current=next;setPattern(next);setFile(prepared);onDirtyChange?.(true);if(previous)URL.revokeObjectURL(previous);
  }catch(e){if(ticket===generation.current)setError(e instanceof Error?e.message:'Görsel doğrulanamadı.');}
  finally{if(ticket===generation.current)setBusy(false)}
 }
 function remove(){generation.current++;processing.current?.abort();if(activeUrl.current)URL.revokeObjectURL(activeUrl.current);activeUrl.current=null;setPattern(null);setFile(null);setError('');setBusy(false);onDirtyChange?.(false);}
 // Only AI/demo XINOBI previews compose artwork over the pattern. The standalone
 // own-image flow and shopping editor retain their single-artwork behaviour.
 const composeArtwork=xinobiPreview&&Boolean(initialPatternSrc);
 const previewPattern=composeArtwork?initialPatternSrc:pattern??initialPatternSrc;
 return <>
  <div className={styles.localImageSelection} data-upload-card="">
   <label htmlFor="local-pattern">{uploadMode==='pattern'?(pattern?'Başka bir desen seç':'Desen seç'):(pattern?'Başka bir görsel seç':'Görsel seç')}</label>
   <input ref={fileInput} id="local-pattern" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" disabled={busy} aria-describedby="local-image-help" onChange={event=>{const input=event.currentTarget,file=input.files?.[0];if(file)void select(file).finally(()=>{if(input.files?.[0]===file)input.value=''})}}/>
   {pattern&&<button type="button" className={styles.secondary} onClick={remove}>{uploadMode==='pattern'?'Deseni kaldır':'Görseli kaldır'}</button>}
   <p id="local-image-help">PNG, JPEG veya WebP · Dosya boyutu veya çözünürlük için yükleme sınırı yoktur. Büyük görseller önizleme ve kaydetme için otomatik optimize edilir. Görsel bu tarayıcıda önizlenir; yalnız “Tasarımımı kaydet” dersen hesabına yüklenir ve yalnız sen görürsün.</p>
   {busy&&<><p role="status">Görsel hazırlanıyor…</p><button type="button" className={styles.secondary} onClick={()=>{generation.current++;processing.current?.abort();setBusy(false);setError('');}}>Hazırlamayı iptal et</button></>}{error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>
  {previewPattern&&<EditorWorkspace key={composeArtwork?'composed':pattern?'artwork':'pattern'} renderingInputs={inputs} onPlacementChange={setSavedPlacement} patternSrc={previewPattern} placementMode={!composeArtwork&&pattern?uploadMode:'pattern'} fillMask={!composeArtwork&&Boolean(pattern)&&uploadMode==='pattern'} artworkSrc={composeArtwork?pattern??undefined:undefined} onUpload={()=>fileInput.current?.click()} uploadBusy={busy} xinobiPreview={xinobiPreview} placementRef={placementRef}/>}
  {file&&product&&!composeArtwork&&<SaveDesignButton key={pattern} placement={savedPlacement} source={{file,productId:product,variantId:variant??null}}/>}
 </>;
}
