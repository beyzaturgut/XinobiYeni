import {useEffect,useState,type ReactNode} from 'react'
import {commerceApi} from './commerce'

type AdminSession={account:{name:string};permissions:string[]}
const api=commerceApi.replace(/\/local-commerce\/?$/,'')
async function call<T>(path:string,body?:unknown):Promise<T>{
 if(!api)throw new Error('Yönetim API adresi yapılandırılmadı.')
 let response:Response
 try{response=await fetch(api+path,{method:body===undefined?'GET':'POST',credentials:'include',headers:{'Content-Type':'application/json','X-Xinobi-Csrf':'1'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)})}
 catch{throw new Error('Yönetim servisine ulaşılamadı. Lütfen daha sonra tekrar dene.')}
 if(!response.ok){const problem=await response.json().catch(()=>null);throw Object.assign(new Error(response.status===403?'Bu hesabın yönetim paneline erişim yetkisi yok.':problem?.title||'Yönetim servisi kullanılamıyor.'),{status:response.status})}
 return response.status===204?undefined as T:response.json()
}
export default function AdminAccess({children}:{children:ReactNode}){
 const [session,setSession]=useState<AdminSession|null>(null),[checking,setChecking]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('')
 useEffect(()=>{let active=true;async function load(){try{let value:AdminSession;try{value=await call<AdminSession>('/admin/session')}catch(error){if((error as {status?:number}).status!==401)throw error;await call('/auth/web/refresh',{});value=await call<AdminSession>('/admin/session')}if(active)setSession(value)}catch(error){if(active&&(error as {status?:number}).status!==401)setError(error instanceof Error?error.message:'Oturum kontrol edilemedi.')}finally{if(active)setChecking(false)}}void load();return()=>{active=false}},[])
 if(checking)return <main className="admin-access"><p role="status">Yönetici oturumu kontrol ediliyor…</p></main>
 if(session)return <><div className="admin-session"><span>{session.account.name} · Yönetici oturumu</span><button disabled={busy} onClick={async()=>{setBusy(true);try{await call('/auth/web/logout',{});setSession(null);setError('')}catch(error){setError(error instanceof Error?error.message:'Çıkış yapılamadı.')}finally{setBusy(false)}}}>Çıkış yap</button>{error&&<p role="alert">{error}</p>}</div>{children}</>
 return <main className="admin-access"><section><p>XINOBI YÖNETİM</p><h1>Yönetici girişi</h1><p>Yönetici yetkisi verilmiş hesabınla giriş yap.</p><form onSubmit={async event=>{event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);setBusy(true);setError('');try{await call('/auth/web/login',{email:String(data.get('email')||'').trim(),password:String(data.get('password')||'')});setSession(await call<AdminSession>('/admin/session'))}catch(error){setError(error instanceof Error?error.message:'Giriş yapılamadı.')}finally{setBusy(false)}}}><label>E-posta adresi<input name="email" type="email" autoComplete="username" required/></label><label>Parola<input name="password" type="password" autoComplete="current-password" required/></label><button disabled={busy}>{busy?'Bekle…':'Giriş yap'}</button></form>{error&&<p role="alert">{error}</p>}</section></main>
}
