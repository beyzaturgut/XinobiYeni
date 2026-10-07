'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useRef, useState} from 'react';
import {useCommerce} from '../lib/commerce';
import styles from './site-header.module.css';
type IconName = 'arrow' | 'bag' | 'search' | 'user' | 'heart';
function Icon({ name }: { name: IconName }) {
  const common = { "aria-hidden": true, fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8, viewBox: "0 0 32 32" };
  if (name === "search") return <svg {...common}><circle cx="14" cy="14" r="8.5" /><path d="m20.5 20.5 6 6" /></svg>;
  if (name === "user") return <svg {...common}><circle cx="16" cy="10" r="5" /><path d="M7.5 27c.7-7 3.7-10.5 8.5-10.5S23.8 20 24.5 27" /></svg>;
  if (name === "heart") return <svg {...common}><path d="M16 27 5.5 16.8C-2 9.5 9 1 16 9c7-8 18 .5 10.5 7.8L16 27Z" /></svg>;
  if (name === "bag") return <svg {...common}><path d="M7 10h18l-1.4 17H8.4L7 10Z" /><path d="M12 11V7a4 4 0 0 1 8 0v4" /></svg>;
  return <svg {...common}><path d="M6 16h19M19 10l6 6-6 6" /></svg>;
}

export default function SiteHeader({ categories: supplied }: { categories?: { name: string }[] }) {
  const {state}=useCommerce();
  const categories=supplied ?? (state?.categories ?? []).map(name=>({name}));
  const [newsOpen,setNewsOpen]=useState(false);
  const newsButton=useRef<HTMLButtonElement>(null);
  const announcements=state?.announcements ?? [];
  const closeNews=()=>{setNewsOpen(false);newsButton.current?.focus()};
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  return <header className={styles.siteHeader} onKeyDown={event=>{if(event.key==='Escape'&&newsOpen)closeNews()}}>
    <div className={styles.topRow}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><nav className={styles.topNav} aria-label="Kurumsal menü"><Link href="/xinobi">Xinobi dünyası</Link><Link href="/kurumsal/teklif">Kurumsal teklif</Link><Link href="/asistan">Destek</Link></nav></div>
    <div className={styles.bottomRow}><nav className={styles.desktopNav} aria-label="Ana menü"><Link href="/urunler">Ürünler</Link><div className={styles.categoryMenu} onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}><button type="button" aria-expanded={categoriesOpen} aria-controls="home-category-menu" onClick={() => setCategoriesOpen((open) => !open)}>Kategoriler</button><div id="home-category-menu" hidden={!categoriesOpen}>{categories.map((category) => <Link href={`/urunler?category=${encodeURIComponent(category.name)}`} key={category.name}>{category.name}</Link>)}</div></div><Link href="/xinobi-u">XINOBI U</Link></nav>
    <div className={styles.headerActions} aria-label="Hızlı işlemler"><Link className={styles.search} href="/arama" aria-label="Ara"><Icon name="search" /><span>Ara</span></Link><Link href="/hesap" aria-label="Hesabım"><Icon name="user" /></Link><Link href="/favoriler" aria-label="Favorilerim"><Icon name="heart" /></Link><Link href="/sepet" aria-label="Sepet"><Icon name="bag" /></Link><button ref={newsButton} className={styles.newsButton} type="button" aria-label="Haber ve duyurular" aria-expanded={newsOpen} aria-controls="news-inbox" onClick={()=>setNewsOpen(value=>!value)}><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="7" width="24" height="18" rx="2"/><path d="m5 8 11 9L27 8"/></svg>{announcements.length>0&&<span className={styles.newsBadge}>{announcements.length}</span>}</button></div></div>
    <section id="news-inbox" className={styles.newsInbox} hidden={!newsOpen} aria-label="Haber ve duyuru kutusu"><div className={styles.newsHeading}><h2>Haber ve duyurular</h2><button type="button" aria-label="Duyuru kutusunu kapat" onClick={closeNews}>×</button></div>{announcements.length===0?<p>Henüz haber veya duyuru yok.</p>:announcements.map(item=><article key={item.id}><small>{item.kind} · {new Date(item.publishedAt).toLocaleDateString('tr-TR')}</small><h3>{item.title}</h3><p>{item.body}</p></article>)}</section>
    <details className={styles.mobileMenu}><summary>Menü</summary><nav aria-label="Mobil menü"><Link href="/urunler">Ürünler</Link><Link href="/#kategoriler">Kategoriler</Link><Link href="/xinobi-u">XINOBI U</Link></nav></details>
  </header>;
}

