import {useState} from 'react'
import type {Product} from './catalog-data'
import {providers,type Provider} from './integration-model'

export default function Integrations({products,catalogAvailable}:{products:Product[];catalogAvailable:boolean}){
  const [provider,setProvider]=useState<Provider>('Mikro'),[tab,setTab]=useState('Eşlemeler')
  return <section aria-label="Entegrasyon izleme">
    <p className="panel-notice">Sağlayıcı durumunu ve kayıtlarını okuyacak yönetim API'si bağlı değil. Bağlantı, teslim veya senkronizasyon başarısı doğrulanmadı; dış sisteme işlem gönderilmez.</p>
    <div className="catalog-tabs" role="group" aria-label="Sağlayıcı seçimi">{providers.map(item=><button key={item} aria-pressed={provider===item} onClick={()=>setProvider(item)}>{item}</button>)}</div>
    <div className="integration-status"><strong>{provider}</strong><span>Bağlantı doğrulanmadı</span><span>Son senkronizasyon: doğrulanmadı</span></div>
    <div className="catalog-tabs" role="group" aria-label="Entegrasyon bölümleri">{['Eşlemeler','İşler ve hatalar','Uzlaştırma'].map(item=><button key={item} aria-pressed={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div>
    <div className="empty-widget" role="status"><strong>{tab}: veri kaynağı bağlı değil</strong><p>{provider} API sürümü, test erişimi, alan eşlemeleri ve veri sahipliği D02/D06 kapsamında doğrulanmadan kayıt veya mutabakat sonucu gösterilmez.</p>{tab==='Uzlaştırma'&&<p>{catalogAvailable?`Katalogda ${products.reduce((sum,product)=>sum+product.variants.length,0)} yerel varyant var;`:'Katalog verileri kullanılamıyor; yerel varyant sayısı bilinmiyor;'} dış veriyle karşılaştırma yapılmadı.</p>}</div>
  </section>
}
