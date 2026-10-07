import Link from "next/link";
import styles from "../app/hesap/account.module.css";

export default function CommerceFooter(){return <footer className={styles.footer}><div className={styles.footerInner}>
      <div className={styles.footerGrid}>
        <div><span className={styles.footerBrand}>XINOBI</span><p>Disiplinli estetik, minimalist fonksiyonellik ve çağdaş tasarım vizyonu.</p></div>
        <div><h2>Koleksiyonlar</h2><nav aria-label="Hesap altbilgisi koleksiyonları"><Link href="/urunler">Tüm ürünler</Link><Link href="/urunler/cay-makinesi-101">Çay makineleri</Link><Link href="/arama">Ürün ara</Link></nav></div>
        <div><h2>Keşfet</h2><nav aria-label="Hesap altbilgisi keşfet"><Link href="/xinobi-u">XINOBI U</Link><Link href="/favoriler">Favorilerin</Link><Link href="/sepet">Sepetin</Link></nav></div>
        <div><h2>Hesabın</h2><nav aria-label="Hesap altbilgisi yardım"><Link href="/hesap/siparisler">Siparişlerim</Link><Link href="/hesap/siparisler/iade">İade ve değişim</Link><Link href="/yasal">Gizlilik ve yasal bilgiler</Link></nav></div>
      </div>
      <div className={styles.copyright}><span>© {new Date().getFullYear()} XINOBI. Tüm hakları saklıdır.</span><span>Minimalist Modern Commerce</span></div>
    </div></footer>;}
