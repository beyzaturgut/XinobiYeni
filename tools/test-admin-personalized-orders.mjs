// Synthetic API responses only: no customer, SQL, email or provider request is sent.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(new URL('../apps/web/package.json',import.meta.url))('@playwright/test');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/';
const money={amountMinor:10000,currency:'TRY'};
const placement={sourceWidth:100,sourceHeight:100,surfaceVersion:'a'.repeat(64),x:25,y:35,scale:1.2,rotation:15,curvatureStrength:.4,mode:'artwork',fillMask:false,bodyAdjustments:{'upper-body':{x:2,y:3,scale:.8,rotation:4}}};
const make=(id,kind,legacy=false)=>({accountId:'account',customerName:'Synthetic',customerEmail:'test@example.invalid',order:{id,number:'UX-'+id,createdAt:'2026-10-22T10:00:00Z',status:'received',address:{fullName:'Synthetic',phone:'+905321234567',line:'Synthetic address',district:'Test',city:'Test'},lines:[{productId:'P',variantId:'V',name:'Test product',color:'Blue',quantity:2,unitPrice:money,lineTotal:money,...(kind?{personalization:{designId:'D',name:'Test design',kind,imageUrl:'/api/v1/local-commerce/orders/'+id+'/lines/0/design',...(legacy?{}:{placement,schemaVersion:1,configurationId:'C',configurationRevision:2,sourceSha256:'b'.repeat(64),sku:'TEST-SKU'})}}:{})}],total:money}});
const orders=[make('AI','ai'),make('UPLOAD','upload'),make('PLAIN'),make('OLD','upload',true)];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(10000);let writes=0;
 page.on('pageerror',error=>console.error('Browser error:',error.message));
 await page.route('**/api/**',route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname;
  if(req.method()!=='GET'){writes++;return route.fulfill({status:403,json:{title:'Read-only test'}})}
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['orders.read']}});
  if(path.endsWith('/state'))return route.fulfill({json:{products:[],prices:{},categories:[],content:{slides:[],xinobiBanner:'',buttonColor:'#000000'}}});
  if(path.endsWith('/orders'))return route.fulfill({json:orders});
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['Test carrier'],returnWindowDays:14}});
  if(path.endsWith('/lines/0/pattern'))return route.fulfill({body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=','base64'),contentType:'image/png',headers:{'Access-Control-Expose-Headers':'Content-Disposition','Content-Disposition':'attachment; filename=xinobi-UX-AI-satir-1-desen-rev2.png'}});
  if(path.endsWith('/design'))return route.fulfill({body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=','base64'),contentType:'image/png',headers:{'Access-Control-Expose-Headers':'Content-Disposition','Content-Disposition':'attachment; filename="xinobi-AI-0-source.png"'}});
  return route.fulfill({status:404,json:{title:'Synthetic unavailable'}});
 });
 await page.goto(base+'?view=orders');
 const list=page.getByRole('region',{name:'Sipariş listesi'});
 await list.getByRole('button',{name:'UX-AI detayını aç'}).waitFor();
 for(const [kind,count] of [['personalized',3],['ai',1],['upload',2],['all',4]]){await page.getByRole('combobox',{name:'Kişiselleştirme',exact:true}).selectOption(kind);assert.equal(await list.locator('tbody tr').count(),count)}
 await list.getByRole('button',{name:'UX-AI detayını aç'}).click();
 const detail=page.getByRole('region',{name:'Sipariş tasarım detayı · 1. satır'});
 await detail.getByRole('region',{name:'Sipariş ve ürün bilgileri'}).getByText('TEST-SKU',{exact:true}).waitFor();
 await detail.getByRole('region',{name:'Kayıtlı yerleşim'}).getByText('Yatay konum (desen merkezi)',{exact:true}).waitFor();
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Ham deseni indir',exact:true}).click();
 assert.equal((await downloadPromise).suggestedFilename(),'xinobi-UX-AI-satir-1-desen-rev2.png');
 await page.getByRole('button',{name:'Sipariş detayını kapat'}).click();
 await list.getByRole('button',{name:'UX-OLD detayını aç'}).click();
 await page.getByText(/Bu eski siparişte yerleşim ayarları kaydedilmemiş/).waitFor();
 assert.equal(writes,0);await browser.close();
 console.log('PASS: personalized/AI/upload filters, stored placement/SKU, protected download link, legacy explanation, read-only UI');
}finally{await browser.close()}
