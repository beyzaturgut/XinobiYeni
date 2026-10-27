"use client";
import {useRef} from 'react';
import type {RenderingInputs} from './rendering/accepted-surface-api';
import PlacementStudio from '../../app/xinobi-u/kendi-gorselin/placement-studio';
import {useLocalPatternFile} from './use-local-pattern-file';
import styles from '../../app/xinobi-u/studio.module.css';
export default function LocalPatternPreview({inputs,initialPatternSrc}:{inputs:RenderingInputs;initialPatternSrc?:string}){
 const {file,url:pattern,error,busy,select,remove,cancel}=useLocalPatternFile();
 const fileInput=useRef<HTMLInputElement>(null);
 const previewPattern=pattern??initialPatternSrc;
 return <>
  <div className={styles.localImageSelection} data-upload-card="">
   <label htmlFor="local-pattern">{pattern?'Başka bir görsel seç':'Görsel seç'}</label>
   <input ref={fileInput} id="local-pattern" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" disabled={busy} aria-describedby="local-image-help" onChange={event=>{const input=event.currentTarget,file=input.files?.[0];if(file)void select(file).finally(()=>{if(input.files?.[0]===file)input.value=''})}}/>
   {pattern&&<button type="button" className={styles.secondary} onClick={remove}>Görseli kaldır</button>}
   <p id="local-image-help">PNG, JPEG veya WebP · Dosya boyutu veya çözünürlük için yükleme sınırı yoktur. Büyük görseller önizleme ve kaydetme için otomatik optimize edilir. Bu referans önizlemesinde görsel yalnızca tarayıcıda işlenir. Hesabına kaydetmek için XINOBI U ürün seçimiyle başlayın.</p>
   {busy&&<><p role="status">Görsel hazırlanıyor…</p><button type="button" className={styles.secondary} onClick={cancel}>Hazırlamayı iptal et</button></>}{error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>
  {/* Surface diagnostics have no commerce identity and never receive file/save actions. */}
  {previewPattern&&<PlacementStudio key={pattern?'artwork':'pattern'} product={{id:'',name:inputs.displayName??'Ürün önizlemesi'}} active={{id:'',color:''}} variants={[]} surfaces={{'':inputs}} onActiveChange={()=>{}} mode={pattern?'artwork':'pattern'} cover={false} patternUrl={previewPattern} source={{name:file?.name??'Örnek desen',type:file?.type??'',size:file?.size??0}} canChange changeLabel="Görsel yükle" changeHref="#local-pattern" onChange={()=>fileInput.current?.click()}/>}

 </>;
}
