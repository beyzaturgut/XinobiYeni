import {useState} from 'react'

const periods=['Bugün','Dün','Bu Hafta','Geçen Hafta','Bu Ay','Geçen Ay','Bu Yıl','Geçen Yıl','Tüm Zamanlar']
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
  function move(id:string,direction:number){
    const next=[...order],index=next.indexOf(id),target=index+direction
    if(target<0||target>=next.length)return
    ;[next[index],next[target]]=[next[target],next[index]];setOrder(next)
    try{localStorage.setItem(key,JSON.stringify(next));setNotice('Kart düzeni yalnız bu tarayıcıda saklandı.')}catch{setNotice('Kart taşındı; tarayıcı düzeni saklanamadı.')}
  }
  return <section aria-label="Dashboard">
    <div className="periods" role="group" aria-label="Rapor dönemi">{periods.map(period=><button key={period} disabled title="Rapor veri kaynağı bağlı değil">{period}</button>)}</div>
    <div className="dashboard-toolbar"><p role="status">Rapor veri kaynağı bağlı değil. Dönem özeti ve metrikler şu anda hesaplanamıyor; bu durum sıfır kayıt anlamına gelmez.</p></div>
    <p className="layout-note" role="status">{notice||'Kartları yukarı/aşağı düğmeleriyle sıralayabilirsiniz. Bu tercih iş verilerini değiştirmez.'}</p>
    <div className="dashboard-grid">{order.map((id,index)=>{const widget=widgets.find(item=>item.id===id)!;return <section className={`widget ${id==='chart'?'wide-widget':''}`} key={id} aria-labelledby={`widget-${id}`}>
      <header><h2 id={`widget-${id}`}>{widget.title}</h2><div><button disabled={index===0} aria-label={`${widget.title} kartını yukarı taşı`} onClick={()=>move(id,-1)}>↑</button><button disabled={index===order.length-1} aria-label={`${widget.title} kartını aşağı taşı`} onClick={()=>move(id,1)}>↓</button></div></header>
      <div className="widget-body"><div className="empty-widget"><strong>Veri kaynağı bağlı değil</strong><p>Doğrulanmış raporlama verisi henüz kullanılamıyor.</p></div>{id==='orders'&&<button onClick={onOrders}>Sipariş listesini aç →</button>}</div>
    </section>})}</div>
  </section>
}
