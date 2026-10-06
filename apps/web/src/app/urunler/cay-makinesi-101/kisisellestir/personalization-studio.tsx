"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./studio.module.css";
import teaMaker from "../../../../../public/assets/products/tea-maker-101-blue.webp";

type StyleChoice = "Sade" | "Geometrik" | "Yumuşak";
type ColorChoice = { name: string; value: string };
const colors: ColorChoice[] = [
  { name: "Kırık beyaz", value: "#f5f1e8" },
  { name: "Gece", value: "#17252a" },
  { name: "Xinobi teal", value: "#0b6c68" },
];
const stylesList: StyleChoice[] = ["Sade", "Geometrik", "Yumuşak"];

function PersonalizationStudioContent() {
  const variant = useSearchParams().get("variant") ?? "blue";
  const [text, setText] = useState("Bana özel");
  const [style, setStyle] = useState<StyleChoice>("Sade");
  const [color, setColor] = useState(colors[0]);
  const [saved, setSaved] = useState(false);
  const remaining = 24 - text.length;

  function updateText(value: string) {
    setText(value.slice(0, 24));
    setSaved(false);
  }

  if (variant !== "blue") return <section className={styles.actionPanel} role="status">
    <h1>Bu renk için geliştirme önizlemesi kullanılamıyor.</h1>
    <p>Başka bir rengin maskesi kullanılmaz. Bu demo fiziksel baskı veya üretim onayı değildir.</p>
    <Link href="/urunler/cay-makinesi-101">Ürüne dön</Link>
  </section>;
  return <div className={styles.workspace}>
    <section className={styles.preview} aria-labelledby="preview-title">
      <div className={styles.previewHeader}><div><p>Adım 1 / 2</p><h1 id="preview-title">Tasarımınızı oluşturun.</h1></div><span>Demo önizleme</span></div>
      <div className={styles.productStage}>
        <div className={styles.halo} />
        <Image src={teaMaker} alt="Lacivert Xinobi Çay Makinesi 101" priority sizes="(max-width: 880px) 94vw, 58vw" />
        <div className={styles.previewCard} aria-live="polite">
          <span>Metin önizlemesi</span>
          <strong data-style={style} style={{ color: color.value }}>{text || "Metninizi yazın"}</strong>
          <small>Temsili dijital önizleme · Üretim/baskı alanı değildir</small>
        </div>
      </div>
      <div className={styles.previewNotice}><span aria-hidden="true">i</span><p><strong>D04 üretim kararı bekleniyor.</strong> Fiziksel konum, ölçü, güvenli alan, baskı tekniği ve renk sonucu henüz tanımlanmadı. Bu önizleme yalnız etkileşim taslağıdır.</p></div>
    </section>

    <aside className={styles.controls} aria-label="Kişiselleştirme kontrolleri">
      <div className={styles.controlHeader}><p>Çay Makinesi 101</p><span>Lacivert</span></div>
      <section className={styles.controlSection} aria-labelledby="text-title">
        <div className={styles.sectionTitle}><span>01</span><h2 id="text-title">Metin</h2></div>
        <label htmlFor="personalization-text">İsim veya kısa mesaj</label>
        <input id="personalization-text" value={text} onChange={(event) => updateText(event.target.value)} maxLength={24} aria-describedby="character-count" />
        <div id="character-count" className={styles.fieldHint}><span>En fazla 24 karakter</span><span>{remaining} kaldı</span></div>
      </section>

      <section className={styles.controlSection} aria-labelledby="style-title">
        <div className={styles.sectionTitle}><span>02</span><h2 id="style-title">Yazı karakteri</h2></div>
        <div className={styles.styleChoices}>{stylesList.map((item) => <button type="button" key={item} data-style={item} aria-pressed={style === item} className={style === item ? styles.selectedChoice : ""} onClick={() => { setStyle(item); setSaved(false); }}><strong>Aa</strong><span>{item}</span></button>)}</div>
      </section>

      <section className={styles.controlSection} aria-labelledby="color-title">
        <div className={styles.sectionTitle}><span>03</span><h2 id="color-title">Metin rengi</h2></div>
        <div className={styles.colorChoices}>{colors.map((item) => <button type="button" key={item.name} aria-label={`${item.name} rengini seç`} aria-pressed={color.name === item.name} className={color.name === item.name ? styles.selectedColor : ""} onClick={() => { setColor(item); setSaved(false); }}><span style={{ backgroundColor: item.value }} /><small>{item.name}</small></button>)}</div>
      </section>

      <div className={styles.actionPanel}>
        <div><span>Tasarım bedeli</span><strong>Ürün verisi bekleniyor</strong></div>
        <button type="button" className={styles.saveButton} onClick={() => setSaved(true)} disabled={!text.trim()}>Demo taslağını hazırla</button>
        <Link className={styles.editorLink} href={`/urunler/cay-makinesi-101/editor?variant=${encodeURIComponent(variant)}`}>Gelişmiş editörde devam et <span aria-hidden="true">↗</span></Link>
        <button type="button" className={styles.continueButton} disabled aria-describedby="continue-note">Siparişe devam et</button>
        <p id="continue-note">D04 baskı standardı ile fiyat/stok doğrulanmadan siparişe aktarılamaz.</p>
        <p className={styles.saveStatus} aria-live="polite">{saved ? "Demo taslağınız bu oturum için hazırlandı. Kalıcı kayıt yapılmadı." : ""}</p>
      </div>
    </aside>
  </div>;
}

export default function PersonalizationStudio() {
  return <Suspense fallback={<p role="status">Geliştirme önizlemesi yükleniyor…</p>}><PersonalizationStudioContent /></Suspense>;
}
