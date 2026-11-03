'use client';
import {useEffect,useState} from 'react';
import {suratTracking,type SuratTracking} from '../lib/demo-commerce';
const states:Record<string,string>={awaiting_acceptance:'Şube kabulü bekleniyor',in_transit:'Yolda',delivery_branch:'Teslimat şubesinde',out_for_delivery:'Dağıtımda',delivered:'Teslim edildi',needs_review:'Kargo durumu teyit ediliyor',redirecting:'Yönlendirmede',return_in_progress:'İade sürecinde',return_delivered:'İade teslim alındı',unknown:'Kargo durumu teyit ediliyor'};
export default function SuratOrderTracking({orderId}:{orderId:string}){
 const [data,setData]=useState<SuratTracking|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;suratTracking(orderId).then(value=>{if(active)setData(value)}).catch(()=>{if(active)setError('Kargo takip bilgileri şu anda alınamıyor.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[orderId,revision]);
 if(!loading&&!error&&!data)return null;
 return <section aria-label="Sürat Kargo takibi"><h3>Sürat Kargo takibi</h3>{loading&&<p role="status">Takip bilgileri yükleniyor…</p>}{error&&<p role="alert">{error}</p>}{data&&<>{data.result==='unavailable'&&<p role="status">Takip servisi geçici olarak kullanılamıyor. Son alınan bilgi gösteriliyor.</p>}{data.result==='not_checked'&&<p>Takip bilgisi henüz alınmadı.</p>}{data.result==='awaiting_acceptance'&&<p>{data.items.length?'Son sorguda hareket dönmedi; önceki kayıt gösteriliyor.':'Şube kabulü veya yeni hareket bekleniyor.'}</p>}{data.lastSuccess&&<p>Son güncelleme: {new Date(data.lastSuccess).toLocaleString('tr-TR')}</p>}<ul>{data.items.map((item,i)=><li key={i}>{states[item.state]??states.unknown}{item.trackingNumber&&<span style={{overflowWrap:'anywhere'}}> · Takip no: {item.trackingNumber}</span>}</li>)}</ul></>}
 <button type="button" disabled={loading} onClick={()=>{setLoading(true);setError('');setRevision(v=>v+1)}}>Takip bilgisini yenile</button></section>;
}
