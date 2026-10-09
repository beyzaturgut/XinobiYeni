"use client";

import { useState } from "react";
import ProductPatternPreview, { type PatternTransform } from "./product-pattern-preview";
import styles from "./editor.module.css";
import { DEFAULT_CURVATURE_STRENGTH } from "./product-surface-warp";
import type { RenderingInputs } from "./accepted-surface-api";

type Layer = { id: number; type: "Metin" | "Şekil"; name: string; locked: boolean; visible: boolean };
const initialLayers: Layer[] = [
  { id: 1, type: "Metin", name: "Bana özel", locked: false, visible: true },
  { id: 2, type: "Şekil", name: "İnce çerçeve", locked: false, visible: true },
];

export default function EditorWorkspace({ renderingInputs, placementMode = "pattern", patternSrc = "/assets/personalization/sample-pattern.png" }: { renderingInputs: RenderingInputs; patternSrc?: string; placementMode?: "pattern" | "artwork" }) {
  const [face, setFace] = useState<"Ön yüz" | "Arka yüz">("Ön yüz");
  const [layers, setLayers] = useState(initialLayers);
  const [selected, setSelected] = useState(1);
  const [notice, setNotice] = useState("");
  const [patternTransform, setPatternTransform] = useState<PatternTransform>({ x: renderingInputs.width / 2, y: renderingInputs.height * .65, scale: placementMode === "artwork" ? 1 : 1.2, rotation: 0 });
  const [curvatureStrength, setCurvatureStrength] = useState(DEFAULT_CURVATURE_STRENGTH);

  function toggleLayer(id: number, key: "locked" | "visible") {
    setLayers((current) => current.map((layer) => layer.id === id ? { ...layer, [key]: !layer[key] } : layer));
    setNotice("");
  }

  function addLayer(type: Layer["type"]) {
    const id = Math.max(...layers.map((layer) => layer.id), 0) + 1;
    setLayers((current) => [{ id, type, name: type === "Metin" ? "Yeni metin" : "Yeni şekil", locked: false, visible: true }, ...current]);
    setSelected(id);
    setNotice(`${type} katmanı demo çalışma alanına eklendi.`);
  }

  return <div className={styles.workspace}>
    <aside className={styles.tools} aria-label="Tasarım araçları">
      <p className={styles.eyebrow}>Araçlar</p>
      <button type="button" onClick={() => addLayer("Metin")}><span aria-hidden="true">T</span><strong>Metin</strong><small>Başlık veya isim ekle</small></button>
      <button type="button" disabled aria-describedby="upload-disabled"><span aria-hidden="true">↑</span><strong>Görsel yükle</strong><small id="upload-disabled">Medya API&apos;si bekleniyor</small></button>
      <button type="button" onClick={() => addLayer("Şekil")}><span aria-hidden="true">◇</span><strong>Şekil</strong><small>Temel şekil ekle</small></button>
      <button type="button" disabled><span aria-hidden="true">▦</span><strong>Şablonlar</strong><small>Kategori verisi bekleniyor</small></button>
      <div className={styles.toolNote}><strong>D04 koruması</strong><p>Gerçek baskı alanı ve taşma hesabı üretim standardı onaylandıktan sonra açılır.</p></div>
    </aside>

    <section className={styles.canvasSection} aria-labelledby="canvas-title">
      <div className={styles.canvasToolbar}>
        <div><button type="button" aria-label="Geri al" disabled>↶</button><button type="button" aria-label="İleri al" disabled>↷</button><span>100%</span></div>
        <div role="group" aria-label="Ürün yüzü">{(["Ön yüz", "Arka yüz"] as const).map((item) => <button type="button" key={item} aria-pressed={face === item} onClick={() => setFace(item)}>{item}</button>)}</div>
        <span className={styles.demoBadge}>Güvenli demo alanı</span>
      </div>
      <div className={styles.canvas}>
        <div className={styles.canvasHeading}><p>{renderingInputs.width === 1066 ? "Çay Makinesi 101 · Lacivert" : "CM101 · Metallic Navy"}</p><h1 id="canvas-title">{face}</h1><span className={styles.representativeBadge}>Temsilidir</span></div>
        <div className={styles.productStage}>
          <div className={styles.halo} />
          <ProductPatternPreview
            sourceWidth={renderingInputs.width}
            sourceHeight={renderingInputs.height}
            productSrc={renderingInputs.source.url}
            designableMaskSrc={renderingInputs.mask.url}
            brandingOverlaySrc={renderingInputs.branding?.url}
            patternSrc={patternSrc}
            placementMode={placementMode}
            onArtworkMove={placementMode === "artwork" ? (x,y)=>setPatternTransform(current=>({...current,x,y})) : undefined}
            patternTransform={patternTransform}
            curvatureStrength={curvatureStrength}
            alt="Çay Makinesi 101, desenli ürün önizlemesi"
          />
        </div>
        <p className={styles.canvasDisclaimer}>Temsili dijital çalışma alanı · Ürün üzerindeki fiziksel baskı konumu veya ölçüsü değildir.</p>
      </div>
      <div className={styles.statusBar} aria-live="polite"><span>{notice || "Tüm değişiklikler yalnız bu tarayıcı oturumunda tutulur."}</span><strong>Baskı kontrolü: Bekliyor</strong></div>
    </section>

    <aside className={styles.layers} aria-label="Katmanlar ve özellikler">
      <div className={styles.panelTitle}><div><p>Katmanlar</p><span>{layers.length} öğe</span></div><button type="button" aria-label="Katman seçenekleri">•••</button></div>
      <ul>{layers.map((layer) => <li key={layer.id} className={selected === layer.id ? styles.selectedLayer : ""}>
        <button type="button" className={styles.layerMain} onClick={() => setSelected(layer.id)}><span>{layer.type === "Metin" ? "T" : "◇"}</span><span><strong>{layer.name}</strong><small>{layer.type}</small></span></button>
        <button type="button" aria-label={`${layer.name} katmanını ${layer.visible ? "gizle" : "göster"}`} aria-pressed={layer.visible} onClick={() => toggleLayer(layer.id, "visible")}>{layer.visible ? "◉" : "○"}</button>
        <button type="button" aria-label={`${layer.name} katmanının kilidini ${layer.locked ? "aç" : "kapat"}`} aria-pressed={layer.locked} onClick={() => toggleLayer(layer.id, "locked")}>{layer.locked ? "●" : "○"}</button>
      </li>)}</ul>
      <section className={styles.properties} aria-labelledby="properties-title">
        <section className={styles.patternControls} aria-labelledby="pattern-controls-title">
          <div className={styles.panelTitle}><div><p id="pattern-controls-title">Desen yerleşimi</p><span>Prototip önizleme</span></div></div>
          {([
            { key: "x", label: "Yatay konum", min: 0, max: renderingInputs.width, step: 1, unit: "px" },
            { key: "y", label: "Dikey konum", min: 0, max: renderingInputs.height, step: 1, unit: "px" },
            { key: "scale", label: "Ölçek", min: 0.25, max: 3, step: 0.05, unit: "×" },
            { key: "rotation", label: "Dönüş", min: -180, max: 180, step: 1, unit: "°" },
          ] as const).map(({ key, label, min, max, step, unit }) => <div className={styles.patternControl} key={key}>
            <label htmlFor={`pattern-${key}`}>{label}<span>{patternTransform[key]} {unit}</span></label>
            <input id={`pattern-${key}`} type="range" min={min} max={max} step={step} value={patternTransform[key]} onChange={(event) => setPatternTransform((current) => ({ ...current, [key]: Number(event.target.value) }))} />
          </div>)}
          <div className={styles.patternControl}>
            <label htmlFor="pattern-curvature">Yüzey kavisi<span>{curvatureStrength}</span></label>
            <input id="pattern-curvature" type="range" min={0} max={1} step={0.05} value={curvatureStrength} onChange={(event) => setCurvatureStrength(Number(event.target.value))} />
          </div>
        </section>
        <div className={styles.panelTitle}><div><p id="properties-title">Özellikler</p><span>Seçili katman</span></div></div>
        <label>Konum <span>Demo</span></label><div className={styles.propertyGrid}><button type="button" disabled>X —</button><button type="button" disabled>Y —</button></div>
        <label>Boyut ve dönüş <span>D04 bekliyor</span></label><div className={styles.propertyGrid}><button type="button" disabled>W —</button><button type="button" disabled>0°</button></div>
        <button type="button" className={styles.demoSave} onClick={() => setNotice("Demo taslak hazırlandı; sunucuya kalıcı kayıt yapılmadı.")}>Demo taslağı hazırla</button>
        <p>Kalıcı sürüm, gerçek koordinat ve çıktı üretimi API/üretim standardı sonrasında etkinleşir.</p>
      </section>
    </aside>
  </div>;
}
