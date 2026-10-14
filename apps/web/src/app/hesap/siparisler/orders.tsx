'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {canCancel,cancelOrder,localPhone,orderOptions,orderStatusText,orderSteps,pendingRequest,refreshOrders,requestStatusText,returnable,useDemoCommerce,type CustomerOrder,type OrderOptions} from '../../../lib/demo-commerce';
import {money} from '../../../lib/commerce';
import PrivateDesignImage from '../../../components/private-design-image';
import styles from './orders.module.css';

const date=(value:string)=>new Date(value).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const day=(value:string)=>new Date(value).toLocaleDateString('tr-TR',{day:'2-digit',month:'long'});

function Timeline({order}:{order:CustomerOrder}){
  if(order.status==='cancelled'||order.status==='returned')return <p className={styles.closed} data-state={order.status}>{orderStatusText(order.status)}{order.history?.length?` · ${date(order.history[order.history.length-1].at)}`:''}</p>;
  const reached=orderSteps.indexOf(order.status as typeof orderSteps[number]);
  const at=(status:string)=>order.history?.findLast(item=>item.status===status)?.at;
  return <ol className={styles.steps} aria-label="Sipariş durumu">{orderSteps.map((step,index)=><li key={step} data-done={index<=reached} aria-current={index===reached?'step':undefined}><i aria-hidden="true">{index<reached?'✓':index+1}</i><span>{orderStatusText(step)}</span>{at(step)&&<small>{day(at(step)!)}</small>}</li>)}</ol>;
}

function CancelDialog({order,options,onClose}:{order:CustomerOrder;options:OrderOptions;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  const [reason,setReason]=useState(''),[description,setDescription]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{ref.current?.showModal()},[]);
  const preparing=order.status==='preparing';
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="cancel-title" onClose={onClose}>
    <form method="dialog" onSubmit={async event=>{event.preventDefault();if(!reason||busy)return;setBusy(true);setError('');try{await cancelOrder(order.id,reason,description);ref.current?.close()}catch(e){setError(e instanceof Error?e.message:'İptal edilemedi.')}finally{setBusy(false)}}}>
      <h2 id="cancel-title">{preparing?'İptal talebi oluştur':'Siparişi iptal et'}</h2>
      <p>{order.number} · {preparing?'Siparişin hazırlanıyor; talebini inceleyip sonucu bildireceğiz.':'Sipariş hazırlanmadan hemen iptal edilir.'} Bu demo siparişte ödeme alınmadığı için iade edilecek tutar yoktur.</p>
      <label>İptal nedeni<select required value={reason} onChange={event=>setReason(event.target.value)}><option value="">Seç</option>{options.cancelReasons.map(item=><option key={item}>{item}</option>)}</select></label>
      <label>Açıklama (isteğe bağlı)<textarea rows={3} maxLength={1000} value={description} onChange={event=>setDescription(event.target.value)}/></label>
      {error&&<p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.dialogActions}><button type="button" onClick={()=>ref.current?.close()}>Vazgeç</button><button className={styles.primary} disabled={!reason||busy}>{busy?'Gönderiliyor…':preparing?'Talebi gönder':'Siparişi iptal et'}</button></div>
    </form>
  </dialog>;
}

