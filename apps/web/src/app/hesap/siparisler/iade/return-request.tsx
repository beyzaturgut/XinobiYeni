"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { orderOptions, requestReturn, returnable, useDemoCommerce, type OrderOptions } from "../../../../lib/demo-commerce";
import { money } from "../../../../lib/commerce";
import styles from "./return.module.css";

/** Return request for one delivered order (?siparis=id): lines and quantities, a listed reason and an optional description. */
export default function ReturnRequest() {
  const { user, orders, ready } = useDemoCommerce();
  const orderId = useSearchParams().get("siparis");
  const order = orders.find((item) => item.id === orderId);
  const [options, setOptions] = useState<OrderOptions | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [optionsError,setOptionsError]=useState(""),[reload,setReload]=useState(0);
  useEffect(() => { if (user) orderOptions().then(setOptions).catch(() => setOptionsError("İade seçenekleri yüklenemedi.")); }, [user,reload]);

  if (!ready || (user && !options && !optionsError)) return <p className={styles.layout} role="status">Yükleniyor…</p>;
  if (!user) return <div className={styles.layout}><Link href="/hesap">İade talebi için giriş yap →</Link></div>;
  if (!options) return <div className={styles.layout}><section className={styles.formArea}><h1>İade talebi</h1><p role="alert" className={styles.error}>{optionsError} <button type="button" onClick={()=>{setOptionsError("");setReload(value=>value+1)}}>Tekrar dene</button></p><Link href="/hesap/siparisler">Siparişlerime dön →</Link></section></div>;
  if (!order) {
    // Reached without an order (e.g. the footer link): list the orders that can still be returned or cancelled.
    const eligible = options ? orders.filter((item) => Object.keys(returnable(item, options.returnWindowDays)).length > 0 || item.status === "received" || item.status === "preparing") : [];
    return <div className={styles.layout}><section className={styles.formArea}><p className={styles.eyebrow}>İptal ve iade</p><h1>{orderId ? "Sipariş bulunamadı." : "Hangi sipariş için?"}</h1>
      {eligible.length === 0 ? <p>İptal veya iade edilebilecek bir siparişin yok. Kargoya verilmeden önce siparişi iptal edebilir, teslimattan sonra {options?.returnWindowDays ?? 14} gün içinde iade talebi oluşturabilirsin.</p> :
        <ul className={styles.orderChoices}>{eligible.map((item) => <li key={item.id}><Link href={item.status === "delivered" ? `/hesap/siparisler/iade?siparis=${item.id}` : `/hesap/siparisler?siparis=${item.id}`}><strong>{item.number}</strong><span>{item.lines.map((line) => line.name).join(", ")} · {money(item.total.amountMinor)}</span><small>{item.status === "delivered" ? "İade talebi oluştur →" : "İptal için siparişe git →"}</small></Link></li>)}</ul>}
      <Link href="/hesap/siparisler">Siparişlerime dön →</Link></section></div>;
  }
  const left = options ? returnable(order, options.returnWindowDays) : {};
  const chosen = Object.entries(quantities).filter(([, count]) => count > 0);
  const canSubmit = reason && chosen.length > 0 && !busy;

  if (sent) return <div className={styles.layout}><section className={styles.formArea} aria-live="polite"><p className={styles.eyebrow}>İade talebi</p><h1>Talebin alındı.</h1><p>{order.number} için iade talebini inceleyip sonucu bildirim ve e-posta ile ileteceğiz. Onaylanırsa ürünü kargoyla geri gönderebilirsin.</p><Link href={`/hesap/siparisler?siparis=${order.id}`}>Siparişime dön →</Link></section></div>;

  return <div className={styles.layout}>
    <section className={styles.formArea} aria-labelledby="return-title">
      <p className={styles.eyebrow}>İade talebi · {order.number}</p><h1 id="return-title">Hangi ürünleri iade etmek istiyorsun?</h1>
      {Object.keys(left).length === 0 ? <div className={styles.notice}><strong>İade edilemez</strong><span>Bu sipariş için iade süresi ({options?.returnWindowDays} gün) dolmuş, sipariş henüz teslim edilmemiş ya da tüm ürünler için talep oluşturulmuş.</span></div> :
      <form onSubmit={async (event) => {
        event.preventDefault(); if (!canSubmit) return;
        setBusy(true); setError("");
        try { await requestReturn(order.id, reason, description, chosen.map(([variantId, quantity]) => ({ variantId, quantity }))); setSent(true); }
        catch (e) { setError(e instanceof Error ? e.message : "Talep gönderilemedi."); }
        finally { setBusy(false); }
      }}>
        <fieldset><legend>01 · Ürünler</legend><div className={styles.lines}>{order.lines.filter((line, index, all) => left[line.variantId] && all.findIndex((other) => other.variantId === line.variantId) === index).map((line) => <label key={line.variantId} className={styles.product}>
          <input type="checkbox" checked={(quantities[line.variantId] ?? 0) > 0} onChange={(event) => setQuantities((current) => ({ ...current, [line.variantId]: event.target.checked ? 1 : 0 }))} />
          {line.imageUrl ? <Image src={line.imageUrl} alt="" width={70} height={85} unoptimized /> : <span />}
          <span><strong>{line.name}</strong><small>{line.color} · {money(line.unitPrice.amountMinor)} · iade edilebilir: {left[line.variantId]}</small>
            {(quantities[line.variantId] ?? 0) > 0 && left[line.variantId] > 1 && <select aria-label={`${line.name} iade adedi`} value={quantities[line.variantId]} onChange={(event) => setQuantities((current) => ({ ...current, [line.variantId]: Number(event.target.value) }))}>{Array.from({ length: left[line.variantId] }, (_, i) => i + 1).map((count) => <option key={count} value={count}>{count} adet</option>)}</select>}
          </span>
        </label>)}</div></fieldset>
        <fieldset><legend>02 · Talep nedeni</legend>
          <label className={styles.field}>Neden<select required value={reason} onChange={(event) => setReason(event.target.value)}><option value="">Seçiniz</option>{options?.returnReasons.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className={styles.field}>Açıklama (isteğe bağlı)<textarea rows={4} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Örneğin hasarın nerede olduğunu anlat" /><small>{description.length}/1000</small></label>
        </fieldset>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.submit} disabled={!canSubmit}>{busy ? "Gönderiliyor…" : "İade talebini gönder"}</button>
      </form>}
    </section>
    <aside className={styles.summary}><p>Nasıl işler?</p><h2>İade adımları</h2><ol><li>Talebini mağaza inceler; sonucu bildirim ve e-posta ile iletilir.</li><li>Onaylanırsa ürünü orijinal kutusuyla kargoya verirsin.</li><li>Ürün depoya ulaşınca iade tamamlanır.</li></ol><p>Teslimattan sonra {options?.returnWindowDays ?? 14} gün içinde talep oluşturabilirsin. Bu demo siparişte ödeme alınmadığı için geri ödeme yapılmaz. Kişiselleştirilmiş ürünlerde koşullar ayrıca değerlendirilir.</p></aside>
  </div>;
}
