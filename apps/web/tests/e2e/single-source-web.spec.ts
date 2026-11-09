import {test,expect,type Page} from '@playwright/test';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import AxeBuilder from '@axe-core/playwright';
import {mockStore,mockReferenceSurface} from './fixtures';
const webRequire=createRequire(process.cwd()+'/package.json'),sharp=createRequire(webRequire.resolve('next/package.json'))('sharp');
const hash=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
const product='DEMO-P101',root='/api/v1/product-surfaces/'+product;
async function fixture(page:Page,{width=213,height=317,status=200,malformed=false,delay=0,signedIn=false}={}){
 // Unknown APIs and foreign hosts cannot reach the local API, SQL or provider. Page fixtures take precedence.
 await page.context().route('**/*',route=>{const url=new URL(route.request().url());return url.origin==='http://127.0.0.1:3017'&&!url.pathname.startsWith('/api/')?route.continue():route.abort()});
 const store=await mockStore(page,{signedIn});for(const item of store.state.products)item.personalizable=true;
 const source:Buffer=await sharp({create:{width,height,channels:4,background:'#999999'}}).png().toBuffer();
 const inner:Buffer=await sharp({create:{width:Math.max(1,Math.floor(width/2)),height,channels:4,background:'#ffffff'}}).png().toBuffer();
 const mask:Buffer=await sharp({create:{width,height,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:inner,left:Math.floor(width/4),top:0}]).png().toBuffer();
 let code=status,revision=1,reads=0,broken=false;
 const publication=()=>{const id=`source-${revision}-mask-`+'a'.repeat(32);return{schemaVersion:1,scope:'single-source-preview',productReference:malformed?'other-product':product,sourceRevision:revision,surfaceId:id,
  inputs:{width,height,surfaceVersion:hash(mask),sourceMediaVersion:hash(source),source:{url:`${root}/${id}/source?v=${hash(source)}`,sha256:hash(source)},mask:{url:`${root}/${id}/mask?v=${hash(mask)}`,sha256:hash(mask)},brandingRequired:false,branding:null}}};
 await page.route('**/api/v1/product-surfaces/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path===root+'/purchase')return route.fulfill({json:{status:'commercial_binding_missing',binding:null,priceMinor:null,stock:null,variantId:null}});
  if(path===root+'/rendering-inputs'){reads++;if(delay)await new Promise(resolve=>setTimeout(resolve,delay));return route.fulfill({status:code,json:code===200?publication():{code:'surface_not_available'}})}
  if(path.endsWith('/rendering-inputs'))return route.fulfill({status:404,json:{}});
  if(broken)return route.fulfill({status:503});
  return route.fulfill({contentType:'image/png',body:path.endsWith('/source')?source:mask});
 });
 await page.addInitScript(()=>localStorage.setItem('xinobi-consent',JSON.stringify({necessary:true,analytics:false,marketing:false})));
 const close=async()=>{const button=page.getByRole('button',{name:'Çerez tercih panelini kapat'});await expect(button).toBeVisible();await button.click()};
 return {...store,close,get reads(){return reads},setStatus:(value:number)=>{code=value},setRevision:(value:number)=>{revision=value},breakMedia:()=>{broken=true},publication};
}
async function upload(page:Page){await page.locator('input[type=file]').setInputFiles('public/assets/personalization/sample-pattern.png');await page.getByRole('button',{name:'Önizlemeye geç →'}).click();await expect(page.locator('canvas[role=img]')).toBeVisible()}

test('historical colour URLs are product method entries, without selecting or persisting a colour',async({page})=>{
 const data=await fixture(page);await page.goto('/xinobi-u/renk/?product='+product+'&variant=removed-colour');await data.close();
 await expect(page.getByRole('heading',{name:'Tasarımını nasıl oluşturmak istersin?'})).toBeVisible();
 const next=page.getByRole('link',{name:'Görsel yükle →'});await expect(next).toHaveAttribute('href',/product=DEMO-P101$/);
 await expect(page.getByRole('group',{name:/renk/i})).toHaveCount(0);
 await next.click();await expect(page.getByRole('heading',{name:'Görselini yükle'})).toBeVisible();
 await expect(page).not.toHaveURL(/variant=/);expect(data.requests.filter(r=>r.method!=='GET'&&r.path!=='/auth/web/refresh')).toHaveLength(0);
});

