'use client';
import Link from 'next/link';
import {useDemoCommerce} from '../../../lib/demo-commerce';
import {money} from '../../../lib/commerce';
import styles from './result.module.css';
export default function PaymentResult(){const {user,orders}=useDemoCommerce();const order=orders[0];return <div className={styles.shell}><section className={styles.resultCard}><h1>{user&&order?'Demo siparişin oluşturuldu':'Gösterilecek demo sipariş yok'}</h1>{user&&order&&<><p>Sipariş: {order.id}</p><p>Toplam: {money(order.total)}</p></>}<p>Gerçek ödeme yapılmadı. Demo sipariş yalnız bu tarayıcıda saklanır.</p><div className={styles.actions}><Link href="/hesap/siparisler">Siparişlerim →</Link><Link href="/urunler">Alışverişe dön →</Link></div></section></div>}
