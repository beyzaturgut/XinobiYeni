/** WEB-02: public catalogue GETs + isolated browser cart; no account/order/provider writes.
 * node apps/web/tests/product-detail-acceptance.mjs
 */
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.WEB02_BASE_URL||'http://127.0.0.1:3000',api=process.env.WEB02_CATALOG_URL||'http://127.0.0.1:5003/api/v1/local-commerce/state';
const output=process.env.WEB02_OUTPUT_DIR||'/tmp/xinobi-web02';await mkdir(output,{recursive:true});
const response=await fetch(api);assert(response.ok);const live=await response.json(),products=live.products.filter(p=>p.active);
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const close=async p=>{const b=p.getByRole('button',{name:'Çerez tercih panelini kapat'});if(await b.count())await b.click()};
const money=p=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(p/100);
const results=[];
try{
 for(const width of [390,768,1440]){
  console.log('Real catalogue',width);const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();page.setDefaultTimeout(15000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/v1/**',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.fulfill({status:401,json:{title:'Read-only acceptance'}}));
  let checked=0;
  for(const p of products){
   await page.goto(base+'/urunler/detay/?id='+encodeURIComponent(p.id),{waitUntil:'domcontentloaded'});await close(page);
   await expect(page.getByRole('heading',{name:p.name,exact:true})).toBeVisible();const info=page.getByRole('region',{name:'Ürün bilgileri'});
   if(p.description){await page.getByRole('button',{name:'Ürün açıklaması',exact:true}).click();await expect(page.getByRole('region',{name:'Ürün açıklaması',exact:true})).toContainText(p.description)}
   if(p.specs?.length){await page.getByRole('button',{name:'Teknik özellikler',exact:true}).click();for(const spec of p.specs)await expect(page.getByRole('region',{name:'Teknik özellikler',exact:true})).toContainText(spec.value)}
   await expect(page.getByRole('heading',{name:'Müşteri değerlendirmeleri',exact:true})).toBeVisible();
   for(const v of p.variants){
    await page.getByRole('button',{name:v.color+' rengini seç',exact:true}).click();await expect(page).toHaveURL(new RegExp('variant='+encodeURIComponent(v.id)));
    await expect(info.getByText('SKU: '+v.sku,{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:v.color+' rengini seç',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.evaluate(()=>{localStorage.removeItem('xinobi-cart-v1');window.dispatchEvent(new Event('xinobi-cart-changed'))});
    const price=live.prices[v.id];
    if(Number.isSafeInteger(price)&&price>0&&v.stock>0){await expect(info.getByText(money(price),{exact:true})).toBeVisible();await info.getByRole('button',{name:'Sepete ekle',exact:true}).click();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')||'[]'))).toEqual([{productId:p.id,variantId:v.id,quantity:1}]);}
    else await expect(info.getByRole('button',{name:v.stock>0?'Fiyat bilgisi bekleniyor':'Stokta yok',exact:true})).toBeDisabled();
    if(v.image){const gallery=page.getByRole('region',{name:p.name+' görselleri'});await expect(gallery.locator('img[loading="eager"]:not([aria-hidden="true"])')).toHaveAttribute('src',new RegExp(v.image.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));await expect.poll(()=>gallery.locator('img[loading="eager"]:not([aria-hidden="true"])').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true)}
    checked++;
   }
   if(p===products[0]){
    const v=p.variants.at(-1);await page.reload();await close(page);await expect(page.getByRole('button',{name:v.color+' rengini seç',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect.poll(()=>page.locator('img[loading="eager"]:not([aria-hidden="true"])').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    await page.screenshot({path:`${output}/detail-${width}.png`,fullPage:false});
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
  }
  assert.deepEqual(errors,[]);results.push({width,products:products.length,variants:checked,result:'PASS'});await context.close();
 }
 // All faults below are synthetic GET responses, never writes to the real catalogue.
 const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage();page.setDefaultTimeout(15000);
 let state=structuredClone(live),fail=false;
 await page.route('**/api/v1/**',r=>{
  const req=r.request(),path=new URL(req.url()).pathname;
  if(!['GET','HEAD','OPTIONS'].includes(req.method()))return r.fulfill({status:401,json:{title:'Read-only acceptance'}});
  if(/\/(local-commerce\/state|catalog\/storefront)$/.test(path))return fail?r.fulfill({status:503,json:{title:'Synthetic outage'}}):r.fulfill({json:state});
  if(path.startsWith('/api/v1/dev/'))return r.fulfill({status:404});
  return r.continue();
 });
 await page.route('**/assets/product-previews/**/inputs.json',r=>r.fulfill({status:404}));
 const template=state.products[0],id=template.id,v=template.variants[0];
 const goto=async variant=>{await page.goto(base+'/urunler/detay/?id='+encodeURIComponent(id)+(variant?'&variant='+encodeURIComponent(variant):''));await close(page)};
 await goto('WEB02-removed-variant');await expect(page.getByRole('heading',{name:'Bu renk şu anda kullanılamıyor.'})).toBeVisible();await expect(page.getByRole('button',{name:'Sepete ekle',exact:true})).toHaveCount(0);
 for(const price of [undefined,0,-1,1.5]){state.prices[v.id]=price;await goto(v.id);await expect(page.getByRole('button',{name:'Fiyat bilgisi bekleniyor',exact:true})).toBeDisabled()}
 state.prices[v.id]=10000;v.stock=0;await goto(v.id);await expect(page.getByRole('button',{name:'Stokta yok',exact:true})).toBeDisabled();
 v.stock=3;await goto(v.id);await page.getByRole('button',{name:'Artır',exact:true}).click();await page.getByRole('button',{name:'Artır',exact:true}).click();await expect(page.getByRole('button',{name:'Artır',exact:true})).toBeDisabled();v.stock=1;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.getByRole('group',{name:'Adet'}).locator('span')).toHaveText('1');
 await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'stok sınırına ulaştı'})).toBeVisible();
 fail=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.getByRole('heading',{name:'Ürün şu anda yüklenemiyor.'})).toBeVisible();await expect(page.getByRole('button',{name:'Sepete ekle',exact:true})).toHaveCount(0);fail=false;await page.getByRole('button',{name:'Ürünü yeniden yükle'}).click();await expect(page.getByRole('heading',{name:template.name,exact:true})).toBeVisible();
 const bad='/assets/WEB02-missing-image.webp';template.originalImage=bad;v.image=bad;await page.route('**/WEB02-missing-image.webp',r=>r.fulfill({status:404}));await goto(v.id);await expect(page.getByRole('status').filter({hasText:'Bu görsel şu anda yüklenemiyor.'})).toBeVisible();
 template.active=false;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.getByText('Bu ürün şu anda yayında değil.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Sepete ekle',exact:true})).toHaveCount(0);
 results.push({edgeCases:'invalid colour/price, zero stock, stock shrink, cart stock limit, outage/retry, broken image, inactive product',result:'PASS'});await context.close();
 await writeFile(output+'/results.json',JSON.stringify({at:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
