'use client';
import Link from 'next/link';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {changeAccountPassword,demoLogout,updateAccountName,useDemoCommerce,type DemoOrder,type DemoUser} from '../../lib/demo-commerce';
import {money} from '../../lib/commerce';
import AccountAccess from './giris/account-access';
import styles from './account.module.css';

type IconName = 'person'|'package'|'heart'|'bag'|'lock'|'arrow'|'pin';
function Icon({name}: {name: IconName}) {
  const paths: Record<IconName, string> = {
    person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0H5Z',
    package:'m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5',
    heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    bag:'M5 7h14l1 14H4L5 7ZM8 7V5a4 4 0 0 1 8 0v2',
    lock:'M5 10h14v11H5V10ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
    arrow:'M4 12h16m-6-6 6 6-6 6',
    pin:'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
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
  const {user,orders,ready}=useDemoCommerce();
  const [mode,setMode]=useState<'login'|'register'|null>(null);
  return <div className={styles.shell}>
    <div className={styles.titleRow}>
      <div><p className={styles.eyebrow}><span className={styles.brandDot}/>XINOBI Üye Portalı</p><h1>Hesabım</h1><p className={styles.caption}>Web ve mobilde aynı Xinobi hesabı.</p></div>
      <p className={styles.session}><span className={user?styles.activeDot:styles.inactiveDot}/>{!ready?'Oturum kontrol ediliyor…':user?'Oturum açık':'Aktif oturum bulunamadı'}</p>
    </div>
    {user?<SignedInAccount user={user} orders={orders}/>:<>
    <div className={styles.cardArea}>
      <section className={styles.card} aria-label="Hesabına giriş yap">
        <div className={styles.halo}/>
        <div className={styles.cardContent}>
          <div className={styles.avatar}><Icon name="person"/></div>
          <>
            <h2>Hesabına giriş yap</h2><p className={styles.description}>Kayıt ol veya giriş yap; siparişlerini, favorilerini ve sepetini tek bir yerden yönet.</p>
            <div className={styles.actions}><button className={styles.primary} onClick={()=>setMode('login')}>Giriş yap <Icon name="arrow"/></button><button className={styles.secondary} onClick={()=>setMode('register')}>Hesap oluştur</button></div>
          </>
          <div className={styles.storage}><p><Icon name="lock"/><strong>Geliştirme ortamı hesabı</strong></p><p>Hesabın Xinobi sunucusunda tutulur; web ve mobil uygulamada aynı hesapla giriş yaparsın. Başka hizmetlerde kullandığın parolayı kullanma.</p><p>Deneme siparişlerin şimdilik yalnızca bu tarayıcıda saklanır.</p></div>
        </div>
      </section>
    </div>
    <div className={styles.features}>
      {[{icon:'package',title:'Siparişlerin',text:'Bu tarayıcıda oluşturduğun deneme siparişlerini görüntüle.',href:'/hesap/siparisler'},{icon:'heart',title:'Favorilerin',text:'Beğendiğin ürünleri bir arada tut, dilediğinde yeniden keşfet.',href:'/favoriler'},{icon:'bag',title:'Sepetin',text:'Seçtiğin ürünleri ve adetlerini kontrol edip deneme ödeme akışına devam et.',href:'/sepet'}].map(feature=><Link href={feature.href} className={styles.feature} key={feature.title}><span className={styles.featureIcon}><Icon name={feature.icon as IconName}/></span><div><h3>{feature.title}</h3><p>{feature.text}</p></div></Link>)}
    </div>
    </>}
    {mode&&<AuthModal key={mode} mode={mode} onClose={()=>setMode(null)}/>}
  </div>;
}

const date=(value?:string)=>value?new Date(value).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'}):'';
const initials=(name:string)=>{const parts=name.trim().split(/\s+/).filter(part=>/^\p{L}/u.test(part));return parts.length?(parts[0][0]+(parts.length>1?parts[parts.length-1][0]:'')).toLocaleUpperCase('tr-TR'):'?'};

/** Signed in: profile summary beside the real settings (name, password); orders are the browser demo, addresses come with checkout. */
function SignedInAccount({user,orders}:{user:DemoUser;orders:DemoOrder[]}){
  return <div className={styles.settings}>
    <aside className={styles.profileCard} aria-label="Hesap özeti">
      <div className={styles.initials} aria-hidden="true">{initials(user.name)}</div>
      <h2>{user.name}</h2><p className={styles.description}>{user.email}</p>
      {user.createdAt&&<p className={styles.member}>Üyelik: {date(user.createdAt)}</p>}
      <button className={styles.logout} onClick={demoLogout}>Çıkış yap</button>
    </aside>
    <div className={styles.sections}>
      <section aria-labelledby="account-info"><h2 id="account-info" className={styles.sectionTitle}>Hesap bilgilerim</h2>
        <div className={styles.forms}><ProfileForm user={user}/><PasswordForm/></div>
      </section>
      <section aria-labelledby="account-shopping"><h2 id="account-shopping" className={styles.sectionTitle}>Alışveriş</h2>
        <nav className={styles.menu} aria-label="Alışveriş">
          <Link href="/hesap/siparisler"><Icon name="package"/><span><strong>Siparişlerim</strong><small>{orders.length?`${orders.length} deneme siparişi${orders[0]?` · son: ${date(orders[0].createdAt)} · ${money(orders[0].total)}`:''}`:'Henüz siparişin yok'}</small></span><Icon name="arrow"/></Link>
          <Link href="/favoriler"><Icon name="heart"/><span><strong>Favorilerim</strong><small>Beğendiğin ürünler</small></span><Icon name="arrow"/></Link>
          <Link href="/sepet"><Icon name="bag"/><span><strong>Sepetim</strong><small>Seçtiğin ürünler ve adetleri</small></span><Icon name="arrow"/></Link>
          <div className={styles.soon} aria-disabled="true"><Icon name="pin"/><span><strong>Adreslerim</strong><small>Teslimat adreslerin sipariş akışıyla eklenecek</small></span><em>Yakında</em></div>
        </nav>
      </section>
      <section aria-labelledby="account-help"><h2 id="account-help" className={styles.sectionTitle}>Yardım ve yasal</h2>
        <nav className={styles.menu} aria-label="Yardım ve yasal"><Link href="/yasal"><Icon name="lock"/><span><strong>Yasal bilgiler</strong><small>KVKK, gizlilik ve çerezler</small></span><Icon name="arrow"/></Link></nav>
      </section>
      <p className={styles.note}>Geliştirme ortamı hesabı: web ve mobilde aynı hesapla giriş yaparsın. Deneme siparişlerin şimdilik yalnızca bu tarayıcıda saklanır.</p>
    </div>
  </div>;
}

function ProfileForm({user}:{user:DemoUser}){
  const [name,setName]=useState(user.name),[busy,setBusy]=useState(false),[message,setMessage]=useState<{ok:boolean;text:string}|null>(null);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setMessage(null);
    try{await updateAccountName(name);setMessage({ok:true,text:'Profil bilgilerin güncellendi.'})}
    catch(error){setMessage({ok:false,text:error instanceof Error?error.message:'Kaydedilemedi.'})}
    finally{setBusy(false)}}
  return <form className={styles.form} onSubmit={submit} noValidate><h3>Profil bilgileri</h3>
    <label>Ad soyad<input value={name} maxLength={80} autoComplete="name" onChange={event=>setName(event.target.value)}/></label>
    <div className={styles.readonly}><span>E-posta</span><strong>{user.email}</strong><small>Giriş bilgin olduğu için buradan değiştirilemez.</small></div>
    {message&&<p role={message.ok?'status':'alert'} className={message.ok?styles.ok:styles.error}>{message.text}</p>}
    <button className={styles.primary} disabled={busy||!name.trim()||name.trim()===user.name}>{busy?'Kaydediliyor…':'Kaydet'}</button>
  </form>;
}