test('catalogue personalisation entry ignores sale colour while normal colour/gallery selection remains',async({page})=>{
 const data=await fixture(page);await page.goto('/urunler/detay/?id='+product);await data.close();
 for(const variant of data.state.products[0].variants){await page.getByRole('button',{name:variant.color+' rengini seç',exact:true}).click();
  await expect(page.getByRole('link',{name:'XINOBI U ile kişiselleştir'})).toHaveAttribute('href',/product=DEMO-P101$/);}
 await expect(page.locator('[data-preview-readiness]')).toHaveAttribute('data-preview-readiness','ready');
 await expect(page.getByRole('button',{name:/Sepete ekle/}).first()).toBeEnabled();
 await page.goto('/xinobi-u/');await expect(page.locator('article').first()).not.toContainText(/renk seçeneği/);
 await expect(page.locator('article').first().locator('img')).toHaveAttribute('src',new RegExp('/product-surfaces/'+product));
});

for(const [width,height] of [[317,213],[213,317],[257,257]])test(`real ${width}x${height} coordinates survive responsive display, history and undo`,async({page})=>{
 const data=await fixture(page,{width,height});await page.goto('/xinobi-u/kendi-gorselin/?product='+product+'&mode=pattern');await data.close();await upload(page);
 const x=page.locator('#pattern-x');await expect(x).toHaveAttribute('max',String(width));await expect(x).toHaveValue(String(Math.round(width/2)));
 await x.fill(String(width-5));await page.getByRole('button',{name:'Geri al',exact:true}).click();await expect(x).toHaveValue(String(Math.round(width/2)));
 await page.getByRole('button',{name:'Yinele',exact:true}).click();await expect(x).toHaveValue(String(width-5));
 for(const viewport of [320,390,768,1440]){await page.setViewportSize({width:viewport,height:950});
  await expect(x).toHaveValue(String(width-5));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const box=await page.locator('canvas[role=img]').boundingBox();expect(box!.width).toBeGreaterThan(5);expect(box!.width/box!.height).toBeCloseTo(width/height,1);}
 await page.goBack();await expect(page.getByRole('button',{name:'Önizlemeye geç →'})).toBeEnabled();
 await page.goForward();await expect(page.locator('canvas[role=img]')).toBeVisible();
 await expect(page.getByRole('group',{name:/Ürün rengi/})).toHaveCount(0);
 await expect(page.getByText(/Bu ürünün kişiselleştirme için satış SKU’su henüz tanımlanmadı./)).toBeVisible();
 expect(data.requests.filter(r=>r.method!=='GET'&&r.path!=='/auth/web/refresh')).toHaveLength(0);
});

test('large source keeps real coordinates while only its temporary drawing buffer is bounded',async({page})=>{
 const data=await fixture(page,{width:5001,height:4000});await page.goto('/xinobi-u/kendi-gorselin/?product='+product);await data.close();await upload(page);
 await expect(page.locator('#pattern-x')).toHaveAttribute('max','5001');await expect(page.locator('#pattern-y')).toHaveAttribute('max','4000');
 const size=await page.locator('canvas[role=img]').evaluate(c=>({w:(c as HTMLCanvasElement).width,h:(c as HTMLCanvasElement).height}));expect(size.w*size.h).toBeLessThanOrEqual(2_000_000);
 await page.locator('#pattern-x').fill('3500');await page.setViewportSize({width:1440,height:1000});await expect(page.locator('#pattern-x')).toHaveValue('3500');
});

