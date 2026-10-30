import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import styles from "./yasal.module.css";

export const metadata: Metadata = pageMetadata("/yasal/", { title: "Yasal Merkez | Xinobi", description: "Xinobi gizlilik, çerez ve kullanım metinleri için taslak yasal merkez." });

const documents = [
  { title: "Gizlilik bildirimi", copy: "Hangi kişisel verilerin, hangi amaç ve hukuki dayanakla işlendiğini açıklayacak metin.", state: "D10 onayı bekleniyor" },
  { title: "Çerez politikası", copy: "Zorunlu, analitik ve pazarlama teknolojilerinin sağlayıcı, süre ve amaçlarını açıklayacak metin.", state: "Envanter bekleniyor" },
  { title: "Kullanım koşulları", copy: "Web, üyelik, kişiselleştirme ve dijital hizmetlere ilişkin koşulların yayın alanı.", state: "Hukuk metni bekleniyor" },
  { title: "Mesafeli satış belgeleri", copy: "Sipariş anındaki sürümlü ön bilgilendirme ve sözleşme belgeleri için ayrılmış alan.", state: "D03 / D10 bekleniyor" },
];

export default function LegalPage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#legal-content">İçeriğe geç</a>
    <SiteHeader />
    <main id="legal-content">
      <section className={styles.hero}><p>Yasal merkez · Taslak</p><h1>Bilginiz.<br />Tercihiniz.<br />Kontrolünüz.</h1><span>Bu sayfa yasal bilgi mimarisi prototipidir. Yayınlanmış hukuki metin veya açık rıza kaydı değildir.</span></section>
      <section className={styles.warning}><strong>Yayın durumu</strong><p>D10 karar sahibi, hukuk metinleri, veri sorumlusu bilgileri, saklama süreleri ve üçüncü taraf envanteri onaylanmadan bu belgeler yürürlüğe girmiş sayılmaz.</p></section>
      <section id="belgeler" className={styles.documents} aria-labelledby="documents-title"><div><p>Belge merkezi</p><h2 id="documents-title">Şeffaf ve erişilebilir bilgi.</h2></div><div className={styles.grid}>{documents.map((document, index) => <article key={document.title}><span>0{index + 1}</span><div><h3>{document.title}</h3><p>{document.copy}</p></div><strong>{document.state}</strong></article>)}</div></section>
      <section id="haklar" className={styles.rights}><div><p>Veri sahibi hakları</p><h2>Talebiniz için açık bir yol.</h2></div><div><p>Gerçek akışta başvuru kanalı, kimlik doğrulama yöntemi, yanıt süresi ve yetkili veri sorumlusu bilgileri burada gösterilecektir.</p><ul><li>Bilgi ve erişim talebi</li><li>Düzeltme ve güncelleme talebi</li><li>Silme veya işlemeyi kısıtlama talebi</li><li>İtiraz ve rızayı geri çekme</li></ul></div></section>
      <section id="iletisim" className={styles.contact}><p>İletişim kanalı D10 bekliyor</p><h2>Hukuki talepler için doğrulanmış iletişim bilgisi henüz sağlanmadı.</h2><Link href="/xinobi">Xinobi dünyasına dön →</Link></section>
    </main>
    <footer className={styles.footer}><span>© 2026 Xinobi</span><span>Faz02 yasal bilgi mimarisi prototipi</span></footer>
  </div>;
}
