"use client";

import Image from "next/image";
import { useState } from "react";
import teaMaker from "../../../../public/assets/products/tea-maker-101-blue.webp";
import styles from "./ai.module.css";

type DemoState = "empty" | "ready" | "error";
const themes = ["Doğa", "Geometrik", "Minimal", "Kutlama"];
const palettes = ["Teal & kum", "Gece & beyaz", "Toprak", "Canlı"];

export default function AiDesignStudio() {
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("Minimal");
  const [palette, setPalette] = useState("Teal & kum");
  const [state, setState] = useState<DemoState>("empty");
  const [selected, setSelected] = useState(0);
  const canPreview = prompt.trim().length >= 10;

  return <div className={styles.workspace}>
    <aside className={styles.controls} aria-label="AI tasarım istemi">
      <p className={styles.eyebrow}>Fikir oluşturucu</p><h1>Tasarım fikrinizi anlatın.</h1>
      <div className={styles.safety}><strong>Demo · AI çağrısı yapılmaz</strong><span>İsteminiz hiçbir sağlayıcıya gönderilmez ve saklanmaz.</span></div>
      <label className={styles.prompt}>Tasarım istemi<textarea rows={6} value={prompt} onChange={(event) => { setPrompt(event.target.value.slice(0,500)); setState("empty"); }} placeholder="Örneğin: Sakin dalga çizgileri, yalın ve modern bir görünüm..." /><small>{prompt.length}/500 · En az 10 karakter</small></label>
      <fieldset><legend>Tema</legend><div className={styles.chips}>{themes.map((item) => <button type="button" key={item} aria-pressed={theme === item} onClick={() => { setTheme(item); setState("empty"); }}>{item}</button>)}</div></fieldset>
      <fieldset><legend>Renk yaklaşımı</legend><div className={styles.chips}>{palettes.map((item) => <button type="button" key={item} aria-pressed={palette === item} onClick={() => { setPalette(item); setState("empty"); }}>{item}</button>)}</div></fieldset>
      <div className={styles.limit}><div><span>Alternatif sayısı</span><strong>D08 bekleniyor</strong></div><div><span>Kalan kullanım</span><strong>Kota tanımlanmadı</strong></div></div>
      <button className={styles.generate} type="button" disabled={!canPreview} onClick={() => { setState("ready"); setSelected(0); }}>Demo alternatifleri göster</button>
      <button className={styles.errorDemo} type="button" onClick={() => setState("error")}>Hata durumunu önizle</button>
    </aside>

    <section className={styles.results} aria-labelledby="results-title" aria-live="polite">
      <div className={styles.resultHeader}><div><p>Çay Makinesi 101 · Lacivert</p><h2 id="results-title">Tasarım alternatifleri</h2></div><span>Sağlayıcı bağlı değil</span></div>
      {state === "empty" && <div className={styles.empty}><div className={styles.orbit}><span>✦</span></div><h3>İlk fikrinizi oluşturun.</h3><p>İsteminizi yazın; demo alternatif düzenleri burada görünsün.</p></div>}
      {state === "error" && <div className={styles.error}><span>!</span><h3>Üretim tamamlanamadı.</h3><p>Gerçek akışta timeout, kota veya içerik reddi ayrı kodlarla gösterilir; başarısız sonuç editöre aktarılamaz.</p><button type="button" onClick={() => setState("empty")}>İsteme dön</button></div>}
      {state === "ready" && <>
        <div className={styles.gallery}>{["Akış", "Denge", "Ritim"].map((name,index) => <button type="button" key={name} aria-pressed={selected === index} onClick={() => setSelected(index)}><div className={styles.art} data-variant={index}><span /><i /><b /></div><strong>{name}</strong><small>{theme} · {palette}</small></button>)}</div>
        <div className={styles.preview}><div className={styles.product}><div /><Image src={teaMaker} alt="Lacivert Çay Makinesi 101 temsili AI tasarım önizlemesi" sizes="(max-width: 800px) 80vw, 40vw" /><span data-variant={selected} /></div><div className={styles.previewCopy}><p>Seçili demo alternatif</p><h3>{["Akış", "Denge", "Ritim"][selected]}</h3><dl><div><dt>Tema</dt><dd>{theme}</dd></div><div><dt>Palet</dt><dd>{palette}</dd></div><div><dt>Çıktı</dt><dd>Temsili düz görsel</dd></div><div><dt>Baskı uygunluğu</dt><dd>D04 bekleniyor</dd></div></dl><button type="button" disabled>Editöre aktar</button><small>D08 çıktı biçimi, D10 veri politikası ve D04 baskı standardı doğrulanmadan aktarım açılamaz.</small></div></div>
      </>}
      <footer><strong>AI şeffaflığı</strong><span>Gerçek üretimde AI çıktısı olarak etiketlenir; içerik politikası, maliyet ve saklama süresi kullanıcıya açıklanır.</span></footer>
    </section>
  </div>;
}
