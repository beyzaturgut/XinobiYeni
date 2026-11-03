import { useEffect, useState } from 'react'
import { commerceApi, commerceRequest, type CommerceState, type Product } from './commerce'
import ContentEditor from './ContentEditor'
import Dashboard from './Dashboard'
import AdminHeader from './AdminHeader'
import {type AdminView, navigationItems, sideNavigation, initialView} from './admin-navigation'
import Orders from './Orders'
import Customers from './Customers'
import Catalog from './Catalog'
import Inventory from './Inventory'
import Pricing from './Pricing'
import Quotes from './Quotes'
import PrintOperations from './PrintOperations'
import Integrations from './Integrations'
import AiAdmin from './AiAdmin'
import AdminSettings from './AdminSettings'
import Notifications from './Notifications'
import Reviews from './Reviews'
import AuditLog from './AuditLog'
import { useAdminSession } from './AdminAccess'
import type { Campaign } from './pricing-model'
import './App.css'
import './panel.css'
import './navigation.css'
import './consistency.css'
import SurfaceMasks from './features/product-surfaces/SurfaceMasks'
type View = AdminView
const viewPermission=Object.fromEntries(navigationItems.map(item=>[item.view,item.permission])) as Record<View,string>
export default function App() {
  const session=useAdminSession()
  const can=(permission:string)=>session?.permissions.includes(permission)??(import.meta.env.DEV&&import.meta.env.VITE_ADMIN_ACCESS==='off')

  const [view, setView] = useState<View>(()=>initialView(location.search,can))
  const [requestedOrderId, setRequestedOrderId] = useState(()=>new URLSearchParams(location.search).get('orderId')||'')
  useEffect(()=>{const url=new URL(location.href);url.searchParams.set('view',view);history.replaceState(history.state,'',url)},[view])
  useEffect(()=>{
    const restore=()=>{setRequestedOrderId(new URLSearchParams(location.search).get('orderId')||'');setView(initialView(location.search,permission=>session?.permissions.includes(permission)??(import.meta.env.DEV&&import.meta.env.VITE_ADMIN_ACCESS==='off')))}
    window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore)
  },[session])
  const [products, setProducts] = useState<Product[]>([])
  const [prices, setPrices] = useState<Record<string,number>>({}), [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [commerce, setCommerce] = useState<CommerceState | null>(null)
  const [apiNotice, setApiNotice] = useState(commerceApi ? 'Ortak içerik API’sine bağlanılıyor…' : 'İçerik API adresi yapılandırılmadı.')
  const [catalogLoading,setCatalogLoading]=useState(Boolean(commerceApi)),[catalogReload,setCatalogReload]=useState(0)
  useEffect(() => {
    if (!commerceApi) return
    let active = true
    commerceRequest<CommerceState>(commerceApi, '/state').then(state => {
      if (active) { setCommerce(state); setProducts(state.products); setPrices(state.prices); setApiNotice('Katalog verileri yüklendi.') }
    }).catch(error => { if (active) {setCommerce(null);setProducts([]);setPrices({});setApiNotice(error instanceof Error?error.message:'Katalog servisine bağlanılamadı. Kayıt işlemleri kullanılamıyor.')} }).finally(()=>{if(active)setCatalogLoading(false)})
    return () => { active = false }
  }, [catalogReload])
  function reloadCatalog(){
    // Clear the previous snapshot before starting a retry; the initial snapshot is already empty.
    setCatalogLoading(true);setCommerce(null);setProducts([]);setPrices({})
    setCatalogReload(value=>value+1)
  }
  async function persist(route: string, method: string, body?: unknown) {
    if (!commerceApi || !commerce) throw new Error('Katalog verileri yüklenmeden kayıt yapılamaz.')
    try {
      const state = await commerceRequest<CommerceState>(commerceApi, route, method, body)
      setCommerce(state); setProducts(state.products); setPrices(state.prices)
      setApiNotice('Sunucu kaydı tamamlandı.')
    } catch (error) { setApiNotice(error instanceof Error ? error.message : 'Kayıt başarısız.'); throw error }
  }
  const saveProduct = (product: Product) => persist(`/products/${encodeURIComponent(product.id)}`, 'PUT', product)
  function navigate(next:View){
    if(!can(viewPermission[next])||next===view)return
    const url=new URL(location.href);url.searchParams.set('view',next);url.searchParams.delete('orderId');history.pushState(null,'',url);setRequestedOrderId('');setView(next)
  }
  function openDesignOrder(id:string){
    if(!can('print.read')||!can('orders.read'))return
    const url=new URL(location.href);url.searchParams.set('view','orders');url.searchParams.set('orderId',id)
    history.pushState({fromDesign:true},'',url);setRequestedOrderId(id);setView('orders')
  }
  function clearRequestedOrder(){const url=new URL(location.href);url.searchParams.delete('orderId');history.replaceState(history.state,'',url);setRequestedOrderId('')}
  if(!can(viewPermission[view])) return <div className="panel-shell"><p>Bu modüle erişim yetkiniz yok.</p>{(Object.keys(viewPermission) as View[]).filter(item=>can(viewPermission[item])).map(item=><button key={item} onClick={()=>navigate(item)}>{item}</button>)}</div>
  return <div className="panel-shell">
    <a className="panel-skip" href="#panel-main">İçeriğe geç</a>
    <AdminHeader view={view} can={can} navigate={navigate} name={session?.account.name} notice={apiNotice}/>
    <div className="panel-body sidebar-open"><aside className="icon-rail" aria-label="Sol navigasyon"><nav id="rail-links" aria-label="Yönetim alanları" onKeyDown={event=>{
      const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));const index=buttons.indexOf(document.activeElement as HTMLButtonElement)
      if(event.key==='Escape'){event.preventDefault();event.currentTarget.querySelector<HTMLButtonElement>('[aria-current=page]')?.focus()}
      else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length]?.focus()}
    }}>{sideNavigation.map(group=>{const items=group.items.filter(item=>can(item.permission));return items.length>0&&<section key={group.title} className="rail-group" aria-label={group.title}><h2>{group.title}</h2><div className="rail-group-items">{items.map(item=><button key={item.view} data-nav-view={item.view} aria-label={item.label} aria-current={view===item.view?'page':undefined} onClick={()=>navigate(item.view)}><span className="rail-label">{item.label}</span></button>)}</div></section>})}</nav></aside>
    <main id="panel-main" className="panel-main"><div className="page-heading"><h1>{view === 'customers' ? 'Müşteri yönetimi' : view === 'audit' ? 'Denetim kaydı' : view === 'reviews' ? 'Ürün değerlendirmeleri' : view === 'notifications' ? 'Bildirim kayıtları' : view === 'surfaces' ? 'Ürün yüzeyi inceleme' : view === 'dashboard' ? 'Operasyon özeti' : view === 'orders' ? 'Sipariş yönetimi' : view === 'catalog' ? 'Katalog ve varyantlar' : view === 'inventory' ? 'Stok ve depo yönetimi' : view === 'pricing' ? 'Fiyat ve kampanya yönetimi' : view === 'quotes' ? 'Kurumsal teklif yönetimi' : view === 'print' ? 'Tasarımlar ve sipariş bağlantıları' : view === 'integrations' ? 'Entegrasyon izleme' : view === 'ai' ? 'AI yönetimi' : view === 'settings' ? 'Rol, ayar ve denetim' : 'İçerik yönetimi'}</h1><span>Yönetim</span></div>{['catalog','inventory','pricing','content'].includes(view)&&!commerce ? <section aria-label="Katalog servis durumu"><p role={catalogLoading?'status':'alert'}>{catalogLoading?'Katalog verileri yükleniyor…':apiNotice}</p>{!catalogLoading&&<button disabled={!commerceApi} onClick={reloadCatalog}>Tekrar dene</button>}</section> : view === 'customers' ? <Customers /> : view === 'audit' ? <AuditLog /> : view === 'reviews' ? <Reviews productName={id => products.find(product => product.id === id)?.name ?? id} /> : view === 'notifications' ? <Notifications /> : view === 'surfaces' ? <SurfaceMasks /> : view === 'dashboard' ? <Dashboard onOrders={() => navigate('orders')} /> : view === 'orders' ? <Orders requestedOrderId={requestedOrderId} onClearRequested={clearRequestedOrder} onBackToDesign={can('print.read')?()=>{if(history.state?.fromDesign)history.back();else navigate('print')}:undefined} /> : view === 'catalog' ? <Catalog prices={prices} onPrice={(id,cents)=>persist(`/prices/${encodeURIComponent(id)}`,'PUT',{cents})} categories={commerce?.categories??[]} onDeleteCategory={(name, moveTo) => persist(`/categories/${encodeURIComponent(name)}${moveTo ? `?moveTo=${encodeURIComponent(moveTo)}` : ''}`, 'DELETE')} onCategory={name => persist('/categories', 'POST', { name })} products={products} onSave={saveProduct} onDelete={id => persist(`/products/${encodeURIComponent(id)}`, 'DELETE')} /> : view === 'inventory' ? <Inventory products={products} onStock={(id,stock)=>persist(`/inventory/${encodeURIComponent(id)}`,'PUT',{stock})} /> : view === 'pricing' ? <Pricing products={products} prices={prices} campaigns={campaigns} onPrice={(id, cents) => persist(`/prices/${encodeURIComponent(id)}`, 'PUT', { cents })} onCampaign={campaign => setCampaigns(current => current.some(item => item.id === campaign.id) ? current.map(item => item.id === campaign.id ? campaign : item) : [...current, campaign])} /> : view === 'quotes' ? <Quotes /> : view === 'print' ? <PrintOperations onOpenOrder={openDesignOrder} /> : view === 'integrations' ? <Integrations products={products} catalogAvailable={!!commerce} /> : view === 'ai' ? <AiAdmin /> : view === 'settings' ? <AdminSettings /> : commerce ? <ContentEditor announcements={commerce.announcements ?? []} onPublishAnnouncement={draft=>persist('/announcements','POST',draft)} onDeleteAnnouncement={id=>persist(`/announcements/${encodeURIComponent(id)}`,'DELETE')} categories={commerce.categories ?? []} products={products} content={commerce.content} onSave={content => persist('/content', 'PUT', content)} /> : <p role="alert">{apiNotice}</p>}</main></div>
  </div>
}
