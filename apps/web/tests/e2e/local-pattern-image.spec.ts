import {test,expect,type Page} from '@playwright/test';
import {containArtwork} from '../../src/app/urunler/cay-makinesi-101/editor/artwork-placement';
import { artworkReadOnly } from './artwork-read-only';
test.beforeEach(async ({page}) => artworkReadOnly(page));
declare global{interface Window{localPatternUrls:{created:string[];revoked:string[]}}}
const route='/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-B';
async function setup(page:Page){
 await page.addInitScript(()=>{window.localPatternUrls={created:[],revoked:[]};const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=create(blob);window.localPatternUrls.created.push(url);return url};URL.revokeObjectURL=url=>{window.localPatternUrls.revoked.push(url);revoke(url)}});
 await page.goto(route);await expect(page.getByLabel('Görsel seç',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click();
}
async function image(page:Page,mime:string,width=32,height=32){return Buffer.from(await page.evaluate(async({mime,width,height})=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#ee9922';ctx.fillRect(0,0,width,height);const blob=await new Promise<Blob>(resolve=>canvas.toBlob(b=>resolve(b!),mime));return [...new Uint8Array(await blob.arrayBuffer())]},{mime,width,height}))}
for(const [mime,extension] of [['image/png','png'],['image/jpeg','jpg'],['image/webp','webp']])test('local '+extension+' uses canonical renderer without upload or generation',async({page})=>{
 let posts=0;page.on('request',r=>{if(r.method()==='POST')posts++});await setup(page);const buffer=await image(page,mime);
 await page.locator('input[type=file]').setInputFiles({name:'pattern.'+extension,mimeType:mime,buffer});await expect(page.locator('canvas[role=img]')).toBeVisible();
 await expect(page.locator('main')).toHaveAttribute('data-product-reference','DEMO-P101');await expect(page.locator('main')).toHaveAttribute('data-variant-reference','DEMO-V101-B');
 await expect(page.getByText('Temsili dijital çalışma alanı',{exact:false})).toBeVisible();
 expect(await page.evaluate(()=>window.localPatternUrls.created.length)).toBe(1);
 await page.getByLabel('Yatay konum',{exact:false}).fill('580');
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
 expect(posts).toBe(0);
});
for(const [name,mime,buffer,error] of [
 ['unsupported','text/plain',Buffer.from('not an image'),'Yalnız PNG'],
 ['invalid large bytes','image/png',Buffer.alloc(8*1024*1024+1),'içeriği'],
 ['invalid content','image/png',Buffer.from('not PNG'),'içeriği'],
 ['decode failure','image/png',Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]),'Görsel okunamadı'],
] as const)test('rejects '+name+' before retaining an object URL',async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles({name:'invalid.png',mimeType:mime,buffer});await expect(page.locator('main').getByRole('alert')).toContainText(error);await expect(page.locator('canvas[role=img]')).toHaveCount(0);expect(await page.evaluate(()=>window.localPatternUrls.created)).toEqual([]);
});
for(const [width,height] of [[4097,1],[3000,3000]])test('optimizes decoded limits '+width+'x'+height,async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles({name:'large.png',mimeType:'image/png',buffer:await image(page,'image/png',width,height)});await expect(page.locator('canvas[role=img]')).toBeVisible();await expect(page.locator('main').getByRole('alert')).toHaveCount(0);expect(await page.evaluate(()=>window.localPatternUrls.created.length)).toBe(1);
});
test('replacement and SPA unmount revoke URLs; invalid replacement preserves preview',async({page})=>{
 await setup(page);const first=await image(page,'image/png');const input=page.locator('input[type=file]');await input.setInputFiles({name:'first.png',mimeType:'image/png',buffer:first});await expect(page.locator('canvas[role=img]')).toBeVisible();
 const firstUrl=await page.evaluate(()=>window.localPatternUrls.created[0]);const pixels=await page.locator('canvas[role=img]').evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await input.setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('bad')});await expect(page.locator('main').getByRole('alert')).toContainText('Yalnız PNG');expect(await page.evaluate(()=>window.localPatternUrls.revoked)).toEqual([]);expect(await page.locator('canvas[role=img]').evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(pixels);
 await input.setInputFiles({name:'second.webp',mimeType:'image/webp',buffer:await image(page,'image/webp')});await expect.poll(()=>page.evaluate(()=>window.localPatternUrls.created.length)).toBe(2);expect(await page.evaluate(()=>window.localPatternUrls.revoked)).toEqual([firstUrl]);
 const secondUrl=await page.evaluate(()=>window.localPatternUrls.created[1]);
 // Same-document variant navigation unmounts the keyed selection without resetting URL instrumentation.
 await page.evaluate(()=>history.pushState(null,'','/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-R'));
 await expect(page.locator('input[type=file]')).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>window.localPatternUrls.revoked)).toEqual([firstUrl,secondUrl]);
});

