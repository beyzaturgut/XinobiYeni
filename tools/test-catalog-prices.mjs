import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('tests/fixtures/demo-commerce.json','utf8'));
const product=state.products[0],variant=product.variants[0];
state.prices[variant.id]=100000;variant.stock=5;
let productWrites=0,priceWrites=0,failPrice=false;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const admin=await browser.newPage();admin.setDefaultTimeout(15000);
 await admin.route('**/api/v1/local-commerce/state',r=>r.fulfill({json:state}));
 await admin.route('**/api/v1/local-commerce/products/*',r=>{
  const draft=r.request().postDataJSON();productWrites++;
  state.products=state.products.some(p=>p.id===draft.id)?state.products.map(p=>p.id===draft.id?draft:p):[...state.products,draft];
  return r.fulfill({json:state});
 });
 await admin.route('**/api/v1/local-commerce/prices/*',r=>{
  const id=decodeURIComponent(new URL(r.request().url()).pathname.split('/').at(-1));
  if(failPrice)return r.fulfill({status:503,json:{message:'Fiyat servisi geçici olarak kullanılamıyor.'}});
  assert.ok(state.products.some(p=>p.variants.some(v=>v.id===id)),'Product must be saved before new variant price');
  priceWrites++;state.prices[id]=r.request().postDataJSON().cents;return r.fulfill({json:state});
 });
 await admin.goto('http://127.0.0.1:5173');await admin.getByRole('button',{name:'Katalog',exact:true}).click();
 await admin.getByRole('button',{name:product.name+' ürününü düzenle',exact:true}).click();
 const dialog=admin.getByRole('dialog');await dialog.getByRole('button',{name:'Stok ve varyant',exact:true}).click();
 const price=dialog.getByLabel(variant.sku+' satış fiyatı (TL)',{exact:true});
 assert.equal(await price.inputValue(),'1000.00');
 for(const value of ['0','-1','12,345','10000000','']){
  await price.fill(value);await dialog.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();
  await dialog.getByRole('alert').waitFor();assert.equal(productWrites,0);assert.equal(priceWrites,0);
 }
 await price.fill('2499,90');await dialog.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();
 await dialog.waitFor({state:'hidden'});assert.equal(state.prices[variant.id],249990);assert.equal(state.products[0].variants[0].stock,5);
 await admin.reload();await admin.getByRole('button',{name:'Katalog',exact:true}).click();
 await admin.getByRole('button',{name:product.name+' ürününü düzenle',exact:true}).click();await dialog.getByRole('button',{name:'Stok ve varyant',exact:true}).click();
 assert.equal(await price.inputValue(),'2499.90');
 await price.fill('3000');failPrice=true;await dialog.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();
 await dialog.getByRole('alert').filter({hasText:'Ürün kaydedildi; bazı fiyatlar kaydedilemedi'}).waitFor();
 assert.equal(await price.inputValue(),'3000');failPrice=false;
 await dialog.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(state.prices[variant.id],300000);
 await admin.getByRole('button',{name:'Yeni ürün',exact:true}).click();await dialog.getByLabel('Ürün adı',{exact:true}).fill('Fiyat Test Ürünü');
 await dialog.getByRole('button',{name:'Stok ve varyant',exact:true}).click();await dialog.getByRole('button',{name:'Varyant ekle',exact:true}).click();
 await dialog.getByLabel('SKU',{exact:true}).fill('TEST-PRICE-SKU');await dialog.getByLabel('Renk',{exact:true}).fill('Mavi');
 await dialog.getByLabel('TEST-PRICE-SKU satış fiyatı (TL)',{exact:true}).fill('99.99');
 await dialog.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();await dialog.waitFor({state:'hidden'});
 const created=state.products.find(p=>p.name==='Fiyat Test Ürünü');assert.equal(state.prices[created.variants[0].id],9999);
 const web=await browser.newPage();web.setDefaultTimeout(15000);await web.route('**/api/v1/local-commerce/state',r=>r.fulfill({json:state}));
 await web.goto('http://127.0.0.1:3000/urunler/detay?id='+product.id);await web.getByText('₺3.000,00',{exact:true}).first().waitFor();
 console.log('PASS: variant price input, comma decimals, invalid values, new variants, persistence, partial failure/retry, web price; no local user records modified.');
}finally{await browser.close();}
