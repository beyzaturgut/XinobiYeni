// Real static export on insecure HTTP, mocked session/provider responses, real published preview assets.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(path.resolve('apps/web/package.json'));
const {chromium}=require('@playwright/test');
const root=path.resolve('apps/web/out');
const bundle=JSON.parse(await readFile(path.join(root,'assets/product-previews/DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6/DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1/inputs.json'),'utf8'));
const product=bundle.productReference,variant=bundle.variantReference;
const id='abcdef123456';
const session={id,status:'ready',product:{id:product,name:'HTTP Preview Product'},variant:{id:variant,color:'Test',image:bundle.sourceImage,stock:10,sku:'PHOTO-TEST'},questions:[],answers:[],imageUrl:`/api/v1/design-studio/sessions/${id}/image`};
const types={'.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
let created=0,patternReads=0,privateCatalogReads=0,brokenHero=false,signedInFixture=false,uploadedPhoto=null;
const errors=[];
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(20000);
 await page.addInitScript(()=>{const create=URL.createObjectURL;URL.createObjectURL=function(blob){window.__lastPreviewBlob=blob;return create.call(URL,blob);};});
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://xinobi-mobile.test/**',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(brokenHero&&url.pathname===new URL(bundle.inputs.source.url,'http://xinobi-mobile.test').pathname)return route.fulfill({status:404});
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
  if(url.pathname==='/api/v1/catalog/storefront')return route.fulfill({json:{products:[{id:product,name:'HTTP Preview Product',category:'Test',active:true,variants:[session.variant]}],prices:{[variant]:250000},categories:['Test'],content:{slides:[]}}});
  if(url.pathname==='/api/v1/local-commerce/state')privateCatalogReads++;
  if(signedInFixture&&url.pathname==='/api/v1/me')return route.fulfill({json:{id:'customer',name:'Photo Customer',email:'photo@example.invalid'}});
  if(signedInFixture&&url.pathname==='/api/v1/me/designs/upload'){
   // Chromium interception omits multipart file bytes. Reuse the exact prepared Blob observed in the editor.
   assert.ok(uploadedPhoto?.length>0);
   return route.fulfill({json:{id:'photodesign',kind:'upload',name:'Photo test',productId:product,variantId:variant,productName:'HTTP Preview Product',imageUrl:'/api/v1/me/designs/photodesign/image'}});
  }
  if(url.pathname==='/api/v1/me/designs/photodesign/image')return route.fulfill({body:uploadedPhoto,contentType:'image/png'});
  if(signedInFixture&&url.pathname==='/api/v1/me/designs')return route.fulfill({json:[{id:'photodesign',kind:'upload'}]});
  if(signedInFixture&&url.pathname.startsWith('/api/v1/me/'))return route.fulfill({json:url.pathname.endsWith('/inbox')?{items:[],unread:0}:[]});
  if(url.pathname.startsWith('/api/'))return route.fulfill({status:401,json:{code:'unauthorized'}});
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+path.sep))return route.fulfill({status:404});
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
 await page.goto('http://xinobi-mobile.test/');
 const hero=page.getByRole('region',{name:'XINOBI U',exact:true});
 await hero.locator('canvas[role=img]').waitFor();
 assert.equal(await hero.getByRole('alert').count(),0);
 const size=await hero.locator('canvas').evaluate(canvas=>({width:canvas.width,height:canvas.height}));
 const heroScale=Math.min(1,1280/Math.max(bundle.inputs.width,bundle.inputs.height));
 assert.equal(size.width,Math.round(bundle.inputs.width*heroScale));
 assert.equal(size.height,Math.round(bundle.inputs.height*heroScale));
 for(const width of [320,390,430,768,1440]){
  await page.setViewportSize({width,height:844});
  const layout=await hero.locator('canvas').evaluate(canvas=>{
   const frame=canvas.parentElement.parentElement;
   const visual=frame.parentElement;
   const rect=element=>{const r=element.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
   return {image:rect(canvas),frame:rect(frame),questions:rect(visual.querySelector('h3').parentElement),art:rect(visual.querySelector('strong').parentElement),ratio:canvas.width/canvas.height};
  });
  const {image,frame,questions,art,ratio}=layout;
  assert.ok(image.left>=frame.left-1&&image.right<=frame.right+1&&image.top>=frame.top-1&&image.bottom<=frame.bottom+1,`Complete product must fit at ${width}px: ${JSON.stringify(layout)}`);
  assert.ok(Math.abs(image.width/image.height-ratio)<0.01,`Product must retain its aspect ratio at ${width}px`);
  if(width<=700){
   assert.ok(image.bottom<=questions.top&&image.bottom<=art.top,`Cards must not cover the product at ${width}px`);
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 await hero.screenshot({path:'artifacts/mobile-personalization-layout.png'});
 console.log('PASS: the complete homepage product retains its aspect ratio at 320–1440px, with mobile cards below the product.');
 brokenHero=true;
 const failure=page.waitForResponse(response=>new URL(response.url()).pathname===new URL(bundle.inputs.source.url,'http://xinobi-mobile.test').pathname&&response.status()===404);
 await page.reload();await failure;
 await hero.getByRole('img',{name:'Japon dalga deseni uygulanmış Xinobi çay makinesi',exact:true}).waitFor();
 assert.equal(await hero.getByRole('alert').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: mobile homepage renders the approved product at its actual dimensions and shows the fallback photo if preview media fails.');
 brokenHero=false;signedInFixture=true;
 await page.goto(`http://xinobi-mobile.test/xinobi-u/kendi-gorselin/?product=${product}&variant=${variant}`);
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 await page.locator('#local-pattern').setInputFiles(path.join(root,'assets/personalization/sample-pattern.png'));
 await page.locator('canvas[role=img]').first().waitFor();
 const original=await page.locator('canvas[role=img]').first().evaluate(canvas=>canvas.toDataURL());
 await page.locator('#pattern-scale').fill('0.55');
 await page.locator('#pattern-rotation').fill('17');
 await page.locator('#pattern-x').fill('1400');
 await page.locator('#pattern-curvature').fill('0.5');
 await page.waitForFunction(previous=>document.querySelector('canvas[role=img]')?.toDataURL()!==previous,original);
 const designed=await page.locator('canvas[role=img]').first().evaluate(canvas=>canvas.toDataURL());
 uploadedPhoto=Buffer.from(await page.evaluate(async()=>Array.from(new Uint8Array(await window.__lastPreviewBlob.arrayBuffer()))));
 await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();
 await page.getByText(/sepete eklendi/).waitFor();
 const line=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1'))[0]);
 assert.equal(line.designPlacement.scale,0.55);assert.equal(line.designPlacement.rotation,17);assert.equal(line.designPlacement.x,1400);
 assert.ok(uploadedPhoto?.length>0,'Uploaded photo must contain bytes');
 await page.goto('http://xinobi-mobile.test/sepet/');
 const cartCanvas=page.locator('canvas[role=img]').first();
 try{await cartCanvas.waitFor();}catch(error){throw new Error(JSON.stringify({alerts:await page.getByRole('alert').allTextContents(),bytes:uploadedPhoto?.length,signature:uploadedPhoto?.subarray(0,16).toString('hex'),line,errors}),{cause:error});}
 await page.waitForFunction(previous=>document.querySelector('canvas[role=img]')?.toDataURL()===previous,designed);
 assert.equal(await cartCanvas.evaluate(canvas=>canvas.toDataURL()),designed);
 await page.reload();await cartCanvas.waitFor();
 await page.waitForFunction(previous=>document.querySelector('canvas[role=img]')?.toDataURL()===previous,designed);
 console.log('PASS: uploaded photo cart image matches the editor pixels after placement edits and after reloading the cart.');

}finally{await browser.close();}
