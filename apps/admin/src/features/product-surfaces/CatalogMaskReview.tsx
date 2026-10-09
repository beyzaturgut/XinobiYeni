import { useCallback, useEffect, useRef, useState } from 'react'
type Source = { productId:string; variantId:string; sha256:string; width:number; height:number }
type Status = { source: {sha256:string; width:number; height:number}; accepted: {version:string; acceptedAt:string}|null; error:string|null; candidates:{candidateId:string;target:string;provenance:string}[]; versions:{version:string;acceptedAt:string}[] }
export default function CatalogMaskReview({source}:{source:Source}) {
 const [status,setStatus]=useState<Status|null>(null),[error,setError]=useState(''),[target,setTarget]=useState(''),[candidate,setCandidate]=useState(''),[busy,setBusy]=useState(false)
 const sent=useRef(false)
 const [attempted,setAttempted]=useState(false)
 const base='/api/v1/dev/catalog-surfaces/'+encodeURIComponent(source.productId)+'/'+encodeURIComponent(source.variantId)
 const refresh=useCallback(async(signal?:AbortSignal)=>{const response=await fetch(base+'/status',{signal,cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.message||'Maske durumu yüklenemedi.');if(data.source.sha256!==source.sha256||data.source.width!==source.width||data.source.height!==source.height)throw Error('Kaynak görsel değişti; varyantı yeniden seçin.');setStatus(data)},[base,source.sha256,source.width,source.height])
 useEffect(()=>{const controller=new AbortController();Promise.resolve().then(()=>refresh(controller.signal)).catch(e=>{if(!controller.signal.aborted)setError(e.message)});return()=>controller.abort()},[refresh]) // exact selection remounts this component
 async function generate(){if(sent.current||busy||!status||!target.trim())return;if(!window.confirm('Bu ürün fotoğrafı ve hedef açıklaması Roboflow’a gönderilecek; kredi kullanılabilir. Tek denemeyi onaylıyor musunuz?'))return;sent.current=true;setAttempted(true);setBusy(true);setError('')
 try{const response=await fetch('/api/v1/admin/dev/catalog-candidate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...source,attemptId:crypto.randomUUID(),target:target.trim(),acknowledgeCredits:true})});const data=await response.json();if(!response.ok)throw Error(data.message||'İstek başarısız veya belirsiz; otomatik tekrar yok.');await refresh();setCandidate(data.candidateId)}catch(e){setError(e instanceof Error?e.message:'İstek başarısız; otomatik tekrar yok.')}finally{setBusy(false)}}
 async function restore(version:string){if(!window.confirm('Bu kaynak için önceki onaylı maske sürümü etkinleştirilsin mi?'))return;setBusy(true);try{const r=await fetch(base+'/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({version})});if(!r.ok)throw Error('Önceki sürüm kaynakla eşleşmiyor veya doğrulanamadı.');await refresh()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <section aria-label="Katalog maskesi inceleme">
 <p role="status">{status?.accepted?'Onaylı maske · '+status.accepted.acceptedAt:'Bu kaynak için genel katalog onayı yok. CM101’in mevcut onayı ayrı korunur.'}</p>
 {error&&<p role="alert">{error}</p>}{status?.error&&<p role="alert">{status.error}</p>}
 <label>Desen uygulanacak gövde açıklaması <input value={target} maxLength={160} onChange={e=>setTarget(e.target.value)} placeholder="Örneğin: lower kettle body" disabled={busy}/></label>
 <button type="button" disabled={!status||busy||attempted||!target.trim()} onClick={generate}>{busy?'İşlem sürüyor…':'Yeni katalog maskesi oluştur'}</button>
 <p>Üretim onay değildir. Logo ve metal parçaları maskeden çıkarın; kaynak hizalı logo PNG katmanı eklenirse orijinal pikselleri sunucuda doğrulanır.</p>
 {status?.candidates.map(c=><button key={c.candidateId} type="button" onClick={()=>setCandidate(c.candidateId)}>{c.target} · {c.provenance} · Düzenle</button>)}
 {candidate&&<><button onClick={()=>{setCandidate('');refresh().catch(e=>setError(e.message))}}>Editörü kapat ve durumu yenile</button><iframe title="Katalog varyantı maske editörü" className="surface-local-editor" src={'http://127.0.0.1:3046/catalog-editor/'+candidate+'/'+encodeURIComponent(source.productId)+'/'+encodeURIComponent(source.variantId)+'/'} /></>}
 {status?.versions.map(v=><button type="button" disabled={busy||v.version===status.accepted?.version} key={v.version} onClick={()=>restore(v.version)}>Önceki onay · {v.acceptedAt}</button>)}
 </section>
}
