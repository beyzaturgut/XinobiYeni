import {useRef,useState} from 'react'
import type {Product} from './catalog-data'
import {useAdminSession} from './AdminAccess'

const tabs=['Web stokları','Depo stokları','Hareket geçmişi','Mutabakat','Sayım önizlemesi']
export default function Inventory({products,onStock}:{products:Product[];onStock:(variantId:string,stock:number)=>Promise<void>}){
  const canWrite=useAdminSession()?.permissions.includes('inventory.write')??false
  const [tab,setTab]=useState(tabs[0]),[query,setQuery]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false)
  const writing=useRef(false)
  const matches=(product:Product,variant:Product['variants'][number])=>`${product.name} ${variant.sku} ${variant.color}`.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'))
  const count=products.reduce((sum,product)=>sum+product.variants.filter(variant=>matches(product,variant)).length,0)
  return <section aria-label="Stok ve depo yönetimi">
    <p className="panel-notice">Web stokları bağlı katalogdan okunur; depo bakiyesi veya rezervasyon olarak yorumlanamaz. Depo ve stok hareketi kaynağı D02/D03 ve ilgili API doğrulamasını bekliyor.</p>
    <div className="catalog-tabs" role="group" aria-label="Stok bölümleri">{tabs.map(item=><button key={item} aria-pressed={tab===item} onClick={()=>{setTab(item);setError('');setNotice('')}}>{item}</button>)}</div>
    {tab!=='Web stokları'?<p role="status">{tab}: doğrulanmış depo ve hareket veri kaynağı bağlı değil. D02/D03 kararları ve ilgili API olmadan bakiye, mutabakat veya sayım sonucu üretilmez.</p>:<>
      <div className="order-filters"><label>Ürün, SKU veya renk ara<input value={query} onChange={event=>setQuery(event.target.value)}/></label><button onClick={()=>setQuery('')}>Filtreleri temizle</button></div>
      <p role="status">{count} katalog varyantı. Sonuç bulunmaması doğrulanmış sıfır depo stoğu anlamına gelmez.</p>
      {products.filter(product=>product.variants.some(variant=>matches(product,variant))).map(product=><fieldset key={product.id} disabled={!canWrite||busy}><legend>{product.name}</legend>{product.variants.filter(variant=>matches(product,variant)).map(variant=><form key={variant.id} onSubmit={async event=>{
        event.preventDefault();if(!canWrite||writing.current)return
        const stock=Number((event.currentTarget.elements.namedItem('stock') as HTMLInputElement).value)
        if(!Number.isSafeInteger(stock)||stock<0){setError('Stok sıfır veya pozitif tam sayı olmalı.');return}
        writing.current=true;setBusy(true);setNotice('');setError('')
        try{await onStock(variant.id,stock);setNotice(`${variant.sku} stoğu kaydedildi.`)}catch(problem){setError(problem instanceof Error?problem.message:'Stok kaydedilemedi.')}finally{writing.current=false;setBusy(false)}
      }}><label>{variant.color} · {variant.sku}<input key={`${variant.id}-${variant.stock}`} aria-label={`${variant.sku} web stoğu`} name="stock" type="number" min="0" step="1" defaultValue={variant.stock} required/></label><button>Stoğu kaydet</button></form>)}</fieldset>)}
      {count===0&&<div className="empty-widget"><strong>{products.length?'Filtreye uygun varyant yok':'Katalogda varyant yok'}</strong><p>Depo stoğu veya örnek ürün üretilmez.</p></div>}
      {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
    </>}
  </section>
}
