import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PersonalizationStudio from "./personalization-studio";
import styles from "./studio.module.css";

export const metadata: Metadata = {
  title: "XINOBI U | Tarzını Ürüne Dönüştür",
  description: "Rengini ve desenini seç, kendi Xinobi tasarımını oluştur.",
};

export default function PersonalizeTeaMakerPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#studio">Kişiselleştirme aracına geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav aria-label="Kişiselleştirme sayfası menüsü"><Link href="/urunler">Tüm ürünler</Link><Link href="/urunler">Çay Makineleri</Link><Link href="/urunler">Kahve Makineleri</Link><Link href="/urunler">Pişirme Cihazları</Link><Link href="/urunler">Hava Temizleme Cihazları</Link><a href="#studio">Desenler</a><a href="#studio">Tarzını keşfet</a></nav>
      <div className={styles.headerActions}><Link className={styles.searchLink} href="/arama"><span aria-hidden="true">⌕</span> Ürün ara</Link><Link href="/hesap/giris" aria-label="Mesajlar">✉</Link><Link href="/favoriler" aria-label="Favoriler">♡</Link><Link href="/sepet" aria-label="Sepet">▢</Link><Link href="/hesap/giris" aria-label="Hesabım">♙</Link></div>
    </header>
    <main>
      <section className={styles.campaignHero} aria-labelledby="campaign-title">
        <Image className={styles.campaignBackground} src="/assets/banners/xinobi-u-coffee-machines.png" alt="Çiçek desenli Xinobi kahve makineleri" fill priority sizes="100vw" />
        <div className={styles.campaignShade} />
        <div className={styles.campaignCopy}>
          <p><span /> KENDİ ÜRÜNÜNÜ TASARLA</p>
          <h1 id="campaign-title"><small>XINOBI U ile</small>Tarzını ürüne<br />dönüştür.</h1>
          <strong>Rengini seç, desenini oluştur, sana özel Xinobi&apos;ni tasarla.</strong>
          <div className={styles.benefits}><div><b aria-hidden="true">◉</b><span><strong>Rengini seç</strong><small>Sana uygun tonu bul.</small></span></div><div><b aria-hidden="true">⠿</b><span><strong>Desenini oluştur</strong><small>Tarzını yansıt.</small></span></div><div><b aria-hidden="true">✦</b><span><strong>Sana özel</strong><small>Eşsiz bir Xinobi tasarla.</small></span></div></div>
          <a className={styles.createButton} href="#studio">Tasarımını Oluştur <span aria-hidden="true">→</span></a>
        </div>
        <div className={styles.designOptions} aria-label="Temsili tasarım seçenekleri">
          <section><h2>Renk Seç</h2><div className={styles.colorDots}><span className={styles.white} /><span className={styles.red} /><span className={styles.green} /><span className={styles.black} /><span className={styles.gold} /></div></section>
          <section><h2>Desen Seç</h2><div className={styles.patternDots}><span>❀</span><span>⌁</span><span>▤</span><span>◇</span></div></section>
          <a href="#studio"><b aria-hidden="true">◇</b><span>Canlı önizleme ile<br />tasarımını gör</span><i aria-hidden="true">→</i></a>
        </div>
        <a className={styles.nobiCall} href="/asistan"><span>⌁</span><strong>Nobi&apos;ye sor</strong></a>
      </section>
      <div id="studio"><PersonalizationStudio /></div>
    </main>
  </div>;
}
