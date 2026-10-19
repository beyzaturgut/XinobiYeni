import {useEffect,useState} from 'react'
import {adminCall} from './admin-api'
import {reportPeriods,reportRange,type ReportPeriod} from './report-periods'

type Summary={fromInclusive:string|null;untilExclusive:string;generatedAt:string;timeZone:string;orderCount:number;registeredCustomerCount:number;orderStatuses:{status:string;count:number}[]}
const widgets=[
  {id:'orders',title:'Siparişler'},{id:'sales',title:'Satış Performansı'},{id:'cart',title:'Sepet Özeti'},
  {id:'chart',title:'Satış Grafiği'},{id:'visitors',title:'Aktif Ziyaretçiler'},{id:'payments',title:'Ödeme Yöntemleri'},
  {id:'shipping',title:'Kargo Firmaları'},{id:'customers',title:'Müşteri İstatistikleri'},{id:'channels',title:'Satış Kanalları'},
  {id:'conversion',title:'Dönüşüm Oranları'},{id:'traffic',title:'Trafik Kaynakları'},{id:'bestsellers',title:'Çok Satanlar'},{id:'stock',title:'Kritik Stok Seviyeleri'},
]
// Keep the existing browser-only layout preference, not business data.
const key='xinobi:admin:demo:dashboard-layout:v1'
function loadOrder():string[]{
  try{const value:unknown=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(value)&&value.length===widgets.length&&new Set(value).size===widgets.length&&value.every(id=>widgets.some(widget=>widget.id===id)))return value}catch{/* Use the existing default layout. */}
  return widgets.map(widget=>widget.id)
}
export default function Dashboard({onOrders}:{onOrders:()=>void}){
  const [order,setOrder]=useState(loadOrder),[notice,setNotice]=useState('')
  const [period,setPeriod]=useState<ReportPeriod>('Bu Hafta'),[today,setToday]=useState(()=>new Date().toISOString().slice(0,10)),[reload,setReload]=useState(0)
  const range=reportRange(period,today),requestKey=`${range.query}:${reload}`
  const [result,setResult]=useState<{key:string;data?:Summary;error?:string}>({key:''})
  useEffect(()=>{
    let active=true
    adminCall<Summary>('/admin/reports/summary'+range.query).then(data=>{if(active)setResult({key:requestKey,data})}).catch(problem=>{if(active)setResult({key:requestKey,error:problem instanceof Error?problem.message:'Özet yüklenemedi.'})})
    return()=>{active=false}
  },[range.query,requestKey])
  const loading=result.key!==requestKey,data=loading?undefined:result.data,error=loading?undefined:result.error
  function retry(){setToday(new Date().toISOString().slice(0,10));setReload(value=>value+1)}
  function move(id:string,direction:number){
    const next=[...order],index=next.indexOf(id),target=index+direction
    if(target<0||target>=next.length)return
    ;[next[index],next[target]]=[next[target],next[index]];setOrder(next)
    try{localStorage.setItem(key,JSON.stringify(next));setNotice('Kart düzeni yalnız bu tarayıcıda saklandı.')}catch{setNotice('Kart taşındı; tarayıcı düzeni saklanamadı.')}
  }
  return <section aria-label="Dashboard">
    <div className="periods" role="group" aria-label="Rapor dönemi">{reportPeriods.map(item=><button key={item} aria-pressed={period===item} onClick={()=>setPeriod(item)}>{item}</button>)}</div>
    <div className="dashboard-toolbar"><p>{range.label}</p><button onClick={retry}>Yenile</button></div>
    {loading&&<p role="status">Özet yükleniyor…</p>}{error&&<p role="alert">{error} <button onClick={retry}>Tekrar dene</button></p>}
    <p className="panel-notice">Sipariş sayısı, seçilen UTC aralığında oluşturulmuş SQL sipariş kayıtlarıdır; tüm durumlar dahildir. Dağılım kayıtların güncel durumudur, geçmiş tarihteki durumu değildir. Müşteri sayısı aynı aralıkta kaydolan, personel rolü bulunmayan müşteri hesaplarıdır (doğrulama bekleyen ve devre dışı hesaplar dahil). Tahsilat, net satış, aktif müşteri veya dönüşüm oranı değildir.</p>
    <p className="layout-note" role="status">{notice||'Kartları yukarı/aşağı düğmeleriyle sıralayabilirsiniz. Bu tercih iş verilerini değiştirmez.'}</p>
    <div className="dashboard-grid">{order.map((id,index)=>{const widget=widgets.find(item=>item.id===id)!;return <section className={`widget ${id==='chart'?'wide-widget':''}`} key={id} aria-labelledby={`widget-${id}`}>
      <header><h2 id={`widget-${id}`}>{widget.title}</h2><div><button disabled={index===0} aria-label={`${widget.title} kartını yukarı taşı`} onClick={()=>move(id,-1)}>↑</button><button disabled={index===order.length-1} aria-label={`${widget.title} kartını aşağı taşı`} onClick={()=>move(id,1)}>↓</button></div></header>
      <div className="widget-body">{id==='orders'||id==='customers'?data?<><div className="metric"><strong>{id==='orders'?data.orderCount:data.registeredCustomerCount}</strong><span>{id==='orders'?'Kayıtlı sipariş':'Dönemde kaydolan müşteri'}</span></div>{id==='orders'&&<dl>{data.orderStatuses.map(item=><div key={item.status}><dt>{item.status}</dt><dd>{item.count}</dd></div>)}</dl>}{(id==='orders'?data.orderCount:data.registeredCustomerCount)===0&&<p>Seçilen aralıkta kayıt yok.</p>}</>:<p>{loading?'Özet yükleniyor…':'SQL özet verisi kullanılamıyor; sayı bilinmiyor.'}</p>:<div className="empty-widget"><strong>Veri kaynağı bağlı değil</strong><p>Doğrulanmış raporlama verisi henüz kullanılamıyor.</p></div>}{id==='orders'&&<button onClick={onOrders}>Sipariş listesini aç →</button>}</div>
    </section>})}</div>
  </section>
}
