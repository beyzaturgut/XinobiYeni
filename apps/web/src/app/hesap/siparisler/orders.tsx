'use client';
import Image from 'next/image';
import Link from 'next/link';
import {localPhone,orderStatusText,useDemoCommerce} from '../../../lib/demo-commerce';
import {money} from '../../../lib/commerce';
import styles from './orders.module.css';

const date=(value:string)=>new Date(value).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

/** The signed-in customer's demo orders from the server: the same list the mobile app shows. */
export default function Orders(){
  const {user,orders,ready}=useDemoCommerce();
  return <div className={styles.shell}>
    <div className={styles.title}><h1>Siparişlerim</h1></div>
    <div className={styles.notice}><p>Demo siparişler: ödeme alınmaz, kargo ve stok işlemi yapılmaz. Web ve mobilde aynı siparişleri görürsün.</p></div>
    {!ready?<p role="status">Siparişler yükleniyor…</p>:!user?<Link href="/hesap/giris">Siparişlerini görmek için giriş yap →</Link>:orders.length===0?<><p>Henüz siparişin yok.</p><Link href="/urunler">Ürünleri keşfet →</Link></>:
      <div className={styles.orderList}>{orders.map(order=><section className={styles.orderCard} key={order.id} aria-labelledby={`order-${order.id}`}>
        <header><div><h2 id={`order-${order.id}`}>{order.number}</h2><p>{date(order.createdAt)} · {orderStatusText(order.status)}</p></div><strong>{money(order.total.amountMinor)}</strong></header>
        <ul>{order.lines.map(line=><li key={line.variantId}>{line.imageUrl?<Image src={line.imageUrl} alt="" width={64} height={64} unoptimized/>:<span aria-hidden="true"/>}<div><strong>{line.name}</strong><small>{line.color} · {line.quantity} × {money(line.unitPrice.amountMinor)}</small></div><span>{money(line.lineTotal.amountMinor)}</span></li>)}</ul>
        <p className={styles.orderAddress}><strong>Teslimat:</strong> {order.address.title} · {order.address.fullName} · {localPhone(order.address.phone)} · {order.address.line}, {order.address.district}/{order.address.city}</p>
      </section>)}</div>}
  </div>;
}
