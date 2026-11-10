import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {mkdir} from 'node:fs/promises'
import {mockPanel,permissions} from './consistency-fixtures.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/',out=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-single-mask-ui'
await mkdir(out,{recursive:true})
const sha=b=>createHash('sha256').update(b).digest('hex'),image='/api/v1/local-commerce/media/'+'a'.repeat(32)+'.png',maskImage='/api/v1/local-commerce/surfaces/products/MASK-P1/masks/MASK-D1.png'
async function fixture({sourceStatus='ready',write=true,loadError=false,photoError=false}={}){
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',error=>console.error('PAGE',error.message))
 const encoded=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=113;c.height=67;const x=c.getContext('2d');x.fillStyle='#777';x.fillRect(0,0,113,67);const source=c.toDataURL('image/png');x.clearRect(0,0,113,67);x.fillStyle='white';x.fillRect(20,0,60,67);return {source,mask:c.toDataURL('image/png'),webp:c.toDataURL('image/webp')}})
 const bytes=Buffer.from(encoded.source.split(',')[1],'base64'),png=Buffer.from(encoded.mask.split(',')[1],'base64'),webp=Buffer.from(encoded.webp.split(',')[1],'base64')
 const source={image,sha256:sha(bytes),mime:'image/png',bytes:bytes.length,width:113,height:67}
 let item={productId:'MASK-P1',productName:'Tek kaynak test ürünü',profileRevision:1,sourceRevision:1,sourceStatus,source:sourceStatus==='none'?null:source,status:sourceStatus==='stale'?'stale':'none',draft:null,approved:null}
 let writes=0,failUpload=false,failExport=false,changed=false
 await mockPanel(page,{permissions:write?permissions:permissions.filter(p=>!p.endsWith('.write')),handler:async(route,path)=>{
  const req=route.request()
  if(path===image){await route.fulfill(photoError?{status:503,body:''}:{contentType:'image/png',body:bytes});return true}
  if(path===maskImage){await route.fulfill({contentType:'image/png',body:png});return true}
  if(path.includes('/surfaces/products')){
   if(loadError){await route.fulfill({status:503,json:{message:'İzole maske servisi hatası'}});return true}
   if(req.method()!=='GET'){
    writes++;const body=req.postDataJSON()
    assert.equal(body.sourceRevision,item.sourceRevision);assert.equal(body.expectedRevision,item.profileRevision);assert.equal(body.sourceSha256,source.sha256)
    assert.equal(body.colors,undefined);assert.equal(body.samePlacementConfirmed,undefined)
    if(path.endsWith('/mask')){
     if(failUpload){await route.fulfill({status:503,json:{message:'İzole WebP kayıt hatası'}});return true}
     assert.deepEqual(Buffer.from(body.webpBase64,'base64'),webp)
     item={...item,status:'draft',profileRevision:item.profileRevision+1,draft:{id:'MASK-D1',image:maskImage,sha256:sha(png),sourceRevision:item.sourceRevision,sourceSha256:source.sha256,bytes:png.length,method:'webp-alpha'}}
    }else if(path.endsWith('/approval')&&req.method()==='POST'){
     assert.equal(body.draftId,item.draft.id);item={...item,status:'approved',profileRevision:item.profileRevision+1,approved:item.draft,draft:null}
    }else if(path.endsWith('/approval'))item={...item,status:'none',profileRevision:item.profileRevision+1,approved:null}
    else if(path.endsWith('/draft'))item={...item,status:'none',profileRevision:item.profileRevision+1,draft:null}
    else throw new Error('Unexpected synthetic write '+path)
    await route.fulfill({json:item});return true
   }
   if(path.endsWith('/draft.webp')){await route.fulfill(failExport?{status:503,json:{message:'İzole indirme hatası'}}:{contentType:'image/webp',body:webp});return true}
   if(changed)item={...item,profileRevision:10,sourceRevision:2,source:{...source,width:79,height:91},status:'stale',draft:null,approved:null}
   await route.fulfill({json:path.endsWith('/products')?[item,{...item,productId:'MASK-P2',productName:'İkinci ürün',sourceStatus:'none',source:null,status:'none',sourceRevision:0,profileRevision:0,draft:null,approved:null}]:item});return true
  }
  return false
 }})
 await page.goto(base+'?view=surfaces')
 if(!loadError)await page.getByRole('button',{name:/Tek kaynak test ürünü/}).click()
 return {page,bytes,webp,get writes(){return writes},failUpload:v=>{failUpload=v},failExport:v=>{failExport=v},changeSource:()=>{changed=true}}
}
try{
 const f=await fixture(),p=f.page
 const prompt=p.getByLabel('Hazır maskeleme promptu',{exact:true});try{await prompt.waitFor({timeout:10000})}catch(error){console.error(await p.locator('body').innerText());await p.screenshot({path:out+'/failure.png',fullPage:true});throw error}
 assert.match(await prompt.inputValue(),/Tam tuval: 113 × 67/);assert.match(await prompt.inputValue(),/Kaynak sürümü: 1/)
 assert.doesNotMatch(await prompt.inputValue(),/Seçili renk:|Ürün \/ varyant kimliği:|1333 × 2000/)
 assert.match(await prompt.inputValue(),/Yeni bir ürün fotoğrafı üretme/)
 assert.match(await prompt.inputValue(),/Logo konturunu güvenilir biçimde ayıramıyorsan/)
 assert.match(await prompt.inputValue(),/Maske tuvali fotoğraf tuvaliyle birebir aynı: 113 × 67/)
 assert.equal(await p.getByLabel('Önizleme rengi',{exact:true}).count(),0);assert.equal(await p.getByText('Seçilen renklerde onayla',{exact:true}).count(),0)
 const sourceDownload=p.waitForEvent('download');await p.getByRole('button',{name:'Maskeleme için kaynak fotoğrafı indir',exact:true}).click();assert.deepEqual(readFileSync(await (await sourceDownload).path()),f.bytes)
 await p.getByLabel('Maske WebP dosyası').setInputFiles({name:'mask.webp',mimeType:'image/webp',buffer:f.webp})
 p.once('dialog',d=>d.dismiss());await p.getByRole('button',{name:/İkinci ürün/}).click();assert.equal(await p.getByRole('heading',{name:'Tek kaynak test ürünü',exact:true}).count(),1)
 f.failUpload(true);await p.getByRole('button',{name:'WebP maskeyi taslağa yükle',exact:true}).click();await p.getByRole('alert').filter({hasText:'İzole WebP kayıt hatası'}).waitFor();assert.equal(await p.getByLabel('Maske WebP dosyası').evaluate(e=>e.files.length),1)
 f.failUpload(false);await p.getByRole('button',{name:'WebP maskeyi taslağa yükle',exact:true}).click();await p.getByRole('button',{name:'Taslağı onayla',exact:true}).waitFor()
 await p.waitForFunction(()=>!document.querySelector('.surface-decisions .approve').disabled)
 assert.equal(await p.getByLabel('Maske WebP dosyası').evaluate(e=>e.files.length),0)
 await p.getByLabel('Maske içinde örnek desen göster').check()
 assert.equal(await p.locator('.surface-stage canvas').evaluate(c=>{const x=c.getContext('2d');return x.getImageData(0,10,1,1).data[3]===0&&x.getImageData(30,10,1,1).data[3]>0}),true)
 f.failExport(true);await p.getByRole('button',{name:'Taslak WebP maskeyi aç / indir',exact:true}).click();await p.getByRole('alert').filter({hasText:'İzole indirme hatası'}).waitFor()
 f.failExport(false);const exportDownload=p.waitForEvent('download');await p.getByRole('button',{name:'Taslak WebP maskeyi aç / indir',exact:true}).click();assert.deepEqual(readFileSync(await(await exportDownload).path()),f.webp)
 const before=f.writes;p.once('dialog',d=>d.dismiss());await p.getByRole('button',{name:'Taslağı onayla',exact:true}).click();assert.equal(f.writes,before)
 p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Taslağı onayla',exact:true}).click();await p.getByRole('status').filter({hasText:'Maske bu kaynak için onaylandı.'}).waitFor();await p.getByRole('status').filter({hasText:'Yeni tasarımlar bu onaylı yüzeyi kullanır; eski sipariş dosyaları korunur.'}).waitFor()
 const scan=await new AxeBuilder({page:p}).include('.surface-masks').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(scan.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id),[])
 for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:1000});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+width)}
 await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(100)
 await p.screenshot({path:out+'/mask-1440.png',fullPage:true})
 await p.setViewportSize({width:320,height:1100});await p.addStyleTag({content:'.surface-masks,.surface-masks button,.surface-masks input,.surface-masks label,.surface-masks p,.surface-masks select{font-size:24px!important}'})
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'2x overflow');await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(100);await p.screenshot({path:out+'/mask-320-2x.png',fullPage:true})
 f.changeSource();await p.getByRole('button',{name:'Güncel kaydı yükle',exact:true}).click()
 await p.getByText(/Önceki maske korunuyor/).waitFor();assert.match(await prompt.inputValue(),/Tam tuval: 79 × 91/)
 assert.equal(await p.getByRole('button',{name:'Taslağı onayla',exact:true}).isDisabled(),true)
 assert.equal(await p.locator('.surface-stage canvas').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.every(x=>x===0)),true)
 await p.close()
 for(const sourceStatus of ['none','stale']){const x=await fixture({sourceStatus});await x.page.getByRole('alert').filter({hasText:sourceStatus==='none'?'henüz kaydedilmedi':'değişmiş veya kayıp'}).waitFor();assert.equal(await x.page.getByLabel('Maske WebP dosyası').count(),0);assert.equal(x.writes,0);await x.page.close()}
 const missingPhoto=await fixture({photoError:true})
 await missingPhoto.page.getByRole('alert').filter({hasText:'Kaynak fotoğraf önizlemesi açılamadı'}).waitFor()
 assert.equal(await missingPhoto.page.getByRole('button',{name:'Taslağı onayla',exact:true}).isDisabled(),true)
 assert.equal(missingPhoto.writes,0);await missingPhoto.page.close()
 const readonly=await fixture({write:false});await readonly.page.getByLabel('Maske WebP dosyası').waitFor();assert.equal(await readonly.page.getByLabel('Maske WebP dosyası').isDisabled(),true);assert.equal(readonly.writes,0);await readonly.page.close()
 const error=await fixture({loadError:true});await error.page.getByRole('alert').filter({hasText:'İzole maske servisi hatası'}).waitFor();assert.equal(await error.page.getByText('Listelenecek XINOBI U ürünü yok.',{exact:true}).count(),0);await error.page.close()
 console.log('PASS single-source mask upload/approve/export/errors/source-change/permissions/prompt/responsive/axe; no real API writes')
}finally{await browser.close()}
