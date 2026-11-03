import {useEffect, useRef, useState} from 'react'
import {adminCall} from './admin-api'
import {adminRequest, type AdminFile} from './admin-request'
import {commerceApi} from './commerce'

type Connection = {enabled:boolean; mode:string; accountConfigured:boolean; pollingEnabled:boolean; liveOperationsAllowed:boolean}
type Registration = {reference:string; state:string; message:string}
type Item = {trackingNumber?:string|null; state:string; providerText?:string|null; lastMovementRaw?:string|null}
type Tracking = {environment:string; result:string; lastSuccess?:string|null; items:Item[]}
function registrationValue(value:Registration|null){if(value&&(typeof value.reference!=='string'||typeof value.state!=='string'||typeof value.message!=='string'))throw new Error('Kargo kayıt yanıtı doğrulanamadı.');return value}
function trackingValue(value:Tracking|null){if(value&&(!Array.isArray(value.items)||!value.items.every(item=>item&&typeof item.state==='string')||typeof value.result!=='string'))throw new Error('Kargo takip yanıtı doğrulanamadı.');return value}
const states:Record<string,string>={awaiting_acceptance:'Şube kabulü bekleniyor',in_transit:'Yolda',delivery_branch:'Teslimat şubesinde',out_for_delivery:'Dağıtımda',delivered:'Teslim edildi',needs_review:'Sağlayıcı durumu teyit gerektiriyor',redirecting:'Yönlendirmede',return_in_progress:'İade sürecinde',return_delivered:'İade teslim alındı',unknown:'Durum teyit edilemedi'}
export default function SuratShipment({orderId,canWrite,eligible}:{orderId:string;canWrite:boolean;eligible:boolean}){
 const [connection,setConnection]=useState<Connection|null>(null)
 const [registration,setRegistration]=useState<Registration|null>(null),[tracking,setTracking]=useState<Tracking|null>(null)
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[version,setVersion]=useState(0)
 const [parcels,setParcels]=useState(''),[desi,setDesi]=useState(''),[kg,setKg]=useState(''),[payer,setPayer]=useState(''),[evidence,setEvidence]=useState(''),[resolution,setResolution]=useState('registered')
 const lock=useRef(false),mounted=useRef(true)
 const path=`/admin/orders/${encodeURIComponent(orderId)}/surat-shipment`
 useEffect(()=>{mounted.current=true;let active=true
  void Promise.all([adminCall<Registration|null>(path),adminCall<Tracking|null>(path+'/tracking'),adminCall<Connection>('/admin/shipping/surat/status')]).then(([r,t,c])=>{if(active){const registration=registrationValue(r??null),tracking=trackingValue(t??null);if(!c||typeof c.mode!=='string'||typeof c.enabled!=='boolean')throw new Error('Kargo bağlantı yanıtı doğrulanamadı.');setRegistration(registration);setTracking(tracking);setConnection(c)}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Kargo bilgileri yüklenemedi.')}).finally(()=>{if(active)setLoading(false)})
  return()=>{active=false;mounted.current=false}
 },[path,version])
 async function run(action:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');try{await action()}catch(e){if(mounted.current)setError(e instanceof Error?e.message:'İşlem yapılamadı; kayıt durumunu yenileyin.')}finally{lock.current=false;if(mounted.current)setBusy(false)}}
 async function download(){await run(async()=>{const api=commerceApi.replace(/\/local-commerce\/?$/,'');const file=await adminRequest<AdminFile>(api,path+'/label','GET',undefined,'file');const url=URL.createObjectURL(file.blob);const a=document.createElement('a');a.href=url;a.download=file.fileName||'surat-test-etiket.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);if(mounted.current)setNotice('Test etiketi indirildi. %100 ölçekte yazdırın; şube/okuyucu kabulü bekleniyor.')})}
 return <section className="quote-detail" aria-label="Sürat Kargo gönderisi" aria-busy={loading||busy}>
  <h3>Sürat Kargo</h3><p>Gönderi kaydı, fiziksel kargo kabulü değildir. Canlı gönderim, ödeme/operasyon uygunluğu doğrulanana kadar kapalıdır.</p>
  {connection&&<p>Ortam: {connection.mode==='Sandbox'?'TEST':'Canlı'} · Bağlantı: {connection.enabled&&connection.accountConfigured?'Ayarlar tanımlı; gerçek kabul ayrıca gerekli':'Kapalı veya hesap ayarı eksik'} · Otomatik takip: {connection.pollingEnabled?'Açık':'Kapalı'}</p>}
  {loading&&<p role="status">Kargo kaydı yükleniyor…</p>}
  {error&&<p role="alert">{error}</p>}
  <button type="button" disabled={busy||loading} onClick={()=>{setLoading(true);setError('');setVersion(v=>v+1)}}>Kargo kaydını yenile</button>
  {!loading&&!error&&connection?.mode==='Sandbox'&&(!registration||registration.state==='confirmed_not_created')&&<><p>{registration?'Yokluğu sağlayıcı tarafından teyit edilmiş kayıt için aynı referans korunarak yeni deneme yapılır.':'Bu ortamda gönderi kaydı yok.'}</p><form className="catalog-form" onSubmit={e=>{e.preventDefault();void run(async()=>{const r=await adminCall<Registration>(path,{parcelCount:Number(parcels),parcelDesi:Number(desi),parcelKg:Number(kg),paymentType:Number(payer)});if(mounted.current){setRegistration(registrationValue(r));setNotice(r.message)}})}}>
   <label>Paket sayısı<input type="number" min="1" step="1" required value={parcels} onChange={e=>setParcels(e.target.value)}/></label>
   <label>Tek paketin desisi<input type="number" min="0.001" step="any" required value={desi} onChange={e=>setDesi(e.target.value)}/></label>
   <label>Tek paketin ağırlığı (kg)<input type="number" min="0.001" step="any" required value={kg} onChange={e=>setKg(e.target.value)}/></label>
   <label>Kargo ücretini ödeyen<select required value={payer} onChange={e=>setPayer(e.target.value)}><option value="">Sözleşmeye göre seçin</option><option value="1">Gönderici (peşin)</option><option value="2">Alıcı</option></select></label>
   <p>Yalnız eş ölçülü koli, adrese/karayolu ve kapıda tahsilatsız çıkış desteklenir. Eksik ölçüleri tahmin etmeyin.</p>
   <button disabled={busy||!canWrite||!eligible||!connection?.enabled||!connection.accountConfigured||connection.mode!=='Sandbox'}>Test ortamında gönderi oluştur</button>
   {(!canWrite||!eligible)&&<p>Gönderi oluşturmak için uygun sipariş durumu ve orders.write yetkisi gerekli.</p>}
  </form></>}
  {!loading&&registration&&<><p><strong>Gönderi referansı: </strong><span style={{overflowWrap:'anywhere'}}>{registration.reference}</span></p><p role="status">{registration.message}</p>
   {registration.state==='registered'&&connection?.mode==='Sandbox'&&<button type="button" disabled={busy} onClick={()=>void download()}>Test etiketini indir (SVG)</button>}
   {registration.state==='registered'&&connection?.mode==='Production'&&<p>Canlı etiket şablonu sağlayıcı onayı bekliyor; indirme kapalı.</p>}
   {registration.state!=='registered'&&registration.state!=='confirmed_not_created'&&<form onSubmit={e=>{e.preventDefault();if(!window.confirm(resolution==='registered'?'Sağlayıcı bu referansla kaydın oluşturulduğunu doğruladı mı?':'Sağlayıcı bu referansla hiçbir kayıt oluşturulmadığını açıkça teyit etti mi? Boş takip sonucu tek başına yeterli değildir.'))return;void run(async()=>{const r=await adminCall<Registration>(path+'/reconcile',{evidence,resolution});if(mounted.current){setRegistration(registrationValue(r));setNotice('Sağlayıcı teyidi kanıtla kaydedildi. Bu işlem yeni gönderi oluşturmaz.')}})}}>
    <p>Sonuç belirsizse tekrar gönderim yapılmaz. Sağlayıcıdan referansla teyit alın.</p><label>Sağlayıcının teyit ettiği sonuç<select value={resolution} onChange={e=>setResolution(e.target.value)}><option value="registered">Kayıt oluşmuş</option><option value="not_created">Kayıt kesinlikle oluşmamış</option></select></label><label>Sağlayıcı kabul kanıtı<textarea required maxLength={500} value={evidence} onChange={e=>setEvidence(e.target.value)}/></label><button disabled={busy||!canWrite}>Sağlayıcı teyidini kaydet</button>
   </form>}
   <button type="button" disabled={busy||!canWrite} onClick={()=>void run(async()=>{const t=await adminCall<Tracking>(path+'/tracking',{});if(mounted.current){setTracking(trackingValue(t));setNotice('Takip sorgulama sonucu güncellendi. Sorgu aralığı dolmadıysa son kayıt gösterilir.')}})}>Takibi sorgula</button>
  </>}
  {!loading&&tracking&&<div><p>Ortam: {tracking.environment==='Sandbox'?'TEST':'Canlı'}</p>{tracking.result==='unavailable'&&<p role="alert">Takip servisine ulaşılamadı. Varsa son başarılı veri korunuyor.</p>}{tracking.result==='not_checked'&&<p>Takip henüz sorgulanmadı.</p>}{tracking.result==='awaiting_acceptance'&&<p>{tracking.items.length?'Son sorguda hareket dönmedi; önceki kayıt gösteriliyor.':'Şube kabulü veya hareket bekleniyor.'}</p>}{tracking.lastSuccess&&<p>Son başarılı sorgu: {new Date(tracking.lastSuccess).toLocaleString('tr-TR')}</p>}<ul>{tracking.items.map((item,i)=><li key={i}>{item.trackingNumber&&<span>Takip: {item.trackingNumber} · </span>}{states[item.state]??states.unknown}{item.providerText&&` · ${item.providerText}`}{item.lastMovementRaw&&` · Sağlayıcı zamanı: ${item.lastMovementRaw}`}</li>)}</ul></div>}
  {notice&&<p role="status">{notice}</p>}
 </section>
}
