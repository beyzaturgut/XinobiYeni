import {useCallback,useEffect,useRef,useState} from 'react'
import type {Product} from '../../commerce'
import {commerceApi,commerceRequest,mediaUrl} from '../../commerce'
import {useAdminSession} from '../../AdminAccess'
import {sourceChecksum} from '../product-surfaces/source-checksum'
import './personalization-source.css'

type Asset={image:string;sha256:string;mime:string;bytes:number;width:number;height:number}
type View={productId:string;revision:number;status:'none'|'ready'|'stale';source:Asset|null;surfaceStatus:string;sourceRevision?:number}
type Activity={dirty:boolean;busy:boolean}
const message=(error:unknown)=>error instanceof Error?error.message:'Kaynak işlemi tamamlanamadı.'
function asset(value:Asset):Asset{
 if(!value||typeof value.image!=='string'||!value.image||!/^[a-f0-9]{64}$/.test(value.sha256)||!Number.isInteger(value.width)||value.width<1||!Number.isInteger(value.height)||value.height<1||!Number.isInteger(value.bytes)||value.bytes<1||!['image/png','image/jpeg','image/webp'].includes(value.mime))throw new Error('Kaynak servisinden geçerli fotoğraf bilgisi alınamadı.')
 return value
}
function readView(value:View,productId:string):View{
 if(!value||value.productId!==productId||!Number.isInteger(value.revision)||value.revision<0||!['none','ready','stale'].includes(value.status)||typeof value.surfaceStatus!=='string'||(value.status==='none'?value.source!==null:!value.source))throw new Error('Kaynak servisinden geçerli durum bilgisi alınamadı.')
 if(value.source)asset(value.source)
 return value
}

export default function PersonalizationSource({products}:{products:Product[]}){
 const eligible=products.filter(p=>p.personalizable===true)
 const [selected,setSelected]=useState<Product|null>(()=>products.find(p=>p.personalizable===true)??null)
 const activity=useRef<Activity>({dirty:false,busy:false})
 const onActivity=useCallback((next:Activity)=>{activity.current=next},[])
 const product=selected?(products.find(p=>p.id===selected.id)??selected):eligible[0]
 const available=!!product&&eligible.some(p=>p.id===product.id)
 const options=product&&!available?[product,...eligible]:eligible
 function select(id:string){
  const next=eligible.find(p=>p.id===id)
  if(!next||activity.current.busy)return
  if(activity.current.dirty&&!window.confirm('Kaydedilmemiş kaynak fotoğraf değişikliği silinsin mi?'))return
  activity.current={dirty:false,busy:false};setSelected(next)
 }
 return <details className="personalization-source" onFocusCapture={()=>{if(!selected&&product)setSelected(product)}}><summary>XINOBI U · Tek kaynak fotoğraf</summary>
  <p>Kaynak fotoğraf normal katalog renklerinden ayrı saklanır. Renk veya HEX bilgisi bu alanı kaydetmek için gerekli değildir.</p>
  {product?<><label>Kaynak fotoğrafı yönetilecek ürün<select value={product.id} onChange={e=>select(e.target.value)}>{options.map(p=><option key={p.id} value={p.id}>{p.name}{!eligible.some(item=>item.id===p.id)?' · Kişiselleştirmeye kapalı':''}</option>)}</select></label>
   {!available&&<p role="alert">Seçili ürün artık katalogda kişiselleştirmeye açık değil. Kaydedilmemiş kaynak seçimi korunuyor. Ürünü tekrar açın veya seçimi iptal ederek başka bir ürün seçin.</p>}
   <SourceEditor key={product.id} product={product} available={available} onActivity={onActivity}/></>:<p role="status">XINOBI U işaretli ürün yok. Ürünü Genel bilgiler bölümünden kişiselleştirmeye açın.</p>}
 </details>
}

