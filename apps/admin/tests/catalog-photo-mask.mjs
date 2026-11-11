import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {mkdir} from 'node:fs/promises'
import {mockPanel} from './consistency-fixtures.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/',out=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-catalog-photo-mask'
await mkdir(out,{recursive:true})
try{
 for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1100}}),page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>console.error(e.message));console.log('start',width)
 const encoded=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=113;c.height=67;const x=c.getContext('2d');x.fillStyle='#777';x.fillRect(0,0,113,67);const source=c.toDataURL('image/png');x.clearRect(0,0,113,67);x.fillStyle='white';x.fillRect(20,0,60,67);return {source,mask:c.toDataURL('image/png'),webp:c.toDataURL('image/webp')}})
 const bytes=Buffer.from(encoded.source.split(',')[1],'base64'),png=Buffer.from(encoded.mask.split(',')[1],'base64'),webp=Buffer.from(encoded.webp.split(',')[1],'base64'),sha=b=>createHash('sha256').update(b).digest('hex')
 const path='/api/v1/local-commerce/surfaces/products/P1',image='/api/v1/local-commerce/media/'+'b'.repeat(32)+'.png',photo={image,sha256:sha(bytes),mime:'image/png',bytes:bytes.length,width:113,height:67}
 let selected='V1',writes=0;let detail={productId:'P1',productName:'Katalog fotoğrafı test ürünü',profileRevision:0,sourceRevision:0,sourceStatus:'ready',source:photo,status:'none',draft:null,approved:null,catalogPhotoId:selected,catalogPhotos:[{id:'V1',label:'Fotoğraf 1 · SKU1',image},{id:'V2',label:'Fotoğraf 2 · SKU2',image}]}
 await mockPanel(page,{handler:async(route,url)=>{
  if(url.includes('/personalization-sources/'))throw new Error('Separate source registration must never be requested')
  if(url===image){await route.fulfill({contentType:'image/png',body:bytes});return true}
  if(url===path+'/masks/D1.png'){await route.fulfill({contentType:'image/png',body:png});return true}
  if(!url.startsWith('/api/v1/local-commerce/surfaces/products'))return false
  const request=route.request()
  if(request.method()==='POST'){
   writes++;const b=request.postDataJSON();assert.equal(b.colors,undefined);assert.equal(b.samePlacementConfirmed,undefined)
   if(url.endsWith('/mask')){assert.equal(b.catalogPhotoId,'V2');assert.equal(b.expectedRevision,0);assert.equal(b.sourceRevision,0);detail={...detail,catalogPhotos:null,catalogPhotoId:null,profileRevision:1,sourceRevision:1,status:'draft',draft:{id:'D1',image:path+'/masks/D1.png',sha256:sha(png),sourceSha256:photo.sha256,sourceRevision:1,method:'webp-alpha'}}}
   else if(url.endsWith('/approval')){assert.equal(b.draftId,'D1');assert.equal(b.sourceRevision,1);detail={...detail,status:'approved',profileRevision:2,approved:detail.draft,draft:null}}
   else throw Error('Unexpected write '+url)
  }else if(url===path&&new URL(request.url()).searchParams.has('catalogPhotoId')){selected=new URL(request.url()).searchParams.get('catalogPhotoId');detail={...detail,catalogPhotoId:selected}}
  await route.fulfill({json:url.endsWith('/products')?[detail]:detail});return true
 }})
 console.log('goto',width);await page.goto(base+'?view=surfaces');await page.getByRole('button',{name:/Katalog fotoğrafı test ürünü/}).click()
 console.log('select',width);await page.getByLabel('Maskelenecek ürün fotoğrafı',{exact:true}).selectOption('V2')
 await page.getByLabel('Hazır maskeleme promptu',{exact:true}).waitFor();assert.match(await page.getByLabel('Hazır maskeleme promptu',{exact:true}).inputValue(),/113 × 67/)
 assert.equal(writes,0);assert.equal(await page.getByRole('button',{name:'Kaynak fotoğrafı kaydet',exact:true}).count(),0)
 console.log('download',width);const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Maskeleme için kaynak fotoğrafı indir',exact:true}).click();assert.deepEqual(readFileSync(await(await downloaded).path()),bytes)
 console.log('upload',width);await page.getByLabel('Maske WebP dosyası',{exact:true}).setInputFiles({name:'mask.webp',mimeType:'image/webp',buffer:webp})
 await page.getByRole('button',{name:'WebP maskeyi taslağa yükle',exact:true}).click()
 await page.getByRole('status').filter({hasText:'Maske taslağı kaydedildi.'}).waitFor()
 console.log('waiting approval',width);await page.waitForFunction(()=>!document.querySelector('.surface-decisions .approve').disabled,null,{timeout:10000}).catch(async e=>{console.error(await page.locator('body').innerText());throw e})
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Taslağı onayla',exact:true}).click()
 await page.getByRole('status').filter({hasText:'başka renklere uygulanmaz'}).waitFor();assert.equal(writes,2)
 assert.equal(await page.getByText('Seçilen renklerde onayla',{exact:true}).count(),0)
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
 await page.screenshot({path:out+'/mask-'+width+'.png',fullPage:true});await context.close()
 }
 console.log('PASS existing catalogue photo selection/download/prompt -> upload rev0-to1 -> one-photo approval; no separate source write or bulk-colour approval; 390/1440')
}finally{await browser.close()}
