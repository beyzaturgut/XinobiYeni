'use client';
import {useState,type ReactNode} from 'react';
import {refreshAccountSession,refreshAddresses,refreshOrders,useDemoCommerce} from '../lib/demo-commerce';
import styles from './request-state.module.css';
/** A service failure is neither a signed-out account nor an empty private collection. */
export default function AccountRequestState({resource,children}:{resource?:'addresses'|'orders';children:ReactNode}){
 const state=useDemoCommerce(),[busy,setBusy]=useState(false);
 const loading=!state.ready||!!(state.user&&resource&&(resource==='addresses'?state.addressesLoading&&!state.addressesLoaded:state.ordersLoading&&!state.ordersLoaded));
 const error=state.sessionError||(state.user&&resource?(resource==='addresses'?state.addressesError:state.ordersError):undefined);
 async function retry(){if(busy)return;setBusy(true);try{await(state.sessionError?refreshAccountSession():resource==='addresses'?refreshAddresses():refreshOrders())}catch{/* The shared request state contains the error. */}finally{setBusy(false)}}
 return <>
  {error?<div className={styles.panel} role="alert"><p>{error}</p><button type="button" disabled={busy} onClick={()=>void retry()}>{busy?'Yükleniyor…':'Tekrar dene'}</button></div>:loading?<div className={styles.panel} role="status">{resource==='addresses'?'Adresler yükleniyor…':resource==='orders'?'Siparişler yükleniyor…':'Hesap kontrol ediliyor…'}</div>:null}
  <div className={styles.content} hidden={!!error||loading}>{children}</div>
 </>;
}