for(const [width,height] of [[100,100],[100,300],[300,100]])test('artwork contain preserves aspect '+width+'x'+height,()=>{
 const data=new Uint8ClampedArray(200*300*4);for(let y=40;y<260;y++)for(let x=30;x<170;x++)data[(y*200+x)*4+3]=255;
 const before=data.slice();const rect=containArtwork({width:200,height:300,data} as ImageData,width,height);
 expect(rect.width/rect.height).toBeCloseTo(width/height,8);
 expect(rect.x-rect.width/2).toBeGreaterThan(30);expect(rect.x+rect.width/2).toBeLessThan(170);
 expect(rect.y-rect.height/2).toBeGreaterThan(40);expect(rect.y+rect.height/2).toBeLessThan(260);
 expect(data).toEqual(before);
});
test('local artwork position, scale and rotation change the canonical preview',async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:await image(page,'image/png',100,300)});
 const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();
 for(const [id,value] of [['pattern-x','580'],['pattern-y','950'],['pattern-scale','1.5'],['pattern-rotation','45']]){
  const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.locator('#'+id).fill(value);
  await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).not.toBe(before);
 }
});

test('artwork moved across mask stays clipped with branding above it',async({page})=>{
 await setup(page);await page.locator('input[type=file]').setInputFiles({name:'art.png',mimeType:'image/png',buffer:await image(page,'image/png',300,100)});
 const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();await page.locator('#pattern-scale').fill('3');await page.locator('#pattern-x').fill('650');
 const stats=await canvas.evaluate(async(c:HTMLCanvasElement)=>{
  const load=async(src:string)=>{const i=new Image();i.src=src;await i.decode();return i};
  const [product,mask,brand]=await Promise.all(['/assets/products/tea-maker-101-blue.webp','/assets/personalization/tea-maker-101-blue-designable.png','/assets/personalization/tea-maker-101-blue-branding-overlay.png'].map(load));
  const b=document.createElement('canvas');b.width=c.width;b.height=c.height;const ctx=b.getContext('2d')!;
  const read=(i:HTMLImageElement)=>{ctx.clearRect(0,0,b.width,b.height);ctx.drawImage(i,0,0);return ctx.getImageData(0,0,b.width,b.height).data};
  const m=read(mask),branding=read(brand);ctx.clearRect(0,0,b.width,b.height);ctx.drawImage(product,0,0);ctx.drawImage(brand,0,0);const original=ctx.getImageData(0,0,b.width,b.height).data,final=c.getContext('2d')!.getImageData(0,0,b.width,b.height).data;
  let outside=0,logo=0;for(let i=0;i<final.length;i+=4){if(m[i+3]===0&&[0,1,2,3].some(k=>final[i+k]!==original[i+k]))outside++;if(branding[i+3]===255&&[0,1,2].some(k=>final[i+k]!==branding[i+k]))logo++}return {outside,logo};
 });expect(stats).toEqual({outside:0,logo:0});
});

