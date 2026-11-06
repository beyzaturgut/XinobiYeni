// All API/media requests are synthetic and intercepted. No real account or catalogue writes.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {readFileSync} from 'node:fs'
import {mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {mockPanel,permissions,store,product as original} from './consistency-fixtures.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/'
const output=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-source-ui'
await mkdir(output,{recursive:true})
const bytes=readFileSync(new URL('../public/assets/banners/slider-1.png',import.meta.url))
const sha=createHash('sha256').update(bytes).digest('hex'),image='/api/v1/local-commerce/media/'+'a'.repeat(32)+'.png'
const asset={image,sha256:sha,mime:'image/png',bytes:bytes.length,width:73,height:41}
const product={...original,personalizable:true,variants:[{...original.variants[0],color:'',hex:'',image}]}
const other={...product,id:'UI-P2',name:'İkinci izole ürün',variants:[]}
async function fixture({write=true,mode='none',holdSave=false,sourceBytes=bytes}={}){
 const fixtureAsset=sourceBytes===bytes?asset:{...asset,sha256:createHash('sha256').update(sourceBytes).digest('hex'),bytes:sourceBytes.length,width:sourceBytes.readUInt32BE(16),height:sourceBytes.readUInt32BE(20)}
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage()
 let catalogueProducts=[product,other],catalogueWrites=0
 let current={productId:product.id,revision:0,status:'none',source:null,surfaceStatus:'none'},writes=0,uploads=0,failure=false,malformed=false
 let releaseSave;const saveGate=new Promise(resolve=>{releaseSave=resolve})
 let releaseLoad;const gate=new Promise(resolve=>{releaseLoad=resolve})
 await mockPanel(page,{permissions:[...permissions.filter(p=>p!=='catalog.write'),...(write?['catalog.write','media.write']:[])],handler:async(route,path)=>{
  const req=route.request()
  if(path.endsWith('/state')){await route.fulfill({json:{...store,products:catalogueProducts}});return true}
  if(path.endsWith('/categories')&&req.method()==='POST'){
   catalogueWrites++;await route.fulfill({json:{...store,products:catalogueProducts,categories:['Test',req.postDataJSON().name]}});return true
  }
  if(path.includes('/local-commerce/media/')){await route.fulfill({contentType:'image/png',body:sourceBytes});return true}
  if(path.endsWith('/local-commerce/media')&&req.method()==='POST'){
   const contentType=req.headers()['content-type'],boundary=/boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType)
   assert.ok(boundary,'Multipart boundary is present')
   const body=req.postDataBuffer(),start=body.indexOf(Buffer.from('\r\n\r\n'))+4
   const end=body.indexOf(Buffer.from('\r\n--'+(boundary[1]||boundary[2])),start)
   assert.ok(start>=4&&end>start,'Multipart contains file bytes')
   assert.deepEqual(body.subarray(start,end),sourceBytes,'Uploaded source must preserve every byte')
   uploads++;await route.fulfill({json:{src:'/api/v1/local-commerce/media/'+'c'.repeat(32)+'.png'}});return true}
  if(path.includes('/personalization-sources/')){
   if(path.endsWith('/candidate')){await route.fulfill({json:{...fixtureAsset,image:new URL(req.url()).searchParams.get('image')}});return true}
   if(req.method()==='PUT'){
    writes++;if(holdSave)await saveGate
    assert.equal(req.postDataJSON().expectedRevision,current.revision)
    assert.equal(req.postDataJSON().sourceSha256,fixtureAsset.sha256)
    if(failure){await route.fulfill({status:503,json:{message:'İzole kayıt hatası'}});return true}
    if(malformed){await route.fulfill({json:{}});return true}
    current={...current,revision:current.revision+1,status:'ready',source:fixtureAsset,surfaceStatus:'pending'}
    await route.fulfill({json:current});return true
   }
   if(mode==='loading')await gate
   if(mode==='error'){await route.fulfill({status:503,json:{message:'İzole kaynak servisi hatası'}});return true}
   if(mode==='denied'){await route.fulfill({status:403,json:{}});return true}
   if(mode==='malformed'){await route.fulfill({json:[]});return true}
   if(mode==='stale')current={...current,revision:1,status:'stale',source:fixtureAsset,surfaceStatus:'pending'}
   await route.fulfill({json:current});return true
  }
  return false
 }})
 await page.goto(base+'?view=catalog')
 await page.locator('.personalization-source summary').click()
 return {page,setCatalogueProducts:next=>{catalogueProducts=next},get catalogueWrites(){return catalogueWrites},get writes(){return writes},get uploads(){return uploads},setMode:value=>{mode=value},releaseLoad,releaseSave,fail:value=>{failure=value},malformed:value=>{malformed=value}}
}
try{
 const f=await fixture({mode:'loading'}),p=f.page
 await p.getByText('Kaynak fotoğraf yükleniyor…',{exact:true}).waitFor();f.setMode('none');f.releaseLoad()
 await p.getByText('Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.',{exact:true}).waitFor()
 assert.equal(await p.getByText('XINOBI U · Katalog görseli promptu',{exact:true}).count(),0)
 await p.getByRole('button',{name:product.name+' ürününü düzenle',exact:true}).click()
 await p.getByRole('button',{name:'Medya',exact:true}).click()
 assert.equal(await p.getByRole('heading',{name:'Orijinal ürün görseli',exact:true}).count(),1,'Normal catalogue media remains')
 assert.equal(await p.getByText('XINOBI U · Katalog görseli promptu',{exact:true}).count(),0)
 assert.equal(await p.getByLabel('Hazır katalog görseli promptu',{exact:true}).count(),0)
 await p.getByRole('button',{name:'Ürün düzenlemeyi kapat',exact:true}).click()
 await p.getByLabel('Mevcut katalog fotoğrafını kullan').selectOption(image)
 await p.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 p.once('dialog',d=>d.dismiss());await p.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).click();assert.equal(f.writes,0)
 p.once('dialog',d=>d.dismiss());await p.getByLabel('Kaynak fotoğrafı yönetilecek ürün').selectOption(other.id)
 assert.equal(await p.getByLabel('Kaynak fotoğrafı yönetilecek ürün').inputValue(),product.id)
 p.once('dialog',d=>d.dismiss());assert.equal(await p.evaluate(()=>window.dispatchEvent(new Event('xinobi:before-navigation',{cancelable:true}))),false)
 p.once('dialog',d=>d.dismiss());await p.getByRole('button',{name:'Çıkış yap',exact:true}).click();assert.equal(f.writes,0)
 f.fail(true);p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).click()
 await p.getByRole('alert').filter({hasText:'İzole kayıt hatası'}).waitFor()
 await p.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor();assert.equal(f.writes,1)
 f.fail(false);f.malformed(true);p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).click()
 await p.getByRole('alert').filter({hasText:'geçerli durum bilgisi'}).waitFor();assert.equal(f.writes,2)
 f.malformed(false);p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).click()
 await p.getByText('Kaynak fotoğraf kaydedildi. Bu kaynak için maske onayı bekleniyor; eski sipariş dosyaları korunuyor.',{exact:true}).waitFor();assert.equal(f.writes,3)
 assert.equal(await p.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).isDisabled(),true)
 assert.equal(await p.evaluate(()=>window.dispatchEvent(new Event('xinobi:before-navigation',{cancelable:true}))),true)
 const scan=await new AxeBuilder({page:p}).include('.personalization-source').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
 assert.deepEqual(scan.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id),[])
 await p.getByRole('button',{name:'Kayıtlı kaynak fotoğrafı indir',exact:true}).focus();await p.keyboard.press('Tab')
 assert.equal(await p.getByRole('button',{name:'Güncel kaydı yükle',exact:true}).evaluate(e=>e===document.activeElement),true)
 const download=p.waitForEvent('download');await p.getByRole('button',{name:'Kayıtlı kaynak fotoğrafı indir',exact:true}).click();const downloaded=await download
 assert.deepEqual(readFileSync(await downloaded.path()),bytes,'Downloaded source preserves every byte')
 await p.getByText('Kaynak fotoğraf indirme için tarayıcıya verildi.',{exact:true}).waitFor()
 for(const width of [320,390,768,1440]){
  await p.setViewportSize({width,height:1000})
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Viewport overflow '+width)
 }
 await p.setViewportSize({width:320,height:1100});await p.addStyleTag({content:'html{font-size:200%}.personalization-source{font-size:200%}'})
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% text overflow')
 await p.screenshot({path:output+'/single-source-320-2x.png',fullPage:true})
 await p.close()
 for(const mode of ['error','denied','malformed']){
  const x=await fixture({mode}),page=x.page
  await page.locator('.personalization-source [role=alert]').waitFor()
  assert.equal(await page.getByText('Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.',{exact:true}).count(),0)
  x.setMode('none');await page.getByRole('button',{name:'Güncel kaydı yükle',exact:true}).click()
  await page.getByText('Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.',{exact:true}).waitFor();assert.equal(x.writes,0);await page.close()
 }
 // A catalogue write refreshes the parent's props while the source form has an unsaved selection.
 const refresh=await fixture(),rp=refresh.page
 await rp.getByText('Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.',{exact:true}).waitFor()
 await rp.getByLabel('Mevcut katalog fotoğrafını kullan').selectOption(image)
 await rp.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 async function catalogueRefresh(products,name){
  refresh.setCatalogueProducts(products)
  await rp.getByRole('button',{name:'Yeni kategori',exact:true}).click()
  await rp.getByLabel('Yeni kategori adı',{exact:true}).fill(name)
  await rp.getByRole('button',{name:'Kategori ekle',exact:true}).click()
  await rp.getByRole('dialog',{name:'Kategoriler',exact:true}).waitFor({state:'hidden'})
 }
 await catalogueRefresh([other,product],'Sıra değişikliği')
 assert.equal(await rp.getByLabel('Kaynak fotoğrafı yönetilecek ürün').inputValue(),product.id,'Catalogue reordering must not change source product')
 await rp.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 await catalogueRefresh([other,{...product,personalizable:false}],'İşaret kaldırma')
 await rp.getByText(/Seçili ürün artık katalogda kişiselleştirmeye açık değil/).waitFor()
 assert.equal(await rp.getByLabel('Kaynak fotoğrafı yönetilecek ürün').inputValue(),product.id)
 await rp.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 assert.equal(await rp.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).isDisabled(),true)
 rp.once('dialog',d=>d.dismiss());await rp.getByLabel('Kaynak fotoğrafı yönetilecek ürün').selectOption(other.id)
 assert.equal(await rp.getByLabel('Kaynak fotoğrafı yönetilecek ürün').inputValue(),product.id)
 await catalogueRefresh([other],'Ürünü katalogdan kaldırma')
 assert.equal(await rp.getByLabel('Kaynak fotoğrafı yönetilecek ürün').inputValue(),product.id)
 await rp.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 assert.equal(await rp.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).isDisabled(),true)
 await catalogueRefresh([product,other],'İşareti geri açma')
 assert.equal(await rp.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).isEnabled(),true)
 assert.equal(refresh.writes,0,'Parent catalogue refresh must not save a source automatically')
 assert.equal(refresh.catalogueWrites,4)
 await rp.close()
 const readonly=await fixture({write:false,mode:'stale'})
 await readonly.page.getByText(/Kayıtlı kaynak dosya değişmiş/).waitFor()
 assert.equal(await readonly.page.getByLabel('Mevcut katalog fotoğrafını kullan').isDisabled(),true)
 assert.equal(await readonly.page.getByRole('button',{name:'Kayıtlı kaynak fotoğrafı indir',exact:true}).isDisabled(),true)
 assert.equal(readonly.writes,0);await readonly.page.close()
 const repair=await fixture({mode:'stale'})
 await repair.page.getByText(/Kayıtlı kaynak dosya değişmiş/).waitFor()
 await repair.page.getByLabel('Tek kaynak fotoğraf yükle').setInputFiles({name:'same-bytes-repair.png',mimeType:'image/png',buffer:bytes})
 await repair.page.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 assert.equal(await repair.page.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).isEnabled(),true)
 await repair.page.close()
 const busyFixture=await fixture({holdSave:true}),bp=busyFixture.page
 await bp.getByText('Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.',{exact:true}).waitFor()
 await bp.getByLabel('Mevcut katalog fotoğrafını kullan').selectOption(image)
 await bp.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 bp.once('dialog',d=>d.accept());await bp.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).click()
 await bp.getByText('Kaynak işlemi sürüyor; tamamlanmasını bekleyin.',{exact:true}).waitFor()
 assert.equal(await bp.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).isDisabled(),true)
 assert.equal(await bp.evaluate(()=>window.dispatchEvent(new Event('xinobi:before-navigation',{cancelable:true}))),false)
 assert.equal(busyFixture.writes,1);busyFixture.releaseSave()
 await bp.getByText('Kaynak fotoğraf kaydedildi. Bu kaynak için maske onayı bekleniyor; eski sipariş dosyaları korunuyor.',{exact:true}).waitFor();await bp.close()
 const upload=await fixture()
 await upload.page.getByText('Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.',{exact:true}).waitFor()
 await upload.page.getByLabel('Tek kaynak fotoğraf yükle').setInputFiles({name:'any-size.png',mimeType:'image/png',buffer:bytes})
 await upload.page.getByText('73 × 41 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 assert.equal(upload.uploads,1);assert.equal(upload.writes,0)
 await upload.page.screenshot({path:output+'/single-source-1440.png',fullPage:true});await upload.page.close()
 const largeBytes=readFileSync(new URL('../../../fixtures/product-surfaces/ec501-metallic-silver/fe618b58-1ced-4edd-9063-6d6c49961e65/mask.png',import.meta.url))
 const large=await fixture({sourceBytes:largeBytes}),lp=large.page
 await lp.getByText('Bu ürün için tek kaynak fotoğraf henüz tanımlanmadı.',{exact:true}).waitFor()
 await lp.getByLabel('Tek kaynak fotoğraf yükle').setInputFiles({name:'large-nonstandard-source.png',mimeType:'image/png',buffer:largeBytes})
 await lp.getByText('5001 × 3730 px · Kaydedilmemiş seçim',{exact:true}).waitFor()
 lp.once('dialog',d=>d.accept());await lp.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).click()
 await lp.getByText('Kaynak fotoğraf kaydedildi. Bu kaynak için maske onayı bekleniyor; eski sipariş dosyaları korunuyor.',{exact:true}).waitFor()
 const largeDownload=lp.waitForEvent('download');await lp.getByRole('button',{name:'Kayıtlı kaynak fotoğrafı indir',exact:true}).click()
 const largeFile=await largeDownload
 assert.deepEqual(readFileSync(await largeFile.path()),largeBytes,'Large source is not resized/reencoded on upload or download')
 assert.equal(large.uploads,1);assert.equal(large.writes,1);await lp.close()
 console.log('PASS single-source load/empty/error/denied/stale/success, malformed success, confirmations/dirty guard, photo generation prompt absent in both locations; exact upload/download bytes, responsive + 200%')
}finally{await browser.close()}
