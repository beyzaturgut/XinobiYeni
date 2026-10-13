import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const p='DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6',v='DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1';
const base=path.resolve('services/api/App_Data/cm101-sam3-review'),pending=path.join(base,'pending/cbb1dbc9-2582-45dc-85ee-6de5fd27106c'),ref=path.join(base,'refinements/local-refinement-20261009-02');
const files={source:fs.readFileSync(path.join(pending,'source.webp')),mask:fs.readFileSync(path.join(ref,'refined-mask.pending.png')),branding:fs.readFileSync(path.join(ref,'branding-protection.png'))};
const hashes=Object.fromEntries(Object.entries(files).map(([k,b])=>[k,crypto.createHash('sha256').update(b).digest('hex')]));
const version='00000000-0000-4000-8000-000000000001';
const media=(role:string)=>({url:'/api/v1/dev/cm101-approved/media/'+version+'/'+role+'?v='+hashes[role],sha256:hashes[role]});
const bundle={scope:'development-preview',productReference:p,variantReference:v,previewAvailable:true,inputs:{width:3543,height:5315,surfaceVersion:hashes.mask,sourceMediaVersion:'cm101:'+hashes.source,source:media('source'),mask:media('mask'),brandingRequired:true,branding:media('branding')}};
test('CM101 live remains unavailable without explicit Admin approval',async({page,request})=>{
const response=await request.get('/api/v1/dev/cm101-approved/'+p+'/'+v+'/rendering-inputs');expect((await response.json()).previewAvailable).toBe(false);
await page.goto('/xinobi-u/kendi-gorselin/?product='+p+'&variant='+v);await expect(page.getByText('Bu seçili ürün/varyant için geliştirme ürün önizlemesi kullanılamıyor.',{exact:true})).toBeVisible();expect(await page.locator('input[type=file]').count()).toBe(0);
});
test('CM101 mock accepted bundle renders local artwork at exact dimensions with mask and branding protection',async({page})=>{
test.setTimeout(180000);
await page.route('**/api/v1/dev/cm101-approved/**',async route=>{const u=new URL(route.request().url());if(u.pathname.endsWith('rendering-inputs'))return route.fulfill({json:bundle});const role=u.pathname.split('/').pop()!;return route.fulfill({contentType:role==='source'?'image/webp':'image/png',body:files[role as keyof typeof files]});});
await page.goto('/xinobi-u/kendi-gorselin/?product='+p+'&variant='+v);
await page.locator('input[type=file]').setInputFiles(path.resolve('apps/web/public/assets/personalization/sample-pattern.png'));
const canvas=page.locator('canvas[role=img]');const start=Date.now();await expect(canvas).toBeVisible({timeout:120000});expect(await canvas.evaluate((c:HTMLCanvasElement)=>[c.width,c.height])).toEqual([3543,5315]);
const result=await canvas.evaluate(async(c:HTMLCanvasElement)=>{
const paths=['source','mask','branding'].map(role=>'/api/v1/dev/cm101-approved/media/00000000-0000-4000-8000-000000000001/'+role);
const output=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
const buffer=document.createElement('canvas');buffer.width=c.width;buffer.height=c.height;const ctx=buffer.getContext('2d',{willReadFrequently:true})!;
const arrays: Uint8ClampedArray[]=[];for(const url of paths){const i=new Image();i.src=url;await i.decode();ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(i,0,0);arrays.push(ctx.getImageData(0,0,c.width,c.height).data);}
let outside=0,branding=0,inside=0,alpha=0;for(let n=0;n<output.length;n+=4){if(!arrays[1][n+3]&&[0,1,2,3].some(k=>output[n+k]!==arrays[0][n+k]))outside++;if(arrays[2][n+3]===255&&[0,1,2,3].some(k=>output[n+k]!==arrays[2][n+k]))branding++;if(arrays[1][n+3]&&[0,1,2].some(k=>output[n+k]!==arrays[0][n+k]))inside++;if(output[n+3]!==arrays[0][n+3])alpha++;}
return {outside,branding,inside,alpha};
});console.log('CM101 full-resolution mock render',Date.now()-start,'ms',result);expect(result.outside).toBe(0);expect(result.branding).toBe(0);expect(result.alpha).toBe(0);expect(result.inside).toBeGreaterThan(0);
await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('CM101 stale source bundle is rejected client-side',async({page})=>{
await page.route('**/api/v1/dev/cm101-approved/**/rendering-inputs',r=>r.fulfill({json:{...bundle,inputs:{...bundle.inputs,source:{...bundle.inputs.source,sha256:'a'.repeat(64)}}}}));
await page.goto('/xinobi-u/kendi-gorselin/?product='+p+'&variant='+v);await expect(page.getByText('Geliştirme ürün önizlemesi şu anda doğrulanamıyor.',{exact:true})).toBeVisible();expect(await page.locator('canvas[role=img]').count()).toBe(0);
});
test('CM101 completed AI pattern handoff uses canonical full-resolution preview without generation',async({page})=>{
test.setTimeout(120000);const id='b'.repeat(64);let writes=0;
page.on('request',r=>{if(r.method()!=='GET')writes++;});
await page.addInitScript(id=>sessionStorage.setItem('xinobi-u-selected-session',id),id);
await page.route('**/api/v1/design-studio/**',r=>r.request().url().endsWith('/image')?r.fulfill({contentType:'image/png',body:fs.readFileSync(path.resolve('apps/web/public/assets/personalization/sample-pattern.png'))}):r.fulfill({json:{id,status:'ready',product:{id:p,name:'CM101'},variant:{id:v,color:'Metallic Navy'},imageUrl:'/api/v1/design-studio/sessions/'+id+'/image'}}));
await page.route('**/api/v1/dev/cm101-approved/**',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('rendering-inputs'))return r.fulfill({json:bundle});const role=u.pathname.split('/').pop()!;return r.fulfill({contentType:role==='source'?'image/webp':'image/png',body:files[role as keyof typeof files]});});
await page.goto('/xinobi-u/onizleme/');const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible({timeout:90000});expect(await canvas.evaluate((c:HTMLCanvasElement)=>[c.width,c.height])).toEqual([3543,5315]);expect(writes).toBe(0);await expect(page.getByText('Temsilidir',{exact:true})).toBeVisible();
});
