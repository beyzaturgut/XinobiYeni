"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { commerceApi, mediaUrl, useCommerce } from "../../../lib/commerce";
import { useDemoCommerce } from "../../../lib/demo-commerce";
import { createQuote, quoteOptions, type Quote, type QuoteOptions } from "../../../lib/quotes";
import styles from "./quote.module.css";

type Row = { productId: string; quantity: number };

/** Corporate quote request: company and contact, products with quantities, personalisation, date and purpose. */
export default function QuoteForm() {
  const { state } = useCommerce();
  const { user } = useDemoCommerce();
  const products = useMemo(() => state?.products.filter((product) => product.active) ?? [], [state]);
  const [options, setOptions] = useState<QuoteOptions | null>(null);
  const [company, setCompany] = useState(""), [contactInput, setContactName] = useState<string>(), [emailInput, setEmail] = useState<string>(), [phone, setPhone] = useState(""), [taxNumber, setTaxNumber] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [personalization, setPersonalization] = useState(false), [personalizationNote, setPersonalizationNote] = useState("");
  const [desiredDate, setDesiredDate] = useState(""), [purpose, setPurpose] = useState(""), [note, setNote] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [sent, setSent] = useState<Quote | null>(null);
  useEffect(() => { quoteOptions().then(setOptions).catch(() => setError("Teklif servisine ulaşılamadı.")); }, []);
  // Signed-in senders start with their own name and e-mail until they type something else.
  const contactName = contactInput ?? user?.name ?? "", email = emailInput ?? user?.email ?? "";
  const items = rows.length ? rows : products[0] ? [{ productId: products[0].id, quantity: options?.minQuantity ?? 10 }] : [];
  const setRow = (index: number, patch: Partial<Row>) => setRows(items.map((row, i) => i === index ? { ...row, ...patch } : row));
  const preview = products.find((product) => product.id === items[0]?.productId);

  if (sent) return <section className={styles.layout}><div className={styles.done} aria-live="polite"><p>Teklif talebi</p><h1>Talebin alındı.</h1><p>Talep kodun: <strong>{sent.code}</strong>. Onay e-postası <strong>{sent.email}</strong> adresine gönderildi. İnceleyip en kısa sürede dönüş yapacağız.</p><Link href={`/kurumsal/teklif/takip?kod=${encodeURIComponent(sent.code)}&eposta=${encodeURIComponent(sent.email)}`}>Talebini takip et →</Link></div></section>;

  return <>
    <section className={styles.hero}><div><p>Xinobi for Business</p><h1>İşinize özel, sakin teknoloji.</h1><span>Toplu ürün, kurumsal hediye ve kişiselleştirme ihtiyaçlarınızı tek talepte anlatın.</span></div><div className={styles.heroProduct}><div />{preview && (preview.originalImage || preview.variants[0]?.image) && <Image src={mediaUrl(preview.originalImage || preview.variants[0].image, commerceApi)} alt={preview.name} width={600} height={600} priority sizes="(max-width: 800px) 80vw, 42vw" />}</div></section>
    <section className={styles.layout}>
      <form onSubmit={async (event) => {
        event.preventDefault(); if (busy) return;
        setBusy(true); setError("");
        try { setSent(await createQuote({ company, contactName, email, phone: phone || undefined, taxNumber: taxNumber || undefined, items, personalization, personalizationNote: personalization ? personalizationNote : undefined, desiredDate: desiredDate || null, purpose: purpose || null, note: note || undefined })); }
        catch (e) { setError(e instanceof Error ? e.message : "Talep gönderilemedi."); }
        finally { setBusy(false); }
      }}>
        <div className={styles.intro}><p>Teklif talebi</p><h2>İhtiyacınızı birlikte şekillendirelim.</h2><div><strong>Ödeme alınmaz</strong><span>Talep bir sipariş değildir; fiyat ve termin satış ekibimizin teklifiyle kesinleşir.</span></div></div>
        <fieldset><legend>01 · Firma ve iletişim</legend><div className={styles.grid}>
          <label>Firma adı<input required minLength={2} maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" /></label>
          <label>Yetkili kişi<input required minLength={2} maxLength={80} value={contactName} onChange={(e) => setContactName(e.target.value)} autoComplete="name" /></label>
          <label>Kurumsal e-posta<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label>Telefon (isteğe bağlı)<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="0532 123 45 67" /></label>
          <label>Vergi numarası (isteğe bağlı)<input inputMode="numeric" maxLength={11} value={taxNumber} onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, ""))} /></label>
        </div></fieldset>
        <fieldset><legend>02 · Ürün ve adet</legend>
          {items.map((row, index) => <div className={styles.itemRow} key={index}>
            <label>Ürün<select value={row.productId} onChange={(e) => setRow(index, { productId: e.target.value })}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
            <label>Adet<input type="number" min={options?.minQuantity ?? 10} max={options?.maxQuantity ?? 100000} value={row.quantity} onChange={(e) => setRow(index, { quantity: Number(e.target.value) })} /></label>
            {items.length > 1 && <button type="button" aria-label={`${index + 1}. ürünü kaldır`} onClick={() => setRows(items.filter((_, i) => i !== index))}>×</button>}
          </div>)}
          {items.length < (options?.maxItems ?? 10) && products.length > items.length && <button type="button" className={styles.addRow} onClick={() => setRows([...items, { productId: products.find((product) => !items.some((row) => row.productId === product.id))?.id ?? products[0].id, quantity: options?.minQuantity ?? 10 }])}>+ Ürün ekle</button>}
          <small className={styles.hint}>Ürün başına en az {options?.minQuantity ?? 10} adet.</small>
        </fieldset>
        <fieldset><legend>03 · Proje ayrıntıları</legend>
          <label className={styles.check}><input type="checkbox" checked={personalization} onChange={(e) => setPersonalization(e.target.checked)} /><span><strong>Kurumsal kişiselleştirme istiyorum</strong><small>Logo, isim veya kampanya tasarımı</small></span></label>
          {personalization && <label className={styles.full}>Kişiselleştirme notu<textarea rows={3} maxLength={500} value={personalizationNote} onChange={(e) => setPersonalizationNote(e.target.value)} placeholder="Ör. ön yüzde tek renk logo" /></label>}
          <div className={styles.grid}>
            <label>Hedef teslim tarihi<input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} /></label>
            <label>Kullanım amacı<select value={purpose} onChange={(e) => setPurpose(e.target.value)}><option value="">Seçiniz</option>{options?.purposes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className={styles.full}>Notunuz<textarea rows={5} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Projenizi, renk veya teslimat beklentinizi anlatın" /></label>
          </div>
        </fieldset>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.previewButton} disabled={busy || !items.length}>{busy ? "Gönderiliyor…" : "Teklif talebini gönder"}</button>
      </form>
      <aside className={styles.summary}><p>Talep özeti</p><h2>Kurumsal proje</h2><dl><div><dt>Ürün</dt><dd>{items.map((row) => products.find((product) => product.id === row.productId)?.name).join(", ") || "—"}</dd></div><div><dt>Toplam adet</dt><dd>{items.reduce((sum, row) => sum + (row.quantity || 0), 0)}</dd></div><div><dt>Kişiselleştirme</dt><dd>{personalization ? "İsteniyor" : "İstenmiyor"}</dd></div></dl><ol><li><b>1</b>Talep incelenir</li><li><b>2</b>Ürün ve üretim uygunluğu doğrulanır</li><li><b>3</b>Birim fiyatlı teklif e-postayla iletilir; kabul veya ret takip sayfasından verilir</li></ol></aside>
    </section>
  </>;
}
