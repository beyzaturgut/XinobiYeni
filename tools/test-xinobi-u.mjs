import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const api='http://127.0.0.1:5003/api/v1/design-studio';
const fixture = await readFile('apps/web/public/assets/banners/home-slider-2.png');
let generated=0;
const commerce=await (await fetch('http://127.0.0.1:5003/api/v1/local-commerce/state')).json();
// Picks the first personalizable product, so the test does not depend on catalog names. There is no colour step;
// the server picks the product's first photographed variant, which the session reports.
async function startDesign(page){
 const card=page.getByRole('link',{name:/ için tasarım oluştur$/}).first();
 const productName=(await card.getAttribute('aria-label')).replace(/ için tasarım oluştur$/,'');
 assert.ok(commerce.products.some(item=>item.name===productName),'XINOBI U ürünü API kaydında yok: '+productName);
 await card.click();
 await page.waitForURL('**/sorular/**');
 return {productName};
}
try {
 for(const width of [1440,390]){
  console.log(`Kontrol: ${width}px ürün → 5 soru → tasarım → ürün önizlemesi…`);
  const context=await browser.newContext({viewport:{width,height:1000}});
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  // Only provider response is simulated. Sessions/questions are served by the real local API.
  await page.route(api+'/status',route=>route.fulfill({json:{configured:true,questionCount:500,version:'xinobi-u-1'}}));
  const results=new Map();
  await page.route(api+'/sessions/*/generation',async route=>{
   generated++;
   const id=route.request().url().split('/').at(-2);
   const response=await fetch(api+'/sessions/'+id);const session=await response.json();
   const body=route.request().postDataJSON();assert.equal(body.answers.length,5);
   const result={...session,status:'ready',answers:body.answers,imageUrl:`/api/v1/design-studio/sessions/${id}/image`};results.set(id,result);
   await route.fulfill({json:result});
  });
  await page.route(api+'/sessions/*',async route=>{
   const id=route.request().url().split('/').at(-1);
   if(results.has(id))return route.fulfill({json:results.get(id)});
   return route.continue();
  });
  await page.route(api+'/sessions/*/image',route=>route.fulfill({status:200,contentType:'image/png',body:fixture,headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.goto('http://127.0.0.1:3000');
  await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
  const nav=page.locator('header nav').getByRole('link',{name:'XINOBI U',exact:true});
  if(width>650){await nav.first().click()}else{await page.goto('http://127.0.0.1:3000/xinobi-u')}
  await page.getByRole('heading',{name:'Bir ürün. Binlerce olasılık.'}).waitFor();
  const cookieClose=page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}); if(await cookieClose.isVisible())await cookieClose.click();
  const choice=await startDesign(page);
  await page.getByText('Soru 1 / 5',{exact:true}).waitFor();
  const firstId=await page.evaluate(()=>sessionStorage.getItem('xinobi-u-selected-session'));
  const axes=new Set();
  for(let step=1;step<=5;step++){
   assert.equal(await page.getByRole('radio').count(),4);
   const selected = await page.getByRole('radio').first().getAttribute('name');
   axes.add(selected.split('-')[0]);
   await page.locator('fieldset label').first().click();
   await page.getByRole('button',{name:step===5?'Tercihlerimi gör →':'Devam et →',exact:true}).click();
   if(step<5)await page.getByText(`Soru ${step+1} / 5`,{exact:true}).waitFor();
  }
  assert.equal(axes.size,5);
  await page.getByRole('heading',{name:'Birlikte şekillenen beş tercih.'}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
  await page.getByText('Soru 1 / 5',{exact:true}).waitFor();
  assert.equal(await page.getByRole('radio').first().isChecked(),true);
  for(let step=1;step<=5;step++)await page.getByRole('button',{name:step===5?'Tercihlerimi gör →':'Devam et →',exact:true}).click();
  await page.getByRole('button',{name:'AI ile tasarımımı oluştur ✦',exact:true}).click();
  await page.getByRole('heading',{name:'İşte sana özel yorum.'}).waitFor();
  await page.getByRole('button',{name:'Ürünümde dene ↗',exact:true}).click();
  await page.getByRole('img',{name:new RegExp(`^${choice.productName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')} .+ üzerinde AI tasarımının dijital önizlemesi$`)}).waitFor();
  assert.equal(await page.locator('canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0),true);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Ürün önizlemesini indir',exact:true}).click();assert.equal((await download).suggestedFilename(),'xinobi-u-urun-onizlemesi.png');
  await page.screenshot({path:`/tmp/xinobi-u-preview-${width}.png`,fullPage:true});
  await page.goto('http://127.0.0.1:3000/xinobi-u');
  await startDesign(page);
  await page.getByText('Soru 1 / 5',{exact:true}).waitFor();
  const nextId=await page.evaluate(()=>sessionStorage.getItem('xinobi-u-selected-session'));assert.notEqual(nextId,firstId);
  assert.deepEqual(errors,[]);
  await context.close();
 }
 assert.equal(generated,2);
 console.log('PASS: Masaüstü/mobil ürün seçimi, 5×4 soru, yanıt kalıcılığı, tek üretim eylemi, perspektifli ürün önizlemesi, PNG indirme ve yeni oturum. Sağlayıcı çıktısı test verisiyle simüle edildi; gerçek ücretli çağrı yapılmadı.');
}finally{await browser.close()}
