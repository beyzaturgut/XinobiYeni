import {useEffect,useState} from 'react'
import {adminCall} from './admin-api'
import {useAdminSession} from './AdminAccess'
type Status={enabled:boolean;mode:string;accountConfigured:boolean;pollingEnabled:boolean;liveOperationsAllowed:boolean}
export default function SuratConnection(){
 const canRead=useAdminSession()?.permissions.includes('orders.read')??false
 const [status,setStatus]=useState<Status|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(canRead),[revision,setRevision]=useState(0)
 useEffect(()=>{if(!canRead)return;let active=true;void adminCall<Status>('/admin/shipping/surat/status').then(value=>{if(!value||typeof value.accountConfigured!=='boolean')throw new Error('Kargo bağlantı yanıtı doğrulanamadı.');if(active)setStatus(value)}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Ayar durumu alınamadı.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[canRead,revision])
 if(!canRead)return <p>Sürat bağlantı ayarlarını görmek için orders.read yetkisi gerekli.</p>
 return <section aria-label="Sürat Kargo bağlantı durumu"><h3>Sürat Kargo</h3>{loading&&<p role="status">Ayar durumu yükleniyor…</p>}{error&&<p role="alert">{error}</p>}{status&&<><dl><div><dt>Ortam</dt><dd>{status.mode==='Sandbox'?'Test':status.mode==='Production'?'Canlı':'Geçersiz ayar'}</dd></div><div><dt>Hesap bilgileri</dt><dd>{status.accountConfigured?'Tanımlı':'Eksik'}</dd></div><div><dt>Servis</dt><dd>{status.enabled?'Etkin':'Kapalı'}</dd></div><div><dt>Otomatik takip</dt><dd>{status.pollingEnabled?'Açık':'Kapalı'}</dd></div><div><dt>Canlı gönderim</dt><dd>{status.liveOperationsAllowed?'İzinli':'Kabul bekliyor; kapalı'}</dd></div></dl><p>Ayarların tanımlı olması sağlayıcı bağlantısının veya gönderi kabulünün doğrulandığı anlamına gelmez.</p></>}
 <p>Hesap bilgileri sunucuda yönetilir. Gönderi, etiket, takip ve uzlaştırma işlemleri sipariş detayındadır.</p><a href="?view=orders">Siparişlere git</a> <button disabled={loading} onClick={()=>{setLoading(true);setError('');setRevision(v=>v+1)}}>Ayar durumunu yenile</button></section>
}
