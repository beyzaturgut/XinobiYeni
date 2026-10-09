const {chromium}=require('../apps/web/node_modules/@playwright/test'),fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const immutable=[path.join(root,'services/api/App_Data/real-catalog-qa/state.json'),path.join(root,'services/api/App_Data/cm101-sam3-review/manual-editor/approved/current.json')],before=immutable.map(f=>hash(fs.readFileSync(f)));
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-networking']});try{
const p=await b.newPage({viewport:{width:1440,height:1000}});let generation=0,session=null;const responses=[];
await p.route('**/*',r=>{const u=new URL(r.request().url());if(!['127.0.0.1','localhost'].includes(u.hostname))return r.abort();if(u.pathname.includes('/generation')){generation++;return r.abort();}return r.continue();});
p.on('response',r=>{if(r.url().includes('/design-studio/'))responses.push([r.request().method(),r.status(),r.url()]);});
await p.goto('http://127.0.0.1:3032/');const cookie=p.getByRole('button',{name:'Çerez tercih panelini kapat'});if(await cookie.isVisible())await cookie.click();
await p.getByRole('navigation',{name:'Ana menü',exact:true}).getByRole('link',{name:'XINOBI U',exact:true}).click();
const card=p.locator('article').filter({has:p.getByRole('heading',{name:'Elektrikli Çay Makinesi CM 101-105',exact:true})});await card.getByRole('link',{name:'Tarzını Keşfet ↗',exact:true}).click();
await p.getByRole('radio').first().waitFor({timeout:30000});
const id=await p.evaluate(()=>sessionStorage.getItem('xinobi-u-selected-session'));const response=await p.request.get('http://127.0.0.1:3032/api/v1/design-studio/sessions/'+id);assert.equal(response.status(),200);session=await response.json();assert.equal(session.product.id,'DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6');assert.equal(session.variant.id,'DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1');assert.equal(session.questions.length,5);
for(let n=0;n<5;n++){await p.getByRole('radio').first().check();await p.getByRole('button',{name:n===4?'Tercihlerimi gör →':'Devam et →',exact:true}).click();}
await p.getByRole('heading',{name:'Birlikte şekillenen beş tercih.',exact:true}).waitFor();assert.equal(await p.locator('dl dd').count(),5);assert.ok(await p.getByRole('button',{name:'AI ile tasarımımı oluştur ✦',exact:true}).isDisabled());assert.equal(generation,0);
const answers=await p.evaluate(id=>JSON.parse(sessionStorage.getItem('xinobi-u-answers:'+id)),id);assert.equal(Object.keys(answers).length,5);
await p.reload();await p.getByRole('radio').first().waitFor();assert.ok(await p.getByRole('radio').first().isChecked());
for(const[method,route]of [['POST','/api/v1/design-studio/sessions/'+id+'/generation'],['PUT','/api/v1/design-studio/sessions/'+id],['PATCH','/api/v1/design-studio/sessions/'+id],['DELETE','/api/v1/design-studio/sessions/'+id],['POST','/api/v1/design-studio/other']]){
const r=await p.request.fetch('http://127.0.0.1:3032'+route,{method,headers:{Origin:'http://127.0.0.1:3032','Content-Type':'application/json'},data:'{}'});assert.equal(r.status(),405);
}
assert.equal((await p.request.post('http://127.0.0.1:5021/api/v1/design-studio/sessions',{headers:{Origin:'http://evil.test'},data:{}})).status(),403);
for(let n=0;n<immutable.length;n++)assert.equal(hash(fs.readFileSync(immutable[n])),before[n]);
console.log('PASS: real menu -> Tarzını Keşfet -> 5 questions/answers -> design profile; exact CM101 identity, answer resume, generation and unrelated design writes blocked, no catalog/approval changes.');console.log('Design HTTP:',responses);
const ready={...session,status:'ready',imageUrl:'/api/v1/design-studio/sessions/'+id+'/image'};
await p.route('**/api/v1/design-studio/**',r=>r.request().url().replace(/\/$/,'').endsWith('/image')?r.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(root,'apps/web/public/assets/personalization/sample-pattern.png'))}):r.fulfill({json:r.request().url().replace(/\/$/,'').endsWith('/status')?{configured:false}:ready}));
await p.reload();await p.getByRole('heading',{name:'İşte sana özel yorum.',exact:true}).waitFor();if(await cookie.isVisible())await cookie.click();await p.getByRole('button',{name:'Ürünümde dene ↗',exact:true}).click();await p.locator('canvas[role=img]').waitFor({timeout:90000});assert.deepEqual(await p.locator('canvas[role=img]').evaluate(c=>[c.width,c.height]),[3543,5315]);assert.equal(generation,0);console.log('PASS: mocked ready AI result -> real approved CM101 canonical preview, zero generation requests.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
