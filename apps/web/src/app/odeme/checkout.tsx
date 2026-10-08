'use client';
import Link from 'next/link';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useCart,clearCart} from '../../lib/cart';
import {useCommerce,money} from '../../lib/commerce';
import {localPhone,placeDemoOrder,useDemoCommerce} from '../../lib/demo-commerce';
import styles from './checkout.module.css';

/** Demo checkout: pick a saved address; the server prices the cart from the catalogue. No card, no payment, no stock reservation. */
export default function Checkout(){
  const router=useRouter();const cart=useCart();const {state}=useCommerce();const {user,addresses,ready}=useDemoCommerce();
  const [scenario,setScenario]=useState('success');const [chosen,setChosen]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const requestId=useRef('');const locked=useRef(false);
  const rows=cart.map(row=>{const product=state?.products.find(item=>item.id===row.productId&&item.active);const variant=product?.variants.find(item=>item.id===row.variantId);return {...row,product,variant,price:state?.prices[row.variantId]}});
  const valid=rows.length>0&&rows.every(row=>row.product&&row.variant&&row.variant.stock>=row.quantity&&row.price!==undefined&&row.price>0);
  const total=rows.reduce((sum,row)=>sum+(row.price||0)*row.quantity,0);
  const address=addresses.find(item=>item.id===chosen)??addresses.find(item=>item.isDefault)??addresses[0];
  async function submit(event:React.FormEvent){event.preventDefault();if(locked.current)return;setError('');
    if(!valid){setError('Fiyat veya stok değişti. Sepetini kontrol et.');return}
    if(!address){setError('Bir teslimat adresi seç.');return}
    if(scenario==='failed'){setError('Ödeme reddedildi (demo). Sipariş oluşmadı; yeniden deneyebilirsin.');return}
    locked.current=true;setBusy(true);
    try{requestId.current||='web-'+crypto.randomUUID();const order=await placeDemoOrder(address.id,rows.map(row=>({productId:row.productId,variantId:row.variantId,quantity:row.quantity})),requestId.current);clearCart();router.push(`/odeme/sonuc?siparis=${encodeURIComponent(order.id)}`)}
    catch(problem){setError(problem instanceof Error?problem.message:'Sipariş kaydedilemedi.');locked.current=false;setBusy(false)}}
  return <div className={styles.layout}><section className={styles.formArea}><h1>Ödeme</h1>
    <div className={styles.notice}><strong>Para çekilmez</strong><p>Demo sipariş: kart bilgisi istenmez, ödeme alınmaz; kargo ve stok işlemi yapılmaz. Siparişin web ve mobilde görünür.</p></div>
    {!ready?<p role="status">Hesap kontrol ediliyor…</p>:!user?<p><Link href="/hesap/giris">Önce hesabına giriş yap →</Link></p>:<form id="demo-checkout" onSubmit={submit}>
      <p>{user.name} · {user.email}</p>
      <fieldset><legend>Teslimat adresi</legend>
        {addresses.length===0?<p>Sipariş için bir teslimat adresi ekle. <Link href="/hesap/adresler">Adres ekle →</Link></p>:<div className={styles.addresses}>{addresses.map(item=><label key={item.id} className={item.id===address?.id?styles.addressChosen:styles.address}><input type="radio" name="address" checked={item.id===address?.id} onChange={()=>setChosen(item.id)}/><span><strong>{item.title}{item.isDefault&&<em>Varsayılan</em>}</strong><small>{item.fullName} · {localPhone(item.phone)}</small><small>{item.line}, {item.district}/{item.city}</small></span></label>)}<Link href="/hesap/adresler">Adresleri yönet →</Link></div>}
      </fieldset>
      <fieldset><legend>Ödeme senaryosu (demo)</legend><label><input type="radio" name="scenario" checked={scenario==='success'} onChange={()=>setScenario('success')}/> Başarılı ödeme</label><label><input type="radio" name="scenario" checked={scenario==='failed'} onChange={()=>setScenario('failed')}/> Başarısız ödeme</label></fieldset>
    </form>}
    {error&&<p role="alert">{error}</p>}
  </section>
  <aside className={styles.summary}><h2>Sipariş özeti</h2>{rows.map(row=><p key={row.variantId}>{row.product?.name||'Ürün bulunamadı'} · {row.variant?.color} × {row.quantity}</p>)}<p>Toplam: {valid?money(total):'Sepeti kontrol et'}</p><button form="demo-checkout" type="submit" disabled={!user||!valid||!address||busy}>{busy?'Kaydediliyor…':'Ödemeyi tamamla'}</button><p><Link href="/sepet">Sepete dön →</Link></p></aside></div>;
}
