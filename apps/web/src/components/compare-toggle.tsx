'use client';
import {maxCompare,toggleCompare,useCompare} from '../lib/compare';
import styles from './compare.module.css';

/** "Karşılaştır" switch for a product card or page; the tray and /karsilastir pick it up. */
export default function CompareToggle({productId,name,compact=false}:{productId:string;name:string;compact?:boolean}){
  const ids=useCompare();
  const active=ids.includes(productId);
  const full=!active&&ids.length>=maxCompare;
  return <button type="button" className={`${styles.toggle} ${compact?styles.compact:''}`} aria-pressed={active} disabled={full}
    aria-label={active?`${name} ürününü karşılaştırmadan çıkar`:full?`Karşılaştırma dolu (en fazla ${maxCompare} ürün)`:`${name} ürününü karşılaştırmaya ekle`}
    title={full?`En fazla ${maxCompare} ürün karşılaştırılabilir`:undefined}
    onClick={()=>toggleCompare(productId)}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M16 4v16M4 8h8M12 16h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
    {!compact&&<span>{active?'Karşılaştırmada':'Karşılaştır'}</span>}{active&&<b aria-hidden="true">✓</b>}
  </button>;
}
