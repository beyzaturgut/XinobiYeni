// Production admin on a non-loopback HTTP origin. All API writes are mocked.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(path.resolve('apps/web/package.json'));
const {chromium}=require('@playwright/test');
const root=path.resolve('apps/admin/dist');
const state={products:[],categories:['Test kategorisi'],prices:{},content:{slides:[]},announcements:[]};
const writes=[],errors=[];
let uploaded=false;
const photo=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const media='/api/v1/local-commerce/media/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();page.setDefaultTimeout(8000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://xinobi-http.test/**',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.pathname==='/api/v1/admin/session')return route.fulfill({json:{account:{name:'Test Admin'},permissions:['reports.read','catalog.read','catalog.write','pricing.write','media.write']}});
  if(url.pathname===media)return route.fulfill({body:photo,contentType:'image/png'});
  if(url.pathname==='/api/v1/local-commerce/media'&&request.method()==='POST'){
   assert.equal(request.headers()['x-xinobi-csrf'],'1');
   uploaded=true;return route.fulfill({json:{src:media}});
  }
  if(url.pathname.startsWith('/api/v1/local-commerce/')){
   if(request.method()==='PUT'){
    const body=request.postDataJSON();writes.push({path:url.pathname,body});
    if(url.pathname.includes('/products/'))state.products=[body];
    if(url.pathname.includes('/prices/'))state.prices[url.pathname.split('/').at(-1)]=body.cents;
   }
   return route.fulfill({json:state});
  }
  let file=path.resolve(root,'.'+url.pathname.replace(/^\/admin/,'')||'.');
  if(file!==root&&!file.startsWith(root+path.sep))return route.fulfill({status:404});
  if(url.pathname.endsWith('/'))file=path.join(file,'index.html');
  try{return route.fulfill({body:await readFile(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});}
  catch{return route.fulfill({status:404});}
 });
 await page.goto('http://xinobi-http.test/admin/');
 assert.equal(await page.evaluate(()=>isSecureContext),false);
 assert.equal(await page.evaluate(()=>typeof crypto.randomUUID),'undefined');
 await page.getByRole('button',{name:/^Ürünler/}).click();
 await page.getByRole('button',{name:'Çalışma alanını aç',exact:true}).click();
 await page.getByRole('button',{name:'Yeni ürün',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Ürün taslağı'});
 await dialog.waitFor();
 await dialog.getByLabel('Ürün adı',{exact:true}).fill('HTTP test ürünü');
 await dialog.getByLabel('Web’de aktif',{exact:true}).check();
 await dialog.getByRole('button',{name:'Stok ve varyant',exact:true}).click();
 await dialog.getByRole('button',{name:'Varyant ekle',exact:true}).click();
 await dialog.getByLabel('SKU',{exact:true}).fill('HTTP-TEST-1');
 await dialog.getByLabel('Renk',{exact:true}).fill('Beyaz');
 await dialog.getByLabel('Stok',{exact:true}).fill('7');
 await dialog.getByLabel('HTTP-TEST-1 satış fiyatı (TL)').fill('2499,90');
 await dialog.getByRole('button',{name:'Medya',exact:true}).click();
 await dialog.getByLabel('Orijinal ürün görseli yükle',{exact:true}).setInputFiles({name:'test.png',mimeType:'image/png',buffer:photo});
 await dialog.locator('.original-product-media img').waitFor();
 await dialog.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();
 await dialog.waitFor({state:'hidden'});
 assert.equal(writes.length,2);
 const product=writes[0].body;
 assert.match(product.id,/^DEMO-[a-f0-9-]{36}$/);
 assert.match(product.variants[0].id,/^DEMO-V-[a-f0-9-]{36}$/);
 assert.equal(product.variants[0].stock,7);
 assert.equal(uploaded,true);
 assert.equal(product.originalImage,media);
 assert.equal(writes[1].body.cents,249990);
 assert.deepEqual(errors,[]);
 console.log('PASS: non-secure HTTP creates a product and variant, uploads a photo, and saves stock and price without randomUUID.');
}finally{await browser.close();}