for(const status of [404,503])test(`surface ${status} is distinct and cannot borrow old packaged masks`,async({page})=>{
 const data=await fixture(page,{status});await page.goto('/xinobi-u/kendi-gorselin/?product='+product);await data.close();
 if(status===503){await expect(page.getByRole('button',{name:'Önizlemeyi yeniden yükle'})).toBeVisible();
  await page.locator('input[type=file]').setInputFiles('public/assets/personalization/sample-pattern.png');data.setStatus(200);
  await page.getByRole('button',{name:'Önizlemeyi yeniden yükle'}).click();await page.getByRole('button',{name:'Önizlemeye geç →'}).click();await expect(page.locator('canvas[role=img]')).toBeVisible();
 }else{await expect(page.getByText('Bu ürün için onaylı yüzey henüz hazır değil.')).toBeVisible();await expect(page.getByRole('button',{name:/Önizlemeye geçmek için/})).toBeDisabled()}
});

test('wrong product identity and broken media have explicit failures without a false save',async({page})=>{
 const data=await fixture(page,{malformed:true});await page.goto('/xinobi-u/renk/?product='+product);await data.close();
 await expect(page.getByRole('button',{name:'Tekrar dene',exact:true})).toBeVisible();expect(data.requests.filter(r=>r.method!=='GET'&&r.path!=='/auth/web/refresh')).toHaveLength(0);
});

test('broken media never presents a completed preview',async({page})=>{
 const data=await fixture(page);data.breakMedia();await page.goto('/xinobi-u/kendi-gorselin/?product='+product);await data.close();
 await page.locator('input[type=file]').setInputFiles('public/assets/personalization/sample-pattern.png');await page.getByRole('button',{name:'Önizlemeye geç →'}).click();
 await expect(page.getByRole('alert').filter({hasText:'Ürün görselleri doğrulanamadı'})).toBeVisible();await expect(page.locator('canvas[role=img]')).toBeHidden();
});

test('changing product cannot reuse the previous surface and a new visit reads the current revision',async({page})=>{
 const data=await fixture(page);await page.goto('/xinobi-u/renk/?product='+product);await data.close();await expect(page.getByRole('link',{name:'Görsel yükle →'})).toBeVisible();
 const old=data.publication().surfaceId;data.setRevision(2);await page.reload();await expect(page.locator('main img').first()).toHaveAttribute('src',/source-2-mask-/);expect(data.publication().surfaceId).not.toBe(old);
 await page.goto('/xinobi-u/renk/?product=DEMO-P102');await expect(page.getByText('Bu ürünün onaylı kişiselleştirme yüzeyi henüz hazır değil.')).toBeVisible();
 await expect(page.locator('main img')).toHaveCount(0);await expect(page.getByRole('link',{name:'Görsel yükle →'})).toHaveCount(0);
});

test('200 percent text, keyboard and automated accessibility keep the method and placement usable',async({page})=>{
 const data=await fixture(page);await page.goto('/xinobi-u/renk/?product='+product);await data.close();
 await page.evaluate(()=>{for(const node of document.querySelectorAll<HTMLElement>('main *')){if([...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent?.trim())){const style=getComputedStyle(node);node.style.fontSize=(parseFloat(style.fontSize)*2)+'px';node.style.lineHeight='1.4';}}});
 await page.getByRole('radio',{name:/Kendi desenini yükle/}).focus();await page.keyboard.press('Space');
 await page.getByRole('link',{name:'Desen yükle →'}).click();await upload(page);
 await page.evaluate(()=>{for(const node of document.querySelectorAll<HTMLElement>('main *')){if([...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent?.trim())){const size=parseFloat(getComputedStyle(node).fontSize);node.style.fontSize=(size*2)+'px';node.style.lineHeight='1.4';}}});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1100});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const name of ['Ortala','Alanı doldur']){const button=page.getByRole('button',{name,exact:true});expect(await button.evaluate(node=>node.scrollHeight<=node.clientHeight+1)).toBe(true)}}
 const consent=page.getByRole('button',{name:'Çerez tercih panelini kapat'});if(await consent.isVisible())await consent.click();
 await expect(page.getByRole('complementary',{name:'Çerez tercihleri'})).toBeHidden();
 const results=await new AxeBuilder({page}).include('main').analyze();expect(results.violations).toEqual([]);
 await page.screenshot({path:'../../artifacts/task07-single-source-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:950});await page.screenshot({path:'../../artifacts/task07-single-source-mobile.png',fullPage:true});
});

