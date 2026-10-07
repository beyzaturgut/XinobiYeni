'use client';
import Link from 'next/link';
import {useDemoCommerce} from '../../../lib/demo-commerce';
import {money} from '../../../lib/commerce';
import styles from './orders.module.css';
export default function Orders(){const {user,orders}=useDemoCommerce();return <div className={styles.shell}><div className={styles.title}><h1>Siparişlerim</h1></div><div className={styles.notice}><p>Yalnız bu tarayıcıda oluşturulan deneme siparişleri. Gerçek ödeme, kargo veya stok işlemi yoktur.</p></div>{!user?<Link href="/hesap/giris">Siparişlerini görmek için giriş yap →</Link>:orders.length===0?<><p>Henüz siparişin yok.</p><Link href="/urunler">Ürünleri keşfet →</Link></>:orders.map(order=><section className={styles.detail} key={order.id}><h2>{order.id}</h2><p>{new Date(order.createdAt).toLocaleString('tr-TR')} · Sipariş alındı</p>{order.lines.map((line,index)=><article key={index}><strong>{line.name}</strong><p>{line.color} · {line.quantity} adet · {money(line.price*line.quantity)}</p></article>)}<p>Toplam: {money(order.total)}</p></section>)}</div>}