function OrderCard({order,options,focused,onCancel}:{order:CustomerOrder;options:OrderOptions|null;focused:boolean;onCancel:()=>void}){
  const ref=useRef<HTMLElement>(null);
  useEffect(()=>{if(focused)ref.current?.scrollIntoView({block:'start'})},[focused]);
  const left=options?returnable(order,options.returnWindowDays):{};
  const cancelPending=pendingRequest(order,'cancel');
  return <section ref={ref} className={styles.orderCard} data-focused={focused} aria-labelledby={`order-${order.id}`}>
    <header><div><h2 id={`order-${order.id}`}>{order.number}</h2><p>{date(order.createdAt)} · <b data-state={order.status}>{orderStatusText(order.status)}</b></p></div><strong>{money(order.total.amountMinor)}</strong></header>
    <Timeline order={order}/>
    {order.shipment&&<div className={styles.shipment}><div><small>Kargo firması</small><strong>{order.shipment.carrier}</strong></div><div><small>Takip numarası</small><strong>{order.shipment.trackingNumber}</strong></div><div><small>{order.shipment.deliveredAt?'Teslim':'Kargoya verildi'}</small><strong>{date(order.shipment.deliveredAt??order.shipment.shippedAt)}</strong></div>{order.shipment.trackingUrl?<a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer">Kargom nerede? ↗</a>:<span>Takip numarasıyla kargo firmasının sitesinden sorgulayabilirsin.</span>}</div>}
    {order.requests?.length?<ul className={styles.requests}>{order.requests.map(request=><li key={request.id} data-state={request.status}><strong>{requestStatusText(request)}</strong><span>{request.reason} · {date(request.createdAt)}</span>{request.resolution&&<small>Mağaza notu: {request.resolution}</small>}</li>)}</ul>:null}
    <ul className={styles.orderLines}>{order.lines.map((line,index)=><li key={index}>{line.personalization?.imageUrl?<PrivateDesignImage className={styles.lineDesign} path={line.personalization.imageUrl} alt={`${line.personalization.name} tasarımı`}/>:line.imageUrl?<Image src={line.imageUrl} alt="" width={64} height={64} unoptimized/>:<span aria-hidden="true"/>}<div><strong>{line.name}</strong><small>{line.color} · {line.quantity} × {money(line.unitPrice.amountMinor)}</small>{line.personalization&&<small>Kişiselleştirilmiş · Tasarım: {line.personalization.name}</small>}</div><span>{money(line.lineTotal.amountMinor)}</span></li>)}</ul>
    <p className={styles.orderAddress}><strong>Teslimat:</strong> {order.address.title} · {order.address.fullName} · {localPhone(order.address.phone)} · {order.address.line}, {order.address.district}/{order.address.city}</p>
    <div className={styles.orderActions}>
      {canCancel(order)&&<button type="button" onClick={onCancel}>{order.status==='preparing'?'İptal talebi oluştur':'Siparişi iptal et'}</button>}
      {cancelPending&&<span>İptal talebin değerlendiriliyor.</span>}
      {Object.keys(left).length>0&&<Link href={`/hesap/siparisler/iade?siparis=${order.id}`}>İade talebi oluştur</Link>}
      {order.status==='delivered'&&<Link href={`/urunler/detay?id=${encodeURIComponent(order.lines[0].productId)}#degerlendirmeler`}>Ürünü değerlendir</Link>}
      {order.status==='shipped'&&<span>Kargodaki sipariş iptal edilemez; teslimattan sonra {options?.returnWindowDays??14} gün içinde iade talebi oluşturabilirsin.</span>}
    </div>
  </section>;
}

/** The signed-in customer's orders from the server: the same list the mobile app shows, with tracking and requests. */
export default function Orders(){
  const {user,orders,ready}=useDemoCommerce();
  const focus=useSearchParams().get('siparis');
  const [options,setOptions]=useState<OrderOptions|null>(null),[cancelling,setCancelling]=useState<CustomerOrder|null>(null);
  useEffect(()=>{
    if(!user)return;
    let active=true;orderOptions().then(value=>{if(active)setOptions(value)}).catch(()=>{});
    // The store moves orders along from the panel; keep the list fresh while the page is open.
    const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void refreshOrders().catch(()=>{})},10000);
    return()=>{active=false;window.clearInterval(timer)};
  },[user]);
  return <div className={styles.shell}>
    <div className={styles.title}><h1>Siparişlerim</h1></div>
    <div className={styles.notice}><p>Demo siparişler: ödeme alınmaz ve stok ayrılmaz. Kargo, iptal ve iade adımları mağaza panelinden yürütülür; her değişiklikte bildirim alırsın.</p></div>
    {!ready?<p role="status">Siparişler yükleniyor…</p>:!user?<Link href="/hesap">Siparişlerini görmek için giriş yap →</Link>:orders.length===0?<><p>Henüz siparişin yok.</p><Link href="/urunler">Ürünleri keşfet →</Link></>:
      <div className={styles.orderList}>{orders.map(order=><OrderCard key={order.id} order={order} options={options} focused={order.id===focus} onCancel={()=>setCancelling(order)}/>)}</div>}
    {cancelling&&options&&<CancelDialog key={cancelling.id} order={cancelling} options={options} onClose={()=>setCancelling(null)}/>}
  </div>;
}
