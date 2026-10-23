"use client";
import {useRef,useState,type Ref} from 'react';
import type {RenderingInputs} from '../../app/urunler/cay-makinesi-101/editor/accepted-surface-api';
import EditorWorkspace from '../../app/urunler/cay-makinesi-101/editor/editor-workspace';
import {useLocalPatternFile} from './use-local-pattern-file';
import SaveDesignButton from '../../components/save-design-button';
import styles from '../../app/xinobi-u/studio.module.css';
import type {DesignPlacement} from '../../lib/design-placement';
import type {PlacementTransferHandle} from './preview-placement-transfer';
export default function LocalPatternPreview({inputs,initialPatternSrc,xinobiPreview=false,placementRef,product,variant,uploadMode="artwork",onDirtyChange}:{inputs:RenderingInputs;initialPatternSrc?:string;xinobiPreview?:boolean;placementRef?:Ref<PlacementTransferHandle>;product?:string;variant?:string;uploadMode?:"pattern"|"artwork";onDirtyChange?:(dirty:boolean)=>void}){
 const [savedPlacement,setSavedPlacement]=useState<DesignPlacement>();
 const {file,url:pattern,error,busy,select,remove,cancel}=useLocalPatternFile(onDirtyChange);
 const fileInput=useRef<HTMLInputElement>(null);
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
   {busy&&<><p role="status">Görsel hazırlanıyor…</p><button type="button" className={styles.secondary} onClick={cancel}>Hazırlamayı iptal et</button></>}{error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>
  {previewPattern&&<EditorWorkspace key={composeArtwork?'composed':pattern?'artwork':'pattern'} renderingInputs={inputs} onPlacementChange={setSavedPlacement} patternSrc={previewPattern} placementMode={!composeArtwork&&pattern?uploadMode:'pattern'} fillMask={!composeArtwork&&Boolean(pattern)&&uploadMode==='pattern'} artworkSrc={composeArtwork?pattern??undefined:undefined} onUpload={()=>fileInput.current?.click()} uploadBusy={busy} xinobiPreview={xinobiPreview} placementRef={placementRef}/>}
  {file&&product&&!composeArtwork&&<SaveDesignButton key={pattern} placement={savedPlacement} source={{file,productId:product,variantId:variant??null}}/>}
 </>;
}
