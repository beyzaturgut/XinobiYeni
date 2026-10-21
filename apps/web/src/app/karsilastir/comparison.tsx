'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import {useSearchParams} from 'next/navigation';
import {commerceApi,mediaUrl,money,stockText,useCommerce} from '../../lib/commerce';
import {clearCompare,maxCompare,removeCompare,setCompare,toggleCompare,useCompare} from '../../lib/compare';
import {stars,useReviewSummaries} from '../../lib/reviews';
import type {Product} from '../../../../../packages/commerce/client';
import styles from './compare.module.css';

type Row={label:string;cells:ReactNode[];values:string[]};
const personalizable=(product:Product)=>product.personalizable===true;

/** Side-by-side comparison of up to four products: price, colours, stock, rating, XINOBI U and every technical spec. */
export default function Comparison(){
  const {state,error}=useCommerce();
  const ids=useCompare();
  const shared=useSearchParams().get('urunler');
  // A shared link (?urunler=a,b) replaces the list once.
  useEffect(()=>{if(shared)setCompare(shared.split(',').filter(Boolean).slice(0,maxCompare))},[shared]);
  const [onlyDifferences,setOnlyDifferences]=useState(false);
  const [copied,setCopied]=useState(false);
  const active=useMemo(()=>state?.products.filter(product=>product.active)??[],[state]);
  const products=ids.map(id=>active.find(product=>product.id===id)).filter((product):product is Product=>Boolean(product));
  const summaries=useReviewSummaries(products.map(product=>product.id));
  const candidates=active.filter(product=>!ids.includes(product.id));
  const priceOf=(product:Product)=>{const prices=product.variants.map(variant=>state?.prices[variant.id]).filter((value):value is number=>Boolean(value));return prices.length?Math.min(...prices):undefined};

  if(!state)return <div className={styles.shell}><p role="status">{error||'Ürünler yükleniyor…'}</p></div>;
  const specNames=[...new Set(products.flatMap(product=>(product.specs??[]).map(spec=>spec.name)))];
  const rows:Row[]=[
    {label:'Fiyat',values:products.map(product=>String(priceOf(product)??'')),cells:products.map(product=>{const price=priceOf(product);const varies=new Set(product.variants.map(v=>state.prices[v.id])).size>1;return <strong key={product.id}>{price===undefined?'Fiyat tanımlanmadı':varies?`${money(price)}'den başlayan`:money(price)}</strong>})},
    {label:'Kategori',values:products.map(product=>product.category),cells:products.map(product=>product.category)},
    {label:'Renk seçenekleri',values:products.map(product=>product.variants.map(v=>v.color).join(',')),cells:products.map(product=><ul key={product.id} className={styles.swatches}>{product.variants.map(variant=><li key={variant.id}><span style={{background:variant.hex&&/^#[a-fA-F0-9]{6}$/.test(variant.hex)?variant.hex:'#ccc'}} aria-hidden="true"/>{variant.color}</li>)}</ul>)},
    {label:'Stok durumu',values:products.map(product=>{const stock=product.variants.reduce((sum,v)=>sum+v.stock,0);return stock>0?'var':'yok'}),cells:products.map(product=>{const stock=product.variants.reduce((sum,v)=>sum+v.stock,0);return stock>0?(stockText(stock)||'Stokta'):'Stokta yok'})},
    {label:'Müşteri puanı',values:products.map(product=>String(summaries[product.id]?.average??'')),cells:products.map(product=>{const summary=summaries[product.id];return summary?.count?<span key={product.id} className={styles.rating} aria-label={`5 üzerinden ${summary.average}, ${summary.count} değerlendirme`}><b aria-hidden="true">{stars(summary.average)}</b> {summary.average.toLocaleString('tr-TR')} ({summary.count})</span>:'Henüz değerlendirme yok'})},
    {label:'XINOBI U kişiselleştirme',values:products.map(product=>String(personalizable(product))),cells:products.map(product=>personalizable(product)?<Link key={product.id} href={`/xinobi-u/sorular?product=${encodeURIComponent(product.id)}`}>Var · Tasarla →</Link>:'Yok')},
    ...specNames.map(name=>({label:name,values:products.map(product=>product.specs?.find(spec=>spec.name===name)?.value??''),cells:products.map(product=>product.specs?.find(spec=>spec.name===name)?.value??'—')})),
    {label:'Açıklama',values:products.map(product=>product.description),cells:products.map(product=><p key={product.id} className={styles.description}>{product.description||'—'}</p>)},
  ];
  const visibleRows=onlyDifferences&&products.length>1?rows.filter(row=>new Set(row.values).size>1):rows;

  return <div className={styles.shell}>
    <header className={styles.head}>
      <div><p className={styles.eyebrow}>Ürün karşılaştırma</p><h1>Yan yana karşılaştır.</h1><p>En fazla {maxCompare} ürünü fiyat, renk, stok, müşteri puanı ve teknik özelliklerine göre karşılaştır.</p></div>
      {products.length>0&&<div className={styles.headActions}>
        <label className={styles.switch}><input type="checkbox" checked={onlyDifferences} onChange={event=>setOnlyDifferences(event.target.checked)}/>Yalnız farkları göster</label>
        <button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(`${location.origin}/karsilastir?urunler=${ids.join(',')}`);setCopied(true);window.setTimeout(()=>setCopied(false),2000)}catch{}}}>{copied?'Bağlantı kopyalandı':'Bağlantıyı paylaş'}</button>
        <button type="button" onClick={clearCompare}>Listeyi temizle</button>
      </div>}
    </header>
    {products.length===0?<section className={styles.empty}>
      <h2>Karşılaştırma listen boş.</h2><p>Ürün kartlarındaki “Karşılaştır” düğmesiyle ya da aşağıdan ürün seçerek başlayabilirsin.</p>
      <div className={styles.quickPick}>{active.slice(0,8).map(product=><button type="button" key={product.id} onClick={()=>toggleCompare(product.id)}>{(product.originalImage||product.variants[0]?.image)&&<Image src={mediaUrl(product.originalImage||product.variants[0].image,commerceApi)} alt="" width={96} height={96}/>}<span>{product.name}</span><small>+ Karşılaştırmaya ekle</small></button>)}</div>
    </section>:<>
      <div className={styles.tableWrap} role="region" aria-label="Seçilen ürünlerin karşılaştırma tablosu" tabIndex={0}>
        <table className={styles.table} style={{['--columns' as string]:products.length}}>
          <thead><tr><th scope="col"><span className={styles.srOnly}>Özellik</span>{products.length===1&&<p className={styles.hint}>Karşılaştırmak için en az bir ürün daha ekle.</p>}</th>{products.map(product=><th scope="col" key={product.id}>
            <button type="button" className={styles.remove} aria-label={`${product.name} ürününü karşılaştırmadan çıkar`} onClick={()=>removeCompare(product.id)}>×</button>
            <div className={styles.productImage}>{(product.originalImage||product.variants[0]?.image)?<Image src={mediaUrl(product.originalImage||product.variants[0].image,commerceApi)} alt="" width={220} height={220}/>:<span>Görsel yok</span>}</div>
            <Link href={`/urunler/detay?id=${encodeURIComponent(product.id)}`}>{product.name}</Link>
            <Link className={styles.inspect} href={`/urunler/detay?id=${encodeURIComponent(product.id)}`}>İncele ve sepete ekle →</Link>
          </th>)}
          {products.length<maxCompare&&candidates.length>0&&<th scope="col" className={styles.addColumn}><label>Ürün ekle<select value="" onChange={event=>{if(event.target.value)toggleCompare(event.target.value)}}><option value="">Seç…</option>{candidates.map(product=><option key={product.id} value={product.id}>{product.name}</option>)}</select></label></th>}</tr></thead>
          <tbody>{visibleRows.map(row=>{const differs=products.length>1&&new Set(row.values).size>1;return <tr key={row.label} data-differs={differs||undefined}><th scope="row">{row.label}{differs&&<span className={styles.diffDot} aria-label="farklı"/>}</th>{row.cells.map((cell,index)=><td key={products[index].id}>{cell}</td>)}{products.length<maxCompare&&candidates.length>0&&<td/>}</tr>})}
            {onlyDifferences&&visibleRows.length===0&&<tr><td colSpan={products.length+2}>Seçilen ürünler arasında fark bulunamadı.</td></tr>}</tbody>
        </table>
      </div>
      <p className={styles.note}>Fiyat ve stok anlık bilgidir; ödeme adımında yeniden doğrulanır. Teknik özellikler mağaza tarafından girilir.</p>
    </>}
  </div>;
}
