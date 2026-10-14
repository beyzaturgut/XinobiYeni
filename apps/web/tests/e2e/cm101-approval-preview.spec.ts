import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
type QuestionnaireAnswer={questionId:string;optionId:string};
type QuestionnaireSession={id:string;status:string;product?:{id?:string};variant?:{id?:string};answers?:QuestionnaireAnswer[];createdAt:string;assetFile:string;assetMime:string};
type PatternDebug={mask:Uint8Array|null;source:Uint8Array|null;missing:Array<{upper:number;lower:number}>};
type DebugWindow=Window & {__cm101PatternDebug?:PatternDebug};
const p='DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6',v='DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1';
// These checks read CM101 review data that lives only in a reviewer's ignored services/api/App_Data (cm101-sam3-review,
// catalog-surface-review, real-catalog-qa, questionnaire-preview-sessions). Without it the file reports one skipped test
// instead of failing the whole run at load time.
try{
const repo=path.resolve('../..'),base=path.join(repo,'services/api/App_Data/cm101-sam3-review'),pending=path.join(base,'pending/cbb1dbc9-2582-45dc-85ee-6de5fd27106c'),ref=path.join(base,'refinements/local-refinement-20261009-02');
const files={source:fs.readFileSync(path.join(pending,'source.webp')),mask:fs.readFileSync(path.join(ref,'refined-mask.pending.png')),branding:fs.readFileSync(path.join(ref,'branding-protection.png'))};
const hashes=Object.fromEntries(Object.entries(files).map(([k,b])=>[k,crypto.createHash('sha256').update(b).digest('hex')]));
const version='00000000-0000-4000-8000-000000000001';
const media=(role:string)=>({url:'/api/v1/dev/cm101-approved/media/'+version+'/'+role+'?v='+hashes[role],sha256:hashes[role]});
const bundle={scope:'development-preview',productReference:p,variantReference:v,previewAvailable:true,inputs:{width:3543,height:5315,surfaceVersion:hashes.mask,sourceMediaVersion:'cm101:'+hashes.source,source:media('source'),mask:media('mask'),brandingRequired:true,branding:media('branding')}};
const acceptedRoot=path.join(repo,'services/api/App_Data/catalog-surface-review/accepted/88aa70ded900605cf2b2b98b9a9a796c8c26e6540004f607223103f8aad34377');
const accepted=JSON.parse(fs.readFileSync(path.join(acceptedRoot,'current.json'),'utf8'));
const acceptedDir=path.join(acceptedRoot,accepted.version);
const acceptance=JSON.parse(fs.readFileSync(path.join(acceptedDir,'acceptance.json'),'utf8'));
const acceptedFiles={source:fs.readFileSync(path.join(repo,'services/api/App_Data/real-catalog-qa/media',path.basename(acceptance.sourceImage))),mask:fs.readFileSync(path.join(acceptedDir,'mask.png')),branding:fs.readFileSync(path.join(acceptedDir,'branding.png'))};
const acceptedHashes=Object.fromEntries(Object.entries(acceptedFiles).map(([k,b])=>[k,crypto.createHash('sha256').update(b).digest('hex')])) as Record<string,string>;
const acceptedMedia=(role:string)=>({url:'/api/v1/dev/cm101-approved/media/'+accepted.version+'/'+role+'?v='+acceptedHashes[role],sha256:acceptedHashes[role]});
const acceptedBundle={scope:'development-preview',productReference:p,variantReference:v,previewAvailable:true,inputs:{width:acceptance.width,height:acceptance.height,surfaceVersion:acceptedHashes.mask,sourceMediaVersion:'cm101:'+acceptedHashes.source,source:acceptedMedia('source'),mask:acceptedMedia('mask'),brandingRequired:true,branding:acceptedMedia('branding'),surfaceTreatment:'metallic-ink'}};
const questionnaireStore=JSON.parse(fs.readFileSync(path.join(repo,'services/api/App_Data/questionnaire-preview-sessions/sessions.json'),'utf8')) as {sessions:Record<string,QuestionnaireSession>};
const mountainSession=Object.values(questionnaireStore.sessions).filter((s)=>s.status==='ready'&&s.product?.id===p&&s.variant?.id===v&&s.answers?.some((a)=>a.questionId.startsWith('nature-')&&a.optionId==='mountain')).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt))[0];
if(!mountainSession)throw new Error('Stored CM101 mountain-pattern design session was not found');
const mountainPattern=fs.readFileSync(path.join(repo,'services/api/App_Data/questionnaire-preview-sessions/assets',mountainSession.assetFile));
test('CM101 live remains unavailable without explicit Admin approval',async({page})=>{
await page.route('**/api/v1/dev/cm101-approved/**',r=>r.fulfill({json:{scope:'development-preview',productReference:p,variantReference:v,previewAvailable:false,inputs:null}}));
await page.goto('/xinobi-u/kendi-gorselin/?product='+p+'&variant='+v);await expect(page.getByText('Bu seçili ürün/varyant için geliştirme ürün önizlemesi kullanılamıyor.',{exact:true})).toBeVisible();expect(await page.locator('input[type=file]').count()).toBe(0);
});
test('CM101 mock accepted bundle renders local artwork at exact dimensions with mask and branding protection',async({page})=>{
test.setTimeout(180000);
await page.route('**/api/v1/dev/cm101-approved/**',async route=>{const u=new URL(route.request().url());if(u.pathname.endsWith('rendering-inputs'))return route.fulfill({json:bundle});const role=u.pathname.split('/').pop()!;return route.fulfill({contentType:role==='source'?'image/webp':'image/png',body:files[role as keyof typeof files]});});
await page.goto('/xinobi-u/kendi-gorselin/?product='+p+'&variant='+v);
await page.locator('input[type=file]').setInputFiles(path.join(repo,'apps/web/public/assets/personalization/sample-pattern.png'));
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
page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes++;});
await page.addInitScript(id=>sessionStorage.setItem('xinobi-u-selected-session',id),id);
await page.route('**/api/v1/design-studio/**',r=>r.request().url().endsWith('/image')?r.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(repo,'apps/web/public/assets/personalization/sample-pattern.png'))}):r.fulfill({json:{id,status:'ready',product:{id:p,name:'CM101'},variant:{id:v,color:'Metallic Navy'},imageUrl:'/api/v1/design-studio/sessions/'+id+'/image'}}));
await page.route('**/api/v1/dev/cm101-approved/**',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('rendering-inputs'))return r.fulfill({json:bundle});const role=u.pathname.split('/').pop()!;return r.fulfill({contentType:role==='source'?'image/webp':'image/png',body:files[role as keyof typeof files]});});
await page.goto('/xinobi-u/onizleme/');const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible({timeout:90000});expect(await canvas.evaluate((c:HTMLCanvasElement)=>[c.width,c.height])).toEqual([3543,5315]);expect(writes).toBe(0);await expect(page.getByText('Temsilidir',{exact:true})).toBeVisible();
});

