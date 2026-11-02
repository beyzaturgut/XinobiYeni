import {createContext,useContext,useEffect,useState,type ReactNode} from 'react'
import {adminCall} from './admin-api'
export type AdminSession={account:{name:string};permissions:string[]}
type MfaChallenge={challengeId:string;expiresAt:string;previewCode?:string}
const AdminSessionContext=createContext<AdminSession|null>(null)
// oxlint-disable-next-line react/only-export-components
export const useAdminSession=()=>useContext(AdminSessionContext)
export default function AdminAccess({children}:{children:ReactNode}){
 const [session,setSession]=useState<AdminSession|null>(null),[challenge,setChallenge]=useState<MfaChallenge|null>(null)
 const [forgot,setForgot]=useState(false),[resetToken,setResetToken]=useState(()=>new URLSearchParams(location.hash.slice(1)).get('password-reset')||'')
 useEffect(()=>{
  const openReset=()=>{const token=new URLSearchParams(location.hash.slice(1)).get('password-reset');if(token){setResetToken(token);setForgot(false);setSession(null);setChallenge(null);history.replaceState(null,'',location.pathname)}}
  window.addEventListener('hashchange',openReset)
  if(new URLSearchParams(location.hash.slice(1)).has('password-reset'))history.replaceState(null,'',location.pathname)
  return()=>window.removeEventListener('hashchange',openReset)
 },[])
 const [recoveryMessage,setRecoveryMessage]=useState(''),[previewUrl,setPreviewUrl]=useState('')
 const [retryAt,setRetryAt]=useState(0),[now,setNow]=useState(()=>Date.now())
 const retrySeconds=Math.max(0,Math.ceil((retryAt-now)/1000))
 useEffect(()=>{if(!retryAt)return;const timer=window.setInterval(()=>setNow(Date.now()),250);return()=>window.clearInterval(timer)},[retryAt])
 const [checking,setChecking]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [invitationToken,setInvitationToken]=useState(()=>new URLSearchParams(location.search).get('invitation')||'')
 useEffect(()=>{const expired=()=>{setSession(null);setChallenge(null);setError('Oturumun sona erdi. Yeniden giriş yap.')};window.addEventListener('xinobi:admin-session-expired',expired);return()=>window.removeEventListener('xinobi:admin-session-expired',expired)},[])
 useEffect(()=>{let active=true;async function load(){try{const value=await adminCall<AdminSession>('/admin/session');if(active)setSession(value)}catch(problem){if(active&&(problem as {status?:number}).status!==401)setError(problem instanceof Error?problem.message:'Oturum kontrol edilemedi.')}finally{if(active)setChecking(false)}}void load();return()=>{active=false}},[])
 async function submit(form:HTMLFormElement){if(busy||(forgot&&!resetToken&&Date.now()<retryAt))return;const data=new FormData(form);setBusy(true);setError('');try{
   if(resetToken){await adminCall('/auth/admin/password-reset/complete',{token:resetToken,newPassword:String(data.get('password')||'')});setResetToken('');setSession(null);setChallenge(null);setForgot(false);setPreviewUrl('');history.replaceState(null,'',location.pathname);setRecoveryMessage('Parola değiştirildi. Yeni parolanla giriş yapıp e-posta kodunu doğrula.')}
   else if(forgot){const value=await adminCall<{message:string;previewUrl?:string}>('/auth/admin/password-reset',{email:String(data.get('email')||'').trim()});setRecoveryMessage(value.message);if(value.previewUrl)setPreviewUrl(value.previewUrl);const requestedAt=Date.now();setNow(requestedAt);setRetryAt(requestedAt+60000)}
   else if(challenge){setSession(await adminCall<AdminSession>('/auth/admin/mfa/verify',{challengeId:challenge.challengeId,code:String(data.get('code')||'')}));setChallenge(null)}
   else if(invitationToken){setChallenge(await adminCall<MfaChallenge>('/auth/admin-invitations/accept',{token:invitationToken,name:String(data.get('name')||'').trim(),password:String(data.get('password')||'')}));history.replaceState(null,'',location.pathname);setInvitationToken('')}
   else setChallenge(await adminCall<MfaChallenge>('/auth/admin/login',{email:String(data.get('email')||'').trim(),password:String(data.get('password')||'')}))
 }catch(problem){setError(problem instanceof Error?problem.message:'İşlem tamamlanamadı.')}finally{setBusy(false)}}
 if(forgot||resetToken)return <main className="admin-access"><section><h1>Parolamı unuttum</h1><form onSubmit={event=>{event.preventDefault();void submit(event.currentTarget)}}>{resetToken?<label>Yeni parola<input name="password" type="password" autoComplete="new-password" minLength={8} required/></label>:<label>E-posta adresi<input name="email" type="email" autoComplete="username" onChange={()=>{setPreviewUrl('');setRecoveryMessage('')}} required/></label>}<button disabled={busy||(!resetToken&&retrySeconds>0)}>{resetToken?'Parolayı değiştir':'Sıfırlama bağlantısı iste'}</button><button type="button" onClick={()=>{setForgot(false);setResetToken('');setPreviewUrl('');history.replaceState(null,'',location.pathname)}}>Girişe dön</button></form>{!resetToken&&retrySeconds>0&&<p role="status" aria-live="off">Yeni istek için {retrySeconds} saniye bekle. Daha önce gönderilen bağlantı geçerli olmaya devam eder.</p>}{recoveryMessage&&<p role="status">{recoveryMessage}</p>}{previewUrl&&<a href={previewUrl} onClick={event=>{event.preventDefault();setResetToken(new URL(previewUrl).hash.slice('#password-reset='.length));setForgot(false);history.replaceState(null,'',location.pathname)}}>Yerel Preview bağlantısını aç</a>}{error&&<p role="alert">{error}</p>}</section></main>
 if(checking&&!invitationToken)return <main className="admin-access"><p role="status">Yönetici oturumu kontrol ediliyor…</p></main>
 if(session&&!challenge&&!invitationToken)return <AdminSessionContext.Provider value={session}><div className="admin-session"><span>{session.account.name} · Yönetici oturumu</span><button disabled={busy} onClick={async()=>{setBusy(true);try{await adminCall('/auth/admin/logout',{});setSession(null);setError('')}catch(problem){setError(problem instanceof Error?problem.message:'Çıkış yapılamadı.')}finally{setBusy(false)}}}>Çıkış yap</button>{error&&<p role="alert">{error}</p>}</div>{children}</AdminSessionContext.Provider>
 return <main className="admin-access"><section><p>XINOBI YÖNETİM</p><h1>{challenge?'E-posta doğrulaması':invitationToken?'Yönetici hesabını oluştur':'Yönetici girişi'}</h1><form onSubmit={event=>{event.preventDefault();void submit(event.currentTarget)}}>
 {challenge?<><p>E-postana gönderilen 6 haneli kodu gir.</p>{challenge.previewCode&&<p>Yerel Preview kodu: <code>{challenge.previewCode}</code></p>}<label>Doğrulama kodu<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/></label></>:<>{invitationToken?<label>Ad soyad<input name="name" autoComplete="name" maxLength={80} required/></label>:<label>E-posta adresi<input name="email" type="email" autoComplete="username" required/></label>}<label>Parola<input name="password" type="password" autoComplete={invitationToken?'new-password':'current-password'} minLength={invitationToken?8:undefined} required/></label></>}
 <button disabled={busy}>{busy?'Bekle…':challenge?'Doğrula':invitationToken?'Hesabı oluştur':'Giriş yap'}</button>{challenge&&<button type="button" disabled={busy} onClick={()=>{setChallenge(null);setError('')}}>Girişe dön</button>}{!challenge&&!invitationToken&&<button type="button" onClick={()=>setForgot(true)}>Parolamı unuttum</button>}</form>{recoveryMessage&&<p role="status">{recoveryMessage}</p>}{error&&<p role="alert">{error}</p>}</section></main>
}
