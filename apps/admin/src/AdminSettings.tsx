import { useState } from 'react'
import { allowed, changeRole, changeSettings, resources } from './settings-model'
import type { AdminState } from './settings-model'
import { useAdminSession } from './AdminAccess'
import { adminCall } from './admin-api'
import AuditHistory from './AuditHistory'
type InvitationResponse={email:string;expiresAt:string;previewUrl?:string}
export default function AdminSettings({state,onChange}:{state:AdminState;onChange:(state:AdminState)=>void}) {
 const session=useAdminSession()
 const canManageStaff=session?.permissions.includes('settings.staff')??(import.meta.env.DEV&&import.meta.env.VITE_ADMIN_ACCESS==='off')
 const canReadAudit=session?.permissions.includes('audit.read')??false
 const [tab,setTab]=useState(canManageStaff?'Rol ve yetkiler':'Sistem ayarları'),[roleId,setRoleId]=useState('operator')
 const role=state.roles.find(r=>r.id===roleId)!
 const [permissions,setPermissions]=useState(role.permissions),[base,setBase]=useState(state.settings.revision)
 const [threshold,setThreshold]=useState(String(state.settings.lowStock)),[notice,setNotice]=useState(state.settings.orderNotice)
 const [message,setMessage]=useState(''),[error,setError]=useState('')
 const [inviting,setInviting]=useState(false),[previewUrl,setPreviewUrl]=useState('')
 function result(value:{state?:AdminState;error?:string}) {setError(value.error||'');setMessage('');if(value.state){onChange(value.state);setBase(value.state.settings.revision);setMessage('Demo değişikliği oturumda kaydedildi; denetim kaydı eklendi.')}}
 return <section><p className="muted">Yetki matrisi bir simülasyondur. Gerçek oturum ve API yetkilendirmesi bağlı değildir. Değişiklikler yenilemede sıfırlanır; bildirim gönderilmez.</p>
 <div className="catalog-tabs" aria-label="Yönetim bölümleri">{['Rol ve yetkiler','Sistem ayarları','Denetim geçmişi'].filter(t=>(t!=='Rol ve yetkiler'||canManageStaff)&&(t!=='Denetim geçmişi'||canReadAudit)).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>{setTab(t);setError('');setMessage('')}}>{t}</button>)}</div>
 {error&&<p role="alert" className="catalog-error">{error}</p>}{message&&<p role="status">{message}</p>}
 {tab==='Rol ve yetkiler'&&canManageStaff&&<><div className="order-filters"><label>Demo rol<select aria-label="Demo rol" value={roleId} onChange={e=>{setRoleId(e.target.value);setPermissions(state.roles.find(r=>r.id===e.target.value)!.permissions);setError('');setMessage('')}}>{state.roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label></div>
 <div className="table-scroll"><table><caption>Kaynak ve eylem bazlı demo yetki matrisi</caption><thead><tr><th>Kaynak</th><th>Okuma</th><th>Yazma</th></tr></thead><tbody>{resources.map(r=><tr key={r}><th>{r}</th>{['read','write'].map(a=><td key={a}><input type="checkbox" aria-label={`${r} ${a}`} disabled={role.locked} checked={allowed({...role,permissions},r,a)} onChange={e=>setPermissions(p=>e.target.checked?[...p,`${r}.${a}`]:p.filter(x=>x!==`${r}.${a}`))}/></td>)}</tr>)}</tbody></table></div>
 <button disabled={role.locked} onClick={()=>result(changeRole(state,roleId,permissions))}>Demo rolü kaydet</button><p>Tanımsız kaynak ve eylemler reddedilir. Bu seçim panel gezinmesini veya gerçek erişimi değiştirmez.</p>
 <form className="catalog-form" onSubmit={async event=>{event.preventDefault();if(inviting)return;const form=event.currentTarget;const data=new FormData(form);setInviting(true);setError('');setMessage('');setPreviewUrl('');try{const invitation=await adminCall<InvitationResponse>('/admin/invitations',{email:String(data.get('email')||'').trim()});setMessage(`${invitation.email} adresine yönetici daveti oluşturuldu.`);setPreviewUrl(invitation.previewUrl||'');form.reset()}catch(error){setError(error instanceof Error?error.message:'Davet oluşturulamadı.')}finally{setInviting(false)}}}><h3>Yeni yönetici daveti</h3><label>E-posta adresi<input name="email" type="email" autoComplete="off" required/></label><button disabled={inviting}>{inviting?'Gönderiliyor…':'Yönetici daveti gönder'}</button>{previewUrl&&<a href={previewUrl}>Preview davetini aç</a>}</form></>}
 {tab==='Sistem ayarları'&&<form className="catalog-form" onSubmit={e=>{e.preventDefault();result(changeSettings(state,base,Number(threshold),notice))}}><p>Güncel sürüm: {state.settings.revision} · Taslak sürümü: {base}</p><label>Para birimi<input value={state.settings.currency} readOnly/></label><label>Saat dilimi<input value={state.settings.timezone} readOnly/></label><label>Düşük stok eşiği<input type="number" value={threshold} onChange={e=>setThreshold(e.target.value)} required/></label><label><input type="checkbox" checked={notice} onChange={e=>setNotice(e.target.checked)}/> Sipariş bildirim tercihi (demo)</label><button type="submit">Demo ayarları kaydet</button><button type="button" onClick={()=>{setBase(state.settings.revision);setThreshold(String(state.settings.lowStock));setNotice(state.settings.orderNotice);setError('');setMessage('')}}>Güncel ayarları yükle</button></form>}
 {tab==='Denetim geçmişi'&&canReadAudit&&<AuditHistory/>}
 </section>
}
