'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {markInboxRead,refreshInbox,useDemoCommerce} from '../../../lib/demo-commerce';
import styles from './notifications.module.css';

const date=(value:string)=>new Date(value).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

/** The account's in-app notifications (orders, shipping, requests); the same inbox the mobile app shows. */
export default function NotificationInbox(){
  const {user,ready,inbox,unread}=useDemoCommerce();
  useEffect(()=>{if(user)void refreshInbox().catch(()=>{})},[user]);
  return <div className={styles.shell}>
    <div className={styles.title}><h1>Bildirimlerim</h1>{unread>0&&<button type="button" onClick={()=>void markInboxRead()}>Tümünü okundu say</button>}</div>
    <p className={styles.caption}>Sipariş, kargo, iptal ve iade gelişmeleri burada; aynı bildirimler e-posta ile de gönderilir.</p>
    {!ready?<p role="status">Yükleniyor…</p>:!user?<Link href="/hesap">Bildirimlerini görmek için giriş yap →</Link>:inbox.length===0?<p>Henüz bildirimin yok.</p>:
      <ul className={styles.list}>{inbox.map(item=><li key={item.id} data-read={item.read}>
        <div><strong>{item.title}</strong><small>{date(item.createdAt)}</small></div><p>{item.body}</p>
        <div className={styles.actions}>{item.link&&<Link href={item.link} onClick={()=>{if(!item.read)void markInboxRead([item.id])}}>Ayrıntılar →</Link>}{!item.read&&<button type="button" onClick={()=>void markInboxRead([item.id])}>Okundu</button>}</div>
      </li>)}</ul>}
  </div>;
}
