const {chromium}=require('../../apps/web/node_modules/@playwright/test'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),source=fs.readFileSync(path.join(root,'services/api/App_Data/cm101-sam3-review/pending/cbb1dbc9-2582-45dc-85ee-6de5fd27106c/source.webp'));
const product='DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6',variant='DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1',sha='f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935';
const image='/api/v1/local-commerce/media/01b20091ecaa4fbb86a9a929bf7b56ee.webp';
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-networking']});const p=await b.newPage({viewport:{width:1300,height:1000}});
let writes=0;await p.route('**/*',async r=>{const req=r.request(),u=new URL(req.url());if(!['127.0.0.1','localhost'].includes(u.hostname))return r.abort();if(req.method()!=='GET'){writes++;return r.abort();}
if(u.pathname==='/api/v1/local-commerce/state')return r.fulfill({json:{products:[{id:product,name:'CM101 test',active:true,personalizable:true,variants:[{id:variant,color:'Metallic Navy',image},{id:'different-variant',color:'Other',image}]}],prices:{},content:{slides:[]}}});
if(u.pathname===image)return r.fulfill({body:source,contentType:'image/webp'});return r.continue();});
await p.goto('http://127.0.0.1:5176/');await p.getByRole('button',{name:'Ürün yüzeyi incele (geliştirme)',exact:true}).click();
const pr=p.getByRole('combobox',{name:'Ürün',exact:true}),vr=p.getByRole('combobox',{name:'Varyant',exact:true});await pr.selectOption(product);await vr.selectOption(variant);
await p.getByRole('button',{name:'Yerel maske editörünü aç',exact:true}).waitFor({timeout:30000});const node=p.getByTestId('catalog-surface-source');assert.equal(await node.getAttribute('data-source-sha256'),sha);assert.equal(await node.getAttribute('data-source-width'),'3543');assert.equal(await node.getAttribute('data-source-height'),'5315');
await p.getByRole('button',{name:'Yerel maske editörünü aç',exact:true}).click();
const frame=p.frameLocator('iframe[title="Seçili varyantın yerel maske editörü"]');await frame.getByRole('status').filter({hasText:'Hazır'}).waitFor({timeout:60000});
assert.equal(await frame.getByRole('button',{name:'Yeni bekleyen sürümü kaydet'}).count(),1);
await vr.selectOption('different-variant');await p.getByText('Bu varyant için kaynakla eşleşen yerel maske adayı yok. Başka ürünün maskesi kullanılmadı.').waitFor({timeout:30000});assert.equal(await p.locator('iframe').count(),0);assert.equal(await p.getByRole('button',{name:'Yerel maske editörünü aç',exact:true}).count(),0);assert.equal(writes,0);
const q=new URLSearchParams({productId:product,variantId:variant,sha256:sha,width:'3543',height:'5315'});
for(const[key,bad]of [['productId','wrong'],['variantId','wrong'],['sha256','wrong'],['width','1066'],['height','1600']]){const wrong=new URLSearchParams(q);wrong.set(key,bad);const res=await p.request.get('http://127.0.0.1:3045/?'+wrong);assert.equal(res.status(),400,key+' server rejection');}
const res=await p.request.get('http://127.0.0.1:3045/?'+q);assert.equal(res.status(),200);assert.ok(res.headers()['content-security-policy'].includes("frame-ancestors 'self' http://127.0.0.1:5176"));
console.log('PASS: Admin exact product/variant/SHA/dimensions binding, embedded editor ready, other variant denied, server tuple mismatch rejection, zero writes/inference');await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});