function PasswordForm(){
  const [current,setCurrent]=useState(''),[next,setNext]=useState(''),[repeat,setRepeat]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState<{ok:boolean;text:string}|null>(null);
  async function submit(event:FormEvent){event.preventDefault();setMessage(null);
    if(next!==repeat)return setMessage({ok:false,text:'Yeni parolalar eşleşmiyor.'});
    setBusy(true);
    try{await changeAccountPassword(current,next);setCurrent('');setNext('');setRepeat('');setMessage({ok:true,text:'Parolan değiştirildi. Diğer cihazlardaki oturumların kapatıldı.'})}
    catch(error){setMessage({ok:false,text:error instanceof Error?error.message:'Parola değiştirilemedi.'})}
    finally{setBusy(false)}}
  return <form className={styles.form} onSubmit={submit} noValidate><h3>Parola değiştir</h3>
    <label>Mevcut parola<input type="password" value={current} autoComplete="current-password" onChange={event=>setCurrent(event.target.value)}/></label>
    <label>Yeni parola<input type="password" value={next} autoComplete="new-password" minLength={8} maxLength={128} aria-describedby="new-password-help" onChange={event=>setNext(event.target.value)}/></label><small id="new-password-help" className={styles.fieldHelp}>En az 8 karakter</small>
    <label>Yeni parola (tekrar)<input type="password" value={repeat} autoComplete="new-password" maxLength={128} onChange={event=>setRepeat(event.target.value)}/></label>
    <p className={styles.hint}>Parolan değişince diğer cihazlardaki oturumların kapanır; bu tarayıcıda oturumun açık kalır.</p>
    {message&&<p role={message.ok?'status':'alert'} className={message.ok?styles.ok:styles.error}>{message.text}</p>}
    <button className={styles.primary} disabled={busy||!current||!next||!repeat}>{busy?'Kaydediliyor…':'Parolayı değiştir'}</button>
  </form>;
}
