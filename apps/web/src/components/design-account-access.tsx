'use client';
import {useState} from 'react';
import AuthModal from './account-access/account-modal';
import {refreshAccountSession} from '../lib/demo-commerce';
import {isNativeCommerce,nativeCommerce} from '../lib/native-commerce';
import styles from './save-design.module.css';

/** Sign in without leaving (and discarding) the editor's local file and placement. */
export default function DesignAccountAccess({stacked=false}:{stacked?:boolean}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function signIn(){
  setError('');if(!isNativeCommerce()){setOpen(true);return}
  setBusy(true);try{await nativeCommerce('login');await refreshAccountSession()}catch(e){setError(e instanceof Error?e.message:'Giriş tamamlanamadı.')}finally{setBusy(false)}
 }
 return <div className={`${styles.wrap} ${stacked?styles.stacked:''}`}><p className={styles.note}>Tasarımın bu ekranda korunur. Kaydetmek ve sepete eklemek için giriş yap.</p><button className={`${styles.button} ${styles.primary}`} disabled={busy} onClick={()=>void signIn()}>Sepete eklemek için giriş yap</button>{open&&<AuthModal mode="login" onClose={()=>setOpen(false)}/>} {error&&<p role="alert">{error}</p>}</div>;
}
