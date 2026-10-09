"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { decideQuote, quoteStatusText, sendQuoteMessage, tl, trackQuote, type Quote } from "../../../../lib/quotes";
import styles from "./tracking.module.css";

const date = (value: string) => new Date(value).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const steps = ["received", "reviewing", "offered", "accepted"] as const;

/** Track a quote with its code and the e-mail it was sent with: status, offer, messages, accept or decline. */
export default function QuoteTracking() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("kod") ?? ""), [email, setEmail] = useState(params.get("eposta") ?? "");
  const [quote, setQuote] = useState<Quote | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""), [decisionNote, setDecisionNote] = useState("");
  async function load(event?: React.FormEvent) {
    event?.preventDefault(); if (!code.trim() || !email.trim()) return;
    setBusy(true); setError("");
    try { setQuote(await trackQuote(code, email)); } catch (e) { setQuote(null); setError(e instanceof Error ? e.message : "Teklif bulunamadı."); } finally { setBusy(false); }
  }
  // A link from the confirmation e-mail or form fills both fields.
  useEffect(() => {
    const linkedCode = params.get("kod"), linkedEmail = params.get("eposta");
    if (!linkedCode || !linkedEmail) return;
    let active = true;
    trackQuote(linkedCode, linkedEmail).then((value) => { if (active) setQuote(value); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : "Teklif bulunamadı."); });
    return () => { active = false; };
  }, [params]);
  async function act(run: () => Promise<Quote>) { setBusy(true); setError(""); try { setQuote(await run()); } catch (e) { setError(e instanceof Error ? e.message : "İşlem yapılamadı."); } finally { setBusy(false); } }
  const reached = quote ? (quote.status === "rejected" || quote.status === "closed" ? -1 : steps.indexOf(quote.status as typeof steps[number])) : -1;
  const open = quote && ["received", "reviewing", "offered"].includes(quote.status);

  return <div className={styles.shell}>
    <section className={styles.hero}><p>Kurumsal süreç</p><h1>Teklifinizi takip edin.</h1><span>Talep kodunu ve talebi gönderdiğiniz e-posta adresini girin.</span>
      <form onSubmit={load}><label htmlFor="quote-code">Teklif kodu</label><div><input id="quote-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Q-261009-1234" required /><input aria-label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@firma.com" required /><button type="submit" disabled={busy}>{busy && !quote ? "Aranıyor…" : "Teklifi getir"}</button></div></form></section>
    {error && <div className={styles.notice} role="alert"><strong>Bulunamadı</strong><span>{error}</span></div>}
    {!quote ? <p className={styles.empty}>Yeni bir talep mi? <Link href="/kurumsal/teklif">Teklif iste →</Link></p> : <div className={styles.layout}>
      <section className={styles.main}>
        <div className={styles.quoteHeader}><div><p>{quote.code}</p><h2>{quote.company}</h2><span>{quote.contactName} · {date(quote.createdAt)}</span></div><b>{quoteStatusText[quote.status]}</b></div>
        {reached >= 0 ? <ol className={styles.timeline}>{steps.map((step, index) => <li key={step} className={index < reached ? styles.done : index === reached ? styles.active : ""}><i>{index < reached ? "✓" : index + 1}</i><div><strong>{quoteStatusText[step]}</strong><span>{quote.history.findLast((item) => item.status === step) ? date(quote.history.findLast((item) => item.status === step)!.at) : "Bekleniyor"}</span></div></li>)}</ol> : <p className={styles.closed}>{quoteStatusText[quote.status]}</p>}
        <section className={styles.revisions} aria-labelledby="items-title"><div className={styles.sectionTitle}><div><p>Ürünler</p><h3 id="items-title">{quote.offer ? "Teklif" : "Talep edilen ürünler"}</h3></div>{quote.offer && <span>Geçerlilik: {new Date(quote.offer.validUntil).toLocaleDateString("tr-TR")}</span>}</div>
          <table className={styles.items}><thead><tr><th>Ürün</th><th>Adet</th><th>Birim fiyat</th><th>Tutar</th></tr></thead><tbody>{quote.items.map((item) => <tr key={item.productId}><td>{item.productName}</td><td>{item.quantity}</td><td>{tl(item.unitPrice)}</td><td>{tl(item.lineTotal)}</td></tr>)}</tbody>{quote.offer && <tfoot><tr><th colSpan={3}>Toplam (KDV ve kargo teklif notunda belirtilir)</th><th>{tl(quote.offer.total)}</th></tr></tfoot>}</table>
          {quote.offer?.note && <p className={styles.offerNote}>Satış ekibinin notu: {quote.offer.note}</p>}
          {quote.status === "offered" && <div className={styles.decision}><label>Notunuz (isteğe bağlı)<textarea rows={2} maxLength={1000} value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} /></label><div><button type="button" disabled={busy} onClick={() => act(() => decideQuote(quote.code, quote.email, "accept", decisionNote))}>Teklifi kabul et</button><button type="button" disabled={busy} onClick={() => act(() => decideQuote(quote.code, quote.email, "reject", decisionNote))}>Reddet</button></div><small>Kabul ödeme başlatmaz; satış ekibi sipariş ve teslimat adımları için sizinle iletişime geçer.</small></div>}
        </section>
        <section className={styles.response}><div className={styles.sectionTitle}><div><p>Yazışma</p><h3>Mesajlar</h3></div></div>
          {quote.messages.length === 0 ? <p>Henüz mesaj yok.</p> : <ul className={styles.messages}>{quote.messages.map((item, index) => <li key={index} data-from={item.from}><strong>{item.from === "store" ? "Xinobi satış" : quote.contactName}</strong><p>{item.text}</p><small>{date(item.at)}</small></li>)}</ul>}
          {open && <form onSubmit={(e) => { e.preventDefault(); if (message.trim().length >= 2) void act(async () => { const next = await sendQuoteMessage(quote.code, quote.email, message); setMessage(""); return next; }); }}><label htmlFor="quote-message">Mesajınız<textarea id="quote-message" rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Adet, renk, termin veya kişiselleştirme sorunuzu yazın" /></label><button disabled={busy || message.trim().length < 2}>Mesaj gönder</button></form>}
        </section>
      </section>
      <aside className={styles.summary}><p>Talep özeti</p><h2>{quoteStatusText[quote.status]}</h2><dl><div><dt>Kişiselleştirme</dt><dd>{quote.personalization ? quote.personalizationNote || "İsteniyor" : "İstenmiyor"}</dd></div><div><dt>Hedef tarih</dt><dd>{quote.desiredDate ? new Date(quote.desiredDate).toLocaleDateString("tr-TR") : "—"}</dd></div><div><dt>Amaç</dt><dd>{quote.purpose ?? "—"}</dd></div><div><dt>Toplam</dt><dd>{tl(quote.offer?.total)}</dd></div></dl></aside>
    </div>}
  </div>;
}
