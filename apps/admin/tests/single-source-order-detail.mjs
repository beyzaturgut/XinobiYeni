// All data/bytes are synthetic; context guard blocks every unmocked API and external host.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {mkdir} from 'node:fs/promises'
import {mockPanel} from './consistency-fixtures.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium,expect}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default
const sharp=createRequire(require.resolve('next/package.json'))('sharp')
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/'
const output=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-task10-admin';await mkdir(output,{recursive:true})
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
const make=async(width,height,background,jpeg=false)=>{const image=sharp({create:{width,height,channels:3,background}});return jpeg?image.jpeg().toBuffer():image.png().toBuffer()}
const bytes={pattern:await make(19,13,'#d95555'),source:await make(7001,7,'#999999'),composition:await make(301,151,'#008888',true)}
const files=Object.fromEntries(Object.entries(bytes).map(([role,value])=>[role==='source'?'productSource':role,{sha256:hash(value),mime:role==='composition'?'image/jpeg':'image/png',bytes:value.length}]))
const binding={productId:'P-SYN',profileRevision:9,sourceRevision:7,surfaceId:'source-7-mask-'+'c'.repeat(32),productSourceSha256:hash(bytes.source),maskSha256:'b'.repeat(64),width:7001,height:7,fulfillmentVariantId:'V-SYN'}
const personalization={designId:'D-SYN',kind:'upload',name:'Tek kaynak deseni',mime:'image/png',imageUrl:'/api/v1/local-commerce/orders/SINGLE/lines/0/design',sku:'SYN-SKU',schemaVersion:2,configurationId:'d'.repeat(32),configurationRevision:3,sourceSha256:hash(bytes.pattern),surfaceBinding:binding,files,placement:{sourceWidth:7001,sourceHeight:7,surfaceVersion:binding.maskSha256,x:3500,y:3,scale:1.2,rotation:15,curvatureStrength:.4,mode:'pattern',fillMask:true}}
const money={amountMinor:250000,currency:'TRY'}
async function fixture(width=390,bad=false,scale=1.2){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[],requests=[];let writes=0,fail={}
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000)
 const saved={...personalization,placement:{...personalization.placement,scale}}
 const order={accountId:'synthetic',customerName:'Synthetic owner',customerEmail:'owner@example.invalid',order:{id:'SINGLE',number:'SYN-SINGLE',createdAt:'2026-11-09T10:00:00Z',status:'received',total:money,address:{title:'Test',fullName:'Synthetic',phone:'',line:'Synthetic',city:'Test',district:'Test'},requests:[],history:[],lines:[
  {productId:'P-SYN',variantId:'V-SYN',name:'Tek kaynaklı ürün',color:'GİZLİ-TİCARİ-RENK',quantity:1,unitPrice:money,lineTotal:money,personalization:bad?{...saved,surfaceBinding:{...binding,width:7000}}:saved},
  {productId:'P-OLD',variantId:'V-OLD',name:'Eski ürün',color:'Eski Lacivert',quantity:1,unitPrice:money,lineTotal:money,personalization:{...personalization,schemaVersion:1,surfaceBinding:null,imageUrl:'/api/v1/local-commerce/orders/SINGLE/lines/1/design',placement:{...personalization.placement,sourceWidth:100,sourceHeight:100}}},
  {productId:'P-NORMAL',variantId:'V-NORMAL',name:'Normal ürün',color:'Standart Beyaz',quantity:1,unitPrice:money,lineTotal:money},
 ]}}
 await mockPanel(page,{permissions:['orders.read'],handler:async(route,path)=>{
  if(route.request().method()!=='GET'){writes++;return false}
  requests.push(path)
  if(path.endsWith('/local-commerce/orders')){await route.fulfill({json:[order]});return true}
  if(path.endsWith('/design')){await route.fulfill({body:bytes.pattern,contentType:'image/png'});return true}
  const match=/\/lines\/(\d+)\/(pattern|source|composition)$/.exec(path)
  if(match){const kind=match[2],status=fail[kind];if(status)await route.fulfill({status,json:{code:'synthetic_error',message:'İzole indirme hatası'}});else await route.fulfill({body:bytes[kind],contentType:kind==='composition'?'image/jpeg':'image/png',headers:{'Access-Control-Expose-Headers':'Content-Disposition, X-Xinobi-File-Check','Content-Disposition':`attachment; filename=xinobi-SYN-SINGLE-satir-${Number(match[1])+1}-${kind}.`+(kind==='composition'?'jpg':'png'),'X-Xinobi-File-Check':'sha256'}});return true}
  return false
 }})
 await page.goto(base+'?view=orders');await page.getByRole('button',{name:'SYN-SINGLE detayını aç'}).click()
 const detail=page.getByRole('region',{name:'Sipariş tasarım detayı · 1. satır'}),dialog=page.getByRole('dialog')
 await detail.waitFor()
 return{page,detail,dialog,requests,fail:(kind,status)=>{fail[kind]=status},close:async()=>{assert.deepEqual(errors,[]);assert.equal(writes,0);await context.close()}}
}
try{
 for(const width of [320,390,768,1440]){
  const f=await fixture(width),{page,detail,dialog}=f
  await expect(detail).toHaveAttribute('data-source-model','single');await expect(detail.getByText(binding.surfaceId,{exact:true})).toBeVisible()
  await expect(detail.getByText('7.001 × 7 px')).toBeVisible();await expect(detail.getByText('3.500 px')).toBeVisible()
  await expect(detail.getByText('Siparişteki ürün fotoğrafı bu yüzey kaydıyla aynı (SHA-256 eşleşiyor).')).toBeVisible()
  await expect(dialog.getByText('GİZLİ-TİCARİ-RENK',{exact:false})).toHaveCount(0)
  await expect(dialog.getByText('Eski Lacivert',{exact:true})).toBeVisible();await expect(dialog.getByText(/Standart Beyaz/)).toBeVisible()
  for(const [kind,title,label]of [['pattern','Ham desen','Ham deseni indir'],['source','Ürün kaynak görseli','Ürün kaynak görselini indir'],['composition','Giydirilmiş önizleme','Giydirilmiş önizlemeyi indir']]){
   const card=detail.getByRole('article',{name:title});await expect(card.getByRole('button',{name:label,exact:true})).toBeVisible()
   const download=page.waitForEvent('download');const button=card.getByRole('button',{name:label,exact:true});if(width===390){await button.focus();await expect(button).toBeFocused();await page.keyboard.press('Enter')}else await button.click();const file=await download
   assert.deepEqual(readFileSync(await file.path()),bytes[kind]);assert.ok(file.suggestedFilename().includes('satir-1-'+kind))
  }
  if(width===320){await page.evaluate(()=>{const sizes=[...document.querySelectorAll('dialog *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,size]of sizes)e.style.setProperty('font-size',size*2+'px','important')})}
  if(await dialog.evaluate(e=>e.scrollWidth>e.clientWidth+1)){console.error('Overflow',width,await dialog.evaluate(e=>[...e.querySelectorAll('*')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>[n.tagName,n.className,n.clientWidth,n.scrollWidth,n.textContent.slice(0,100)]).slice(-15)));await page.screenshot({path:output+'/overflow.png',fullPage:true});throw Error('Dialog overflow '+width)}
  if(width===390){const axe=await new AxeBuilder({page}).include('dialog[open]').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(axe.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id),[]);await detail.getByRole('heading',{level:3}).scrollIntoViewIfNeeded();await page.screenshot({path:output+'/single-source-order-390.png',fullPage:true})}
  if(width===1440){await detail.getByRole('heading',{name:'Görseller',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:output+'/single-source-order-files-1440.png',fullPage:true})}
  assert.equal(await dialog.getByRole('button',{name:/üretim|baskıya|kalibrasyon/i}).count(),0)
  await f.close()
 }
 const f=await fixture(),{detail,page}=f
 f.fail('source',404);await detail.getByRole('button',{name:'Ürün kaynak görselini indir',exact:true}).click();await expect(detail.getByRole('alert').filter({hasText:'ürün kaynak görseli bulunamadı'})).toBeVisible()
 await expect(detail.getByRole('button',{name:'Ürün kaynak görselini indir',exact:true})).toHaveCount(0)
 f.fail('composition',503);const card=detail.getByRole('article',{name:'Giydirilmiş önizleme'});await card.getByRole('button',{name:'Giydirilmiş önizlemeyi indir',exact:true}).click();await expect(card.getByRole('alert')).toContainText('şu anda indirilemedi')
 f.fail('composition',0);const retry=page.waitForEvent('download');await card.getByRole('button',{name:'İndirmeyi tekrar dene',exact:true}).click();await retry
 await expect(card.getByRole('status')).toContainText('tarayıcıya indirme için verildi');await f.close()
 const tiny=await fixture(390,false,.000001);await expect(tiny.detail.getByText('0,000001 kat')).toBeVisible();await tiny.close()
 const bad=await fixture(390,true);await expect(bad.detail.getByRole('alert').filter({hasText:'Tek kaynak yüzeyi ile kayıtlı yerleşim eşleşmesi doğrulanamıyor'})).toBeVisible();await expect(bad.detail.getByText('Yatay konum (desen merkezi)',{exact:true})).toHaveCount(0);await bad.close()
 console.log('PASS schema-2 source/hash/revision/raw canvas, separate exact 3 downloads, no commercial colour, legacy/normal colours retained, 320/390/768/1440 + 200%, keyboard/axe, 404/503 retry and mismatched snapshot; no writes')
}finally{await browser.close()}
