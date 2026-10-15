"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { myReviews, submitReview, useDemoCommerce, type MyReview } from "../../../lib/demo-commerce";
import styles from "./reviews.module.css";

const status: Record<MyReview["status"], { label: string; text: string }> = {
  pending: { label: "İnceleniyor", text: "Değerlendirmen moderasyon sonrasında yayınlanacak." },
  approved: { label: "Yayında", text: "Değerlendirmen ürün sayfasında yayınlandı." },
  rejected: { label: "Yayınlanmadı", text: "Değerlendirmeni düzenleyip yeniden gönderebilirsin." },
};
const date = (value: string) => new Date(value).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

type Product = { id: string; name: string; color?: string };

function ReviewForm({ product, review, onSaved, onCancel }: { product: Product; review?: MyReview; onSaved: (review: MyReview) => void; onCancel: () => void }) {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [title, setTitle] = useState(review?.title ?? "");
  const [body, setBody] = useState(review?.body ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { onSaved(await submitReview(product.id, rating, title, body)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Değerlendirme gönderilemedi."); }
    finally { setBusy(false); }
  }
  return <form className={styles.form} onSubmit={save}>
    <h2>{review ? "Değerlendirmeyi düzenle" : "Ürünü değerlendir"}</h2>
    <p><strong>{product.name}</strong>{product.color ? ` · ${product.color}` : ""}</p>
    <fieldset><legend>Puanın</legend><div className={styles.stars}>{[1, 2, 3, 4, 5].map(value => <label key={value}><input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} /><span aria-hidden="true">★</span><span className={styles.srOnly}>{value} yıldız</span></label>)}</div></fieldset>
    <label>Başlık (isteğe bağlı)<input value={title} maxLength={80} onChange={event => setTitle(event.target.value)} /></label>
    <label>Yorumun<textarea value={body} minLength={10} maxLength={2000} rows={5} required onChange={event => setBody(event.target.value)} /><small>{body.trim().length}/2000 · en az 10 karakter</small></label>
    {review && <p className={styles.warning}>Değişiklik kaydedildiğinde değerlendirme yeniden incelemeye alınır.</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <div className={styles.actions}><button type="button" onClick={onCancel}>Vazgeç</button><button className={styles.primary} disabled={busy || rating === 0 || body.trim().length < 10}>{busy ? "Gönderiliyor…" : "İncelemeye gönder"}</button></div>
  </form>;
}

export default function MyReviews() {
  const { user, ready, orders } = useDemoCommerce();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string>();
  const products = useMemo(() => {
    const result = new Map<string, Product>();
    orders.filter(order => order.status === "delivered").forEach(order => order.lines.forEach(line => result.set(line.productId, { id: line.productId, name: line.name, color: line.color })));
    reviews.forEach(review => { if (!result.has(review.productId)) result.set(review.productId, { id: review.productId, name: review.productId }); });
    return result;
  }, [orders, reviews]);

  useEffect(() => {
    if (!ready) return;
    if (!user) { const timer = window.setTimeout(() => setLoading(false), 0); return () => window.clearTimeout(timer); }
    let active = true;
    myReviews().then(items => { if (active) setReviews(items); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Değerlendirmeler yüklenemedi."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ready, user]);

  const eligible = [...products.values()].filter(product => !reviews.some(review => review.productId === product.id));
  function saved(next: MyReview) { setReviews(current => [next, ...current.filter(review => review.id !== next.id)]); setEditing(undefined); }

  return <div className={styles.shell}>
    <header><p>Market hesabım</p><h1>Değerlendirmelerim</h1><span>Yalnız teslim aldığın ürünleri değerlendirebilirsin.</span></header>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {!ready || loading ? <p role="status">Değerlendirmelerin yükleniyor…</p> : !user ? <div className={styles.empty}><h2>Hesabına giriş yap</h2><p>Kendi değerlendirmelerini görmek ve teslim aldığın ürünlere puan vermek için giriş yap.</p><Link href="/hesap">Giriş yap →</Link></div> : <>
      {eligible.length > 0 && <section aria-labelledby="eligible-title"><h2 id="eligible-title" className={styles.sectionTitle}>Değerlendirebileceğin ürünler</h2><div className={styles.eligible}>{eligible.map(product => <button key={product.id} onClick={() => setEditing(product.id)}><span><strong>{product.name}</strong><small>{product.color}</small></span><b>Değerlendir →</b></button>)}</div></section>}
      <section aria-labelledby="reviews-title"><h2 id="reviews-title" className={styles.sectionTitle}>Gönderdiklerin</h2>
        {reviews.length === 0 ? <div className={styles.empty}><h2>Henüz değerlendirmen yok.</h2><p>Teslim edilen siparişlerindeki ürünler burada değerlendirmeye açılır.</p><Link href="/hesap/siparisler">Siparişlerime git →</Link></div> : <div className={styles.list}>{reviews.map(review => {
          const product = products.get(review.productId)!; const current = status[review.status];
          return <article key={review.id} data-status={review.status}><header><div><h2>{product.name}</h2><p>{product.color || review.productId} · {date(review.createdAt)}</p></div><span>{current.label}</span></header><div className={styles.rating} aria-label={`${review.rating} / 5 yıldız`}>{[1, 2, 3, 4, 5].map(star => <span key={star} data-active={star <= review.rating}>★</span>)}</div>{review.title && <h3>{review.title}</h3>}<p className={styles.body}>{review.body}</p><p className={styles.statusText}>{current.text}</p>{review.moderationNote && <p className={styles.note}><strong>Moderasyon notu:</strong> {review.moderationNote}</p>}<button className={styles.edit} onClick={() => setEditing(review.productId)}>Düzenle ve yeniden gönder</button></article>;
        })}</div>}
      </section>
      {editing && products.has(editing) && <ReviewForm product={products.get(editing)!} review={reviews.find(review => review.productId === editing)} onSaved={saved} onCancel={() => setEditing(undefined)} />}
    </>}
  </div>;
}
