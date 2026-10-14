'use client';
import {useId,useState} from 'react';
import {demoAccess} from '../../lib/demo-commerce';
import {startEmailVerification, type VerificationChallenge} from '../../lib/email-verification';
import PasswordReset from './password-reset';
import styles from './account-access.module.css';

/** Login, registration and password reset; shown inside the dialog on /hesap. */
type AccountAccessProps = {initialMode?: 'login'|'register'; onAuthenticated: () => void};
export default function AccountAccess({initialMode='login', onAuthenticated}: AccountAccessProps) {
  const passwordId=useId();
  const [mode, setMode] = useState<'login'|'register'>(initialMode);
  const [showPassword,setShowPassword]=useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState<VerificationChallenge|null>(null);
  const [pending, setPending] = useState<{name: string; email: string; password: string}|null>(null);
  const [notice, setNotice] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const [forgot, setForgot] = useState(false);
  function reset(nextMode: 'login'|'register') {
    setMode(nextMode); setForgot(false); setShowPassword(false); setError(''); setChallenge(null); setPending(null); setNotice('');
  }
  const complete = onAuthenticated;
  return <div className={styles.layout}>
    <section className={styles.formPanel}>
      <div className={styles.tabs}><button aria-pressed={mode==='login'} disabled={busy} onClick={()=>reset('login')}>Giriş</button><button aria-pressed={mode==='register'} disabled={busy} onClick={()=>reset('register')}>Yeni hesap</button></div>
      {forgot ? <PasswordReset onCancel={()=>reset('login')} onDone={message=>{reset('login');setNotice(message);}}/> : <>
      <h2>{challenge?'E-postanı doğrula':mode==='login'?'Giriş yap':'Hesap oluştur'}</h2>
      {!challenge&&<p className={styles.subheading}>{mode==='login'?'Kişisel oturumuna erişmek için bilgilerini gir.':'Hesabını oluşturmak için bilgilerini doldur.'}</p>}
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
        {mode==='register'&&<label>Ad soyad<input type="text" name="name" required autoComplete="name" maxLength={100} placeholder="Ahmet Yılmaz"/></label>}
        <label>E-posta adresi<input type="email" name="email" required autoComplete="email" maxLength={254} placeholder="ornek@email.com"/></label>
        <div><label htmlFor={passwordId}>Parola</label><div className={styles.password}><input id={passwordId} name="password" type={showPassword?'text':'password'} required minLength={8} placeholder="••••••••••••" autoComplete={mode==='login'?'current-password':'new-password'}/><button type="button" aria-label={showPassword?'Parolayı gizle':'Parolayı göster'} aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)}>{showPassword?'Gizle':'Göster'}</button></div></div>{mode==='register'&&<p className={styles.passwordHint}>En az 8 karakter kullan.</p>}
        <button className={styles.submit} disabled={busy}>{busy?'Bekle…':mode==='login'?'Giriş yap':'Doğrulama kodu gönder'}</button>
        {mode==='login'&&<button type="button" className={styles.forgot} disabled={busy} onClick={()=>{reset('login');setForgot(true);}}>Parolamı unuttum</button>}
      </form>}
      {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
      </>}
      <div className={styles.syncNotice}><p>Hesabın ve siparişlerin cihazlar arasında eşitlenmez. Tüm kayıtlar bu tarayıcıda korunur.</p></div>
    </section>
  </div>;
}
