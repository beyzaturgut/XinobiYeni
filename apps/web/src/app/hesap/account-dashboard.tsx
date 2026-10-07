'use client';
import Link from 'next/link';
import {demoLogout,useDemoCommerce} from '../../lib/demo-commerce';
import styles from './account.module.css';
export default function AccountDashboard(){const {user}=useDemoCommerce();return <div className={styles.layout}><aside className={styles.sidebar}><h1>Hesabım</h1><p>Bu tarayıcıda saklanan deneme hesabı.</p></aside><section className={styles.content}>{user?<><h2>{user.name}</h2><p>{user.email}</p><p><Link href="/hesap/siparisler">Siparişlerim →</Link></p><p><Link href="/favoriler">Favorilerim →</Link></p><p><Link href="/sepet">Sepetim →</Link></p><button onClick={demoLogout}>Çıkış yap</button></>:<><p>Henüz giriş yapmadın.</p><Link href="/hesap/giris">Giriş yap veya kayıt ol →</Link></>}</section></div>}
