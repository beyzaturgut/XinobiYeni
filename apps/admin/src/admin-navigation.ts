export type AdminView = 'customers' | 'audit' | 'reviews' | 'notifications' | 'surfaces' | 'dashboard' | 'orders' | 'content' | 'catalog' | 'inventory' | 'pricing' | 'quotes' | 'print' | 'integrations' | 'ai' | 'settings'
export type NavigationItem = { view: AdminView; label: string; permission: string; owner:'top'|'side'; category: string; section: string }
// Exactly one primary navigation owner per existing screen; both menus are independent.
export const navigationItems: readonly NavigationItem[] = [
  { view:'customers', label:'Müşteriler', permission:'customers.read', owner:'top', category:'Müşteriler', section:'Müşteri yönetimi' },
  { view:'orders', label:'Siparişler', permission:'orders.read', owner:'top', category:'Siparişler', section:'Operasyon' },
  { view:'catalog', label:'Katalog', permission:'catalog.read', owner:'top', category:'Ürünler', section:'Katalog' },
  { view:'inventory', label:'Stok ve depolar', permission:'inventory.read', owner:'top', category:'Ürünler', section:'Operasyon' },
  { view:'surfaces', label:'Ürün yüzeyleri', permission:'catalog.read', owner:'top', category:'Ürünler', section:'Kişiselleştirme' },
  { view:'reviews', label:'Ürün değerlendirmeleri', permission:'content.read', owner:'top', category:'Ürünler', section:'İçerik' },
  { view:'quotes', label:'Kurumsal teklifler', permission:'quotes.read', owner:'top', category:'Müşteriler', section:'Kurumsal' },
  { view:'pricing', label:'Fiyat ve kampanyalar', permission:'pricing.read', owner:'top', category:'Fiyat ve kampanyalar', section:'Fiyatlandırma' },
  { view:'content', label:'İçerik', permission:'content.read', owner:'top', category:'İçerik', section:'Mağaza içeriği' },
  { view:'print', label:'Tasarım ve baskı', permission:'print.read', owner:'top', category:'Tasarım', section:'Üretim' },
  { view:'integrations', label:'Entegrasyon izleme', permission:'integration.read', owner:'top', category:'Entegrasyonlar', section:'Bağlantılar' },
  { view:'dashboard', label:'Operasyon özeti', permission:'reports.read', owner:'side', category:'Raporlar', section:'Operasyon ve takip' },
  { view:'settings', label:'Rol, ayar ve denetim', permission:'settings.read', owner:'top', category:'Ayarlar', section:'Yönetim' },
  { view:'ai', label:'AI yönetimi', permission:'ai.read', owner:'top', category:'Ayarlar', section:'Asistan' },
  { view:'notifications', label:'Bildirim kayıtları', permission:'notifications.read', owner:'side', category:'Siparişler', section:'Operasyon ve takip' },
  { view:'audit', label:'İşlem geçmişi', permission:'audit.read', owner:'side', category:'Ayarlar', section:'Denetim' },
]
export const topNavigation = [...new Set(navigationItems.filter(item=>item.owner==='top').map(item=>item.category))].map(name=>({name,links:navigationItems.filter(item=>item.owner==='top'&&item.category===name)}))
export const sideNavigation = [...new Set(navigationItems.filter(item=>item.owner==='side').map(item=>item.section))].map(title=>({title,items:navigationItems.filter(item=>item.owner==='side'&&item.section===title)}))
export function categoryForView(view:AdminView):string|undefined {
  const item=navigationItems.find(item=>item.view===view)
  return item?.owner==='top'?item.category:undefined
}
export function initialView(search:string,can:(permission:string)=>boolean):AdminView {
  const requested=new URLSearchParams(search).get('view')
  return navigationItems.find(item=>item.view===requested&&can(item.permission))?.view
    ?? navigationItems.find(item=>item.view==='dashboard'&&can(item.permission))?.view
    ?? navigationItems.find(item=>can(item.permission))?.view ?? 'dashboard'
}
