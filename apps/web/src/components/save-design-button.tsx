'use client';
import Link from 'next/link';
import {useState} from 'react';
import {saveDesignFromSession,uploadDesign,useDemoCommerce} from '../lib/demo-commerce';
import styles from './save-design.module.css';

type Source={sessionId:string}|{file:Blob;productId:string;variantId:string|null};

/** "Tasarımımı kaydet" for an AI result (session) or an own image (file); signed-out shoppers are sent to sign in. */
export default function SaveDesignButton({source}:{source:Source}){
  const {user,ready}=useDemoCommerce();
  const [state,setState]=useState<'idle'|'busy'|'saved'>('idle'),[error,setError]=useState('');
  if(!ready)return null;
  if(!user)return <p className={styles.note}><Link href="/hesap/giris">Giriş yap</Link>, tasarımını hesabında sakla.</p>;
  if(state==='saved')return <p className={styles.saved} role="status">Tasarım hesabına kaydedildi. <Link href="/hesap/tasarimlarim">Tasarımlarım →</Link></p>;
  return <div className={styles.wrap}>
    <button type="button" className={styles.button} disabled={state==='busy'} onClick={async()=>{
      setState('busy');setError('');
      try{if('sessionId' in source)await saveDesignFromSession(source.sessionId);else await uploadDesign(source.file,source.productId,source.variantId);setState('saved')}
      catch(e){setError(e instanceof Error?e.message:'Kaydedilemedi.');setState('idle')}
    }}>{state==='busy'?'Kaydediliyor…':'Tasarımımı kaydet'}</button>
    {error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
