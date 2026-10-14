'use client';
import Link from 'next/link';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {changeAccountPassword,confirmEmailChange,deleteAccount,demoLogout,localPhone,startEmailChange,updateAccountProfile,useDemoCommerce,type CustomerAddress,type CustomerOrder,type DemoUser,type EmailChallenge} from '../../lib/demo-commerce';
import {money} from '../../lib/commerce';
import AccountAccess from '../../components/account-access/account-access';
import styles from './account.module.css';

type IconName = 'person'|'package'|'heart'|'bag'|'lock'|'arrow'|'pin'|'bell';
function Icon({name}: {name: IconName}) {
  const paths: Record<IconName, string> = {
    person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0H5Z',
    package:'m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5',
    heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    bag:'M5 7h14l1 14H4L5 7ZM8 7V5a4 4 0 0 1 8 0v2',
    lock:'M5 10h14v11H5V10ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
    arrow:'M4 12h16m-6-6 6 6-6 6',
    bell:'M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15L6 17ZM10 21a2 2 0 0 0 4 0',
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
    <AccountAccess initialMode={mode} onAuthenticated={close}/>
  </dialog>;
}
export default function AccountDashboard(){
  const {user,orders,addresses,ready}=useDemoCommerce();
  const [mode,setMode]=useState<'login'|'register'|null>(null);
  return <div className={styles.shell}>
    <div className={styles.titleRow}>
      <div><p className={styles.eyebrow}><span className={styles.brandDot}/>XINOBI Üye Portalı</p><h1>Hesabım</h1><p className={styles.caption}>Web ve mobilde aynı Xinobi hesabı.</p></div>
      <p className={styles.session}><span className={user?styles.activeDot:styles.inactiveDot}/>{!ready?'Oturum kontrol ediliyor…':user?'Oturum açık':'Aktif oturum bulunamadı'}</p>
    </div>
    {user?<SignedInAccount user={user} orders={orders} addresses={addresses}/>:<>
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
function SignedInAccount({user,orders,addresses}:{user:DemoUser;orders:CustomerOrder[];addresses:CustomerAddress[]}){
  return <div className={styles.settings}>
    <aside className={styles.profileCard} aria-label="Hesap özeti">
      <div className={styles.initials} aria-hidden="true">{initials(user.name)}</div>
      <h2>{user.name}</h2><p className={styles.description}>{user.email}</p>{user.phone&&<p className={styles.member}>{localPhone(user.phone)}</p>}
      {user.createdAt&&<p className={styles.member}>Üyelik: {date(user.createdAt)}</p>}
      <button className={styles.logout} onClick={demoLogout}>Çıkış yap</button>
    </aside>
    <div className={styles.sections}>
      <section aria-labelledby="account-info"><h2 id="account-info" className={styles.sectionTitle}>Hesap bilgilerim</h2>
        <div className={styles.forms}><ProfileForm key={user.email} user={user}/><PasswordForm/><EmailForm/></div>
      </section>
      <section aria-labelledby="account-shopping"><h2 id="account-shopping" className={styles.sectionTitle}>Alışveriş</h2>
        <nav className={styles.menu} aria-label="Alışveriş">
          <Link href="/hesap/siparisler"><Icon name="package"/><span><strong>Siparişlerim</strong><small>{orders.length?`${orders.length} demo sipariş · son: ${orders[0].number} · ${money(orders[0].total.amountMinor)}`:'Henüz siparişin yok'}</small></span><Icon name="arrow"/></Link>
          <Link href="/favoriler"><Icon name="heart"/><span><strong>Favorilerim</strong><small>Beğendiğin ürünler</small></span><Icon name="arrow"/></Link>
          <Link href="/sepet"><Icon name="bag"/><span><strong>Sepetim</strong><small>Seçtiğin ürünler ve adetleri</small></span><Icon name="arrow"/></Link>
          <Link href="/hesap/tasarimlarim"><Icon name="heart"/><span><strong>Tasarımlarım</strong><small>XINOBI U tasarımların ve yüklediğin görseller</small></span><Icon name="arrow"/></Link>
          <Link href="/hesap/bildirimler"><Icon name="bell"/><span><strong>Bildirimlerim</strong><small>Sipariş, kargo, iptal ve iade gelişmeleri</small></span><Icon name="arrow"/></Link>
          <Link href="/hesap/adresler"><Icon name="pin"/><span><strong>Adreslerim</strong><small>{addresses.length?`${addresses.length} kayıtlı adres${addresses[0]?.isDefault?` · varsayılan: ${addresses[0].title}`:''}`:'Henüz adres eklemedin'}</small></span><Icon name="arrow"/></Link>
        </nav>
      </section>
      <section aria-labelledby="account-help"><h2 id="account-help" className={styles.sectionTitle}>Yardım ve yasal</h2>
        <nav className={styles.menu} aria-label="Yardım ve yasal"><Link href="/yasal"><Icon name="lock"/><span><strong>Yasal bilgiler</strong><small>KVKK, gizlilik ve çerezler</small></span><Icon name="arrow"/></Link></nav>
      </section>
      <section aria-labelledby="account-delete"><h2 id="account-delete" className={styles.sectionTitle}>Hesabı sil</h2><DeleteForm user={user}/></section>
      <p className={styles.note}>Geliştirme ortamı hesabı: web ve mobilde aynı hesap, adresler ve demo siparişler. Demo siparişlerde ödeme alınmaz, kargo ve stok işlemi yapılmaz.</p>
    </div>
  </div>;
}

function ProfileForm({user}:{user:DemoUser}){
  const [name,setName]=useState(user.name),[phone,setPhone]=useState(localPhone(user.phone)),[busy,setBusy]=useState(false),[message,setMessage]=useState<{ok:boolean;text:string}|null>(null);
  const unchanged=name.trim()===user.name&&phone.trim()===localPhone(user.phone);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setMessage(null);
    try{await updateAccountProfile(name,phone);setMessage({ok:true,text:'Profil bilgilerin güncellendi.'})}
    catch(error){setMessage({ok:false,text:error instanceof Error?error.message:'Kaydedilemedi.'})}
    finally{setBusy(false)}}
  return <form className={styles.form} onSubmit={submit} noValidate><h3>Profil bilgileri</h3>
    <label>Ad soyad<input value={name} maxLength={80} autoComplete="name" onChange={event=>setName(event.target.value)}/></label>
    <label>Telefon (isteğe bağlı)<input value={phone} type="tel" autoComplete="tel" placeholder="0532 123 45 67" onChange={event=>setPhone(event.target.value)}/></label>
    <div className={styles.readonly}><span>E-posta</span><strong>{user.email}</strong><small>Değiştirmek için E-posta değiştir bölümünü kullan.</small></div>
    {message&&<p role={message.ok?'status':'alert'} className={message.ok?styles.ok:styles.error}>{message.text}</p>}
    <button className={styles.primary} disabled={busy||!name.trim()||unchanged}>{busy?'Kaydediliyor…':'Kaydet'}</button>
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

/** A code goes to the new address; the code and the current password confirm the change. */
function EmailForm(){
  const [email,setEmail]=useState(''),[challenge,setChallenge]=useState<EmailChallenge|null>(null),[code,setCode]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState<{ok:boolean;text:string}|null>(null);
  async function run(action:()=>Promise<void>){setBusy(true);setMessage(null);try{await action()}catch(error){setMessage({ok:false,text:error instanceof Error?error.message:'İşlem tamamlanamadı.'})}finally{setBusy(false)}}
  function submit(event:FormEvent){event.preventDefault();
    if(!challenge)return run(async()=>{setChallenge(await startEmailChange(email))});
    return run(async()=>{await confirmEmailChange(challenge,code,password);setMessage({ok:true,text:`E-posta adresin ${challenge.email} olarak güncellendi.`});setChallenge(null);setEmail('');setCode('');setPassword('')});
  }
  return <form className={styles.form} onSubmit={submit} noValidate><h3>E-posta değiştir</h3>
    <label>Yeni e-posta<input type="email" value={email} autoComplete="email" disabled={!!challenge} onChange={event=>setEmail(event.target.value)}/></label>
    {challenge&&<>
      <p className={styles.hint}>{challenge.email} adresine 6 haneli bir kod gönderdik.{challenge.previewCode&&<> Geliştirme ortamı kodu: <strong>{challenge.previewCode}</strong></>}</p>
      <label>Doğrulama kodu<input inputMode="numeric" maxLength={6} value={code} autoComplete="one-time-code" onChange={event=>setCode(event.target.value)}/></label>
      <label>Mevcut parola<input type="password" value={password} autoComplete="current-password" onChange={event=>setPassword(event.target.value)}/></label>
    </>}
    {message&&<p role={message.ok?'status':'alert'} className={message.ok?styles.ok:styles.error}>{message.text}</p>}
    <button className={styles.primary} disabled={busy||(!challenge?!email.includes('@'):code.length!==6||!password)}>{busy?'Gönderiliyor…':challenge?'E-postayı değiştir':'Doğrulama kodu gönder'}</button>
    {challenge&&<button type="button" className={styles.logout} onClick={()=>{setChallenge(null);setMessage(null)}}>Farklı bir adres gir</button>}
  </form>;
}

function DeleteForm({user}:{user:DemoUser}){
  const [password,setPassword]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError('');
    try{await deleteAccount(password)}catch(problem){setError(problem instanceof Error?problem.message:'Hesap silinemedi.');setBusy(false)}}
  return <form className={`${styles.form} ${styles.danger}`} onSubmit={submit} noValidate>
    <p className={styles.hint}><strong>{user.email}</strong> hesabı kalıcı olarak silinir: profil bilgilerin, adreslerin ve demo siparişlerin silinir, bütün cihazlardaki oturumların kapanır. Bu işlem geri alınamaz.</p>
    <label>Mevcut parola<input type="password" value={password} autoComplete="current-password" onChange={event=>setPassword(event.target.value)}/></label>
    <label className={styles.check}><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/>Hesabımın ve bilgilerimin silineceğini anladım.</label>
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <button className={styles.dangerButton} disabled={busy||!confirmed||!password}>{busy?'Siliniyor…':'Hesabımı kalıcı olarak sil'}</button>
  </form>;
}
