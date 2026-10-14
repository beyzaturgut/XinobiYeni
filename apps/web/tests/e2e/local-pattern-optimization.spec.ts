import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { artworkReadOnly } from './artwork-read-only';

const source = ts.transpileModule(readFileSync('src/features/product-personalization/local-pattern-image.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
declare global { interface Window { preparePhoto: (file: File, signal?: AbortSignal) => Promise<File> } }
test.beforeEach(async ({ page }) => {
 await artworkReadOnly(page);
 await page.addInitScript({ content: `(() => { const exports = {}; ${source}; window.preparePhoto = exports.prepareLocalPattern; })()` });
 await page.goto('/xinobi-u/kendi-gorselin/');
});

const cases = [
 { name: 'unchanged JPEG', mime: 'image/jpeg', width: 320, height: 240 },
 { name: 'unchanged PNG', mime: 'image/png', width: 320, height: 240, alpha: true },
 { name: 'unchanged WebP', mime: 'image/webp', width: 320, height: 240, alpha: true },
 { name: 'phone JPEG', mime: 'image/jpeg', width: 4032, height: 3024 },
 { name: 'large transparent PNG', mime: 'image/png', width: 4096, height: 4096, alpha: true },
 { name: 'large transparent WebP', mime: 'image/webp', width: 4096, height: 4096, alpha: true },
 { name: 'oversized JPEG bytes', mime: 'image/jpeg', width: 320, height: 240, padded: true },
 { name: 'oversized transparent PNG bytes', mime: 'image/png', width: 320, height: 240, alpha: true, padded: true },
 { name: 'EXIF clockwise JPEG', mime: 'image/jpeg', width: 96, height: 48, padded: true, exif: 6 },
 { name: 'unchanged EXIF JPEG', mime: 'image/jpeg', width: 96, height: 48, exif: 6 },
];
for (const entry of cases) test(entry.name, async ({ page }) => {
 const metrics = await page.evaluate(async entry => {
  const canvas = document.createElement('canvas'); canvas.width = entry.width; canvas.height = entry.height;
  const ctx = canvas.getContext('2d')!;
  if (entry.alpha) { ctx.fillStyle = 'rgba(255,0,0,0.4)'; ctx.fillRect(entry.width / 4, entry.height / 4, entry.width / 2, entry.height / 2); }
  else { ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, entry.width / 2, entry.height); ctx.fillStyle = '#0000ff'; ctx.fillRect(entry.width / 2, 0, entry.width / 2, entry.height); }
  const original = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), entry.mime, .95));
  canvas.width = 0; canvas.height = 0;
  let blob: Blob = original;
  if (entry.exif) {
   const bytes = new Uint8Array(await original.arrayBuffer());
   const app1 = new Uint8Array([255,225,0,34,69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,entry.exif,0,0,0,0,0,0,0]);
   // APP1 payload is 32 bytes (including Exif prefix); keep the JPEG unchanged.
   blob = new Blob([bytes.slice(0,2), app1, bytes.slice(2)], { type: entry.mime });
  }
  if (entry.padded) blob = new Blob([blob, new Uint8Array(8 * 1024 * 1024)], { type: entry.mime });
  const file = new File([blob], 'photo', { type: entry.mime });
  const started = performance.now(); const output = await window.preparePhoto(file); const elapsedMs = performance.now() - started;
  const bitmap = await createImageBitmap(output);
  const pixels = document.createElement('canvas'); pixels.width = bitmap.width; pixels.height = bitmap.height;
  const context = pixels.getContext('2d')!; context.drawImage(bitmap, 0, 0);
  const sample = (x: number, y: number) => [...context.getImageData(x, y, 1, 1).data];
  const result = { name: entry.name, unchanged: output === file, inputWidth: entry.width, inputHeight: entry.height, inputBytes: file.size, outputWidth: bitmap.width, outputHeight: bitmap.height, outputBytes: output.size, outputType: output.type, elapsedMs, corner: sample(0,0), center: sample(Math.floor(bitmap.width/2),Math.floor(bitmap.height/2)), top: sample(Math.floor(bitmap.width/2),Math.floor(bitmap.height/4)), bottom: sample(Math.floor(bitmap.width/2),Math.floor(bitmap.height*3/4)) };
  bitmap.close(); pixels.width = 0; pixels.height = 0; return result;
 }, entry);
 console.log(JSON.stringify(metrics));
 await test.info().attach('optimization-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
 expect(metrics.outputWidth).toBeLessThanOrEqual(4096); expect(metrics.outputHeight).toBeLessThanOrEqual(4096);
 expect(metrics.outputWidth * metrics.outputHeight).toBeLessThanOrEqual(8 * 1024 * 1024); expect(metrics.outputBytes).toBeLessThanOrEqual(8 * 1024 * 1024);
 expect(metrics.unchanged).toBe(entry.width * entry.height <= 8 * 1024 * 1024 && !entry.padded);
 const orientedRatio = entry.exif === 6 ? entry.height / entry.width : entry.width / entry.height;
 expect(metrics.outputWidth / metrics.outputHeight).toBeCloseTo(orientedRatio, 2);
 if (entry.alpha) { expect(metrics.corner[3]).toBe(0); expect(metrics.center[3]).toBeGreaterThanOrEqual(100); expect(metrics.center[3]).toBeLessThanOrEqual(104); expect(metrics.outputType).not.toBe('image/jpeg'); }
 if (entry.exif === 6) { expect(metrics.top[0]).toBeGreaterThan(200); expect(metrics.top[2]).toBeLessThan(50); expect(metrics.bottom[2]).toBeGreaterThan(200); }
});

