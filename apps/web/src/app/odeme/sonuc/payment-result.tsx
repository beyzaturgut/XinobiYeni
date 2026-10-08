'use client';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {useDemoCommerce} from '../../../lib/demo-commerce';
import {money} from '../../../lib/commerce';
import styles from './result.module.css';
export default function PaymentResult(){const {user,orders}=useDemoCommerce();const id=useSearchParams().get('siparis');const order=orders.find(item=>item.id===id)??(id?undefined:orders[0]);return <div className={styles.shell}><section className={styles.resultCard}><h1>{user&&order?'Siparişin oluşturuldu':'Gösterilecek sipariş yok'}</h1>{user&&order&&<><p>Sipariş: {order.number}</p><p>Toplam: {money(order.total.amountMinor)}</p></>}<p>Demo sipariş: ödeme alınmadı, kargo ve stok işlemi yapılmadı. Siparişlerini web ve mobilde görebilirsin.</p><div className={styles.actions}><Link href="/hesap/siparisler">Siparişlerim →</Link><Link href="/urunler">Alışverişe dön →</Link></div></section></div>}