test('AI session is created without a required colour and uses the approved product source',async({page})=>{
 const data=await fixture(page);let creates=0;
 const questions=Array.from({length:5},(_,i)=>({id:'q'+i,axis:'style',axisLabel:'Tarz',text:'Tercihin '+i,options:[{id:'a',label:'İlk seçenek'},{id:'b',label:'İkinci seçenek'}]}));
 const session={id:'abcdef',status:'questionnaire',product:{id:product,name:'Çay Makinesi 101'},variant:null,questions,answers:[],imageUrl:null};
 await page.route('**/api/v1/design-studio/**',route=>{const request=route.request(),path=new URL(request.url()).pathname;
  if(path.endsWith('/status'))return route.fulfill({json:{configured:false}});
  if(request.method()==='POST'){creates++;expect(request.postDataJSON().variantId).toBeNull();return route.fulfill({json:session})}
  return route.fulfill({json:session});});
 await page.goto('/xinobi-u/sorular/?product='+product);await data.close();await expect(page.getByRole('heading',{name:'Tercihin 0'})).toBeVisible();
 await expect(page.locator('main aside img')).toHaveAttribute('src',new RegExp('/product-surfaces/'+product));expect(creates).toBe(1);
 await page.getByRole('radio',{name:/İlk seçenek/}).check();await page.reload();await expect(page.getByRole('radio',{name:/İlk seçenek/})).toBeChecked();expect(creates).toBe(1);
});


test('ready AI result opens the product surface without a colour step or a mismatched session',async({page})=>{
 const data=await fixture(page);
 const session={id:'abcdef',status:'ready',product:{id:product,name:'Çay Makinesi 101'},variant:null,questions:[],answers:[],imageUrl:'/api/v1/design-studio/sessions/abcdef/image'};
 await page.addInitScript(product=>sessionStorage.setItem(`xinobi-u-single-session:${product}:`,'abcdef'),product);
 await page.route('**/api/v1/design-studio/**',route=>{const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/image'))return route.fulfill({path:'public/assets/personalization/sample-pattern.png'});
  return route.fulfill({json:path.endsWith('/status')?{configured:false}:session});});
 await page.goto('/xinobi-u/sorular/?product='+product);await data.close();await expect(page.getByRole('heading',{name:'İşte sana özel yorum.'})).toBeVisible();
 await page.getByRole('button',{name:'Üründe gelişmiş önizlemeyi aç'}).click();await expect(page).toHaveURL(/product=DEMO-P101&session=abcdef/);
 await expect(page.locator('canvas[role=img]')).toBeVisible();await expect(page.getByRole('group',{name:/Ürün rengi/})).toHaveCount(0);
 await page.getByRole('link',{name:'Tasarımıma dön'}).click();await expect(page.getByRole('heading',{name:'İşte sana özel yorum.'})).toBeVisible();
 await page.goBack();await expect(page.locator('canvas[role=img]')).toBeVisible();
 await page.goto('/xinobi-u/onizleme/?product=DEMO-P102&session=abcdef');await expect(page.locator('main [role=alert]')).toContainText('Tasarım önizlemesi yüklenemedi.');await expect(page.locator('canvas[role=img]')).toHaveCount(0);
});

test('loading and empty catalogue are explicit and missing identity cannot start an upload',async({page})=>{
 const data=await fixture(page,{delay:1000});await page.goto('/xinobi-u/renk/?product='+product);await data.close();
 await expect(page.getByRole('button',{name:'Kontrol ediliyor…',exact:true})).toBeDisabled();await expect(page.getByRole('link',{name:'Görsel yükle →'})).toBeVisible();
 await page.goto('/xinobi-u/kendi-gorselin/');await expect(page.getByText('Devam etmek için önce bir ürün seçin.')).toBeVisible();await expect(page.locator('input[type=file]')).toHaveCount(0);
 data.state.products.forEach(item=>item.personalizable=false);await page.goto('/xinobi-u/');await expect(page.getByText('Şu anda kişiselleştirmeye açık bir ürün bulunmuyor.')).toBeVisible();
});


