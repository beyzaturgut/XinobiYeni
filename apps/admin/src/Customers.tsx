import { useEffect, useRef, useState, type FormEvent } from 'react'
import { adminCall } from './admin-api'

type Customer = { id:string; name:string; email:string; phone?:string|null; status:string; createdAt:string; orderCount:number; lastOrderAt?:string|null }
type CustomerPage = { items:Customer[]; page:number; pageSize:number; total:number; totalPages:number }
type CustomerDetails = { customer:Customer; addressCount:number; favoriteCount:number }

const date=(value?:string|null)=>value?new Date(value).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'
const status:Record<string,string>={active:'Aktif',pending_verification:'Doğrulama bekliyor',disabled:'Devre dışı'}

/** Read-only, masked customer directory. Account mutations stay out until the audit trail is ready. */
export default function Customers(){
  const [data,setData]=useState<CustomerPage|null>(null),[query,setQuery]=useState(''),[applied,setApplied]=useState(''),[page,setPage]=useState(1)
  const [selected,setSelected]=useState<CustomerDetails|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0)
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement|null>(null)
  const detailGuard=useRef({version:0})
  /* oxlint-disable react/set-state-in-effect -- synchronizes UI state with the remote page request */
  useEffect(()=>{const guard=detailGuard.current;let active=true;setLoading(true);setError('');setSelected(null);setData(null)
    adminCall<CustomerPage>(`/admin/customers?${new URLSearchParams({page:String(page),pageSize:'20',...(applied&&{query:applied})})}`)
      .then(value=>{if(active)setData(value)}).catch(problem=>{if(active)setError(problem instanceof Error?problem.message:'Müşteriler yüklenemedi.')})
      .finally(()=>{if(active)setLoading(false)});return()=>{active=false;guard.version++}},[applied,page,reload])
  /* oxlint-enable react/set-state-in-effect */
  function search(event:FormEvent){event.preventDefault();setPage(1);setApplied(query.trim())}
  async function open(customer:Customer,button:HTMLButtonElement){const version=++detailGuard.current.version;trigger.current=button;setError('');setSelected(null);try{const detail=await adminCall<CustomerDetails>(`/admin/customers/${encodeURIComponent(customer.id)}`);if(version!==detailGuard.current.version)return;setSelected(detail);dialog.current?.showModal()}catch(problem){if(version===detailGuard.current.version)setError(problem instanceof Error?problem.message:'Müşteri detayı yüklenemedi.')}}
  function close(){detailGuard.current.version++;dialog.current?.close();setSelected(null);trigger.current?.focus()}
  return <section aria-label="Müşteri yönetimi">
    <p className="panel-notice">Yalnız müşteri hesapları gösterilir. Bu dizin salt okunurdur; kişisel bilgiler maskelenir.</p>
    <form className="order-filters" onSubmit={search}><label>Müşteri ara<input value={query} maxLength={100} onChange={event=>setQuery(event.target.value)} placeholder="Ad, e-posta veya telefon"/></label><button disabled={loading}>Ara</button>{applied&&<button type="button" onClick={()=>{setQuery('');setApplied('');setPage(1)}}>Aramayı temizle</button>}</form>
    {error&&<p role="alert">{error} <button onClick={()=>setReload(value=>value+1)}>Tekrar dene</button></p>}{loading&&<p role="status">Müşteriler yükleniyor…</p>}
    {!loading&&data&&<><p role="status">{data.total} müşteri · Sayfa {data.totalPages?data.page:0}/{data.totalPages}</p>
      <div className="table-scroll"><table><caption>Maskeli müşteri dizini</caption><thead><tr>{['Müşteri','İletişim','Durum','Kayıt','Sipariş','Son sipariş','İşlem'].map(item=><th scope="col" key={item}>{item}</th>)}</tr></thead><tbody>{data.items.map(customer=><tr key={customer.id}><th scope="row">{customer.name}</th><td>{customer.email}<br/><small>{customer.phone||'Telefon yok'}</small></td><td><span className="order-state">{status[customer.status]??customer.status}</span></td><td>{date(customer.createdAt)}</td><td>{customer.orderCount}</td><td>{date(customer.lastOrderAt)}</td><td><button onClick={event=>void open(customer,event.currentTarget)}>İncele</button></td></tr>)}</tbody></table></div>
      {!data.items.length&&<div className="empty-widget"><strong>{applied?'Aramaya uygun müşteri yok':'Henüz müşteri hesabı yok'}</strong></div>}
      <div className="periods" aria-label="Müşteri sayfaları"><button disabled={loading||data.page<=1} onClick={()=>setPage(value=>value-1)}>← Önceki</button><button disabled={loading||data.totalPages===0||data.page>=data.totalPages} onClick={()=>setPage(value=>value+1)}>Sonraki →</button></div></>}
    <dialog ref={dialog} aria-labelledby="customer-title" onClose={()=>trigger.current?.focus()} onCancel={event=>{event.preventDefault();close()}}><header className="dialog-heading"><h2 id="customer-title">Müşteri detayı</h2><button aria-label="Müşteri detayını kapat" onClick={close}>×</button></header>{selected&&<div className="dialog-body"><p className="panel-notice">Bu görünüm salt okunur ve maskelidir.</p><dl><div><dt>Ad</dt><dd>{selected.customer.name}</dd></div><div><dt>E-posta</dt><dd>{selected.customer.email}</dd></div><div><dt>Telefon</dt><dd>{selected.customer.phone||'—'}</dd></div><div><dt>Durum</dt><dd>{status[selected.customer.status]??selected.customer.status}</dd></div><div><dt>Kayıt</dt><dd>{date(selected.customer.createdAt)}</dd></div><div><dt>Adres</dt><dd>{selected.addressCount}</dd></div><div><dt>Favori</dt><dd>{selected.favoriteCount}</dd></div><div><dt>Sipariş</dt><dd>{selected.customer.orderCount}</dd></div><div><dt>Son sipariş</dt><dd>{date(selected.customer.lastOrderAt)}</dd></div></dl><button onClick={close}>Kapat</button></div>}</dialog>
  </section>
}
