'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {demoLogout,useDemoCommerce} from '../../lib/demo-commerce';
import {money} from '../../lib/commerce';
import AccountAccess from './giris/account-access';
import styles from './account.module.css';

type IconName = 'person'|'package'|'heart'|'bag'|'lock'|'arrow';
function Icon({name}: {name: IconName}) {
  const paths: Record<IconName, string> = {
    person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0H5Z',
    package:'m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5',
    heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    bag:'M5 7h14l1 14H4L5 7ZM8 7V5a4 4 0 0 1 8 0v2',
    lock:'M5 10h14v11H5V10ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
    arrow:'M4 12h16m-6-6 6 6-6 6',
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
function AuthModal({mode,onClose}: {mode:'login'|'register';onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();},[]);
  function close() {ref.current?.close();}
  return <dialog ref={ref} className={styles.modal} aria-label={mode==='login'?'Giriş yap':'Hesap oluştur'} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}}}>
    <button className={styles.close} aria-label="Pencereyi kapat" onClick={close}>×</button>
    <p className={styles.eyebrow}>XINOBI Üye Portalı</p>
    <AccountAccess initialMode={mode} embedded onAuthenticated={close}/>
  </dialog>;
}
export default function AccountDashboard(){
  const {user,orders}=useDemoCommerce();
  const [mode,setMode]=useState<'login'|'register'|null>(null);
  return <div className={styles.shell}>
    <div className={styles.titleRow}>
      <div><p className={styles.eyebrow}><span className={styles.brandDot}/>XINOBI Üye Portalı</p><h1>Hesabım</h1><p className={styles.caption}>Bu tarayıcıda saklanan deneme hesabı.</p></div>
      <p className={styles.session}><span className={user?styles.activeDot:styles.inactiveDot}/>{user?'Oturum açık':'Aktif oturum bulunamadı'}</p>
    </div>
    <div className={styles.cardArea}>
      <section className={styles.card} aria-label={user?'Hesap özeti':'Hesabına giriş yap'}>
        <div className={styles.halo}/>
        <div className={styles.cardContent}>
          <div className={styles.avatar}><Icon name="person"/></div>
          {user?<>
            <h2>{user.name}</h2><p className={styles.description}>{user.email}</p>
            <div className={styles.actions}><Link className={styles.primary} href="/hesap/siparisler">Siparişlerim <Icon name="arrow"/></Link><Link className={styles.secondary} href="/favoriler">Favorilerim</Link><Link className={styles.secondary} href="/sepet">Sepetim</Link></div>
            <div className={styles.orderSummary}><span>Deneme siparişlerin</span><strong>{orders.length}</strong>{orders[0]&&<p>Son sipariş: {new Date(orders[0].createdAt).toLocaleDateString('tr-TR')} · {money(orders[0].total)}</p>}</div>
            <button className={styles.logout} onClick={demoLogout}>Çıkış yap</button>
          </>:<>
            <h2>Hesabına giriş yap</h2><p className={styles.description}>Kayıt ol veya giriş yap; siparişlerini, favorilerini ve sepetini tek bir yerden yönet.</p>
            <div className={styles.actions}><button className={styles.primary} onClick={()=>setMode('login')}>Giriş yap <Icon name="arrow"/></button><button className={styles.secondary} onClick={()=>setMode('register')}>Hesap oluştur</button></div>
          </>}
          <div className={styles.storage}><p><Icon name="lock"/><strong>Yerel deneme hesabı</strong></p><p>Yalnızca bu tarayıcıda saklanır. Gerçek hesabındaki parolayı kullanma.</p><p>Hesabın ve siparişlerin cihazlar arasında eşitlenmez.</p></div>
        </div>
      </section>
    </div>
    <div className={styles.features}>
      {[{icon:'package',title:'Siparişlerin',text:'Bu tarayıcıda oluşturduğun deneme siparişlerini görüntüle.',href:'/hesap/siparisler'},{icon:'heart',title:'Favorilerin',text:'Beğendiğin ürünleri bir arada tut, dilediğinde yeniden keşfet.',href:'/favoriler'},{icon:'bag',title:'Sepetin',text:'Seçtiğin ürünleri ve adetlerini kontrol edip deneme ödeme akışına devam et.',href:'/sepet'}].map(feature=><Link href={feature.href} className={styles.feature} key={feature.title}><span className={styles.featureIcon}><Icon name={feature.icon as IconName}/></span><div><h3>{feature.title}</h3><p>{feature.text}</p></div></Link>)}
    </div>
    {mode&&<AuthModal key={mode} mode={mode} onClose={()=>setMode(null)}/>}
  </div>;
}
