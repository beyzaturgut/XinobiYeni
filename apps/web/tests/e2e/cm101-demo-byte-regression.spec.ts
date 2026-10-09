import {execFileSync} from 'node:child_process';
import ts from 'typescript';
import {test,expect} from '@playwright/test';
test('demo pixels remain byte-exact against Oct7 lighting warp and compositing',async({page})=>{
test.setTimeout(120000);await page.goto('/urunler/cay-makinesi-101/editor/');const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();
const helper=(name:string)=>ts.transpileModule(execFileSync('git',['show','9401386ea319898bcffea4fb7bb105a5b591b013:apps/web/src/app/urunler/cay-makinesi-101/editor/'+name+'.ts'],{encoding:'utf8'}),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const difference=await canvas.evaluate(async(c:HTMLCanvasElement,codes:{lighting:string;warp:string})=>{
const exportsFor=(code:string)=>{const value:Record<string, (...args:never[])=>unknown>={};new Function('exports',code)(value);return value;};
const lighting=exportsFor(codes.lighting) as unknown as {deriveProductLighting:(p:ImageData,m:ImageData,b:ImageData)=>unknown;shadePattern:(p:ImageData,l:unknown)=>void};
const warp=exportsFor(codes.warp) as unknown as {deriveBodySurface:(m:ImageData)=>unknown;warpPattern:(p:ImageData,s:unknown,c:number)=>void};
const imgs=[];for(const src of ['/assets/products/tea-maker-101-blue.webp','/assets/personalization/tea-maker-101-blue-designable.png','/assets/personalization/tea-maker-101-blue-branding-overlay.png','/assets/personalization/sample-pattern.png']){const i=new Image();i.src=src;await i.decode();imgs.push(i);}
const buf=document.createElement('canvas');buf.width=1066;buf.height=1600;const ctx=buf.getContext('2d')!;
const pixels=(i:HTMLImageElement)=>{ctx.clearRect(0,0,1066,1600);ctx.drawImage(i,0,0);return ctx.getImageData(0,0,1066,1600);};
const product=pixels(imgs[0]),mask=pixels(imgs[1]),brand=pixels(imgs[2]),field=lighting.deriveProductLighting(product,mask,brand),surface=warp.deriveBodySurface(mask);
ctx.clearRect(0,0,1066,1600);ctx.save();ctx.translate(533,1040);ctx.scale(1.2,1.2);ctx.drawImage(imgs[3],-imgs[3].naturalWidth/2,-imgs[3].naturalHeight/2);ctx.restore();
const pattern=ctx.getImageData(0,0,1066,1600);warp.warpPattern(pattern,surface,.75);lighting.shadePattern(pattern,field);ctx.putImageData(pattern,0,0);
ctx.save();ctx.globalCompositeOperation='destination-in';ctx.drawImage(imgs[1],0,0);ctx.restore();
const result=document.createElement('canvas');result.width=1066;result.height=1600;const r=result.getContext('2d')!;r.drawImage(imgs[0],0,0);r.drawImage(buf,0,0);r.drawImage(imgs[2],0,0);
const baseline=r.getImageData(0,0,1066,1600).data,current=c.getContext('2d')!.getImageData(0,0,1066,1600).data;let differences=0;for(let n=0;n<baseline.length;n++)if(baseline[n]!==current[n])differences++;return differences;
},{lighting:helper('product-lighting'),warp:helper('product-surface-warp')});
console.log('Oct7 byte differences:',difference);expect(difference).toBe(0);
});
