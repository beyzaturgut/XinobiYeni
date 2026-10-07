import Image from 'next/image';
import Link from 'next/link';
import styles from './studio.module.css';
export default function StudioHeader() {
  return <header className={styles.header}><Link href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" width={112} height={64} alt="Xinobi" /></Link><nav aria-label="XINOBI U gezinme"><Link href="/urunler">Ürünler</Link><Link href="/xinobi-u" aria-current="page">XINOBI U</Link></nav><Link href="/">Ana sayfa <span aria-hidden="true">↗</span></Link></header>;
}
