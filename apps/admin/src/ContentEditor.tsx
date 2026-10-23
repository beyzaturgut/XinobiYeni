import { useRef, useState, type ChangeEvent } from 'react'

import Announcements from './Announcements'
import { commerceApi, mediaUrl, uploadMedia, type Content, type Slide, type Product, type Announcement } from './commerce'

function ContentEditor({ content, products, categories, announcements, onPublishAnnouncement, onDeleteAnnouncement, onSave }: { announcements: Announcement[]; onPublishAnnouncement: (draft: {title:string;body:string;kind:'Haber'|'Duyuru'})=>Promise<void>; onDeleteAnnouncement:(id:string)=>Promise<void>; products: Product[]; categories: string[]; content: Content; onSave: (content: Content) => Promise<void> }) {
  const [section, setSection] = useState<'slider' | 'categories' | 'titanium' | 'featured' | 'announcements'>('slider')
  const [featuredProducts, setFeaturedProducts] = useState<string[]>(content.featuredProducts ?? products.filter(product=>product.active).slice(0,4).map(product=>product.id))
  const [categoryImages,setCategoryImages] = useState(content.categoryImages ?? {})
  const [categoryProducts, setCategoryProducts] = useState(content.categoryProducts ?? {})
  const [slides, setSlides] = useState(content.slides)
  const [selectedId, setSelectedId] = useState(content.slides[0]?.id ?? 0)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [titaniumCategory,setTitaniumCategory]=useState(content.titaniumCategory??'')
  const [titaniumImage, setTitaniumImage] = useState(content.titaniumImage ?? '/assets/products/titanium-bronze-gold.png')
  const buttonColor = content.buttonColor
  const selected = slides.find((slide) => slide.id === selectedId) ?? slides[0]

  function updateSelected(patch: Partial<Slide>) {
    if (!selected) return
    setSlides((current) => current.map((slide) => slide.id === selected?.id ? { ...slide, ...patch } : slide))
  }

  async function addMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
    const src = await uploadMedia(commerceApi, file)
    const isVideo = file.type.startsWith('video/')
    const slide: Slide = { id: Date.now(), name: file.name.replace(/\.[^.]+$/, ''), type: isVideo ? 'Video' : 'Fotoğraf', src, alt: '', duration: isVideo ? 0 : 6, active: true }
    setSlides((current) => [...current, slide])
    setSelectedId(slide.id)
    setNotice(`${file.name} eklendi; web’e yansıtmak için kaydedin.`)
    event.target.value = ''
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Medya yüklenemedi.') }
  }

  function moveSelected(direction: -1 | 1) {
    if (!selected) return
    setSlides((current) => {
      const index = current.findIndex((slide) => slide.id === selected?.id)
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function saveContent() {
    try { await onSave({ ...content, slides, buttonColor, categoryProducts, categoryImages, titaniumImage, titaniumCategory: titaniumCategory||null, featuredProducts: featuredProducts.filter(Boolean) }); setNotice('İçerik kaydedildi.') }
    catch (error) { setNotice(error instanceof Error ? error.message : 'İçerik kaydedilemedi.') }
  }
  const source = (src: string) => mediaUrl(src, commerceApi, 'http://127.0.0.1:3000')

  return <div className="content-editor">
    <main className="workspace">
      <header className="topbar"><div><p>İÇERİK YÖNETİMİ</p><h1>{section === 'slider' ? 'Ana sayfa slider' : section === 'categories' ? 'Anasayfa kategorileri' : section === 'titanium' ? 'Titanyum kaplama alanı' : section === 'featured' ? 'Öne çıkan ürünler' : section === 'announcements' ? 'Haber ve duyurular' : 'İçerik yönetimi'}</h1></div><div className="content-tabs"><button aria-pressed={section === 'slider'} onClick={() => setSection('slider')}>Slider</button><button aria-pressed={section === 'categories'} onClick={() => setSection('categories')}>Kategoriler</button><button aria-pressed={section === 'titanium'} onClick={() => setSection('titanium')}>Titanyum kaplama</button><button aria-pressed={section === 'featured'} onClick={() => setSection('featured')}>Öne çıkanlar</button><button aria-pressed={section === 'announcements'} onClick={()=>setSection('announcements')}>Haber ve duyurular</button></div></header>
      <section className="status-note"><strong>Ortak içerik yönetimi</strong><span>Görselleri düzenledikten sonra “Kaydet ve web’i güncelle” düğmesine basın. Kayıtlar local API’de korunur.</span></section>
      {section === 'announcements' ? <Announcements items={announcements} onPublish={onPublishAnnouncement} onDelete={onDeleteAnnouncement} /> : section === 'featured' ? <section className="xinobi-editor" aria-label="Öne çıkan ürünleri seç"><h2>Anasayfada öne çıkanlar</h2><p>Dört farklı ürün seçin. Sıralama soldan sağa uygulanır; ürünün orijinal kapak görseli kullanılır.</p><div className="home-category-settings">{Array.from({length:4},(_,index)=>{
        const id=featuredProducts[index] || ''
        const product=products.find(product=>product.id===id)
        return <section key={index}><h3>{index+1}. ürün</h3><label>Gösterilecek ürün<select aria-label={`${index+1}. öne çıkan ürün`} value={id} onChange={event=>setFeaturedProducts(current=>Array.from({length:4},(_,slot)=>slot===index?event.target.value:(current[slot]||'')))}><option value="">Ürün seçilmedi</option>{products.filter(product=>product.active).map(product=><option key={product.id} value={product.id} disabled={featuredProducts.some((selected,slot)=>slot!==index&&selected===product.id)}>{product.name}</option>)}{id&&!product?.active&&<option value={id}>Ürün artık aktif değil</option>}</select></label>{product&&(product.originalImage||product.variants[0]?.image)&&<img src={source(product.originalImage||product.variants[0].image)} alt={`${product.name} kapak önizlemesi`} />}</section>
      })}</div><div className="save-row"><p aria-live="polite">{notice}</p><button onClick={saveContent}>Kaydet ve web’i güncelle</button></div></section> : section === 'titanium' ? <section className="xinobi-editor" aria-label="Titanyum kaplama görseli yönetimi"><h2>Titanyum kaplamalı ürünler</h2><label>Titanyum serisi katalog kategorisi<select value={titaniumCategory} onChange={e=>setTitaniumCategory(e.target.value)}><option value="">Seri kategorisi henüz belirlenmedi</option>{categories.map(name=><option key={name}>{name}</option>)}</select></label><p>Mağazadaki seri bağlantısı bu gerçek kategoriye gider. Kategori seçilmezse yanıltıcı seri bağlantısı gösterilmez.</p><p>Bu sabit alan kategorilerin altında gösterilir. Yüklediğiniz tek fotoğraf sağdaki ürün alanında ve koyu gölgenin arkasında birlikte kullanılır.</p><div className="titanium-preview">{titaniumImage ? <img src={source(titaniumImage)} alt="Titanyum kaplama ürün görseli önizlemesi" /> : <p>Görsel kaldırıldı.</p>}</div><label>Titanyum kaplama görseli yükle<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event => {
        const file = event.target.files?.[0]; if(!file) return
        try { setTitaniumImage(await uploadMedia(commerceApi, file));setNotice('Titanyum kaplama görseli eklendi; değişikliği kaydedin.');event.target.value='' }
        catch(error) {setNotice(error instanceof Error ? error.message : 'Görsel yüklenemedi.')}
      }} /></label><button onClick={() => setTitaniumImage('')}>Görseli kaldır</button><button onClick={() => setTitaniumImage('/assets/products/titanium-bronze-gold.png')}>İlk görseli geri yükle</button><div className="save-row"><p aria-live="polite">{notice}</p><button onClick={saveContent}>Kaydet ve web’i güncelle</button></div></section> : section === 'categories' ? <section className="xinobi-editor" aria-label="Anasayfa kategori görselleri"><h2>Anasayfada gösterilecek ürünler</h2><p>Her kategori için fotoğraf yükleyebilirsiniz. Yüklenen fotoğraf öncelikli gösterilir; fotoğraf yoksa seçilen ürünün görseli kullanılır.</p><div className="home-category-settings">{categories.map(category => {
        const candidates = products.filter(product => product.active && product.category === category)
        const selection = categoryProducts[category]
        const selectedVariant = candidates.flatMap(product => product.variants).find(variant => variant.id === selection)
        const automaticVariant = candidates.flatMap(product => product.variants).find(variant => variant.image)
        const uploaded = categoryImages[category]
        const preview = selection === undefined ? automaticVariant : selectedVariant
        return <section key={category}><h3>{category}</h3><label>{category} için ürün<select aria-label={`${category} için ürün`} value={selection ?? '__automatic__'} onChange={event => setCategoryProducts(current => {
          const next = {...current}; if(event.target.value === '__automatic__') delete next[category]; else next[category] = event.target.value; return next
        })}><option value="__automatic__">Otomatik · İlk aktif ürün</option><option value="">Anasayfada gösterme</option>{candidates.map(product => <optgroup key={product.id} label={product.name}>{product.variants.filter(variant => variant.image).map(variant => <option key={variant.id} value={variant.id}>{product.name} · {variant.color}</option>)}</optgroup>)}{selection && !selectedVariant && <option value={selection}>Seçilen ürün artık mevcut veya aktif değil</option>}</select></label><label>{category} fotoğrafı yükle<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async event=>{
          const file=event.target.files?.[0];if(!file)return
          try{const src=await uploadMedia(commerceApi,file);setCategoryImages(current=>({...current,[category]:src}));setNotice('Kategori fotoğrafı yüklendi; değişikliği kaydedin.');event.target.value=''}catch(error){setNotice(error instanceof Error?error.message:'Görsel yüklenemedi.')}
        }}/></label>{uploaded&&<button onClick={()=>setCategoryImages(current=>{const next={...current};delete next[category];return next})}>Kategori fotoğrafını kaldır</button>}{uploaded ? <img src={source(uploaded)} alt={`${category} yüklenen kategori fotoğrafı`} /> : preview ? <img src={source(preview.image)} alt={`${category} kategori görseli · ${preview.color}`} /> : <p>{selection === '' ? 'Bu kategori anasayfada gizlenecek.' : 'Gösterilecek aktif ürün görseli yok.'}</p>}</section>
      })}</div><div className="save-row"><p aria-live="polite">{notice}</p><button onClick={saveContent}>Kaydet ve web’i güncelle</button></div></section> : section === 'slider' ? <div className="editor-layout">
        <section className="slides-panel" aria-labelledby="slides-title">
          <div className="panel-heading"><div><p>SLIDER ÖĞELERİ</p><h2 id="slides-title">Yayın sırası</h2></div><button onClick={() => inputRef.current?.click()}>+ Medya ekle</button><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={addMedia} hidden /></div>
          <div className="slides-list">{slides.map((slide, index) => <button key={slide.id} className={slide.id === selected?.id ? 'slide-row selected' : 'slide-row'} onClick={() => setSelectedId(slide.id)}><span className="order">{String(index + 1).padStart(2, '0')}</span><span className="thumb">{slide.type === 'Video' ? <video src={source(slide.src)} muted /> : <img src={source(slide.src)} alt="" />}</span><span className="slide-name"><strong>{slide.name}</strong><small>{slide.type} · {slide.active ? 'Web’de etkin' : 'Taslak'}</small></span><span aria-hidden="true">›</span></button>)}</div>
          <div className="order-actions"><button onClick={() => moveSelected(-1)}>↑ Yukarı taşı</button><button onClick={() => moveSelected(1)}>↓ Aşağı taşı</button></div>
        </section>
        {selected ? <section className="detail-panel" aria-labelledby="detail-title">
          <div className="panel-heading"><div><p>MEDYA AYARLARI</p><h2 id="detail-title">Seçili öğe</h2></div><span className={selected.active ? 'state live' : 'state'}>{selected.active ? 'Web’de etkin' : 'Taslak'}</span></div>
          <div className="media-preview">{selected.type === 'Video' ? <video src={source(selected.src)} controls muted /> : <img src={source(selected.src)} alt={selected.alt} />}<span>{selected.type}</span></div>
          <div className="form-grid">
            <label>İçerik adı<input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} /></label>
            <label>Medya türü<input value={selected.type} readOnly /></label>
            <label className="full">Alternatif metin<input value={selected.alt} onChange={(event) => updateSelected({ alt: event.target.value })} placeholder="Görseli açıklayan kısa metin" /></label>
            {selected.type === 'Fotoğraf' && <label>Gösterim süresi (sn.)<input type="number" min="3" max="20" value={selected.duration} onChange={(event) => updateSelected({ duration: Number(event.target.value) })} /></label>}
            <label className="toggle"><input type="checkbox" checked={selected.active} onChange={(event) => updateSelected({ active: event.target.checked })} /><span>Web sliderında etkin</span></label>
          </div>
          <div className="save-row"><p aria-live="polite">{notice}</p><button onClick={() => { setSlides(current => current.filter(item => item.id !== selected.id)); setNotice('Banner kaldırıldı; değişikliği kaydedin.') }}>Bannerı sil</button><button onClick={saveContent}>Kaydet ve web’i güncelle</button></div>
        </section> : <section className="detail-panel"><p>Banner yok. Yeni medya ekleyebilirsiniz.</p><button onClick={saveContent}>Kaydet ve web’i güncelle</button></section>}
      </div> : null}

    </main>
  </div>
}

export default ContentEditor
