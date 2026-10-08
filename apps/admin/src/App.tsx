import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest, type CommerceState, type Product } from './commerce'
import ContentEditor from './ContentEditor'
import Dashboard from './Dashboard'
import Orders from './Orders'
import Catalog from './Catalog'
import Inventory from './Inventory'
import Pricing from './Pricing'
import Quotes from './Quotes'
import PrintOperations from './PrintOperations'
import Integrations from './Integrations'
import AiAdmin from './AiAdmin'
import AdminSettings from './AdminSettings'
import { initialAdminState } from './settings-model'
import { initialPolicies } from './ai-admin-model'
import { initialMappings } from './integration-model'
import { initialQuotes, appendRevision } from './quote-model'
import { initialPrices, initialCampaigns } from './pricing-model'
import { initialProducts } from './catalog-data'
import './App.css'
import './panel.css'
import ProductSurfaceReview from './features/product-surfaces/ProductSurfaceReview'
import SurfaceMasks from './features/product-surfaces/SurfaceMasks'
type View = 'surfaces' | 'masks' | 'dashboard' | 'orders' | 'content' | 'catalog' | 'inventory' | 'pricing' | 'quotes' | 'print' | 'integrations' | 'ai' | 'settings'
const modules = ['Siparişler', 'Ürünler', 'Müşteriler', 'Fiyat ve kampanyalar', 'İçerik', 'Tasarım', 'Entegrasyonlar', 'Raporlar', 'Ayarlar']
export default function App() {
  const [view, setView] = useState<View>('dashboard'), [menu, setMenu] = useState<string | null>(null)
  const [products, setProducts] = useState(initialProducts)
  const [prices, setPrices] = useState(initialPrices), [campaigns, setCampaigns] = useState(initialCampaigns)
  const [commerce, setCommerce] = useState<CommerceState | null>(null)
  const [apiNotice, setApiNotice] = useState(commerceApi ? 'Ortak içerik API’sine bağlanılıyor…' : 'İçerik API adresi yapılandırılmadı.')
  useEffect(() => {
    if (!commerceApi) return
    let active = true
    commerceRequest<CommerceState>(commerceApi, '/state').then(state => {
      if (active) { setCommerce(state); setProducts(state.products); setPrices(state.prices); setApiNotice('Local API bağlı · Değişiklikler web’e yansır') }
    }).catch(() => { if (active) setApiNotice('Local API’ye bağlanılamadı. Kayıt işlemleri kullanılamıyor.') })
    return () => { active = false }
  }, [])
  async function persist(route: string, method: string, body?: unknown) {
    if (!commerceApi || !commerce) throw new Error('Local API bağlantısı gerekli.')
    try {
      const state = await commerceRequest<CommerceState>(commerceApi, route, method, body)
      setCommerce(state); setProducts(state.products); setPrices(state.prices)
      setApiNotice('Kaydedildi · Web en geç 2 saniye içinde güncellenir')
    } catch (error) { setApiNotice(error instanceof Error ? error.message : 'Kayıt başarısız.'); throw error }
  }
  const saveProduct = (product: Product) => persist(`/products/${encodeURIComponent(product.id)}`, 'PUT', product)
  const [quotes, setQuotes] = useState(initialQuotes)
  const [printNotes, setPrintNotes] = useState<Record<string, string>>({})
  const [mappings, setMappings] = useState(initialMappings)
  const [adminState, setAdminState] = useState(initialAdminState)
  const [aiPolicies, setAiPolicies] = useState(initialPolicies)
  const trigger = useRef<HTMLButtonElement | null>(null)
  function navigate(next: View) { setView(next); setMenu(null) }
  const target: View | undefined = menu === 'Siparişler' ? 'orders' : menu === 'İçerik' ? 'content' : menu === 'Raporlar' ? 'dashboard' : menu === 'Ürünler' ? 'catalog' : menu === 'Fiyat ve kampanyalar' ? 'pricing' : menu === 'Tasarım' ? 'print' : menu === 'Entegrasyonlar' ? 'integrations' : menu === 'Ayarlar' ? 'settings' : undefined
  return <div className="panel-shell" onKeyDown={(event) => { if (event.key === 'Escape') { setMenu(null); trigger.current?.focus() } }}>
    <a className="panel-skip" href="#panel-main">İçeriğe geç</a>
    <div className="utility-bar"><span>XINOBI · Operasyon paneli</span><span role="status">{apiNotice}</span></div>
    <header className="panel-header"><button className="panel-brand" onClick={() => navigate('dashboard')}>XINOBI<small>YÖNETİM</small></button><nav aria-label="Ana modüller">{modules.map((name) => <button key={name} aria-expanded={menu === name} aria-controls="module-menu" onClick={(event) => { trigger.current = event.currentTarget; setMenu(menu === name ? null : name) }}>{name} ⌄</button>)}</nav>
      {menu && <div className="module-menu" id="module-menu"><strong>{menu}</strong>{menu === 'Ayarlar' && <button onClick={() => navigate('ai')}>AI yönetimi</button>}{menu === 'Müşteriler' && <button onClick={() => navigate('quotes')}>Kurumsal teklifler</button>}{menu === 'Ürünler' && <><button onClick={() => navigate('inventory')}>Stok ve depolar</button><button onClick={() => navigate('masks')}>Ürün yüzeyleri (maske)</button></>}<button disabled={!target} onClick={() => target && navigate(target)}>{target ? 'Çalışma alanını aç' : 'Bu modül hazırlanıyor'}</button><button onClick={() => { setMenu(null); trigger.current?.focus() }}>Menüyü kapat</button></div>}
    </header>
    <div className="panel-body"><aside className="icon-rail" aria-label="Hızlı gezinme">{([{ id: 'dashboard', label: 'Dashboard', icon: '⌂' }, { id: 'orders', label: 'Siparişler', icon: '▤' }, { id: 'content', label: 'İçerik', icon: '▧' }, { id: 'catalog', label: 'Katalog', icon: '▦' }, { id: 'inventory', label: 'Stok ve depolar', icon: '▣' }, { id: 'masks', label: 'Ürün yüzeyleri', icon: '◐' }, { id: 'pricing', label: 'Fiyat ve kampanyalar', icon: '%' }, { id: 'quotes', label: 'Kurumsal teklifler', icon: '▱' }, { id: 'print', label: 'Tasarım ve baskı', icon: '◈' }, { id: 'integrations', label: 'Entegrasyon izleme', icon: '⇄' }, { id: 'ai', label: 'AI yönetimi', icon: '✦' }, { id: 'settings', label: 'Rol, ayar ve denetim', icon: '⚙' }] as const).map((item) => <button key={item.id} aria-label={item.label} aria-pressed={view === item.id} onClick={() => navigate(item.id)}>{item.icon}</button>)}</aside>
    <main id="panel-main" className="panel-main"><div className="page-heading"><h1>{view === 'masks' ? 'Ürün yüzeyleri' : view === 'surfaces' ? 'Ürün yüzeyi inceleme' : view === 'dashboard' ? 'Operasyon özeti' : view === 'orders' ? 'Sipariş yönetimi' : view === 'catalog' ? 'Katalog ve varyantlar' : view === 'inventory' ? 'Stok ve depo yönetimi' : view === 'pricing' ? 'Fiyat ve kampanya yönetimi' : view === 'quotes' ? 'Kurumsal teklif yönetimi' : view === 'print' ? 'Tasarım ve baskı operasyonları' : view === 'integrations' ? 'Entegrasyon izleme' : view === 'ai' ? 'AI yönetimi' : view === 'settings' ? 'Rol, ayar ve denetim' : 'İçerik yönetimi'}</h1><span>Örnek veri</span></div><p className="panel-notice">Ürün, görsel, fiyat ve stok kayıtları local web ile paylaşılır. Sipariş, ödeme ve dış entegrasyon modülleri örnek veridir.</p>{import.meta.env.DEV && <button className="surface-access" onClick={() => navigate(view === 'surfaces' ? 'dashboard' : 'surfaces')}>{view === 'surfaces' ? 'Operasyon özetine dön' : 'Ürün yüzeyi incele (geliştirme)'}</button>}{view === 'masks' ? <SurfaceMasks /> : view === 'surfaces' && import.meta.env.DEV ? <ProductSurfaceReview /> : view === 'dashboard' ? <Dashboard onOrders={() => navigate('orders')} /> : view === 'orders' ? <Orders /> : view === 'catalog' ? <Catalog prices={prices} onPrice={(id,cents)=>persist(`/prices/${encodeURIComponent(id)}`,'PUT',{cents})} categories={commerce?.categories} onDeleteCategory={(name, moveTo) => persist(`/categories/${encodeURIComponent(name)}${moveTo ? `?moveTo=${encodeURIComponent(moveTo)}` : ''}`, 'DELETE')} onCategory={name => persist('/categories', 'POST', { name })} products={products} onSave={saveProduct} onDelete={id => persist(`/products/${encodeURIComponent(id)}`, 'DELETE')} /> : view === 'inventory' ? <Inventory products={products} onSave={saveProduct} /> : view === 'pricing' ? <Pricing products={products} prices={prices} campaigns={campaigns} onPrice={(id, cents) => persist(`/prices/${encodeURIComponent(id)}`, 'PUT', { cents })} onCampaign={campaign => setCampaigns(current => current.some(item => item.id === campaign.id) ? current.map(item => item.id === campaign.id ? campaign : item) : [...current, campaign])} /> : view === 'quotes' ? <Quotes quotes={quotes} onRevision={(id, base, revision) => { const current = quotes.find(item => item.id === id); if (!current) return 'Teklif bulunamadı.'; const result = appendRevision(current, base, revision); if (result.error) return result.error; setQuotes(items => items.map(item => item.id === id ? result.quote! : item)); return '' }} /> : view === 'print' ? <PrintOperations notes={printNotes} onNote={(id, note) => setPrintNotes(current => ({ ...current, [id]: note }))} /> : view === 'integrations' ? <Integrations products={products} mappings={mappings} onMapping={mapping => setMappings(current => current.some(item => item.id === mapping.id) ? current.map(item => item.id === mapping.id ? mapping : item) : [...current, mapping])} /> : view === 'ai' ? <AiAdmin policies={aiPolicies} onPolicy={policy => setAiPolicies(current => [...current, policy])} /> : view === 'settings' ? <AdminSettings state={adminState} onChange={setAdminState} /> : commerce ? <ContentEditor announcements={commerce.announcements ?? []} onPublishAnnouncement={draft=>persist('/announcements','POST',draft)} onDeleteAnnouncement={id=>persist(`/announcements/${encodeURIComponent(id)}`,'DELETE')} categories={commerce.categories ?? []} products={products} content={commerce.content} onSave={content => persist('/content', 'PUT', content)} /> : <p role="alert">{apiNotice}</p>}</main></div>
  </div>
}
