/** WEB-01: read-only acceptance against the running local web and its real public catalogue.
 * node apps/web/tests/catalog-navigation.mjs
 * Edge cases intercept GETs in the browser only; no catalogue/account write is sent.
 */
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.WEB01_BASE_URL||'http://127.0.0.1:3000';
const api=process.env.WEB01_CATALOG_URL||'http://127.0.0.1:5003/api/v1/local-commerce/state';
const output=process.env.WEB01_OUTPUT_DIR||'/tmp/xinobi-web01';
const response=await fetch(api);assert(response.ok,`Catalogue GET failed: ${response.status}`);
const live=await response.json(),active=live.products.filter(p=>p.active);
assert(active.length>=5,'WEB-01 needs at least five active real products for the four-product limit check.');
const label=name=>({'Çay makineleri':'Çay','Kahve makineleri':'Kahve','Hava temizleme':'Hava','Pişirme teknolojileri':'Pişirme'})[name]||name;
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
console.log('Starting WEB-01 browser acceptance');
const results=[];await mkdir(output,{recursive:true});
const closed=async page=>{const button=page.getByRole('button',{name:'Çerez tercih panelini kapat'});if(await button.count())await button.click()};
const widthOK=async page=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflows horizontally');
try{
 for(const width of [390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(20000);console.log('Viewport',width);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/v1/**',route=>{
   if(!['GET','HEAD','OPTIONS'].includes(route.request().method()))return route.fulfill({status:401,json:{title:'Read-only acceptance'}});
   return route.continue();
  });
  await page.goto(base+'/urunler/',{waitUntil:'domcontentloaded'});await closed(page);
  const catalog=page.getByRole('region',{name:'Ürün kataloğu'});
  await expect(catalog.locator('article')).toHaveCount(active.length);
  const categories=[...new Set([...(live.categories||[]),...active.map(p=>p.category)])];
  for(const category of categories){
   const short=label(category),display=categories.filter(c=>label(c)===short).length>1?category:short;
   await catalog.getByRole('button',{name:display,exact:true}).click();
   await expect.poll(()=>new URL(page.url()).searchParams.get('category')).toBe(category);
   await expect(catalog.locator('article')).toHaveCount(active.filter(p=>p.category===category).length);
  }
  await catalog.getByRole('button',{name:'Tümü',exact:true}).click();
  await catalog.getByLabel('Sırala').selectOption('name');
  await expect(catalog.locator('article h2')).toHaveText([...active].sort((a,b)=>a.name.localeCompare(b.name,'tr')||a.variants.map(v=>v.color).join(', ').localeCompare(b.variants.map(v=>v.color).join(', '),'tr')).map(p=>p.name));
  const chosen=active[0],search=catalog.getByRole('searchbox',{name:'Ürünlerde ara'});
  await search.fill(chosen.name);await catalog.getByLabel('Sırala').selectOption('name');
  await expect(catalog.locator('article')).toHaveCount(active.filter(p=>`${p.name} ${p.category} ${p.variants.map(v=>v.color).join(', ')}`.toLocaleLowerCase('tr-TR').includes(chosen.name.toLocaleLowerCase('tr-TR'))).length);
  const filteredURL=page.url();await page.reload();await closed(page);await expect(search).toHaveValue(chosen.name);await expect(catalog.getByLabel('Sırala')).toHaveValue('name');
  await catalog.locator('article').first().locator('a').first().click();await expect(page).toHaveURL(/\/urunler\/detay/);
  await page.goBack();await closed(page);await expect(search).toHaveValue(chosen.name);assert.equal(page.url(),filteredURL);
  await search.fill('WEB01-no-such-product');await expect(catalog.getByRole('heading',{name:'Aradığınız ürün bulunamadı.'})).toBeVisible();
  await catalog.getByRole('button',{name:'Filtreleri temizle'}).click();await expect(search).toHaveValue('');await expect(catalog.getByLabel('Sırala')).toHaveValue('featured');
  const a=categories[0],b=categories.find(c=>c!==a);
  for(const c of [a,b])await catalog.getByRole('button',{name:categories.filter(x=>label(x)===label(c)).length>1?c:label(c),exact:true}).click();
  await page.goBack();await closed(page);await expect.poll(()=>new URL(page.url()).searchParams.get('category')).toBe(a);
  await page.goForward();await expect.poll(()=>new URL(page.url()).searchParams.get('category')).toBe(b);
  await page.goto(base+'/urunler/?category='+encodeURIComponent('WEB01-removed-category'));await closed(page);await expect(catalog.getByRole('heading',{name:'Bu kategori artık kullanılamıyor.'})).toBeVisible();await expect(catalog.locator('article')).toHaveCount(0);
  await page.goto(base+'/arama/?q='+encodeURIComponent(chosen.name));await closed(page);const global=page.getByRole('searchbox',{name:'Ürün, kategori veya özellik ara'});await expect(global).toHaveValue(chosen.name);await global.press('Escape');await expect(global).toHaveValue('');
  await global.fill(chosen.name);await page.reload();await closed(page);await expect(global).toHaveValue(chosen.name);
  await page.goto(base+'/karsilastir/?view=select');await closed(page);const picker=page.getByRole('region',{name:'Karşılaştırılacak ürünleri seç'});
  const picks=picker.locator('button[aria-pressed]');await expect(picks).toHaveCount(active.length);
  await picks.nth(0).click();await expect(picker.getByRole('button',{name:'Seçilen ürünleri karşılaştır (1)'})).toBeDisabled();
  await picks.nth(1).click();await picker.getByRole('button',{name:'Seçilen ürünleri karşılaştır (2)'}).click();await expect(page.getByRole('region',{name:'Seçilen ürünlerin karşılaştırma tablosu'})).toBeVisible();
  await page.getByRole('button',{name:'Seçimleri düzenle / Bir ürün daha ekle'}).click();await picks.nth(2).click();await picks.nth(3).click();await picks.nth(4).click();await expect(picker.getByRole('status')).toContainText('En fazla 4');
  await picker.getByRole('button',{name:'Seçilen ürünleri karşılaştır (4)'}).click();await widthOK(page);await page.screenshot({path:`${output}/compare-${width}.png`,fullPage:false});
  await page.goto(base+'/urunler/');await closed(page);await expect(page.getByRole('complementary',{name:'Karşılaştırma listesi'}).getByRole('link',{name:'Karşılaştır (4)',exact:true})).toBeVisible();await widthOK(page);await page.screenshot({path:`${output}/catalog-${width}.png`,fullPage:false});
  await page.goto(base+'/karsilastir/?urunler='+[active[0],...active.slice(0,4)].map(p=>encodeURIComponent(p.id)).join(','));await closed(page);await expect(page.getByRole('region',{name:'Seçilen ürünlerin karşılaştırma tablosu'}).locator('thead button')).toHaveCount(4);
  await page.goto(base+'/karsilastir/?urunler='+active.slice(0,3).map(p=>encodeURIComponent(p.id)).join(','));await closed(page);
  await page.getByRole('button',{name:`${active[0].name} ürününü karşılaştırmadan çıkar`,exact:true}).click();await page.reload();await closed(page);await expect(page.getByRole('region',{name:'Seçilen ürünlerin karşılaştırma tablosu'})).toBeVisible();await expect(page.getByRole('button',{name:`${active[0].name} ürününü karşılaştırmadan çıkar`,exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Listeyi temizle',exact:true}).click();await page.reload();await closed(page);await expect(picker.getByRole('status')).toContainText('0 / 4');
  assert.deepEqual(errors,[]);results.push({width,result:'PASS',activeProducts:active.length,categories:categories.length});await context.close();
 }
 // Fault injection and catalogue mutation affect browser GET responses only.
 const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage();
 let mode='delay',snapshot=structuredClone(live),release;
 let blocked=new Promise(resolve=>{release=resolve});
 await page.route('**/api/v1/**',async route=>{
  const req=route.request();if(!['GET','HEAD','OPTIONS'].includes(req.method()))return route.fulfill({status:401,json:{title:'Read-only acceptance'}});
  if(/\/(local-commerce\/state|catalog\/storefront)$/.test(new URL(req.url()).pathname)){
   if(mode==='delay')await blocked;
   return mode==='error'?route.fulfill({status:503,json:{title:'Synthetic catalogue outage'}}):route.fulfill({json:snapshot});
  }
  return route.continue();
 });
 await page.goto(base+'/urunler/',{waitUntil:'domcontentloaded'});await closed(page);const catalog=page.getByRole('region',{name:'Ürün kataloğu'});
 await expect(catalog.getByRole('status')).toHaveText('Katalog yükleniyor…');await expect(catalog.getByRole('heading',{name:'Aradığınız ürün bulunamadı.'})).toHaveCount(0);mode='ok';release();await expect(catalog.locator('article')).toHaveCount(active.length);
 await page.evaluate(ids=>localStorage.setItem('xinobi-compare',JSON.stringify(ids)),active.slice(0,4).map(p=>p.id));
 snapshot.products=snapshot.products.filter(p=>p.id!==active[0].id);snapshot.products.find(p=>p.id===active[1].id).active=false;
 await page.reload();await closed(page);await expect(catalog.locator('article')).toHaveCount(active.length-2);await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-compare')))).toEqual(active.slice(2,4).map(p=>p.id));
 // A failed refresh must hide old stock rather than claiming an empty catalogue or clearing valid selections.
 mode='error';await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(catalog.getByRole('heading',{name:'Ürünler şu anda yüklenemiyor.'})).toBeVisible();await expect(catalog.locator('article')).toHaveCount(0);await expect(catalog.getByText('0 ürün',{exact:true})).toHaveCount(0);await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-compare')))).toEqual(active.slice(2,4).map(p=>p.id));
 mode='ok';await catalog.getByRole('button',{name:'Kataloğu yeniden yükle'}).click();await expect(catalog.locator('article')).toHaveCount(active.length-2);
 for(const [route,retry] of [['/arama/','Aramayı yeniden yükle'],['/karsilastir/','Karşılaştırmayı yeniden yükle']]){
  mode='error';await page.goto(base+route);await closed(page);await expect(page.getByRole('heading',{name:'Ürünler şu anda yüklenemiyor.'})).toBeVisible();mode='ok';await page.getByRole('button',{name:retry}).click();await expect(page.getByRole('heading',{name:'Ürünler şu anda yüklenemiyor.'})).toHaveCount(0);
 }
 snapshot.categories=[...snapshot.categories,'Çay'];snapshot.products.push({...structuredClone(active[0]),id:'WEB01-browser-only',name:'WEB01 ayrı kısa kategori',category:'Çay'});
 await page.goto(base+'/urunler/?category='+encodeURIComponent('Çay'));await closed(page);await expect(catalog.locator('article h2')).toHaveText(['WEB01 ayrı kısa kategori']);await expect(catalog.getByRole('button',{name:'Çay makineleri',exact:true})).toBeVisible();await catalog.getByRole('button',{name:'Çay makineleri',exact:true}).click();await expect(catalog.locator('article')).toHaveCount(snapshot.products.filter(p=>p.active&&p.category==='Çay makineleri').length);
 snapshot={...snapshot,products:[],categories:[]};await page.goto(base+'/urunler/');await closed(page);await expect(catalog.getByRole('heading',{name:'Aradığınız ürün bulunamadı.'})).toBeVisible();await expect(catalog.getByText('0 ürün',{exact:true})).toBeVisible();
 results.push({edgeCases:'loading, empty, outage/retry, removed/inactive products, selection persistence',result:'PASS'});await context.close();
 await writeFile(`${output}/results.json`,JSON.stringify({at:new Date().toISOString(),base,api,results},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
