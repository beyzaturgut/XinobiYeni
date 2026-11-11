import {useCallback,useEffect,useMemo,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {useAdminSession} from '../../AdminAccess'
import {commerceApi,commerceRequest,mediaUrl} from '../../commerce'
import MaskPrompt from './MaskPrompt'
import {sourceChecksum} from './source-checksum'
import './surface-masks.css'

type Status='none'|'draft'|'approved'|'stale'
type Source={image:string;sha256:string;mime:string;bytes:number;width:number;height:number}
type Mask={id:string;image:string;sha256:string;method:string;sourceRevision:number;sourceSha256:string}
type Detail={productId:string;productName:string;profileRevision:number;sourceRevision:number;sourceStatus:'none'|'ready'|'stale';source:Source|null;status:Status;draft:Mask|null;approved:Mask|null;catalogPhotos?:{id:string;label:string;image:string}[]|null;catalogPhotoId?:string|null}
type Activity={dirty:boolean;busy:boolean}
const root='/surfaces/products'
const asset=(path:string)=>path.startsWith('/api/v1/local-commerce/')?commerceApi.replace(/\/api\/v1\/local-commerce\/?$/,'')+path:mediaUrl(path,commerceApi,'http://127.0.0.1:3000')
const text:Record<Status,string>={none:'Maske yok',draft:'Taslak',approved:'Onaylı',stale:'Eski kaynak'}
const problem=(value:unknown)=>value instanceof Error?value.message:'Maske işlemi tamamlanamadı.'
function checked(value:Detail):Detail{
 if(!value||typeof value.productId!=='string'||typeof value.productName!=='string'||!Number.isInteger(value.profileRevision)||!Number.isInteger(value.sourceRevision)||!['none','ready','stale'].includes(value.sourceStatus)||!Object.hasOwn(text,value.status)||value.sourceStatus!=='none'&&(!value.source||value.source.width<1||value.source.height<1||!/^[a-f0-9]{64}$/.test(value.source.sha256)))throw new Error('Yüzey servisinden geçerli kayıt alınamadı.')
 if(value.profileRevision<0||value.sourceRevision<0||value.sourceStatus==='none'&&value.source!==null||value.draft===undefined||value.approved===undefined||value.status==='draft'&&!value.draft||value.status==='approved'&&!value.approved)throw new Error('Yüzey kaydının kaynak/maske durumu doğrulanamadı.')
 for(const mask of [value.draft,value.approved])if(mask&&(typeof mask.id!=='string'||!mask.id||typeof mask.image!=='string'||!mask.image.startsWith('/api/v1/local-commerce/surfaces/products/')||!/^[a-f0-9]{64}$/.test(mask.sha256)||mask.sourceRevision!==value.sourceRevision||mask.sourceSha256!==value.source?.sha256))throw new Error('Maske bu kaynağa ait değil veya doğrulanamadı.')
 return value
}
function list(value:Detail[]):Detail[]{if(!Array.isArray(value))throw new Error('Ürün yüzeyleri listesi okunamadı.');return value.map(checked)}

export default function SurfaceMasks(){
 const [items,setItems]=useState<Detail[]>([]),[selected,setSelected]=useState(''),[filter,setFilter]=useState('all'),[query,setQuery]=useState('')
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[side,setSide]=useState<HTMLDivElement|null>(null)
 const activity=useRef<Activity>({dirty:false,busy:false})
 const onActivity=useCallback((next:Activity)=>{activity.current=next},[])
 const refresh=useCallback(async()=>{
  setLoading(true);setError('')
  try{setItems(list(await commerceRequest<Detail[]>(commerceApi,root)))}catch(error){setError(problem(error))}finally{setLoading(false)}
 },[])
 useEffect(()=>{let active=true;async function initial(){try{const value=list(await commerceRequest<Detail[]>(commerceApi,root));if(active)setItems(value)}catch(error){if(active)setError(problem(error))}finally{if(active)setLoading(false)}}void initial();return()=>{active=false}},[])
 const shown=(loading||error?[]:items).filter(item=>(filter==='all'||item.status===filter)&&item.productName.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')))
 const counts=(status:string)=>items.filter(item=>item.status===status).length
 function select(id:string){if(activity.current.busy||activity.current.dirty&&!window.confirm('Kaydedilmemiş maske veya prompt değişikliği silinsin mi?'))return;setSelected(id)}
 return <section className="surface-masks" aria-label="Ürün yüzey maskeleri">
  <div className="surface-side"><aside className="surface-list">
   <p className="surface-intro">Ürünün mevcut fotoğrafını indir, maskeleme promptunu kopyala, hazırladığın WebP maskeyi yükleyip bu fotoğraf için onayla. Başka renklere uygulanmaz.</p>
   <label>Ürün ara<input value={query} onChange={event=>setQuery(event.target.value)}/></label>
   <div className="surface-filters" role="group" aria-label="Durum filtresi">{['all','none','draft','approved','stale'].map(status=><button key={status} aria-pressed={filter===status} onClick={()=>setFilter(status)}>{status==='all'?`Tümü${loading||error?'':` (${items.length})`}`:`${text[status as Status]}${loading||error?'':` (${counts(status)})`}`}</button>)}</div>
   {loading&&<p role="status">Ürün yüzeyleri yükleniyor…</p>}{error&&<p role="alert" className="surface-error">{error} <button onClick={()=>void refresh()}>Tekrar dene</button></p>}
   {!loading&&!error&&!shown.length&&<p className="surface-empty">Listelenecek XINOBI U ürünü yok.</p>}
   {shown.map(item=><button key={item.productId} className="surface-row" aria-current={selected===item.productId?'true':undefined} onClick={()=>select(item.productId)}>
    {item.source?<img src={asset(item.source.image)} alt=""/>:<span aria-hidden="true">—</span>}<span>{item.productName}</span><em data-status={item.status}>{item.sourceStatus==='none'?'Kaynak yok':text[item.status]}</em></button>)}
  </aside><div ref={setSide} className="surface-side-tools"/></div>
  {selected?<Editor key={selected} side={side} productId={selected} onChanged={refresh} onActivity={onActivity}/>:<p className="surface-empty">Soldan bir ürün seç.</p>}
 </section>
}

function Editor({productId,side,onChanged,onActivity}:{productId:string;side:HTMLElement|null;onChanged:()=>void;onActivity:(value:Activity)=>void}){
 const canWrite=useAdminSession()?.permissions.includes('catalog.write')??false
 const path=root+'/'+encodeURIComponent(productId)
 const [detail,setDetail]=useState<Detail|null>(null),[busy,setBusy]=useState('Yükleniyor…'),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const [file,setFile]=useState<File|null>(null),[mode,setMode]=useState('alpha'),[pattern,setPattern]=useState(false),[showDraft,setShowDraft]=useState(true),[promptEdited,setPromptEdited]=useState(false)
 const [pixels,setPixels]=useState<ImageData|null>(null),[decodedKey,setDecodedKey]=useState(''),[loadedSource,setLoadedSource]=useState(''),[sourceAttempt,setSourceAttempt]=useState(0)
 const input=useRef<HTMLInputElement>(null),canvas=useRef<HTMLCanvasElement>(null),lock=useRef(false),alive=useRef(true),current=useRef<Activity>({dirty:false,busy:true})
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;onActivity({dirty:false,busy:false})}},[onActivity])
 useEffect(()=>{const value={dirty:!!file||promptEdited,busy:!!busy};current.current=value;onActivity(value)},[file,promptEdited,busy,onActivity])
 useEffect(()=>{const navigate=(event:Event)=>{if(current.current.busy||current.current.dirty&&!window.confirm('Kaydedilmemiş maske veya prompt değişikliği silinsin mi?'))event.preventDefault()};const unload=(event:BeforeUnloadEvent)=>{if(current.current.busy||current.current.dirty){event.preventDefault();event.returnValue=''}};window.addEventListener('xinobi:before-navigation',navigate);window.addEventListener('beforeunload',unload);return()=>{window.removeEventListener('xinobi:before-navigation',navigate);window.removeEventListener('beforeunload',unload)}},[])
 useEffect(()=>{let active=true;lock.current=true;async function initial(){try{const value=checked(await commerceRequest<Detail>(commerceApi,path));if(active)setDetail(value)}catch(error){if(active)setError(problem(error))}finally{if(active){lock.current=false;setBusy('')}}}void initial();return()=>{active=false}},[path])
 async function run(action:()=>Promise<Detail>,success='',reset=false,accept?:(value:Detail)=>boolean){
  if(lock.current||success&&!canWrite)return
  lock.current=true;setBusy('İşlem sürüyor…');setError('');setNotice('')
  try{const value=checked(await action());if(value.productId!==productId)throw new Error('Yüzey kaydı başka ürüne ait.');if(success&&(value.sourceRevision!==detail?.sourceRevision&&!(detail?.sourceRevision===0&&value.sourceRevision===1)||accept&&!accept(value))){if(alive.current){setDetail(value);onChanged()}throw new Error('Kaynak veya maske sonucu değişti; güncel kaydı inceleyin.')}if(alive.current){const changed=value.sourceRevision!==detail?.sourceRevision||value.source?.sha256!==detail?.source?.sha256;setDetail(value);if(reset||changed){setFile(null);if(input.current)input.current.value=''};if(changed)setPromptEdited(false);setShowDraft(true);if(reset&&!success){setLoadedSource('');setSourceAttempt(n=>n+1)}if(success)setNotice(success);onChanged()}}
  catch(error){if(alive.current)setError(problem(error))}finally{lock.current=false;if(alive.current)setBusy('')}
 }
 const source=detail?.source,mask=detail&&(showDraft?detail.draft??detail.approved:detail.approved??detail.draft)
 const sourceKey=source?source.sha256+':'+detail?.sourceRevision:''
 const photoReady=!!sourceKey&&loadedSource===sourceKey
 const maskKey=mask&&source?mask.id+':'+source.sha256:''
 const maskReady=!!maskKey&&decodedKey===maskKey&&!!pixels
 useEffect(()=>{
  let active=true
  async function decode(){
   if(!mask||!source)return
   try{
    const blob=await commerceRequest<Blob>(commerceApi,mask.image.replace(/^\/api\/v1\/local-commerce/,''),'GET',undefined,'blob');if(await sourceChecksum(await blob.arrayBuffer())!==mask.sha256)throw new Error('Maske dosyası doğrulanamadı.')
    const url=URL.createObjectURL(blob)
    try{const image=new Image();image.src=url;await image.decode();if(image.naturalWidth!==source.width||image.naturalHeight!==source.height)throw new Error('Maske kaynak fotoğrafla aynı boyutta değil.')
     const preview=document.createElement('canvas');preview.width=source.width;preview.height=source.height;const context=preview.getContext('2d',{willReadFrequently:true});if(!context)throw new Error('Maske önizlemesi açılamadı.');context.drawImage(image,0,0);const data=context.getImageData(0,0,source.width,source.height);if(active){setPixels(data);setDecodedKey(mask.id+':'+source.sha256)}}finally{URL.revokeObjectURL(url)}
   }catch(error){if(active){setPixels(null);setDecodedKey('');setError(problem(error))}}
  }
  void decode();return()=>{active=false}
 },[mask,source])
 const overlay=useMemo(()=>{if(!pixels||!source||!maskReady)return null;const data=new Uint8ClampedArray(pixels.data),tile=Math.max(8,Math.round(source.width/24));for(let i=0;i<data.length;i+=4){const light=(Math.floor(i/4%source.width/tile)+Math.floor(Math.floor(i/4/source.width)/tile))%2===0;data[i]=pattern?(light?250:30):220;data[i+1]=pattern?(light?200:90):40;data[i+2]=pattern?(light?90:160):130;data[i+3]=Math.round(data[i+3]*(pattern?.85:.5))}return new ImageData(data,source.width,source.height)},[pixels,source,pattern,maskReady])
 useEffect(()=>{const context=canvas.current?.getContext('2d');if(context&&canvas.current){context.clearRect(0,0,canvas.current.width,canvas.current.height);if(overlay)context.putImageData(overlay,0,0)}},[overlay])
 async function download(){
  if(!source||lock.current)return
  lock.current=true;setBusy('Kaynak indiriliyor…');setError('');setNotice('')
  try{const response=await fetch(asset(source.image),{credentials:'include',cache:'no-store'});if(!response.ok)throw new Error('Kaynak fotoğraf indirilemedi.');const blob=await response.blob();if(await sourceChecksum(await blob.arrayBuffer())!==source.sha256)throw new Error('Kaynak fotoğraf değişti. Güncel kaydı yükleyin.');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`maske-kaynagi-${source.width}x${source.height}.${source.mime==='image/jpeg'?'jpg':source.mime==='image/png'?'png':'webp'}`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);setNotice('Kaynak fotoğraf indirme için tarayıcıya verildi.')}catch(error){setError(problem(error))}finally{lock.current=false;setBusy('')}
 }
 async function exportDraft(){
  if(lock.current||!detail?.draft||!source)return
  lock.current=true;setBusy('WebP indiriliyor…');setError('');setNotice('')
  try{const blob=await commerceRequest<Blob>(commerceApi,`${path}/draft.webp?sourceRevision=${detail.sourceRevision}&maskId=${encodeURIComponent(detail.draft.id)}`,'GET',undefined,'blob');const head=new Uint8Array(await blob.slice(0,12).arrayBuffer());if(head.length!==12||new TextDecoder().decode(head.subarray(0,4))!=='RIFF'||new TextDecoder().decode(head.subarray(8,12))!=='WEBP')throw new Error('Geçerli WebP dosyası alınamadı.');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`surface-mask-${source.width}x${source.height}.webp`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);setNotice('WebP maske indirme için tarayıcıya verildi.')}catch(error){setError(problem(error))}finally{lock.current=false;setBusy('')}
 }
 const action=()=>({expectedRevision:detail!.profileRevision,sourceRevision:detail!.sourceRevision,sourceSha256:source!.sha256,draftId:detail!.draft?.id})
 const usable=!!source&&detail?.sourceStatus==='ready'
 return <div className="surface-editor">
  {detail&&<header><div><h2>{detail.productName}</h2><p>Kaynak sürümü {detail.sourceRevision} · {source?`${source.width}×${source.height} px`:'Kaynak fotoğraf yok'} · {text[detail.status]}</p></div></header>}
  {!!detail?.catalogPhotos?.length&&<label>Maskelenecek ürün fotoğrafı<select aria-label="Maskelenecek ürün fotoğrafı" value={detail.catalogPhotoId??''} disabled={!!busy} onChange={event=>{if(current.current.dirty&&!window.confirm('Kaydedilmemiş maske veya prompt değişikliği silinsin mi?'))return;void run(()=>commerceRequest<Detail>(commerceApi,path+'?'+new URLSearchParams({catalogPhotoId:event.target.value})), '', true)}}>{detail.catalogPhotos.map(photo=><option key={photo.id} value={photo.id}>{photo.label}</option>)}</select></label>}
  {detail&&!usable&&<p role="alert" className="surface-warning">{source?'Kaynak fotoğraf değişmiş veya kayıp. Eski maske yeni kaynağa uygulanmaz.':'Bu ürün için kullanılabilir katalog fotoğrafı yok. Ürünün Medya alanına fotoğraf ekleyin.'}</p>}
  {detail?.status==='stale'&&usable&&<p role="status" className="surface-warning">Kaynak değişti. Önceki maske korunuyor ancak bu fotoğrafa uygulanmıyor. Yeni maske yükleyin.</p>}
  {usable&&source&&detail&&<>
   {side&&createPortal(<><button className="surface-source-download" disabled={!!busy} onClick={()=>void download()}>Maskeleme için kaynak fotoğrafı indir</button>
   <MaskPrompt key={source.sha256+'-'+detail.sourceRevision} source={{productName:detail.productName,productId,sourceRevision:detail.sourceRevision,width:source.width,height:source.height,sourceSha256:source.sha256}} disabled={!!busy} onEdited={()=>setPromptEdited(true)}/></>,side)}
   <div className="surface-workspace"><div className="surface-stage"><img key={sourceKey+sourceAttempt} src={asset(source.image)} alt={detail.productName} draggable={false} onLoad={()=>setLoadedSource(sourceKey)} onError={()=>{setLoadedSource('');setError('Kaynak fotoğraf önizlemesi açılamadı. Güncel kaydı yükleyip tekrar deneyin.')}}/><canvas key={maskKey+detail.sourceRevision} ref={canvas} width={source.width} height={source.height} aria-hidden="true"/>{busy&&<div role="status" className="surface-busy">{busy}</div>}</div>
    <div className="surface-tools"><div className="surface-panel"><h3>WebP maske yükle</h3>{!canWrite&&<p role="status">Maske işlemleri salt okunur. Değişiklik için katalog yazma yetkisi gerekir.</p>}
     <p>Fotoğrafla aynı boyutta ({source.width}×{source.height}) WebP seç. Şeffaf maskede dolu, siyah-beyaz maskede beyaz alanlar desen alır.</p>
     <label>Maske WebP dosyası<input ref={input} type="file" accept="image/webp,.webp" disabled={!!busy||!canWrite} onChange={event=>setFile(event.target.files?.[0]??null)}/></label>
     {file&&<p role="status">Seçili dosya: {file.name}</p>}
     <label>WebP maske türü<select value={mode} disabled={!!busy||!canWrite} onChange={event=>setMode(event.target.value)}><option value="alpha">Şeffaf WebP — dolu alanları kullan</option><option value="luminance">Siyah-beyaz — beyaz alanları kullan</option></select></label>
     <button className="primary" disabled={!!busy||!canWrite||!file||!photoReady} onClick={()=>void run(async()=>{if(!file||!/\.webp$/i.test(file.name)||file.type&&file.type!=='image/webp'||file.size===0||file.size>8*1024*1024)throw new Error('En fazla 8 MB WebP maske seçin.');const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Dosya okunamadı.'));reader.readAsDataURL(file)});return commerceRequest<Detail>(commerceApi,path+'/mask','POST',{...action(),image:source.image,webpBase64:base64,mode,...(detail.catalogPhotoId&&{catalogPhotoId:detail.catalogPhotoId})})},'Maske taslağı kaydedildi. Kaynak üzerinde inceleyip onaylayın.',true,value=>!!value.draft)}>WebP maskeyi taslağa yükle</button>
    </div><div className="surface-panel"><label><input type="checkbox" checked={pattern} disabled={!maskReady} onChange={event=>setPattern(event.target.checked)}/>Maske içinde örnek desen göster</label><p>Örnek desen yalnızca maskenin alanını gösterir; fiziksel baskı çıktısı değildir.</p>
     {detail.draft&&detail.approved&&<div className="surface-toggle" role="group" aria-label="Gösterilen maske"><button aria-pressed={showDraft} onClick={()=>setShowDraft(true)}>Taslak</button><button aria-pressed={!showDraft} onClick={()=>setShowDraft(false)}>Onaylı</button></div>}
     {detail.draft&&<button className="surface-mask-download" disabled={!!busy} onClick={()=>void exportDraft()}>Taslak WebP maskeyi aç / indir</button>}
    </div><div className="surface-decisions">
     <button className="approve" disabled={!!busy||!canWrite||!detail.draft||!maskReady||!photoReady||!showDraft} onClick={()=>{if(window.confirm('Bu kaynak fotoğraf için maske onaylansın mı? Logo, kulp ve sınırları kontrol ettiğinizden emin olun.'))void run(()=>commerceRequest<Detail>(commerceApi,path+'/approval','POST',action()),'Maske bu kaynak için onaylandı. Yalnız bu ürün fotoğrafı için geçerlidir; başka renklere uygulanmaz. Eski sipariş dosyaları korunur.',false,value=>value.approved?.id===detail.draft?.id)}}>Taslağı onayla</button>
     {detail.draft&&<button disabled={!!busy||!canWrite} onClick={()=>{if(window.confirm('Bu kaynağın taslağı kaldırılsın mı?'))void run(()=>commerceRequest<Detail>(commerceApi,path+'/draft','DELETE',action()),'Taslak kaldırıldı.',false,value=>!value.draft)}}>Taslağı sil</button>}
     {detail.approved&&<button className="danger" disabled={!!busy||!canWrite} onClick={()=>{if(window.confirm('Bu kaynağın maske onayı kaldırılsın mı? Eski sipariş dosyaları korunur.'))void run(()=>commerceRequest<Detail>(commerceApi,path+'/approval','DELETE',action()),'Onay kaldırıldı.',false,value=>!value.approved)}}>Onayı kaldır</button>}
    </div></div></div>
  </>}
  {busy&&!usable&&<p role="status">{busy}</p>}{error&&<p role="alert" className="surface-error">{error}</p>}{notice&&<p role="status" className="surface-ok">{notice}</p>}
  <button disabled={!!busy} onClick={()=>{if(current.current.dirty&&!window.confirm('Kaydedilmemiş maske veya prompt değişikliği silinsin mi?'))return;void run(()=>commerceRequest<Detail>(commerceApi,path),'',true)}}>Güncel kaydı yükle</button>
 </div>
}