test('toolbar replaces artwork; removal releases the URL and does not imply a saved design',async({page})=>{
 await setup(page);
 await page.locator('input[type=file]').setInputFiles({name:'first.png',mimeType:'image/png',buffer:await image(page,'image/png')});
 await expect(page.locator('canvas[role=img]')).toBeVisible();
 const chooserEvent=page.waitForEvent('filechooser');
 await page.getByRole('button',{name:/Görsel yükle/}).click();
 await (await chooserEvent).setFiles({name:'replacement.jpg',mimeType:'image/jpeg',buffer:await image(page,'image/jpeg')});
 await expect.poll(()=>page.evaluate(()=>window.localPatternUrls.created.length)).toBe(2);
 // T17 removes the nonfunctional properties/save panel only from XINOBI U.
 await expect(page.getByRole('button',{name:'Kalıcı kaydetme henüz kullanılamıyor'})).toHaveCount(0);
 await expect(page.locator('#local-image-help')).toContainText('yalnız “Tasarımımı kaydet” dersen hesabına yüklenir');
 await page.getByRole('button',{name:'Görseli kaldır',exact:true}).click();
 await expect(page.locator('canvas[role=img]')).toHaveCount(0);
 expect(await page.evaluate(()=>window.localPatternUrls.revoked.length)).toBe(2);
 await expect(page.getByLabel('Görsel seç',{exact:true})).toBeEnabled();
});

test('removing an uploaded photo restores the original pattern preview byte for byte',async({page})=>{
 await page.goto('/urunler/cay-makinesi-101/editor/');
 const canvas=page.locator('canvas[role=img]');
 await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click();
 const original=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 const chooser=page.waitForEvent('filechooser');
 await page.getByRole('button',{name:/Görsel yükle/}).click();
 await (await chooser).setFiles({name:'photo.png',mimeType:'image/png',buffer:await image(page,'image/png',100,150)});
 await expect(page.getByRole('button',{name:'Görseli kaldır',exact:true})).toBeVisible();
 await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'Görseli kaldır',exact:true}).click();
 await expect.poll(()=>canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(original);
});

test('rapid selections serialize decoding and only retain the latest photo',async({page})=>{
 await setup(page);
 const result=await page.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d')!;
  const make=async(color:string)=>{ctx.fillStyle=color;ctx.fillRect(0,0,32,32);return new File([await new Promise<Blob>(resolve=>canvas.toBlob(b=>resolve(b!)))],color+'.png',{type:'image/png'})};
  const first=await make('#ff0000'),second=await make('#0000ff');canvas.width=0;canvas.height=0;
  const decode=window.createImageBitmap.bind(window);let active=0,maxActive=0,closed=0;let started!:()=>void;const firstStarted=new Promise<void>(r=>{started=r});
  window.createImageBitmap=(async(blob:ImageBitmapSource,options?:ImageBitmapOptions)=>{
   active++;maxActive=Math.max(maxActive,active);started();await new Promise(r=>setTimeout(r,150));
   try{const bitmap=await decode(blob,options);const close=bitmap.close.bind(bitmap);bitmap.close=()=>{closed++;close()};return bitmap}finally{active--}
  }) as typeof createImageBitmap;
  const input=document.querySelector<HTMLInputElement>('input[type=file]')!;
  const select=(file:File)=>{const transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}))};
  const create=URL.createObjectURL.bind(URL);let retainedName='';URL.createObjectURL=blob=>{if(blob instanceof File)retainedName=blob.name;return create(blob)};
  select(first);await firstStarted;
  const busy=input.disabled;select(second);
  for(let n=0;n<200&&(!retainedName||input.disabled);n++)await new Promise(r=>setTimeout(r,20));
  window.createImageBitmap=decode;
  return{busy,maxActive,closed,retainedName,created:window.localPatternUrls.created.length};
 });
 expect(result.busy).toBe(true);expect(result.maxActive).toBe(1);expect(result.closed).toBeGreaterThanOrEqual(2);expect(result.retainedName).toBe('#0000ff.png');expect(result.created).toBe(1);
 await expect(page.locator('canvas[role=img]')).toBeVisible();
});
