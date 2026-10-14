'use client';
import {useId,useState} from 'react';
import {confirmPasswordReset,startPasswordReset,type EmailChallenge} from '../../../lib/demo-commerce';
import styles from './account.module.css';

/** Forgotten password: e-mailed 6-digit code, then a new password. Every device is signed out after the change. */
export default function PasswordReset({onDone,onCancel}:{onDone:(message:string)=>void;onCancel:()=>void}){
  const passwordId=useId();
  const [challenge,setChallenge]=useState<EmailChallenge|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[retryAt,setRetryAt]=useState(0),[showPassword,setShowPassword]=useState(false);
  async function send(email:string){
    setBusy(true);setError('');setNotice('');
    try{setChallenge(await startPasswordReset(email));setRetryAt(Date.now()+60000)}
    catch(error){setError(error instanceof Error?error.message:'Kod gönderilemedi.')}
    finally{setBusy(false)}
  }
  return <>
    <h2>Parolanı sıfırla</h2>
    {!challenge?<>
      <p className={styles.subheading}>Hesabının e-posta adresini gir. Bu adrese kayıtlı bir hesap varsa 6 haneli sıfırlama kodu gönderilir.</p>
      <form onSubmit={event=>{event.preventDefault();if(!busy)void send(String(new FormData(event.currentTarget).get('email')||''))}}>
        <label>E-posta adresi<input type="email" name="email" required autoComplete="email" maxLength={254} placeholder="ornek@email.com" autoFocus/></label>
        <button className={styles.submit} disabled={busy}>{busy?'Bekle…':'Sıfırlama kodu gönder'}</button>
      </form>
    </>:<>
      {challenge.previewCode?<p role="status">Geçici doğrulama modu: e-posta gönderilmedi. Deneme kodun: <strong>{challenge.previewCode}</strong>.</p>:<p>{challenge.email} adresine kayıtlı bir hesap varsa 6 haneli kod gönderildi. Kod 10 dakika geçerlidir.</p>}
      <form onSubmit={async event=>{
        event.preventDefault();if(busy)return;
        const data=new FormData(event.currentTarget);
        setBusy(true);setError('');
        try{
          await confirmPasswordReset(challenge.email,challenge.verificationId,String(data.get('code')||''),String(data.get('password')||''));
          onDone('Parolan değiştirildi ve tüm cihazlardaki oturumların kapatıldı. Yeni parolanla giriş yap.');
        }catch(error){setError(error instanceof Error?error.message:'Parola değiştirilemedi.')}
        finally{setBusy(false)}
      }}>
        <label>Sıfırlama kodu<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required autoFocus/></label>
        <div><label htmlFor={passwordId}>Yeni parola</label><div className={styles.password}><input id={passwordId} name="password" type={showPassword?'text':'password'} required minLength={8} maxLength={128} autoComplete="new-password" placeholder="••••••••••••"/><button type="button" aria-label={showPassword?'Parolayı gizle':'Parolayı göster'} aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)}>{showPassword?'Gizle':'Göster'}</button></div></div>
        <p className={styles.passwordHint}>En az 8 karakter kullan.</p>
        <button className={styles.submit} disabled={busy}>{busy?'Bekle…':'Parolayı değiştir'}</button>
      </form>
      <button disabled={busy} onClick={()=>{if(Date.now()<retryAt){setError('Yeni kod istemek için bir dakika bekle.');return}void send(challenge.email).then(()=>setNotice('Yeni kod istendi.'))}}>Kodu tekrar gönder</button>
    </>}
    <button disabled={busy} onClick={onCancel}>Girişe dön</button>
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  </>;
}
