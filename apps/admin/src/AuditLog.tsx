import TableRegion from './TableRegion'
import {useEffect,useState} from 'react'
import {commerceApi,commerceRequest} from './commerce'
import {useAdminSession} from './AdminAccess'
import {auditAction,auditActor,auditAreas,auditDate,auditResult} from './audit-presentation'
import './audit-log.css'

type Entry={id:string;occurredAt:string;actorId?:string|null;action:string;entityType:string;entityId:string;status:number;traceId?:string|null}
type Snapshot={key:string;items:Entry[];error:string}
export default function AuditLog(){
 const session=useAdminSession(),canRead=session?.permissions.includes('audit.read')??false
 const [area,setArea]=useState(''),[reload,setReload]=useState(0),[snapshot,setSnapshot]=useState<Snapshot|null>(null)
 const key=area+':'+reload,current=snapshot?.key===key?snapshot:null
 useEffect(()=>{
  if(!canRead)return
  let active=true
  const request=commerceApi?commerceRequest<Entry[]>(commerceApi,'/audit?'+new URLSearchParams({limit:'200',...(area&&{entityType:area})})):Promise.reject(new Error('Denetim servisi adresi yapılandırılmadı.'))
  request.then(items=>{if(active)setSnapshot({key,items,error:''})}).catch(error=>{if(active)setSnapshot({key,items:[],error:error instanceof Error?error.message:'Denetim kaydı yüklenemedi.'})})
  return()=>{active=false}
 },[area,key,canRead])
 if(!canRead)return <section aria-label="Denetim kaydı"><p role="alert">İşlem geçmişini görüntüleme yetkiniz yok.</p></section>
 return <section aria-label="Denetim kaydı" className="audit-log">
  <p className="panel-notice">Yönetim işlem denemelerini ve sonuçlarını inceleyebilirsiniz. Bu kayıtlar tek başına sipariş, tahsilat veya teslimat gerçekleştiğini göstermez. Kayıtlar değiştirilemez veya silinemez.</p>
  <div className="order-filters"><label>Alan<select aria-label="Alan" value={area} onChange={event=>setArea(event.target.value)}><option value="">Tümü</option>{Object.entries(auditAreas).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button onClick={()=>setReload(value=>value+1)}>Yenile</button></div>
  <p className="audit-help">Seçilen alanın en yeni 200 kaydı gösterilir. Tarih ve saat: Türkiye saati (Europe/Istanbul). Adı doğrulanamayan kullanıcılar ve test/canlı kaynağı tahmin edilmez.</p>
  {!current&&<p role="status">İşlem geçmişi yükleniyor…</p>}
  {current?.error&&<p role="alert">{current.error} <button onClick={()=>setReload(value=>value+1)}>Tekrar dene</button></p>}
  {current&&!current.error&&<><TableRegion className="audit-table"><table><caption>İşlem geçmişi · En fazla 200 kayıt</caption><thead><tr>{['Tarih / saat','İşlem','İşlemi yapan','İlgili kayıt','Sonuç'].map(title=><th key={title} scope="col">{title}</th>)}</tr></thead><tbody>{current.items.map(item=><tr key={item.id}>
   <td><time dateTime={item.occurredAt}>{auditDate(item.occurredAt)}</time></td>
   <th scope="row"><span>{auditAction(item.action)}</span><details><summary>Teknik detaylar</summary><dl>
    <div><dt>Kayıt numarası</dt><dd>{item.id}</dd></div>
    <div><dt>Endpoint / işlem</dt><dd><code>{item.action}</code></dd></div>
    <div><dt>HTTP kodu</dt><dd>{item.status}</dd></div>
    <div><dt>Kullanıcı kimliği</dt><dd>{item.actorId||'Belirtilmemiş'}</dd></div>
    <div><dt>Kayıt türü</dt><dd>{item.entityType}</dd></div>
    <div><dt>Hedef kayıt kimliği</dt><dd>{item.entityId}</dd></div>
    <div><dt>İstek / ilişkilendirme numarası</dt><dd>{item.traceId||'Belirtilmemiş'}</dd></div>
    <div><dt>Kaydedilen zaman</dt><dd>{item.occurredAt}</dd></div>
   </dl></details></th>
   <td>{auditActor(item.actorId,session?.account)}</td>
   <td>{auditAreas[item.entityType]??'İlgili kayıt'} · {item.entityId&&item.entityId!=='-'?'Kayıt kimliği ayrıntılarda':'Hedef belirtilmemiş'}</td>
   <td><span className="order-state">{auditResult(item.status)}</span></td>
  </tr>)}</tbody></table></TableRegion>{current.items.length===0&&<div className="empty-widget"><strong>Kayıt bulunamadı</strong><p>Seçilen alan için gösterilebilecek işlem kaydı yok.</p></div>}</>}
 </section>
}