test('input safety cap rejects before decoding', async ({ page }) => {
 const result = await page.evaluate(async () => {
  let decoded = 0; const original = window.createImageBitmap;
  window.createImageBitmap = ((...args: Parameters<typeof createImageBitmap>) => { decoded++; return original(...args); }) as typeof createImageBitmap;
  try { await window.preparePhoto(new File([new Uint8Array(64*1024*1024+1)], 'too-big.png', { type:'image/png' })); return { decoded, error:'' }; }
  catch (error) { return { decoded, error:(error as Error).message }; }
  finally { window.createImageBitmap = original; }
 });
 expect(result.decoded).toBe(0); expect(result.error).toContain('64 MiB');
});

test('real oversized transparent PNG uses alpha-preserving compression',async({page})=>{
 const metrics=await page.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=1800;c.height=1800;const ctx=c.getContext('2d')!;const pixels=ctx.createImageData(c.width,c.height);
  for(let i=0;i<pixels.data.length;i+=65536)crypto.getRandomValues(pixels.data.subarray(i,Math.min(i+65536,pixels.data.length)));
  for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=102;pixels.data[3]=0;ctx.putImageData(pixels,0,0);
  const blob=await new Promise<Blob>(r=>c.toBlob(b=>r(b!),'image/png'));c.width=0;c.height=0;
  const start=performance.now();const output=await window.preparePhoto(new File([blob],'noise.png',{type:'image/png'}));const elapsedMs=performance.now()-start;
  const bitmap=await createImageBitmap(output);const preview=document.createElement('canvas');preview.width=bitmap.width;preview.height=bitmap.height;const buffer=preview.getContext('2d')!;buffer.drawImage(bitmap,0,0);
  const result={inputBytes:blob.size,outputBytes:output.size,width:bitmap.width,height:bitmap.height,type:output.type,elapsedMs,cornerAlpha:buffer.getImageData(0,0,1,1).data[3],centerAlpha:buffer.getImageData(900,900,1,1).data[3]};bitmap.close();preview.width=0;preview.height=0;return result;
 });
 console.log(JSON.stringify(metrics));await test.info().attach('compression-metrics',{body:JSON.stringify(metrics,null,2),contentType:'application/json'});
 expect(metrics.inputBytes).toBeGreaterThan(8*1024*1024);expect(metrics.outputBytes).toBeLessThanOrEqual(8*1024*1024);expect(metrics.width).toBe(1800);expect(metrics.height).toBe(1800);expect(metrics.type).toBe('image/webp');expect(metrics.cornerAlpha).toBe(0);expect(metrics.centerAlpha).toBe(102);
});

test('huge header dimensions are rejected before decoding',async({page})=>{
 const result=await page.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=1;c.height=1;const blob=await new Promise<Blob>(r=>c.toBlob(b=>r(b!)));const bytes=await blob.arrayBuffer();c.width=0;c.height=0;
  const view=new DataView(bytes);view.setUint32(16,10001);view.setUint32(20,10001);
  let decoded=0;const decode=window.createImageBitmap;window.createImageBitmap=(()=>{decoded++;throw Error('unexpected decoder')}) as typeof createImageBitmap;
  try{await window.preparePhoto(new File([bytes],'huge.png',{type:'image/png'}));return{decoded,error:''}}catch(error){return{decoded,error:(error as Error).message}}finally{window.createImageBitmap=decode}
 });
 expect(result.decoded).toBe(0);expect(result.error).toContain('güvenli işleme sınırını');
});

test('encoder failure returns Turkish error and releases bitmap/canvas',async({page})=>{
 const result=await page.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=32;c.height=32;const blob=await new Promise<Blob>(r=>c.toBlob(b=>r(b!),'image/jpeg'));c.width=0;c.height=0;
  const file=new File([blob,new Uint8Array(8*1024*1024)],'large.jpg',{type:'image/jpeg'});
  const decode=window.createImageBitmap.bind(window),encode=HTMLCanvasElement.prototype.toBlob;let closed=0;const working:HTMLCanvasElement[]=[];
  window.createImageBitmap=(async(input:ImageBitmapSource,options?:ImageBitmapOptions)=>{const bitmap=await decode(input,options),close=bitmap.close.bind(bitmap);bitmap.close=()=>{closed++;close()};return bitmap}) as typeof createImageBitmap;
  HTMLCanvasElement.prototype.toBlob=function(){working.push(this);throw new DOMException('test encoder failure','InvalidStateError')};
  try{await window.preparePhoto(file);return{error:'',closed,released:false}}catch(error){return{error:(error as Error).message,closed,released:working.length===1&&working.every(canvas=>canvas.width===0&&canvas.height===0)}}finally{window.createImageBitmap=decode;HTMLCanvasElement.prototype.toBlob=encode}
 });
 expect(result.error).toContain('Görsel bu cihazda hazırlanamadı');expect(result.closed).toBe(1);expect(result.released).toBe(true);
});
