'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';
import {markInboxRead,refreshInbox,useDemoCommerce} from '../../../lib/demo-commerce';
import styles from './notifications.module.css';

const date=(value:string)=>new Date(value).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

/** The account's in-app notifications (orders, shipping, requests); the same inbox the mobile app shows. */
export default function NotificationInbox(){
  const router=useRouter();
  const {user,ready,inbox,unread}=useDemoCommerce();
  const [busy,setBusy]=useState<string>(),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  useEffect(()=>{if(user)void refreshInbox().catch(problem=>setError(problem instanceof Error?problem.message:'Bildirimler yüklenemedi.')).finally(()=>setLoading(false))},[user]);
  async function read(ids?:string[]){setBusy(ids?.[0]??'all');setError('');try{await markInboxRead(ids)}catch(problem){setError(problem instanceof Error?problem.message:'Bildirim güncellenemedi.')}finally{setBusy(undefined)}}
  async function open(id:string,href:string,alreadyRead:boolean){if(!alreadyRead){setBusy(id);setError('');try{await markInboxRead([id])}catch(problem){setError(problem instanceof Error?problem.message:'Bildirim güncellenemedi.');setBusy(undefined);return}}router.push(href)}
  return <div className={styles.shell}>
    <div className={styles.title}><h1>Bildirimlerim</h1>{!loading&&!error&&<span className={styles.unread} aria-live="polite">{unread} okunmamış</span>}{unread>0&&<button type="button" disabled={!!busy} onClick={()=>void read()}>{busy==='all'?'İşleniyor…':'Tümünü okundu say'}</button>}</div>
    <p className={styles.caption}>Sipariş, kargo, iptal ve iade gelişmeleri burada gösterilir. Harici kanal yapılandırılmışsa ayrıca gönderilir.</p>
    {error&&<p className={styles.error} role="alert">{error} <button type="button" onClick={()=>{setError('');setLoading(true);void refreshInbox().catch(problem=>setError(problem instanceof Error?problem.message:'Bildirimler yüklenemedi.')).finally(()=>setLoading(false))}}>Tekrar dene</button></p>}
    {!ready?<p role="status">Yükleniyor…</p>:!user?<Link href="/hesap">Bildirimlerini görmek için giriş yap →</Link>:loading?<p role="status">Bildirimler yükleniyor…</p>:error?null:inbox.length===0?<p>Henüz bildirimin yok.</p>:
      <ul className={styles.list}>{inbox.map(item=><li key={item.id} data-read={item.read}>
        <div><strong>{item.title}</strong><small>{date(item.createdAt)}</small></div><p>{item.body}</p>
        <div className={styles.actions}>{item.link&&<Link href={item.link} onClick={event=>{event.preventDefault();void open(item.id,item.link!,item.read)}}>İlgili sipariş →</Link>}{!item.read&&<button type="button" disabled={!!busy} onClick={()=>void read([item.id])}>{busy===item.id?'İşleniyor…':'Okundu işaretle'}</button>}</div>
      </li>)}</ul>}
  </div>;
}