test('historical explicit variant preview remains on its own read-only surface contract',async({page})=>{
 const data=await fixture(page);await mockReferenceSurface(page);
 await page.goto('/urunler/cay-makinesi-101/editor/?product=DEMO-P101&variant=DEMO-V101-B');await data.close();
 const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();await expect(canvas).toHaveAttribute('width','1066');await expect(canvas).toHaveAttribute('height','1600');
 expect(data.requests.filter(r=>r.method!=='GET'&&r.path!=='/auth/web/refresh')).toHaveLength(0);
});

function purchaseFor(data:Awaited<ReturnType<typeof fixture>>){const p=data.publication();return{status:'ready',variantId:'DEMO-V101-B',sku:'SYNTHETIC-SKU',priceMinor:240000,stock:8,binding:{productId:product,profileRevision:4,sourceRevision:p.sourceRevision,surfaceId:p.surfaceId,productSourceSha256:p.inputs.sourceMediaVersion,maskSha256:p.inputs.surfaceVersion,width:p.inputs.width,height:p.inputs.height,fulfillmentVariantId:'DEMO-V101-B'}}}
test('single-source save requires server and preview success and different designs stay separate in cart',async({page})=>{
 const data=await fixture(page,{signedIn:true});const purchase=purchaseFor(data);let failPreview=true,designCount=0,configCount=0;
 await page.route('**'+root+'/purchase',route=>route.fulfill({json:purchase}));
 await page.route('**/api/v1/me/designs/**',route=>{
  const path=new URL(route.request().url()).pathname;
  if(route.request().method()==='GET')return route.fulfill({path:'public/assets/personalization/sample-pattern.png'});
  if(path.endsWith('/upload')){designCount++;return route.fulfill({status:201,json:{id:'design-'+designCount,productId:product,name:'Test deseni '+designCount,kind:'upload',mime:'image/png',variantId:null}})}
  const body=route.request().postDataJSON();expect(body.surfaceBinding).toEqual(purchase.binding);expect(body.variantId).toBe('DEMO-V101-B');expect(body.placement.sourceWidth).toBe(purchase.binding.width);
  configCount++;return route.fulfill({json:{id:body.configurationId??String(configCount).padStart(32,'0'),designId:path.split('/')[5],productId:product,variantId:body.variantId,revision:(body.expectedRevision??0)+1,schemaVersion:2,placement:body.placement,surfaceBinding:body.surfaceBinding,favorite:false,sourceSha256:'b'.repeat(64),createdAt:new Date().toISOString()}});
 });
 await page.route('**/api/v1/me/design-configurations/**/preview',route=>route.fulfill(route.request().method()==='GET'?{path:'public/assets/personalization/sample-pattern.png'}:failPreview?{status:503,json:{title:'Önizleme yüklenemedi.'}}:{status:204}));
 await page.goto('/xinobi-u/kendi-gorselin/?product='+product);await data.close();await upload(page);
 const add=page.getByRole('button',{name:'Sepete ekle',exact:true});await expect(add).toBeEnabled();await add.click();
 await expect(page.getByRole('alert').filter({hasText:'Önizleme yüklenemedi'})).toBeVisible();
 await expect(page.getByText(/Tasarım hesabına kaydedildi/)).toHaveCount(0);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')??'[]'))).toHaveLength(0);
 failPreview=false;await add.click();await expect(page.getByRole('status').filter({hasText:/sepete eklendi/})).toBeVisible();
 let lines=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')??'[]'));expect(lines).toHaveLength(1);expect(lines[0].configurationRevision).toBe(1);expect(lines[0].variantId).toBe('DEMO-V101-B');
 await page.goto('/xinobi-u/kendi-gorselin/?product='+product);await upload(page);await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:/sepete eklendi/})).toBeVisible();
 lines=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')??'[]'));expect(lines).toHaveLength(2);expect(new Set(lines.map((line:{designId:string})=>line.designId)).size).toBe(2);
 const consent=page.getByRole('button',{name:'Çerez tercih panelini kapat'});if(await consent.isVisible())await consent.click();
 await page.setViewportSize({width:390,height:1000});await page.screenshot({path:'../../artifacts/task09-save-cart-mobile.png',fullPage:true});
 for(const name of ['Sepete ekle','Favorilere ekle','Tasarımımı kaydet'])await page.getByRole('button',{name,exact:true}).evaluate(button=>{button.style.fontSize='30px';button.style.lineHeight='1.4'});
 for(const width of [320,390]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);for(const name of ['Sepete ekle','Favorilere ekle','Tasarımımı kaydet'])expect(await page.getByRole('button',{name,exact:true}).evaluate(button=>button.scrollHeight<=button.clientHeight+1&&button.scrollWidth<=button.clientWidth+1)).toBe(true)}
 await page.goto('/sepet/');await expect(page.getByText(/^Renk:/)).toHaveCount(0);await expect(page.getByText('Kişiselleştirilmiş · Tasarım:',{exact:false})).toHaveCount(2);
});

