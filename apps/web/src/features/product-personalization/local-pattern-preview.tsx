"use client";
import {useEffect,useRef,useState} from 'react';
import type {RenderingInputs} from '../../app/urunler/cay-makinesi-101/editor/accepted-surface-api';
import EditorWorkspace from '../../app/urunler/cay-makinesi-101/editor/editor-workspace';
import {validateLocalPattern} from './local-pattern-image';
import SaveDesignButton from '../../components/save-design-button';
import styles from '../../app/xinobi-u/studio.module.css';
export default function LocalPatternPreview({inputs,initialPatternSrc,product,variant}:{inputs:RenderingInputs;initialPatternSrc?:string;product?:string;variant?:string}){
 const [file,setFile]=useState<File|null>(null);
 const [pattern,setPattern]=useState<string|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const activeUrl=useRef<string|null>(null),generation=useRef(0),fileInput=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{generation.current++;if(activeUrl.current){URL.revokeObjectURL(activeUrl.current);activeUrl.current=null}},[]);
 async function select(file:File){
  const ticket=++generation.current;setBusy(true);setError('');
  try{
   await validateLocalPattern(file);
   if(ticket!==generation.current)return;
   const next=URL.createObjectURL(file),previous=activeUrl.current;
   activeUrl.current=next;setPattern(next);setFile(file);if(previous)URL.revokeObjectURL(previous);
  }catch(e){if(ticket===generation.current)setError(e instanceof Error?e.message:'Görsel doğrulanamadı.');}
  finally{if(ticket===generation.current)setBusy(false)}
 }
 function remove(){generation.current++;if(activeUrl.current)URL.revokeObjectURL(activeUrl.current);activeUrl.current=null;setPattern(null);setFile(null);setError('');setBusy(false);}
 const previewPattern=pattern??initialPatternSrc;
 return <>
  <div className={styles.localImageSelection}>
   <label htmlFor="local-pattern">{pattern?'Başka bir görsel seç':'Görsel seç'}</label>
   <input ref={fileInput} id="local-pattern" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} aria-describedby="local-image-help" onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void select(file)}}/>
   {pattern&&<button type="button" className={styles.secondary} onClick={remove}>Görseli kaldır</button>}
   <p id="local-image-help">PNG, JPEG veya WebP · En fazla 8 MB · Her kenar en fazla 4096 piksel · En fazla 8 megapiksel. Görsel bu tarayıcıda önizlenir; yalnız “Tasarımımı kaydet” dersen hesabına yüklenir ve yalnız sen görürsün.</p>
   {busy&&<p role="status">Görsel doğrulanıyor…</p>}{error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>
  {previewPattern&&<EditorWorkspace key={pattern?'artwork':'pattern'} renderingInputs={inputs} patternSrc={previewPattern} placementMode={pattern?'artwork':'pattern'} onUpload={()=>fileInput.current?.click()} uploadBusy={busy}/>}
  {file&&product&&<SaveDesignButton key={pattern} source={{file,productId:product,variantId:variant??null}}/>}
 </>;
}
