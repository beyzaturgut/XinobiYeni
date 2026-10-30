'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import {useSearchParams} from 'next/navigation';
import {commerceApi,mediaUrl,money,stockText,useCommerce} from '../../lib/commerce';
import {maxCompare,setCompare,useCatalogCompare} from '../../lib/compare';
import {stars,useReviewSummaries} from '../../lib/reviews';
import type {Product} from '../../../../../packages/commerce/client';
import styles from './compare.module.css';

type Row={label:string;cells:ReactNode[];values:string[]};
const personalizable=(product:Product)=>product.personalizable===true;

/** Side-by-side comparison of up to four products: price, colours, stock, rating, XINOBI U and every technical spec. */
export default function Comparison(){
  const {state,error,retry}=useCommerce();
  const ids=useCatalogCompare(state,error);
  const params=useSearchParams();
  const shared=params.get('urunler');
  const table=params.get('view')==='table'||Boolean(shared)&&params.get('view')!=='select';
  const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[notice,setNotice]=useState('');
  const show=(view:string)=>{const next=new URLSearchParams(params.toString());next.set('view',view);window.history.pushState(null,'',window.location.pathname+'?'+next)};
  // A shared link (?urunler=a,b) replaces the list once.
  useEffect(()=>{if(shared)setCompare(shared.split(','))},[shared]);
  const select=(nextIds:string[])=>{
    setCompare(nextIds);
    if(shared){const next=new URLSearchParams(params.toString());if(nextIds.length)next.set('urunler',nextIds.join(','));else next.delete('urunler');window.history.replaceState(null,'',window.location.pathname+(next.size?'?'+next:''))}
  };
  const remove=(id:string)=>select(ids.filter(item=>item!==id));
  const toggle=(id:string)=>{
    if(ids.includes(id)){remove(id);return true}
    if(ids.length>=maxCompare)return false;
    select([...ids,id]);return true;
  };
  const [onlyDifferences,setOnlyDifferences]=useState(false);
  const [copied,setCopied]=useState(false);
  const active=useMemo(()=>state?.products.filter(product=>product.active)??[],[state]);
  const products=ids.map(id=>active.find(product=>product.id===id)).filter((product):product is Product=>Boolean(product));
  const summaries=useReviewSummaries(products.map(product=>product.id));
  const candidates=active.filter(product=>!ids.includes(product.id));
  const available=active.filter(product=>(!category||product.category===category)&&(!query.trim()||`${product.name} ${product.category}`.toLocaleLowerCase('tr-TR').includes(query.trim().toLocaleLowerCase('tr-TR'))));
  const priceOf=(product:Product)=>{const prices=product.variants.map(variant=>state?.prices[variant.id]).filter((value):value is number=>Boolean(value));return prices.length?Math.min(...prices):undefined};

  if(error||!state)return <div className={styles.shell}>{error?<div role="alert"><h1>Ürünler şu anda yüklenemiyor.</h1><p>{error}</p><button type="button" onClick={retry}>Karşılaştırmayı yeniden yükle</button></div>:<p role="status">Ürünler yükleniyor…</p>}</div>;
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
      {table&&products.length>=2&&<div className={styles.headActions}>
        <label className={styles.switch}><input type="checkbox" checked={onlyDifferences} onChange={event=>setOnlyDifferences(event.target.checked)}/>Yalnız farkları göster</label>
        <button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(`${location.origin}/karsilastir?urunler=${ids.join(',')}`);setCopied(true);window.setTimeout(()=>setCopied(false),2000)}catch{}}}>{copied?'Bağlantı kopyalandı':'Bağlantıyı paylaş'}</button>
        <button type="button" onClick={()=>select([])}>Listeyi temizle</button>
      </div>}
    </header>
    {!table||products.length<2?<section aria-label="Karşılaştırılacak ürünleri seç">
      <h2>Ürünlerini seç, sonra karşılaştır.</h2>
      <div className={styles.filters}><label>Ürün ara<input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label><label>Kategori<select value={category} onChange={event=>setCategory(event.target.value)}><option value="">Tüm kategoriler</option>{[...new Set(active.map(product=>product.category))].map(name=><option key={name}>{name}</option>)}</select></label></div>
      <p role="status">{notice||`${products.length} / ${maxCompare} ürün seçildi. Karşılaştırmak için en az 2 ürün seç.`}</p>
      <button type="button" className={styles.continue} disabled={products.length<2} onClick={()=>show('table')}>Seçilen ürünleri karşılaştır ({products.length})</button>
      <div className={styles.quickPick}>{available.map(product=><button type="button" key={product.id} aria-pressed={ids.includes(product.id)} onClick={()=>{const ok=toggle(product.id);setNotice(ok?'Seçimin güncellendi.':`En fazla ${maxCompare} ürün seçebilirsin. Yeni ürün için bir seçimi kaldır.`)}}>{(product.originalImage||product.variants[0]?.image)&&<Image src={mediaUrl(product.originalImage||product.variants[0].image,commerceApi)} alt="" width={96} height={96}/>}<span>{product.name}</span><small>{product.category}</small><strong>{ids.includes(product.id)?'✓ Seçildi':'+ Seç'}</strong></button>)}</div>
      {!available.length&&<p>Aramana uygun ürün bulunamadı.</p>}
    </section>:<>
      <button type="button" className={styles.continue} onClick={()=>show('select')}>Seçimleri düzenle / Bir ürün daha ekle</button>
      <div className={styles.tableWrap} role="region" aria-label="Seçilen ürünlerin karşılaştırma tablosu" tabIndex={0}>
        <table className={styles.table} style={{['--columns' as string]:products.length}}>
          <thead><tr><th scope="col"><span className={styles.srOnly}>Özellik</span>{products.length===1&&<p className={styles.hint}>Karşılaştırmak için en az bir ürün daha ekle.</p>}</th>{products.map(product=><th scope="col" key={product.id}>
            <button type="button" className={styles.remove} aria-label={`${product.name} ürününü karşılaştırmadan çıkar`} onClick={()=>remove(product.id)}>×</button>
            <div className={styles.productImage}>{(product.originalImage||product.variants[0]?.image)?<Image src={mediaUrl(product.originalImage||product.variants[0].image,commerceApi)} alt="" width={220} height={220}/>:<span>Görsel yok</span>}</div>
            <Link href={`/urunler/detay?id=${encodeURIComponent(product.id)}`}>{product.name}</Link>
            <Link className={styles.inspect} href={`/urunler/detay?id=${encodeURIComponent(product.id)}`}>İncele ve sepete ekle →</Link>
          </th>)}
          {products.length<maxCompare&&candidates.length>0&&<th scope="col" className={styles.addColumn}><button type="button" onClick={()=>show('select')}>Bir ürün daha ekle</button></th>}</tr></thead>
          <tbody>{visibleRows.map(row=>{const differs=products.length>1&&new Set(row.values).size>1;return <tr key={row.label} data-differs={differs||undefined}><th scope="row">{row.label}{differs&&<span className={styles.diffDot} aria-label="farklı"/>}</th>{row.cells.map((cell,index)=><td key={products[index].id}>{cell}</td>)}{products.length<maxCompare&&candidates.length>0&&<td/>}</tr>})}
            {onlyDifferences&&visibleRows.length===0&&<tr><td colSpan={products.length+2}>Seçilen ürünler arasında fark bulunamadı.</td></tr>}</tbody>
        </table>
      </div>
      <p className={styles.note}>Fiyat ve stok anlık bilgidir; ödeme adımında yeniden doğrulanır. Teknik özellikler mağaza tarafından girilir.</p>
    </>}
  </div>;
}
