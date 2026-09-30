"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import teaMaker from "../../../public/assets/products/tea-maker-101-blue.webp";
import coffeeMaker from "../../../public/assets/products/coffee-maker-101-gold.webp";
import styles from "./assistant.module.css";

type Topic = "tea" | "coffee" | "corporate" | null;
const prompts = [{ id: "tea", label: "Çay makinesi öner" }, { id: "coffee", label: "Kahve seçenekleri" }, { id: "corporate", label: "Kurumsal alım" }] as const;

export default function SalesAssistant() {
  const [topic, setTopic] = useState<Topic>(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  function choose(id: Exclude<Topic,null>) { setTopic(id); setMessage(prompts.find((item) => item.id === id)?.label || ""); setNotice(""); }
  const product = topic === "coffee" ? { name: "Kahve Makinesi 101", image: coffeeMaker, copy: "İki fincanı aynı anda hazırlayan kompakt demo ürün.", href: "/urunler" } : { name: "Çay Makinesi 101", image: teaMaker, copy: "Dört demo renk ve Xinobi Studio akışı bulunan ürün.", href: "/urunler/cay-makinesi-101" };
  return <div className={styles.layout}>
    <aside className={styles.context}><p>Asistan kapsamı</p><h1>Doğru ürünü birlikte bulalım.</h1><span>Onaylı katalog verisi ve gerçek AI sağlayıcısı henüz bağlı değildir.</span><nav aria-label="Hızlı işlemler"><Link href="/urunler">Tüm ürünler <b>→</b></Link><Link href="/arama">Karşılaştırma <b>→</b></Link><Link href="/kurumsal/teklif">Kurumsal teklif <b>→</b></Link></nav><div><strong>D08 / D10 bekleniyor</strong><small>Yanıt politikası, konuşma saklama, limit, maliyet ve insan devri kesinleşmeden gerçek asistan açılmaz.</small></div></aside>
    <section className={styles.chat} aria-labelledby="chat-title">
      <div className={styles.chatHeader}><div><span className={styles.statusDot} /><div><h2 id="chat-title">Xinobi Asistan</h2><p>Demo konuşma · Çevrimdışı</p></div></div><button type="button" onClick={() => { setTopic(null); setMessage(""); setNotice(""); }}>Konuşmayı temizle</button></div>
      <div className={styles.messages} aria-live="polite">
        <article className={styles.assistantMessage}><span>X</span><div><p>Merhaba. Ürünleri keşfetme, karşılaştırma veya kurumsal talep yolunu gösterebilirim.</p><small>Demo sabit yanıt · AI üretimi değildir</small></div></article>
        {!topic && <div className={styles.suggestions}>{prompts.map((item) => <button type="button" key={item.id} onClick={() => choose(item.id)}>{item.label} <span>→</span></button>)}</div>}
        {topic && <><article className={styles.userMessage}><p>{message}</p></article><article className={styles.assistantMessage}><span>X</span><div>{topic === "corporate" ? <><p>Toplu alım için ürün, adet, termin ve kişiselleştirme bilgileriyle kurumsal teklif formunu kullanabilirsiniz.</p><Link href="/kurumsal/teklif">Teklif formuna git →</Link></> : <><p>Mevcut demo kataloğa göre bu ürün iyi bir başlangıç olabilir:</p><div className={styles.productCard}><Image src={product.image} alt={product.name} sizes="110px" /><div><strong>{product.name}</strong><span>{product.copy}</span><small>Fiyat ve stok: D02/API bekleniyor</small><Link href={product.href}>Ürünü incele →</Link></div></div></>}<small>Onaylı kaynak/API bağlı değil · Kesin öneri değildir</small></div></article></>}
        {notice && <div className={styles.systemNotice}>{notice}</div>}
      </div>
      <div className={styles.composer}><label htmlFor="assistant-message">Mesajınız</label><div><textarea id="assistant-message" rows={2} value={message} onChange={(event) => setMessage(event.target.value.slice(0,500))} placeholder="Ne aradığınızı anlatın" /><button type="button" disabled={message.trim().length < 3} onClick={() => setNotice("Demo mesaj hazırlandı; AI sağlayıcısına gönderilmedi.")}>Gönder</button></div><small>Bu prototipe kişisel, finansal veya hassas bilgi yazmayın.</small></div>
      <footer><button type="button" disabled>Canlı desteğe bağlan</button><button type="button" disabled>WhatsApp&apos;a geç</button><span>Destek kanalları D05/D10 bekliyor.</span></footer>
    </section>
  </div>;
}
