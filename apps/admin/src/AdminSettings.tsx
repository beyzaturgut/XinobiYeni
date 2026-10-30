import TableRegion from './TableRegion'
import { useState } from 'react'
import { useAdminSession } from './AdminAccess'
import { adminCall } from './admin-api'
import AuditHistory from './AuditHistory'
type InvitationResponse={email:string;expiresAt:string;previewUrl?:string}
const previewSettings = {currency:'TRY',timezone:'Europe/Istanbul',lowStock:5,orderNotice:true}
export default function AdminSettings() {
 const session=useAdminSession()
 const canManageStaff=session?.permissions.includes('settings.staff')??(import.meta.env.DEV&&import.meta.env.VITE_ADMIN_ACCESS==='off')
 const canReadAudit=session?.permissions.includes('audit.read')??false
 const [tab,setTab]=useState(canManageStaff?'Rol ve yetkiler':'Sistem ayarları')
 const permissions=[...(session?.permissions??[])].sort()
 const [message,setMessage]=useState(''),[error,setError]=useState('')
 const [inviting,setInviting]=useState(false),[previewUrl,setPreviewUrl]=useState('')
 return <section><p className="muted">Oturum izinleri API oturum kontrolünün döndürdüğü salt okunur bilgilerdir; güvenlik kararı her API isteğinde sunucuda uygulanır. Kalıcı rol ve sistem ayarı düzenleme API'si bağlı değildir. Yönetici daveti ve denetim geçmişi mevcut API'lerini kullanır.</p>
 <div className="catalog-tabs" aria-label="Yönetim bölümleri">{['Rol ve yetkiler','Sistem ayarları','Denetim geçmişi'].filter(t=>(t!=='Rol ve yetkiler'||canManageStaff)&&(t!=='Denetim geçmişi'||canReadAudit)).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>{setTab(t);setError('');setMessage('')}}>{t}</button>)}</div>
 {error&&<p role="alert" className="catalog-error">{error}</p>}{message&&<p role="status">{message}</p>}
 {tab==='Rol ve yetkiler'&&canManageStaff&&<><TableRegion><table className="session-permissions"><caption>Oturum izinleri · salt okunur</caption><thead><tr><th scope="col">API oturumunun verdiği izin</th></tr></thead><tbody>{permissions.map(permission=><tr key={permission}><td><code>{permission}</code></td></tr>)}</tbody></table></TableRegion>{!session&&<p role="status">Oturum izinleri doğrulanamadı; örnek yetki gösterilmez.</p>}
 <button disabled title="Kalıcı rol düzenleme API'si bağlı değil">Rol kaydı kullanılamıyor</button><p>Bu görünüm yetkileri değiştirmez; rol veya denetim kaydı oluşturulmaz.</p>
 <form className="catalog-form" onSubmit={async event=>{event.preventDefault();if(inviting)return;const form=event.currentTarget;const data=new FormData(form);setInviting(true);setError('');setMessage('');setPreviewUrl('');try{const invitation=await adminCall<InvitationResponse>('/admin/invitations',{email:String(data.get('email')||'').trim()});setMessage(`${invitation.email} adresine yönetici daveti oluşturuldu.`);setPreviewUrl(invitation.previewUrl||'');form.reset()}catch(error){setError(error instanceof Error?error.message:'Davet oluşturulamadı.')}finally{setInviting(false)}}}><h3>Yeni yönetici daveti</h3><label>E-posta adresi<input name="email" type="email" autoComplete="off" required/></label><button disabled={inviting}>{inviting?'Gönderiliyor…':'Yönetici daveti gönder'}</button>{previewUrl&&<a href={previewUrl}>Preview davetini aç</a>}</form></>}
 {tab==='Sistem ayarları'&&<form className="catalog-form" onSubmit={e=>e.preventDefault()}><p role="status">Kalıcı sistem ayarları API'si bağlı değil. Aşağıdaki değerler önizlemedir; gerçek sunucu ayarları olarak doğrulanmadı ve kaydedilemez.</p><label>Para birimi (önizleme)<input value={previewSettings.currency} disabled/></label><label>Saat dilimi (önizleme)<input value={previewSettings.timezone} disabled/></label><label>Düşük stok eşiği (önizleme)<input type="number" value={previewSettings.lowStock} disabled/></label><label><input type="checkbox" checked={previewSettings.orderNotice} disabled/> Sipariş bildirim tercihi (önizleme)</label><button type="submit" disabled>Ayar kaydı kullanılamıyor</button></form>}
 {tab==='Denetim geçmişi'&&canReadAudit&&<AuditHistory/>}
 </section>
}