test('mismatched visual identity or missing commercial price cannot enable save/cart',async({page})=>{
 const data=await fixture(page,{signedIn:true});let value={...purchaseFor(data),binding:{...purchaseFor(data).binding,productId:'other'}};
 await page.route('**'+root+'/purchase',route=>route.fulfill({json:value}));
 await page.goto('/xinobi-u/kendi-gorselin/?product='+product);await data.close();await upload(page);
 await expect(page.getByText('Ürün yüzeyi değişti. Güncel ürünü yeniden aç.')).toBeVisible();await expect(page.getByRole('button',{name:'Sepete ekle',exact:true})).toHaveCount(0);
 value={...purchaseFor(data),status:'price_missing',priceMinor:null as unknown as number};await page.goto('/xinobi-u/kendi-gorselin/?product='+product);await upload(page);
 await expect(page.getByText('Ürünün satış fiyatı henüz tanımlanmadı.')).toBeVisible();await expect(page.getByRole('button',{name:'Sepete ekle',exact:true})).toHaveCount(0);
});

test('saved single-source placement reopens from My Designs and requires explicit reposition after source change',async({page})=>{
 const data=await fixture(page,{signedIn:true});const purchase=purchaseFor(data),id='saved-design',configId='c'.repeat(32);
 const config={id:configId,designId:id,productId:product,variantId:'DEMO-V101-B',revision:1,schemaVersion:2,favorite:true,sourceSha256:'b'.repeat(64),createdAt:new Date().toISOString(),surfaceBinding:{...purchase.binding,profileRevision:3},placement:{sourceWidth:purchase.binding.width,sourceHeight:purchase.binding.height,surfaceVersion:purchase.binding.maskSha256,x:5,y:5,scale:1,rotation:0,curvatureStrength:.4,mode:'pattern'}};
 await page.route('**'+root+'/purchase',route=>route.fulfill({json:purchase}));
 await page.route('**/api/v1/me/designs',route=>route.fulfill({json:[{id,productId:product,productName:'Test ürün',name:'Kayıtlı desen',kind:'upload',imageUrl:'/api/v1/me/designs/'+id+'/image'}]}));
 await page.route('**/api/v1/me/design-configurations',route=>route.fulfill({json:[config]}));
 await page.route('**/api/v1/me/designs/'+id+'/image',route=>route.fulfill({path:'public/assets/personalization/sample-pattern.png'}));
 await page.goto('/hesap/tasarimlarim/onizleme/?id='+id);await data.close();
 await expect(page.getByText('Ürün kaynağı veya ticari eşleme değişti. Eski yerleşim otomatik aktarılmaz.')).toBeVisible();await expect(page.locator('canvas[role=img]')).toHaveCount(0);
 await page.getByRole('button',{name:'Güncel yüzeye yeniden yerleştir'}).click();await expect(page.locator('canvas[role=img]')).toBeVisible();
 await expect(page.locator('#pattern-x')).toHaveValue(String(Math.round(purchase.binding.width/2)));await expect(page.getByRole('button',{name:'Sepete ekle',exact:true})).toBeEnabled();
});
