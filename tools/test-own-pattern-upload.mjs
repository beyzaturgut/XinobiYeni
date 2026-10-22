// Mocked read-only browser check against the local web development server.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
const width=400,height=600,sourceHash='a'.repeat(64),maskHash='b'.repeat(64);
const source=await sharp({create:{width,height,channels:4,background:'#cccccc'}}).png().toBuffer();
const rgba=Buffer.alloc(width*height*4);
// One body with a protected logo hole.
for(let y=150;y<500;y++)for(let x=100;x<300;x++)if(!(x>=180&&x<220&&y>=250&&y<270))rgba.set([255,255,255,255],(y*width+x)*4);
const mask=await sharp(rgba,{raw:{width,height,channels:4}}).png().toBuffer();
const upload=await sharp({create:{width:16,height:32,channels:4,background:'#ff0000'}}).webp({lossless:true}).toBuffer();
const inputs={width,height,sourceMediaVersion:sourceHash,surfaceVersion:maskHash,source:{url:'/assets/test-pattern-source.png?v='+sourceHash,sha256:sourceHash},mask:{url:'/api/v1/local-commerce/media/'+ 'b'.repeat(32)+'.png?v='+maskHash,sha256:maskHash},brandingRequired:false,branding:null,displayName:'Desen test ürünü'};
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();page.setDefaultTimeout(15000);const errors=[];let writes=0;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(!['GET','HEAD','OPTIONS'].includes(request.method())){writes++;return route.abort();}
  if(url.pathname==='/api/v1/me')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:3000','Access-Control-Allow-Credentials':'true'}});
  if(url.pathname.includes('/rendering-inputs')&&!url.pathname.includes('/commerce-mask/'))return route.fulfill({status:404,headers:{'Access-Control-Allow-Origin':'*'}});
  if(url.pathname.includes('/rendering-inputs'))return route.fulfill({json:{scope:'development-preview',productReference:'pattern-test',variantReference:url.pathname.includes('/unapproved/')?'unapproved':'approved',previewAvailable:!url.pathname.includes('/unapproved/'),inputs:url.pathname.includes('/unapproved/')?null:inputs},headers:{'Access-Control-Allow-Origin':'*'}});
  if(url.pathname==='/assets/test-pattern-source.png')return route.fulfill({body:source,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'}});
  if(url.pathname.includes('/local-commerce/media/'))return route.fulfill({body:mask,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'}});
  if(url.pathname.endsWith('/local-commerce/state'))return route.fulfill({json:{products:[],prices:{},content:{slides:[]}},headers:{'Access-Control-Allow-Origin':'*'}});
  return route.continue();
 });
 await page.goto('http://127.0.0.1:3000/xinobi-u/kendi-gorselin?product=pattern-test&variant=approved&mode=pattern');
 await page.getByRole('heading',{name:'Kendi deseninizi yükleyin',exact:true}).waitFor();
 const consent=page.getByRole('button',{name:'Çerez tercih panelini kapat'});if(await consent.isVisible())await consent.click();
 await page.getByLabel('Desen seç',{exact:true}).setInputFiles({name:'red.webp',mimeType:'image/webp',buffer:upload});
 const canvas=page.locator('canvas[role=img]').first();await canvas.waitFor();
 await page.waitForFunction(()=>{
  const c=document.querySelector('canvas[role=img]');if(!c||c.hidden)return false;
  const pixel=c.getContext('2d').getImageData(150,350,1,1).data;return pixel[0]>pixel[1]+20;
 });
 const coverage=await canvas.evaluate(c=>{
  const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  let covered=0,total=0,outsideChanges=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
   const i=(y*c.width+x)*4,inside=x>=100&&x<300&&y>=150&&y<500&&!(x>=180&&x<220&&y>=250&&y<270);
   if(inside){total++;if(data[i]>data[i+1]+20)covered++;}
   else if(data[i]!==204||data[i+1]!==204||data[i+2]!==204)outsideChanges++;
  }
  return{covered,total,outsideChanges};
 });
 assert.ok(coverage.covered/coverage.total>.95,JSON.stringify(coverage));assert.equal(coverage.outsideChanges,0);
 await page.getByRole('button',{name:'Deseni kaldır',exact:true}).click();assert.equal(await page.locator('canvas').count(),0);
 await page.getByRole('link',{name:'Kendi görselinizi yükleyin',exact:true}).click();await page.getByLabel('Görsel seç',{exact:true}).waitFor();
 await page.getByRole('link',{name:'Kendi deseninizi yükleyin',exact:true}).click();await page.getByLabel('Desen seç',{exact:true}).waitFor();
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto('http://127.0.0.1:3000/xinobi-u/kendi-gorselin?product=pattern-test&variant=unapproved&mode=pattern');
 await page.getByText('Bu renk için kişiselleştirme henüz kullanılamıyor.',{exact:true}).waitFor();assert.equal(await page.locator('input[type=file]').count(),0);
 assert.equal(writes,0);assert.deepEqual(errors,[]);
 console.log('PASS: small uploaded pattern covers approved mask, protected logo and outside pixels unchanged, removal, image/pattern tabs, mobile layout, unapproved colour blocked, no writes');
}finally{await browser.close();}
