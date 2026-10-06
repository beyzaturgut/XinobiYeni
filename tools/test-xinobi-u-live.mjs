import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
// Explicit live smoke test: creates one real Cloudflare image; never mocks or retries generation.
const api='http://127.0.0.1:5003/api/v1/design-studio';
const statusResponse=await fetch(api+'/status');
assert.ok(statusResponse.ok,'Local tasarım API’si yanıt vermedi.');
const status=await statusResponse.json();
assert.equal(status.configured,true,'Cloudflare kimlik bilgileri henüz yüklenmedi.');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
let generationRequests=0;
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.method()==='POST'&&request.url().endsWith('/generation'))generationRequests++});
 await page.goto('http://127.0.0.1:3000/xinobi-u');
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 await page.getByRole('link',{name:'Çay Makinesi 101 Lacivert için tasarım oluştur',exact:true}).click();
 await page.getByText('Soru 1 / 5',{exact:true}).waitFor();
 for(let step=1;step<=5;step++){
  assert.equal(await page.getByRole('radio').count(),4);
  await page.locator('fieldset label').first().click();
  await page.getByRole('button',{name:step===5?'Tercihlerimi gör →':'Devam et →',exact:true}).click();
 }
 await page.getByRole('heading',{name:'Birlikte şekillenen beş tercih.'}).waitFor();
 await page.screenshot({path:'/tmp/xinobi-u-live-profile.png',fullPage:true});
 const submitted=page.waitForResponse(response=>response.url().endsWith('/generation')&&response.request().method()==='POST');
 await page.getByRole('button',{name:'AI ile tasarımımı oluştur ✦',exact:true}).click();
 const response=await submitted;
 assert.equal(response.status(),200,`Üretim başlatılamadı: ${await response.text()}`);
 const job=await response.json();
 console.log(`Gerçek Cloudflare işi başlatıldı. Durum: ${job.status}. Tek görsel bekleniyor…`);
 await page.getByRole('heading',{name:'İşte sana özel yorum.'}).waitFor({timeout:150000}).catch(async error=>{
  const current=await (await fetch(api+'/sessions/'+job.id)).json();
  throw new Error(`Cloudflare sonucu: ${current.status}, ${current.errorCode||''}, ${current.errorMessage||error.message}`);
 });
 const completed=await (await fetch(api+'/sessions/'+job.id)).json();
 assert.equal(completed.status,'ready');
 const imageResponse=await fetch('http://127.0.0.1:5003'+completed.imageUrl);
 assert.ok(imageResponse.ok);const bytes=Buffer.from(await imageResponse.arrayBuffer());
 assert.ok(bytes.length>10000,'Beklenen gerçek görsel çıktısı gelmedi.');
 const mime=imageResponse.headers.get('content-type');
 const artifact=mime.includes('png')?'/tmp/xinobi-u-cloudflare-live.png':'/tmp/xinobi-u-cloudflare-live.jpg';
 await writeFile(artifact,bytes);
 await page.getByRole('button',{name:'Ürünümde dene ↗',exact:true}).click();
 await page.getByRole('img',{name:'Çay Makinesi 101 Lacivert üzerinde AI tasarımının dijital önizlemesi',exact:true}).waitFor();
 assert.equal(await page.locator('canvas').evaluate(canvas=>canvas.width>0&&canvas.height>0),true);
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Ürün önizlemesini indir',exact:true}).click();
 const file=await downloaded;await file.saveAs('/tmp/xinobi-u-cloudflare-product-preview.png');
 await page.screenshot({path:'/tmp/xinobi-u-cloudflare-live-preview-screen.png',fullPage:true});
 const disk=JSON.parse(await readFile('services/api/App_Data/local-commerce/design-studio/sessions.json','utf8'));const saved=disk.sessions[job.id];
 assert.equal(saved.providerModel,'@cf/black-forest-labs/flux-1-schnell');
 assert.equal(saved.assetSha256.toLowerCase(),createHash('sha256').update(bytes).digest('hex'));
 assert.equal(generationRequests,1);assert.deepEqual(errors,[]);
 await writeFile('/tmp/xinobi-u-cloudflare-live-report.json',JSON.stringify({status:'ready',provider:saved.providerModel,providerRequestRecorded:Boolean(saved.providerRequestId),bytes:bytes.length,mime,generationRequests,artifact,preview:'/tmp/xinobi-u-cloudflare-product-preview.png'},null,2));
 console.log(`PASS: Tek gerçek Cloudflare üretimi (${bytes.length} byte, ${mime}), 5 yanıtla eşleşen sonuç, seçilen ürün üzerinde perspektifli önizleme ve PNG indirme.`);
}catch(error){console.error(error.message);process.exitCode=1}finally{await browser.close()}
