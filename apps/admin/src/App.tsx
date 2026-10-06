import { useRef, useState, type ChangeEvent } from 'react'
import './App.css'
import ProductSurfaceReview from './features/product-surfaces/ProductSurfaceReview'

type Slide = { id: number; name: string; type: 'Fotoğraf' | 'Video'; src: string; alt: string; duration: number; active: boolean }

const initialSlides: Slide[] = [
  { id: 1, name: 'Beyaz hava temizleyici', type: 'Fotoğraf', src: '/assets/banners/slider-1.png', alt: 'Koyu mermer üzerinde beyaz Xinobi hava temizleyici', duration: 6, active: true },
  { id: 2, name: 'Krom detaylı kahve makinesi', type: 'Fotoğraf', src: '/assets/banners/slider-2.png', alt: 'Krom detaylı lüks Xinobi kahve makinesi', duration: 6, active: true },
  { id: 3, name: 'Pembe çay makinesi', type: 'Fotoğraf', src: '/assets/banners/slider-3.png', alt: 'Türk çayı yanında pembe Xinobi çay makinesi', duration: 6, active: true },
]

function App() {
  const [section, setSection] = useState<'slider' | 'xinobi-u' | 'surfaces'>('slider')
  const [slides, setSlides] = useState(initialSlides)
  const [selectedId, setSelectedId] = useState(1)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [xinobiBanner, setXinobiBanner] = useState('/assets/banners/xinobi-u-banner.png')
  const [buttonColor, setButtonColor] = useState('#ed2639')
  const selected = slides.find((slide) => slide.id === selectedId) ?? slides[0]

  function updateSelected(patch: Partial<Slide>) {
    setSlides((current) => current.map((slide) => slide.id === selected.id ? { ...slide, ...patch } : slide))
  }

  function addMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const slide: Slide = { id: Date.now(), name: file.name.replace(/\.[^.]+$/, ''), type: isVideo ? 'Video' : 'Fotoğraf', src: URL.createObjectURL(file), alt: '', duration: isVideo ? 0 : 6, active: false }
    setSlides((current) => [...current, slide])
    setSelectedId(slide.id)
    setNotice(`${file.name} yerel önizlemeye eklendi.`)
    event.target.value = ''
  }

  function moveSelected(direction: -1 | 1) {
    setSlides((current) => {
      const index = current.findIndex((slide) => slide.id === selected.id)
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function updateXinobiBanner(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setXinobiBanner(URL.createObjectURL(file))
    setNotice(`${file.name} XINOBI U banner önizlemesine eklendi.`)
    event.target.value = ''
  }

  return <div className="admin-shell">
    <aside className="sidebar">
      <div className="admin-brand"><span>✦</span><div><strong>XINOBI</strong><small>Yönetim paneli</small></div></div>
      <nav aria-label="Yönetim menüsü"><button className={section === 'slider' ? 'active' : ''} onClick={() => setSection('slider')}>Ana sayfa slider</button><button>Ürünler</button><button>Kategoriler</button><button className={section === 'xinobi-u' ? 'active' : ''} onClick={() => setSection('xinobi-u')}>XINOBI U</button><button>Siparişler</button></nav>
      <p>Faz02 · Yerel yönetim prototipi</p>
    </aside>
    <main className="workspace">
      <header className="topbar"><div><p>İÇERİK YÖNETİMİ</p><h1>{section === 'surfaces' ? 'Ürün yüzeyi inceleme' : section === 'slider' ? 'Ana sayfa slider' : 'XINOBI U banner'}</h1></div><button className="preview">Site önizleme ↗</button></header>
      <section className="status-note"><strong>Demo yönetim alanı</strong><span>{section === 'surfaces' ? 'Yüzey incelemesi yalnız yerel geliştirme API belleğinde tutulur. API yeniden başlatıldığında sıfırlanır.' : 'Değişiklikler bu tarayıcı oturumunda önizlenir. Kalıcı kayıt ve canlı yayın, CMS API bağlantısıyla açılacaktır.'}</span></section>
      {import.meta.env.DEV && <button className="surface-access" onClick={() => setSection(section === 'surfaces' ? 'slider' : 'surfaces')}>{section === 'surfaces' ? 'İçerik yönetimine dön' : 'Ürün yüzeyi incele (geliştirme)'}</button>}
      {section === 'surfaces' ? <ProductSurfaceReview /> : section === 'slider' ? <div className="editor-layout">
        <section className="slides-panel" aria-labelledby="slides-title">
          <div className="panel-heading"><div><p>SLIDER ÖĞELERİ</p><h2 id="slides-title">Yayın sırası</h2></div><button onClick={() => inputRef.current?.click()}>+ Medya ekle</button><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={addMedia} hidden /></div>
          <div className="slides-list">{slides.map((slide, index) => <button key={slide.id} className={slide.id === selected.id ? 'slide-row selected' : 'slide-row'} onClick={() => setSelectedId(slide.id)}><span className="order">{String(index + 1).padStart(2, '0')}</span><span className="thumb">{slide.type === 'Video' ? <video src={slide.src} muted /> : <img src={slide.src} alt="" />}</span><span className="slide-name"><strong>{slide.name}</strong><small>{slide.type} · {slide.active ? 'Yayında' : 'Taslak'}</small></span><span aria-hidden="true">›</span></button>)}</div>
          <div className="order-actions"><button onClick={() => moveSelected(-1)}>↑ Yukarı taşı</button><button onClick={() => moveSelected(1)}>↓ Aşağı taşı</button></div>
        </section>
        <section className="detail-panel" aria-labelledby="detail-title">
          <div className="panel-heading"><div><p>MEDYA AYARLARI</p><h2 id="detail-title">Seçili öğe</h2></div><span className={selected.active ? 'state live' : 'state'}>{selected.active ? 'Yayında' : 'Taslak'}</span></div>
          <div className="media-preview">{selected.type === 'Video' ? <video src={selected.src} controls muted /> : <img src={selected.src} alt={selected.alt} />}<span>{selected.type}</span></div>
          <div className="form-grid">
            <label>İçerik adı<input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} /></label>
            <label>Medya türü<input value={selected.type} readOnly /></label>
            <label className="full">Alternatif metin<input value={selected.alt} onChange={(event) => updateSelected({ alt: event.target.value })} placeholder="Görseli açıklayan kısa metin" /></label>
            {selected.type === 'Fotoğraf' && <label>Gösterim süresi (sn.)<input type="number" min="3" max="20" value={selected.duration} onChange={(event) => updateSelected({ duration: Number(event.target.value) })} /></label>}
            <label className="toggle"><input type="checkbox" checked={selected.active} onChange={(event) => updateSelected({ active: event.target.checked })} /><span>Slider’da yayınla</span></label>
          </div>
          <div className="save-row"><p aria-live="polite">{notice}</p><button onClick={() => setNotice('Değişiklikler yerel taslak olarak kaydedildi.')}>Taslağı kaydet</button></div>
        </section>
      </div> : <section className="xinobi-editor" aria-labelledby="xinobi-u-settings">
        <div className="panel-heading"><div><p>ANA SAYFA BANNERI</p><h2 id="xinobi-u-settings">Görsel ve sabit buton</h2></div><span className="state live">Yerel önizleme</span></div>
        <div className="xinobi-preview"><img src={xinobiBanner} alt="XINOBI U banner önizlemesi" /><a href="#" style={{ backgroundColor: buttonColor }} onClick={(event) => event.preventDefault()}>Tasarımını Oluştur <span>→</span></a></div>
        <div className="xinobi-settings">
          <div><h3>Banner görseli</h3><p>Önerilen oran 1945 × 809. Görsel alanın tamamını kaplar; buton görselin parçası değildir.</p><button onClick={() => bannerInputRef.current?.click()}>Görseli değiştir</button><input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={updateXinobiBanner} hidden /></div>
          <label><span>Buton rengi</span><input type="color" value={buttonColor} onChange={(event) => setButtonColor(event.target.value)} /><strong>{buttonColor}</strong></label>
          <div><h3>Sabit bağlantı</h3><p><code>/urunler/cay-makinesi-101/kisisellestir</code></p><small>Buton konumu ve bağlantısı tasarım sözleşmesinde sabittir.</small></div>
        </div>
        <div className="save-row"><p aria-live="polite">{notice}</p><button onClick={() => setNotice('XINOBI U ayarları yerel taslak olarak kaydedildi.')}>Taslağı kaydet</button></div>
      </section>}
    </main>
  </div>
}

export default App
