'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useState} from 'react';
import {useCommerce} from '../lib/commerce';
import styles from '../app/page.module.css';
type IconName = 'arrow' | 'bag' | 'search' | 'user';
function Icon({ name }: { name: IconName }) {
  const common = { "aria-hidden": true, fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8, viewBox: "0 0 32 32" };
  if (name === "search") return <svg {...common}><circle cx="14" cy="14" r="8.5" /><path d="m20.5 20.5 6 6" /></svg>;
  if (name === "user") return <svg {...common}><circle cx="16" cy="10" r="5" /><path d="M7.5 27c.7-7 3.7-10.5 8.5-10.5S23.8 20 24.5 27" /></svg>;
  if (name === "bag") return <svg {...common}><path d="M7 10h18l-1.4 17H8.4L7 10Z" /><path d="M12 11V7a4 4 0 0 1 8 0v4" /></svg>;
  return <svg {...common}><path d="M6 16h19M19 10l6 6-6 6" /></svg>;
}

export default function SiteHeader({ categories: supplied }: { categories?: { name: string }[] }) {
  const {state}=useCommerce();
  const categories=supplied ?? (state?.categories ?? []).map(name=>({name}));
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  return <header className={styles.siteHeader}>
    <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
    <nav className={styles.desktopNav} aria-label="Ana menü"><Link href="/urunler">Ürünler</Link><div className={styles.categoryMenu} onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}><button type="button" aria-expanded={categoriesOpen} aria-controls="home-category-menu" onClick={() => setCategoriesOpen((open) => !open)}>Kategoriler</button><div id="home-category-menu" hidden={!categoriesOpen}>{categories.map((category) => <Link href={`/urunler?category=${encodeURIComponent(category.name)}`} key={category.name}>{category.name}</Link>)}</div></div><Link href="/xinobi-u">XINOBI U</Link></nav>
    <div className={styles.headerActions} aria-label="Hızlı işlemler"><Link href="/arama" aria-label="Ara"><Icon name="search" /></Link><Link href="/hesap/giris" aria-label="Hesabım"><Icon name="user" /></Link><Link href="/sepet" aria-label="Sepet"><Icon name="bag" /></Link></div>
    <details className={styles.mobileMenu}><summary>Menü</summary><nav aria-label="Mobil menü"><Link href="/urunler">Ürünler</Link><Link href="/#kategoriler">Kategoriler</Link><Link href="/xinobi-u">XINOBI U</Link></nav></details>
  </header>;
}

