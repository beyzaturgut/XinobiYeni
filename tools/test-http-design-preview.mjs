// Real static export on insecure HTTP, mocked session/provider responses, real published preview assets.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {globSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(path.resolve('apps/web/package.json'));
const {chromium}=require('@playwright/test');
const root=path.resolve('apps/web/out');
const bundle=JSON.parse(await readFile(globSync('apps/web/out/assets/product-previews/*/*/inputs.json')[0],'utf8'));
const product=bundle.productReference,variant=bundle.variantReference;
const id='abcdef123456';
const session={id,status:'ready',product:{id:product,name:'HTTP Preview Product'},variant:{id:variant,color:'Test',image:bundle.sourceImage},questions:[],answers:[],imageUrl:`/api/v1/design-studio/sessions/${id}/image`};
const types={'.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
let created=0,patternReads=0,privateCatalogReads=0;
const errors=[];
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(20000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://xinobi-mobile.test/**',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.pathname==='/api/v1/design-studio/sessions'&&request.method()==='POST'){
   const body=request.postDataJSON();assert.equal(body.productId,product);assert.equal(body.variantId,variant);
   assert.match(body.browserId,/^[a-f0-9-]{36}$/);created++;
   return route.fulfill({json:session});
  }
  if(url.pathname===`/api/v1/design-studio/sessions/${id}`)return route.fulfill({json:session});
  if(url.pathname===`/api/v1/xinobi-u/sessions/${id}`)return route.fulfill({json:{...session,imageUrl:`/api/v1/xinobi-u/sessions/${id}/image`}});
  if(url.pathname===`/api/v1/design-studio/sessions/${id}/image`||url.pathname===`/api/v1/xinobi-u/sessions/${id}/image`){
   patternReads++;return route.fulfill({body:await readFile(path.join(root,'assets/personalization/sample-pattern.png')),contentType:'image/png'});
  }
  if(url.pathname==='/api/v1/design-studio/status')return route.fulfill({json:{configured:true}});
  if(url.pathname===`/api/v1/catalog/products/${product}`)return route.fulfill({json:{id:product,variants:[{id:variant,imageUrl:bundle.sourceImage}]}});
  if(url.pathname==='/api/v1/catalog/storefront')return route.fulfill({json:{products:[{id:product,name:'HTTP Preview Product',category:'Test',active:true,variants:[session.variant]}],prices:{},categories:['Test'],content:{slides:[]}}});
  if(url.pathname==='/api/v1/local-commerce/state')privateCatalogReads++;
  if(url.pathname.startsWith('/api/'))return route.fulfill({status:401,json:{code:'unauthorized'}});
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep))return route.fulfill({status:404});
  if(url.pathname.endsWith('/')||!path.extname(file))file=path.join(file,'index.html');
  try{return route.fulfill({body:await readFile(file),contentType:types[path.extname(file)]||'text/html'});}
  catch{return route.fulfill({status:404});}
 });
 await page.goto(`http://xinobi-mobile.test/xinobi-u/sorular/?product=${product}&variant=${variant}`);
 assert.equal(await page.evaluate(()=>isSecureContext),false);
 assert.equal(await page.evaluate(()=>typeof crypto.randomUUID),'undefined');
 await page.getByRole('heading',{name:'İşte sana özel yorum.'}).waitFor();
 assert.equal(created,1);
 const consent=page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true});
 await consent.waitFor();await consent.click();
 const previewButton=page.getByRole('button',{name:'Üründe gelişmiş önizlemeyi aç'});
 await previewButton.click();
 await page.locator('canvas[role=img]').first().waitFor();
 assert.equal(privateCatalogReads,0);
 await page.waitForFunction(()=>{const c=document.querySelector('canvas[role=img]');return c instanceof HTMLCanvasElement&&c.width>0&&c.height>0&&c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v!==0);});
 assert.ok(patternReads>0);
 const before=await page.locator('canvas[role=img]').first().evaluate(canvas=>canvas.toDataURL());
 await page.locator('#pattern-scale').fill('1.5');
 await page.waitForFunction(previous=>document.querySelector('canvas[role=img]')?.toDataURL()!==previous,before);
 await page.goto(`http://xinobi-mobile.test/xinobi-u/mobil-onizleme/?session=${id}`);
 await page.locator('canvas[role=img]').first().waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: HTTP creates an AI session without randomUUID and renders the generated-pattern product canvas on web and mobile preview routes.');
}finally{await browser.close();}