function SourceEditor({product,available,onActivity}:{product:Product;available:boolean;onActivity:(value:Activity)=>void}){
 const permissions=useAdminSession()?.permissions??[]
 const hasWritePermission=permissions.includes('catalog.write'),canWrite=hasWritePermission&&available,canUpload=canWrite&&permissions.includes('media.write')
 const path='/personalization-sources/'+encodeURIComponent(product.id)
 const [view,setView]=useState<View|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false)
 const [image,setImage]=useState(''),[candidate,setCandidate]=useState<Asset|null>(null)
 const [error,setError]=useState(''),[notice,setNotice]=useState('')
 const lock=useRef(false),alive=useRef(true)
 const dirty=!!view&&!!image&&(candidate?(candidate.sha256!==view.source?.sha256||(view.status==='stale'&&image!==view.source?.image)):image!==view.source?.image)
 const current=useRef({dirty,busy})
 useEffect(()=>{current.current={dirty,busy}},[dirty,busy])
 const choices=[...new Set([product.originalImage,...product.variants.map(v=>v.image)].filter((s):s is string=>!!s))]
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;onActivity({dirty:false,busy:false})}},[onActivity])
 useEffect(()=>{onActivity({dirty,busy})},[dirty,busy,onActivity])
 useEffect(()=>{
  const navigate=(event:Event)=>{if(current.current.busy||(current.current.dirty&&!window.confirm('Kaydedilmemiş kaynak fotoğraf değişikliği silinsin mi?')))event.preventDefault()}
  const unload=(event:BeforeUnloadEvent)=>{if(current.current.dirty||current.current.busy){event.preventDefault();event.returnValue=''}}
  window.addEventListener('xinobi:before-navigation',navigate);window.addEventListener('beforeunload',unload)
  return()=>{window.removeEventListener('xinobi:before-navigation',navigate);window.removeEventListener('beforeunload',unload)}
 },[])
 const load=useCallback(async()=>{
  if(lock.current)return
  if(current.current.dirty&&!window.confirm('Kaydedilmemiş kaynak fotoğraf değişikliği silinsin mi?'))return
  lock.current=true;setLoading(true);setError('');setNotice('')
  try{const value=readView(await commerceRequest<View>(commerceApi,path),product.id);if(alive.current){setView(value);setImage(value.source?.image??'');setCandidate(value.source)}}
  catch(problem){if(alive.current)setError(message(problem))}
  finally{lock.current=false;if(alive.current)setLoading(false)}
 },[path,product.id])
 useEffect(()=>{
  let cancelled=false
  lock.current=true
  async function initial(){
   try{const value=readView(await commerceRequest<View>(commerceApi,path),product.id);if(!cancelled){setView(value);setImage(value.source?.image??'');setCandidate(value.source)}}
   catch(problem){if(!cancelled)setError(message(problem))}
   finally{if(!cancelled){lock.current=false;setLoading(false)}}
  }
  void initial()
  return()=>{cancelled=true}
 },[path,product.id])
 async function choose(next:string,file?:File){
  if(lock.current||!canWrite)return
  lock.current=true;setBusy(true);setError('');setNotice('')
  try{
   if(file){
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size===0||file.size>25*1024*1024)throw new Error('PNG, JPEG veya WebP fotoğraf seçin (en fazla 25 MB).')
    if(!canUpload)throw new Error('Fotoğraf yüklemek için media.write yetkisi gerekli.')
    // Source bytes are intentionally not passed through the catalogue image downscaler.
    const form=new FormData();form.append('file',file)
    next=(await commerceRequest<{src:string}>(commerceApi,'/media','POST',form)).src
   }
   const value=asset(await commerceRequest<Asset>(commerceApi,path+'/candidate?image='+encodeURIComponent(next)))
   if(alive.current){setImage(next);setCandidate(value)}
  }catch(problem){if(alive.current)setError(message(problem))}
  finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 async function save(){
  if(lock.current||!canWrite||!candidate||!view||!dirty)return
  if(!window.confirm(`${product.name}: kaynak fotoğrafı kaydedilsin mi? Yeni kaynak için maske yeniden hazırlanacak. Eski sipariş dosyaları değişmeyecek. Bu kayıt mağazadaki önizlemeyi değiştirmez.`))return
  lock.current=true;setBusy(true);setError('');setNotice('')
  try{
   const value=readView(await commerceRequest<View>(commerceApi,path,'PUT',{image,sourceSha256:candidate.sha256,expectedRevision:view.revision}),product.id)
   if(value.status!=='ready'||value.revision!==view.revision+1||value.source?.sha256!==candidate.sha256)throw new Error('Kaynak kaydı doğrulanamadı. Değerler korunuyor; güncel kaydı kontrol edin.')
   if(alive.current){setView(value);setImage(value.source?.image??'');setCandidate(value.source);setNotice('Kaynak fotoğraf kaydedildi. Bu kaynak için maske onayı bekleniyor; eski sipariş dosyaları korunuyor.')}
  }catch(problem){if(alive.current)setError(message(problem))}
  finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 async function download(){
  if(lock.current||!view?.source)return
  lock.current=true;setBusy(true);setError('');setNotice('')
  try{
   const source=view.source
   const response=await fetch(mediaUrl(source.image,commerceApi,'http://127.0.0.1:3000'),{credentials:'include',cache:'no-store'})
   if(!response.ok)throw new Error('Kaynak fotoğraf indirilemedi.')
   const blob=await response.blob()
   if(await sourceChecksum(await blob.arrayBuffer())!==source.sha256)throw new Error('Kaynak fotoğraf değişmiş; güncel kaydı yükleyin.')
   const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url
   link.download=`maske-kaynagi-${source.width}x${source.height}.${source.mime==='image/jpeg'?'jpg':source.mime==='image/png'?'png':'webp'}`
   document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)
   if(alive.current)setNotice('Kaynak fotoğraf indirme için tarayıcıya verildi.')
  }catch(problem){if(alive.current)setError(message(problem))}
  finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 return <section aria-label="Tek kişiselleştirme kaynağı" aria-busy={busy||loading}>
  {loading?<p role="status">Kaynak fotoğraf yükleniyor…</p>:!view?<p role="status">Kaynak bilgisi alınamadı.</p>:<>
   {view.status==='none'&&<p role="status">Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.</p>}
   {view.status==='stale'&&<p role="alert">Kayıtlı kaynak dosya değişmiş veya bulunamıyor. Yeni bir kaynak seçip kaydedin; eski kaynak geçerli yüzey olarak kullanılmaz.</p>}
   {view.source&&<p>Kayıtlı kaynak · Sürüm {view.sourceRevision??view.revision} · {view.source.width} × {view.source.height} px</p>}
   <p>{view.surfaceStatus==='approved'?'Bu kaynağa ait maske onaylı.':'Bu kaynak için maske onayı bekleniyor.'} Mevcut renk maskeleri otomatik aktarılmaz. Kaynak kaydı mağazadaki önizlemeyi değiştirmez.</p>
   {!hasWritePermission&&<p role="status">Salt okunur: kaynak değiştirmek için catalog.write yetkisi gerekli.</p>}
   <fieldset disabled={busy||!canWrite}><legend>Kaynak fotoğraf seçimi</legend>
    <label>Mevcut katalog fotoğrafını kullan<select value={choices.includes(image)?image:''} onChange={e=>{if(e.target.value)void choose(e.target.value)}}>
     <option value="">Fotoğraf seçin veya yeni fotoğraf yükleyin</option>{choices.map((src,i)=><option key={src} value={src}>Katalog fotoğrafı {i+1}</option>)}
    </select></label>
    <label>Tek kaynak fotoğraf yükle<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!canUpload||busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void choose('',file)}}/></label>
    {!canUpload&&canWrite&&<p>Yeni fotoğraf yüklemek için media.write yetkisi gerekli. Mevcut katalog fotoğrafını seçebilirsiniz.</p>}
    <p>Sabit piksel boyutu veya en-boy oranı gerekmez. Yüklenen dosya kırpılmaz veya küçültülmez. PNG, JPEG, WebP; en fazla 25 MB.</p>
   </fieldset>
   {candidate&&<figure><img src={mediaUrl(candidate.image,commerceApi,'http://127.0.0.1:3000')} alt={`${product.name} kişiselleştirme kaynağı`}/><figcaption>{candidate.width} × {candidate.height} px{dirty?' · Kaydedilmemiş seçim':''}</figcaption></figure>}
   <div className="source-actions"><button type="button" disabled={busy||!canWrite||!dirty||!candidate} onClick={()=>void save()}>Kaynak fotoğrafı kaydet</button>
    <button type="button" disabled={busy||!dirty} onClick={()=>{setImage(view.source?.image??'');setCandidate(view.source);setError('');setNotice('Kaydedilmemiş kaynak seçimi kaldırıldı.')}}>Seçimden vazgeç</button>
    {view.source&&<button type="button" disabled={busy||view.status==='stale'} onClick={()=>void download()}>Kayıtlı kaynak fotoğrafı indir</button>}</div>
  </>}
  {busy&&<p role="status">Kaynak işlemi sürüyor; tamamlanmasını bekleyin.</p>}
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  <button type="button" disabled={loading||busy} onClick={()=>void load()}>Güncel kaydı yükle</button>
 </section>
}