test('CM101 stored AI mountain pattern warps before accepted-mask clipping without losing covered surface pixels',async({page})=>{
test.setTimeout(180000);const id=mountainSession.id;
await page.addInitScript(()=>{
 const width=3543,height=5315,total=width*height,proto=CanvasRenderingContext2D.prototype;
 const draw=proto.drawImage,get=proto.getImageData,put=proto.putImageData;
 const bits=(alpha:Uint8ClampedArray)=>{const result=new Uint8Array(Math.ceil(total/8));for(let i=0;i<total;i++)if(alpha[i*4+3]>=128)result[i>>3]|=1<<(i&7);return result;};
 const debugWindow=window as DebugWindow;debugWindow.__cm101PatternDebug={mask:null,source:null,missing:[]};
 const hookedDrawImage=function(this:CanvasRenderingContext2D,image:CanvasImageSource,...args:number[]){const result=Reflect.apply(draw,this,[image,...args]);if(image instanceof HTMLImageElement){const role=new URL(image.currentSrc||image.src,location.href).pathname.split('/').pop();const debug=debugWindow.__cm101PatternDebug;if((role==='mask'&&!debug?.mask)||(role==='source'&&!debug?.source)){const pixels=Reflect.apply(get,this,[0,0,width,height]);if(debug&&(role==='mask'||role==='source'))debug[role]=bits(pixels.data);}}return result;} as unknown as CanvasRenderingContext2D['drawImage'];
 const hookedPutImageData=function(this:CanvasRenderingContext2D,imageData:ImageData,...args:number[]){const debug=debugWindow.__cm101PatternDebug;if(imageData.width===width&&imageData.height===height&&debug?.mask&&debug.source){let upper=0,lower=0;for(let i=0;i<total;i++){const bit=1<<(i&7);if((debug.mask[i>>3]&bit)&&(debug.source[i>>3]&bit)&&imageData.data[i*4+3]===0){if(Math.floor(i/width)<Math.floor(height/2))upper++;else lower++;}}debug.missing.push({upper,lower});}return Reflect.apply(put,this,[imageData,...args]);} as unknown as CanvasRenderingContext2D['putImageData'];
 (proto as unknown as {drawImage:CanvasRenderingContext2D['drawImage'];putImageData:CanvasRenderingContext2D['putImageData']}).drawImage=hookedDrawImage;
 (proto as unknown as {drawImage:CanvasRenderingContext2D['drawImage'];putImageData:CanvasRenderingContext2D['putImageData']}).putImageData=hookedPutImageData;
});
await page.addInitScript(sessionId=>sessionStorage.setItem('xinobi-u-selected-session',sessionId),id);
await page.route('**/api/v1/design-studio/**',r=>r.request().url().endsWith('/image')?r.fulfill({contentType:mountainSession.assetMime,body:mountainPattern}):r.fulfill({json:{id,status:'ready',product:{id:p,name:'CM101'},variant:{id:v,color:'Metallic Navy'},imageUrl:'/api/v1/design-studio/sessions/'+id+'/image'}}));
await page.route('**/api/v1/dev/cm101-approved/**',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('rendering-inputs'))return r.fulfill({json:acceptedBundle});const role=u.pathname.split('/').pop()!;return r.fulfill({contentType:role==='source'?'image/webp':'image/png',body:acceptedFiles[role as keyof typeof acceptedFiles]});});
await page.goto('/xinobi-u/onizleme/');const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible({timeout:120000});
const urls=['source','mask','branding'].map(role=>'/api/v1/dev/cm101-approved/media/'+accepted.version+'/'+role);
const diagnostics=await page.evaluate(async(urls)=>{
 const c=document.querySelector('canvas[role=img]') as HTMLCanvasElement,out=c.getContext('2d',{willReadFrequently:true})!.getImageData(0,0,c.width,c.height).data;
 const read=async(url:string)=>{const image=new Image();image.src=url;await image.decode();const temp=document.createElement('canvas');temp.width=c.width;temp.height=c.height;const ctx=temp.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,0,0);return ctx.getImageData(0,0,c.width,c.height).data;};
 const [source,mask,branding]=await Promise.all(urls.map(read));let outside=0,logo=0,alpha=0,insideChanged=0,edgeTotal=0,edgeUnchanged=0;
 for(let i=0;i<out.length;i+=4){if(mask[i+3]<128){if(out[i]!==source[i]||out[i+1]!==source[i+1]||out[i+2]!==source[i+2]||out[i+3]!==source[i+3])outside++;}else if(out[i]!==source[i]||out[i+1]!==source[i+1]||out[i+2]!==source[i+2])insideChanged++;if(branding[i+3]===255&&(out[i]!==branding[i]||out[i+1]!==branding[i+1]||out[i+2]!==branding[i+2]||out[i+3]!==branding[i+3]))logo++;if(out[i+3]!==source[i+3])alpha++;}
 for(let y=0;y<c.height;y++){let x=0;while(x<c.width){while(x<c.width&&mask[(y*c.width+x)*4+3]<128)x++;if(x===c.width)break;const left=x;while(x+1<c.width&&mask[(y*c.width+x+1)*4+3]>=128)x++;const right=x;for(let px=left;px<=right;px++)if(px-left<32||right-px<32){const i=(y*c.width+px)*4;edgeTotal++;if(out[i]===source[i]&&out[i+1]===source[i+1]&&out[i+2]===source[i+2])edgeUnchanged++;}x++;}}
 const debug=(window as DebugWindow).__cm101PatternDebug;return{outside,logo,alpha,insideChanged,edgeTotal,edgeUnchanged,warpSnapshots:debug?.missing??[],maskCaptured:!!debug?.mask,sourceCaptured:!!debug?.source};
},urls);
console.log('CM101 stored mountain pattern diagnostics',diagnostics);
if(process.env.CM101_AFTER_DIAGNOSTIC){
 const png=await page.evaluate(async(maskUrl)=>{const rendered=document.querySelector('canvas[role=img]') as HTMLCanvasElement,diag=document.createElement('canvas');diag.width=1200;diag.height=1800;const ctx=diag.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,diag.width,diag.height);ctx.drawImage(rendered,0,0,diag.width,diag.height);const image=new Image();image.src=maskUrl;await image.decode();const maskCanvas=document.createElement('canvas');maskCanvas.width=diag.width;maskCanvas.height=diag.height;const maskContext=maskCanvas.getContext('2d',{willReadFrequently:true})!;maskContext.drawImage(image,0,0,diag.width,diag.height);const mask=maskContext.getImageData(0,0,diag.width,diag.height),overlay=document.createElement('canvas');overlay.width=diag.width;overlay.height=diag.height;const overlayContext=overlay.getContext('2d')!,edge=overlayContext.createImageData(diag.width,diag.height);for(let y=0;y<diag.height;y++)for(let x=0;x<diag.width;x++){const i=(y*diag.width+x)*4;if(mask.data[i+3]<128)continue;let boundary=x===0||y===0||x===diag.width-1||y===diag.height-1;if(!boundary){boundary=mask.data[i-4+3]<128||mask.data[i+4+3]<128||mask.data[i-diag.width*4+3]<128||mask.data[i+diag.width*4+3]<128;}if(boundary){edge.data[i]=0;edge.data[i+1]=255;edge.data[i+2]=255;edge.data[i+3]=225;}}overlayContext.putImageData(edge,0,0);ctx.drawImage(overlay,0,0);ctx.fillStyle='rgba(20,24,30,.9)';ctx.fillRect(0,0,diag.width,34);ctx.fillStyle='#fff';ctx.font='bold 18px Arial';ctx.fillText('CM101 Metallic Navy — yeni warp → maske kırpma',12,23);ctx.fillStyle='#00ffff';ctx.fillRect(930,11,16,12);ctx.fillStyle='#fff';ctx.font='14px Arial';ctx.fillText('aktif maske sınırı',952,23);return diag.toDataURL('image/png').split(',')[1];},urls[1]);
 fs.writeFileSync(process.env.CM101_AFTER_DIAGNOSTIC,Buffer.from(png,'base64'));
}
expect(await canvas.evaluate((c:HTMLCanvasElement)=>[c.width,c.height])).toEqual([3543,5315]);
const mountainSize=await page.evaluate(async(url)=>{const image=new Image();image.src=url;await image.decode();return[image.naturalWidth,image.naturalHeight];},'/api/v1/design-studio/sessions/'+id+'/image');expect(mountainSize).toEqual([1024,1024]);
expect(diagnostics.maskCaptured).toBe(true);expect(diagnostics.sourceCaptured).toBe(true);expect(diagnostics.warpSnapshots).toHaveLength(2);expect(diagnostics.warpSnapshots[0].upper).toBe(0);expect(diagnostics.warpSnapshots[1].lower).toBe(0);
expect(diagnostics.outside).toBe(0);expect(diagnostics.logo).toBe(0);expect(diagnostics.alpha).toBe(0);expect(diagnostics.insideChanged).toBeGreaterThan(0);expect(diagnostics.edgeTotal).toBeGreaterThan(0);expect(diagnostics.edgeUnchanged/diagnostics.edgeTotal).toBeLessThan(0.02);
});
}catch(error){
test('CM101 approval preview needs the local CM101 review data',()=>{test.skip(true,'Local CM101 review data is missing: '+(error instanceof Error?error.message:String(error)));});
}
