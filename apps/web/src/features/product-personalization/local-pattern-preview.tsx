"use client";
import {useEffect,useRef,useState} from 'react';
import type {RenderingInputs} from '../../app/urunler/cay-makinesi-101/editor/accepted-surface-api';
import EditorWorkspace from '../../app/urunler/cay-makinesi-101/editor/editor-workspace';
import {validateLocalPattern} from './local-pattern-image';
import styles from '../../app/xinobi-u/studio.module.css';
export default function LocalPatternPreview({inputs}:{inputs:RenderingInputs}){
 const [pattern,setPattern]=useState<string|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const activeUrl=useRef<string|null>(null),generation=useRef(0);
 useEffect(()=>()=>{generation.current++;if(activeUrl.current){URL.revokeObjectURL(activeUrl.current);activeUrl.current=null}},[]);
 async function select(file:File){
  const ticket=++generation.current;setBusy(true);setError('');
  try{
   await validateLocalPattern(file);
   if(ticket!==generation.current)return;
   const next=URL.createObjectURL(file),previous=activeUrl.current;
   activeUrl.current=next;setPattern(next);if(previous)URL.revokeObjectURL(previous);
  }catch(e){if(ticket===generation.current)setError(e instanceof Error?e.message:'Görsel doğrulanamadı.');}
  finally{if(ticket===generation.current)setBusy(false)}
 }
 return <>
  <div className={styles.localImageSelection}>
   <label htmlFor="local-pattern">{pattern?'Başka bir görsel seç':'Görsel seç'}</label>
   <input id="local-pattern" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} aria-describedby="local-image-help" onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void select(file)}}/>
   <p id="local-image-help">PNG, JPEG veya WebP · En fazla 8 MB · Her kenar en fazla 4096 piksel · En fazla 8 megapiksel. Görsel yalnız bu tarayıcı önizlemesinde geçici kullanılır; sunucuya yüklenmez veya kalıcı kaydedilmez.</p>
   {busy&&<p role="status">Görsel doğrulanıyor…</p>}{error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>
  {pattern&&<EditorWorkspace renderingInputs={inputs} patternSrc={pattern} placementMode="artwork"/>}
 </>;
}
