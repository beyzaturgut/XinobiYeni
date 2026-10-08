import Image from "next/image";
import Link from "next/link";
import styles from "./site-footer.module.css";

export default function SiteFooter() {
  return <footer id="destek" className={styles.footer}><div className={styles.footerBrand}><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} /><p>Gündelik ritüeller için sessiz teknoloji.</p></div><div><h3>Ürünler</h3><Link href="/urunler">Çay makineleri</Link><Link href="/urunler">Kahve makineleri</Link><Link href="/urunler">Pişirme</Link></div><div><h3>Xinobi</h3><Link href="/xinobi-u">XINOBI U</Link><Link href="/xinobi">Hikâyemiz</Link><Link href="/kurumsal/teklif">Kurumsal</Link></div><div><h3>Destek</h3><Link href="#destek">İletişim</Link><Link href="/hesap/siparisler">Sipariş takibi</Link><Link href="/yasal">Yasal bilgiler</Link></div></footer>;
}
