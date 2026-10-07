'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {demoAccess} from '../../../lib/demo-commerce';
import {startEmailVerification, type VerificationChallenge} from '../../../lib/email-verification';
import styles from './account.module.css';

type AccountAccessProps = {initialMode?: 'login'|'register'; embedded?: boolean; onAuthenticated?: () => void};
export default function AccountAccess({initialMode='login', embedded=false, onAuthenticated}: AccountAccessProps = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState<VerificationChallenge|null>(null);
  const [pending, setPending] = useState<{name: string; email: string; password: string}|null>(null);
  const [notice, setNotice] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  function reset(nextMode: 'login'|'register') {
    setMode(nextMode); setError(''); setChallenge(null); setPending(null); setNotice('');
  }
  function complete() {if(onAuthenticated)onAuthenticated();else router.push('/hesap');}
  return <div className={`${styles.layout} ${embedded?styles.embedded:''}`}>
    <section className={styles.story}><h1>Hesabın</h1><p>Kayıt ol, giriş yap ve siparişlerini görüntüle.</p><small>Yalnız bu tarayıcıda saklanır. Gerçek hesabındaki parolayı kullanma.</small></section>
    <section className={styles.formPanel}>
      <div className={styles.tabs}><button disabled={busy} onClick={()=>reset('login')}>Giriş</button><button disabled={busy} onClick={()=>reset('register')}>Yeni hesap</button></div>
      <h2>{challenge?'E-postanı doğrula':mode==='login'?'Giriş yap':'Hesap oluştur'}</h2>
      {challenge && pending ? <>
        {challenge.previewCode ? <p role="status">Geçici doğrulama modu: e-posta gönderilmedi. {challenge.email} için deneme kodun: <strong>{challenge.previewCode}</strong>. Bu işlem e-posta adresinin sana ait olduğunu doğrulamaz.</p> : <p>{challenge.email} adresine gönderilen 6 haneli kodu gir.</p>}
        <p>Kod 10 dakika geçerlidir.</p>
        <form onSubmit={async event=>{
          event.preventDefault(); if(busy)return;
          const code = String(new FormData(event.currentTarget).get('code') || '');
          setBusy(true); setError('');
          try {
            await demoAccess('register',pending.name,pending.email,pending.password,{id:challenge.id,code});
            setPending(null); complete();
          } catch(error) {setError(error instanceof Error?error.message:'İşlem tamamlanamadı.');}
          finally {setBusy(false);}
        }}>
          <label>Doğrulama kodu<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required autoFocus/></label>
          <button className={styles.submit} disabled={busy}>{busy?'Bekle…':'E-postayı doğrula ve hesabı oluştur'}</button>
        </form>
        <button disabled={busy} onClick={async()=>{
          if(Date.now()<retryAt){setError('Yeni kod istemek için bir dakika bekle.');return;}
          setBusy(true);setError('');setNotice('');
          try{const next=await startEmailVerification(pending.email);setChallenge(next);setRetryAt(Date.now()+60000);setNotice(next.previewCode?'Yeni deneme kodu oluşturuldu.':'Yeni doğrulama kodu gönderildi.');}
          catch(error){setError(error instanceof Error?error.message:'Kod gönderilemedi.');}
          finally{setBusy(false);}
        }}>Kodu tekrar gönder</button>
        <button disabled={busy} onClick={()=>reset('register')}>E-posta adresini değiştir</button>
      </> : <form key={mode} onSubmit={async event=>{
        event.preventDefault();if(busy)return;
        const data=new FormData(event.currentTarget);
        const values={name:String(data.get('name')||''),email:String(data.get('email')||'').trim().toLowerCase(),password:String(data.get('password')||'')};
        setBusy(true);setError('');
        try{
          if(mode==='register'){
            setChallenge(await startEmailVerification(values.email));setPending(values);setRetryAt(Date.now()+60000);
          }else{await demoAccess('login',values.name,values.email,values.password);complete();}
        }catch(error){setError(error instanceof Error?error.message:'İşlem tamamlanamadı.');}
        finally{setBusy(false);}
      }}>
        {mode==='register'&&<label>Ad soyad<input type="text" name="name" required autoComplete="name" maxLength={100}/></label>}
        <label>E-posta adresi<input type="email" name="email" required autoComplete="email" maxLength={254}/></label>
        <label>Parola<input name="password" type="password" required minLength={8} autoComplete={mode==='login'?'current-password':'new-password'}/></label>
        <button className={styles.submit} disabled={busy}>{busy?'Bekle…':mode==='login'?'Giriş yap':'Doğrulama kodu gönder'}</button>
      </form>}
      {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
      <p>Hesabın ve siparişlerin cihazlar arasında eşitlenmez.</p>
    </section>
  </div>;
}
