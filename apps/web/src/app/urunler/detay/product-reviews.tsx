'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {myReviews,submitReview,useDemoCommerce,type MyReview} from '../../../lib/demo-commerce';
import {fetchReviews,stars,type ReviewPage} from '../../../lib/reviews';
import styles from './reviews.module.css';

const date=(value:string)=>new Date(value).toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'});
const statusText={pending:'Onay bekliyor',approved:'Yayında',rejected:'Yayınlanmadı'} as const;

/** Approved reviews with the rating breakdown, and a form for customers who received this product. */
export default function ProductReviews({productId,productName}:{productId:string;productName:string}){
  const {user,orders}=useDemoCommerce();
  const [page,setPage]=useState<ReviewPage|null>(null),[unavailable,setUnavailable]=useState(false),[more,setMore]=useState(1);
  const [mine,setMine]=useState<MyReview|null>(null),[rating,setRating]=useState(0),[title,setTitle]=useState(''),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[editing,setEditing]=useState(false);
  useEffect(()=>{let active=true;fetchReviews(productId,1).then(value=>{if(active)setPage(value)}).catch(()=>{if(active)setUnavailable(true)});return()=>{active=false}},[productId]);
  useEffect(()=>{if(!user)return;let active=true;myReviews().then(list=>{if(active)setMine(list.find(item=>item.productId===productId)??null)}).catch(()=>{});return()=>{active=false}},[user,productId]);
  if(unavailable)return null;
  const purchased=orders.some(order=>order.status==='delivered'&&order.lines.some(line=>line.productId===productId));
  const summary=page?.summary;
  const showForm=user&&purchased&&(!mine||editing);
  return <section id="degerlendirmeler" className={styles.reviews} aria-labelledby="reviews-title">
    <div className={styles.head}><h2 id="reviews-title">Müşteri değerlendirmeleri</h2>{summary&&summary.count>0&&<p className={styles.score}><b aria-hidden="true">{stars(summary.average)}</b><span>{summary.average.toLocaleString('tr-TR')} / 5 · {summary.count} değerlendirme</span></p>}</div>
    {summary&&summary.count>0&&<ol className={styles.bars} aria-label="Puan dağılımı">{[5,4,3,2,1].map(star=><li key={star}><span>{star} yıldız</span><i><b style={{width:`${(summary.distribution[star-1]/summary.count)*100}%`}}/></i><span>{summary.distribution[star-1]}</span></li>)}</ol>}
    {mine&&!editing&&<div className={styles.mine}><strong>Senin değerlendirmen · {statusText[mine.status]}</strong><p>{stars(mine.rating)} {mine.title}</p><p>{mine.body}</p>{mine.moderationNote&&<small>Not: {mine.moderationNote}</small>}<button type="button" onClick={()=>{setEditing(true);setRating(mine.rating);setTitle(mine.title??'');setBody(mine.body)}}>Düzenle</button></div>}
    {showForm&&<form className={styles.form} onSubmit={async event=>{event.preventDefault();if(!rating||busy)return;setBusy(true);setError('');try{setMine(await submitReview(productId,rating,title,body));setEditing(false)}catch(e){setError(e instanceof Error?e.message:'Gönderilemedi.')}finally{setBusy(false)}}}>
      <h3>{productName} ürününü değerlendir</h3>
      <fieldset className={styles.starInput}><legend>Puanın</legend>{[1,2,3,4,5].map(star=><label key={star}><input type="radio" name="rating" value={star} checked={rating===star} onChange={()=>setRating(star)}/><span aria-hidden="true">{star<=rating?'★':'☆'}</span><span className={styles.srOnly}>{star} yıldız</span></label>)}</fieldset>
      <label>Başlık (isteğe bağlı)<input value={title} maxLength={80} onChange={event=>setTitle(event.target.value)}/></label>
      <label>Yorumun<textarea rows={4} minLength={10} maxLength={2000} required value={body} onChange={event=>setBody(event.target.value)} placeholder="Ürünü nasıl buldun? (en az 10 karakter)"/></label>
      {error&&<p role="alert" className={styles.error}>{error}</p>}
      <button disabled={!rating||body.trim().length<10||busy}>{busy?'Gönderiliyor…':'Değerlendirmeyi gönder'}</button>
      <small>Değerlendirmen mağaza onayından sonra adının baş harfiyle (ör. Ayşe Y.) yayınlanır.</small>
    </form>}
    {!user&&<p className={styles.muted}>Ürünü satın alıp teslim aldıysan <Link href="/hesap/giris">giriş yaparak</Link> değerlendirebilirsin.</p>}
    {user&&!purchased&&!mine&&<p className={styles.muted}>Bu ürünü teslim aldıktan sonra değerlendirebilirsin.</p>}
    {page&&page.items.length===0&&<p className={styles.muted}>Bu ürün için henüz yayınlanmış değerlendirme yok.</p>}
    <ul className={styles.list}>{page?.items.map(review=><li key={review.id}><div><b aria-label={`5 üzerinden ${review.rating}`}>{stars(review.rating)}</b><strong>{review.title}</strong></div><p>{review.body}</p><small>{review.authorName} · {date(review.createdAt)}{review.color?` · ${review.color}`:''} · Doğrulanmış satın alma</small>{review.storeReply&&<blockquote><strong>Xinobi yanıtı:</strong> {review.storeReply}</blockquote>}</li>)}</ul>
    {page&&summary&&page.items.length<summary.count&&<button type="button" className={styles.more} onClick={async()=>{const next=more+1;const value=await fetchReviews(productId,next);setPage({...value,items:[...page.items,...value.items]});setMore(next)}}>Daha fazla göster</button>}
  </section>;
}
