import AdminDialog from './AdminDialog'
import TableRegion from './TableRegion'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { adminCall } from './admin-api'
import {useAdminSession} from './AdminAccess'
import './customers.css'

type Customer = { id:string; name:string; email:string; phone?:string|null; status:string; createdAt:string; orderCount:number; lastOrderAt?:string|null;version?:string|null }
type CustomerPage = { items:Customer[]; page:number; pageSize:number; total:number; totalPages:number }
type CustomerDetails = { customer:Customer; addressCount:number; favoriteCount:number }
type Action='suspend'|'activate'|'delete'
const date=(value?:string|null)=>value?new Date(value).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'
const status:Record<string,string>={active:'Aktif',pending_verification:'Doğrulama bekliyor',disabled:'Askıya alındı',deleted:'Silindi'}
const labels:Record<Action,string>={suspend:'Müşteriyi askıya al',activate:'Müşteriyi yeniden etkinleştir',delete:'Müşteri hesabını sil'}

export default function Customers(){
  const permissions=useAdminSession()?.permissions??[],canWrite=permissions.includes('customers.write'),canDelete=permissions.includes('customers.delete')
  const [data,setData]=useState<CustomerPage|null>(null),[query,setQuery]=useState(''),[applied,setApplied]=useState(''),[page,setPage]=useState(1)
  const [selected,setSelected]=useState<CustomerDetails|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0)
  const [action,setAction]=useState<Action|null>(null),[confirmed,setConfirmed]=useState(false),[confirmation,setConfirmation]=useState('')
  const [busy,setBusy]=useState(false),[actionError,setActionError]=useState(''),[notice,setNotice]=useState(''),[needsRefresh,setNeedsRefresh]=useState(false)
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement|null>(null),mutation=useRef(false)
  const detailGuard=useRef({version:0})
  useEffect(()=>{const block=(event:Event)=>{if(mutation.current)event.preventDefault()};const unload=(event:BeforeUnloadEvent)=>{if(mutation.current){event.preventDefault();event.returnValue=''}};window.addEventListener('xinobi:before-navigation',block);window.addEventListener('beforeunload',unload);return()=>{window.removeEventListener('xinobi:before-navigation',block);window.removeEventListener('beforeunload',unload)}},[])
  /* oxlint-disable react/set-state-in-effect -- synchronizes UI state with the remote page request */
  useEffect(()=>{const guard=detailGuard.current;let active=true;setLoading(true);setError('');setSelected(null);setData(null)
    adminCall<CustomerPage>(`/admin/customers?${new URLSearchParams({page:String(page),pageSize:'20',...(applied&&{query:applied})})}`)
      .then(value=>{if(active)setData(value)}).catch(problem=>{if(active)setError(problem instanceof Error?problem.message:'Müşteriler yüklenemedi.')})
      .finally(()=>{if(active)setLoading(false)});return()=>{active=false;guard.version++}},[applied,page,reload])
  /* oxlint-enable react/set-state-in-effect */
  function search(event:FormEvent){event.preventDefault();if(mutation.current)return;setPage(1);setApplied(query.trim())}
  function resetAction(){setAction(null);setConfirmed(false);setConfirmation('');setActionError('');setNeedsRefresh(false);setNotice('')}
  async function open(customer:Customer,button:HTMLButtonElement){if(mutation.current)return;const version=++detailGuard.current.version;trigger.current=button;setError('');setSelected(null);resetAction();try{const detail=await adminCall<CustomerDetails>(`/admin/customers/${encodeURIComponent(customer.id)}`);if(version!==detailGuard.current.version)return;setSelected(detail);dialog.current?.showModal()}catch(problem){if(version===detailGuard.current.version)setError(problem instanceof Error?problem.message:'Müşteri detayı yüklenemedi.')}}
  function close(){if(mutation.current)return;detailGuard.current.version++;dialog.current?.close();setSelected(null);resetAction();trigger.current?.focus()}
  function update(detail:CustomerDetails){setSelected(detail);setData(current=>current?{...current,items:current.items.map(row=>row.id===detail.customer.id?detail.customer:row)}:current)}
  async function refreshDetail(){if(!selected||mutation.current)return;mutation.current=true;setBusy(true);setActionError('');try{const value=await adminCall<CustomerDetails>(`/admin/customers/${encodeURIComponent(selected.customer.id)}`);if(value.customer?.id!==selected.customer.id||typeof value.customer.version!=='string'||!value.customer.version.trim())throw Error('Güncel müşteri kaydı doğrulanamadı.');update(value);resetAction()}catch(problem){setActionError(problem instanceof Error?problem.message:'Güncel kayıt yüklenemedi.')}finally{mutation.current=false;setBusy(false)}}
  async function manage(){
    if(!selected||!action||!confirmed||busy||mutation.current||needsRefresh||!selected.customer.version||(action==='delete'?!canDelete:!canWrite)||(action==='delete'&&confirmation.trim()!=='SİL'))return
    const target=selected.customer,desired=action==='delete'?'deleted':action==='suspend'?'disabled':'active';mutation.current=true;setBusy(true);setActionError('');setNotice('')
    try{
      const value=await adminCall<CustomerDetails>(`/admin/customers/${encodeURIComponent(target.id)}/${action==='delete'?'delete':'access'}`,{expectedVersion:target.version,...(action!=='delete'&&{status:desired})})
      if(value.customer?.id!==target.id||value.customer.status!==desired||typeof value.customer.version!=='string'||!value.customer.version.trim()||value.customer.version===target.version)throw Error('İşlem sonucu doğrulanamadı. Güncel kaydı yükleyip sonucu kontrol edin.')
      update(value);resetAction();setNotice(desired==='deleted'?'Müşteri hesabı silindi. Sipariş geçmişi ve dosyaları korundu.':desired==='disabled'?'Müşteri askıya alındı; mevcut oturumları kapatıldı.':'Müşteri yeniden etkinleştirildi. Yeniden giriş yapabilir.')
    }catch(problem){setNeedsRefresh(true);setActionError(problem instanceof Error?problem.message:'İşlem tamamlanamadı. Güncel kaydı yükleyin.')}
    finally{mutation.current=false;setBusy(false)}
  }
  return <section aria-label="Müşteri yönetimi">
    <p className="panel-notice">Yalnız müşteri hesapları gösterilir; kişisel bilgiler maskelenir. Hesap işlemleri yetki gerektirir. Silme, hesabın erişimini kapatır; sipariş geçmişini ve dosyalarını silmez.</p>
    <form className="order-filters" onSubmit={search}><label>Müşteri ara<input value={query} maxLength={100} disabled={busy} onChange={event=>setQuery(event.target.value)} placeholder="Ad, e-posta veya telefon"/></label><button disabled={loading||busy}>Ara</button>{applied&&<button type="button" disabled={busy} onClick={()=>{setQuery('');setApplied('');setPage(1)}}>Aramayı temizle</button>}</form>
    {error&&<p role="alert">{error} <button onClick={()=>setReload(value=>value+1)}>Tekrar dene</button></p>}{loading&&<p role="status">Müşteriler yükleniyor…</p>}
    {!loading&&data&&<><p role="status">{data.total} müşteri · Sayfa {data.totalPages?data.page:0}/{data.totalPages}</p>
      <TableRegion><table><caption>Maskeli müşteri dizini</caption><thead><tr>{['Müşteri','İletişim','Durum','Kayıt','Sipariş','Son sipariş','İşlem'].map(item=><th scope="col" key={item}>{item}</th>)}</tr></thead><tbody>{data.items.map(customer=><tr key={customer.id}><th scope="row">{customer.name}</th><td>{customer.email}<br/><small>{customer.phone||'Telefon yok'}</small></td><td><span className="order-state">{status[customer.status]??customer.status}</span></td><td>{date(customer.createdAt)}</td><td>{customer.orderCount}</td><td>{date(customer.lastOrderAt)}</td><td><button disabled={busy} onClick={event=>void open(customer,event.currentTarget)}>İncele</button></td></tr>)}</tbody></table></TableRegion>
      {!data.items.length&&<div className="empty-widget"><strong>{applied?'Aramaya uygun müşteri yok':'Henüz müşteri hesabı yok'}</strong></div>}
      <div className="periods" aria-label="Müşteri sayfaları"><button disabled={loading||busy||data.page<=1} onClick={()=>setPage(value=>value-1)}>← Önceki</button><button disabled={loading||busy||data.totalPages===0||data.page>=data.totalPages} onClick={()=>setPage(value=>value+1)}>Sonraki →</button></div></>}
    <AdminDialog ref={dialog} aria-labelledby="customer-title" onClose={()=>trigger.current?.focus()} onCancel={event=>{event.preventDefault();close()}}><header className="dialog-heading"><h2 id="customer-title">Müşteri detayı</h2><button disabled={busy} aria-label="Müşteri detayını kapat" onClick={close}>×</button></header>{selected&&<div className="dialog-body">
      <dl><div><dt>Müşteri kimliği</dt><dd style={{overflowWrap:'anywhere'}}>{selected.customer.id}</dd></div><div><dt>Ad</dt><dd>{selected.customer.name}</dd></div><div><dt>E-posta</dt><dd>{selected.customer.email}</dd></div><div><dt>Telefon</dt><dd>{selected.customer.phone||'—'}</dd></div><div><dt>Durum</dt><dd>{status[selected.customer.status]??selected.customer.status}</dd></div><div><dt>Kayıt</dt><dd>{date(selected.customer.createdAt)}</dd></div><div><dt>Adres</dt><dd>{selected.addressCount}</dd></div><div><dt>Favori</dt><dd>{selected.favoriteCount}</dd></div><div><dt>Sipariş</dt><dd>{selected.customer.orderCount}</dd></div><div><dt>Son sipariş</dt><dd>{date(selected.customer.lastOrderAt)}</dd></div></dl>
      {selected.customer.status==='deleted'?<p className="panel-notice">Bu hesap silinmiş; yeniden etkinleştirilemez. Sipariş geçmişi ve dosyaları korunur.</p>:<>
        {!canWrite&&!canDelete&&<p className="panel-notice">Hesap işlemleri için yetkiniz yok; bu görünüm salt okunurdur.</p>}
        {(canWrite||canDelete)&&<div className="customer-actions">
          {canWrite&&selected.customer.status==='active'&&<button disabled={busy||needsRefresh||!selected.customer.version} onClick={()=>{resetAction();setAction('suspend')}}>Askıya al</button>}
          {canWrite&&selected.customer.status==='disabled'&&<button disabled={busy||needsRefresh||!selected.customer.version} onClick={()=>{resetAction();setAction('activate')}}>Yeniden etkinleştir</button>}
          {canDelete&&<button className="danger" disabled={busy||needsRefresh||!selected.customer.version} onClick={()=>{resetAction();setAction('delete')}}>Hesabı sil</button>}
          {!selected.customer.version&&<p role="status">İşlem için güncel müşteri kaydı gerekli.</p>}
        </div>}
        {action&&<fieldset className="customer-confirmation" disabled={busy} aria-label="Müşteri işlemi onayı"><legend>{labels[action]}</legend>
          <p>{action==='delete'?'Hesap kalıcı olarak kapatılır ve yeniden etkinleştirilemez. Mevcut oturumları sonlandırılır. Sipariş geçmişi ve dosyaları korunur.':action==='suspend'?'Müşteri giriş yapamaz; mevcut oturumları sonlandırılır. Siparişleri korunur. Daha sonra yeniden etkinleştirebilirsiniz.':'Müşteri hesabına yeniden giriş yapabilir. Eski oturumları yeniden açılmaz.'}</p>
          {action==='delete'&&<label>Onay için SİL yazın<input value={confirmation} onChange={event=>setConfirmation(event.target.value)} autoComplete="off"/></label>}
          <label><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/>Bu müşteri için işlemi onaylıyorum</label>
          <div><button disabled={!confirmed||needsRefresh||(action==='delete'&&confirmation.trim()!=='SİL')} onClick={()=>void manage()}>İşlemi onayla</button><button onClick={()=>{setAction(null);setConfirmed(false);setConfirmation('')}}>Vazgeç</button></div>
        </fieldset>}
      </>}
      {busy&&<p role="status">İşlem sürüyor…</p>}{actionError&&<p role="alert">{actionError}</p>}{needsRefresh&&<button disabled={busy} onClick={()=>void refreshDetail()}>Güncel müşteri kaydını yükle</button>}{notice&&<p role="status">{notice}</p>}
      <button disabled={busy} onClick={close}>Kapat</button>
    </div>}</AdminDialog>
  </section>
}
