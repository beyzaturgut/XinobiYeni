import AxeBuilder from '@axe-core/playwright';
import {test,expect} from '@playwright/test';
import {readdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {mockStore,closeConsent,mockReferenceSurface} from './fixtures';
import {mockAcceptedSurfaces} from './preview-readiness-fixtures';
const root=path.resolve('src/app');
function pages(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pages(path.join(dir,e.name)):e.name==='page.tsx'?['/'+path.relative(root,dir).replaceAll('\\','/')+'/']:[])}
export const routes=pages(root).map(p=>p.replace('//','/')).sort();
for(const width of [320,390,768,1440])test(`all web routes ${width}px normal and 200% text`,async({page},info)=>{
 test.setTimeout(240000);await page.setViewportSize({width,height:900});await mockStore(page,{signedIn:true,cart:true});await mockAcceptedSurfaces(page);
 await page.route('**/api/v1/me/notifications',r=>r.fulfill({json:{items:[],unread:0}}));
 await page.route('**/api/v1/me/reviews',r=>r.fulfill({json:[]}));
 await page.route('**/api/v1/catalog/products/*/reviews*',r=>r.fulfill({json:{summary:{productId:'DEMO-P101',count:0,average:0,distribution:[0,0,0,0,0]},items:[],page:1,pageSize:10}}));
 type Scan={overflow:boolean;offenders:{tag:string;text:string|undefined;cls:string}[]};
 const errors:string[]=[],accessibility:string[]=[],matrix:{route:string;target:string;url:string;normal:Scan;enlarged:Scan}[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [i,route]of routes.entries()){
  const target=route==='/urunler/detay/'?route+'?id=DEMO-P101':route;
  await page.goto(target);if(await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).isVisible())await closeConsent(page);
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(180);
  const scan=async()=>page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,offenders:[...document.querySelectorAll<HTMLElement>('body *')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&s.position!=='absolute'&&s.position!=='fixed'&&!e.closest('[data-allow-horizontal-scroll],canvas')}).slice(0,5).map(e=>({tag:e.tagName,text:e.textContent?.slice(0,60),cls:e.className}))}));
  const normal=await scan();
  if(width===390){const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();for(const v of results.violations)if(['critical','serious'].includes(v.impact||''))accessibility.push(`${route}: ${v.id} ${v.nodes.map(n=>n.target.join(' ')).join('; ')}`)}
  if(width===390||width===1440)await page.screenshot({path:info.outputPath(`${i}-${width}.png`),fullPage:true});
  await page.evaluate(()=>{const els=[...document.querySelectorAll<HTMLElement>('body *')].filter(e=>!e.closest('svg,canvas,script,style')).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]as const);for(const[e,size]of els)if(size)e.style.setProperty('font-size',`${size*2}px`,'important')});
  const enlarged=await scan();matrix.push({route,target,url:page.url(),normal,enlarged});
 }
 writeFileSync(info.outputPath(`matrix-${width}.json`),JSON.stringify({matrix,errors,accessibility},null,2));
 expect(errors).toEqual([]);expect(accessibility).toEqual([]);
 expect(matrix.filter(row=>row.normal.overflow||row.enlarged.overflow)).toEqual([]);
});

test('private collection failures stay distinct from empty, retry independently, and retain address edits',async({page})=>{
 await mockStore(page,{signedIn:true});let fail=true;
 await page.route('**/api/v1/me/addresses',r=>r.fulfill(fail?{status:503,json:{title:'Adres servisi test kesintisi'}}:{json:[]}));
 await page.goto('/hesap/adresler/');await closeConsent(page);
 await expect(page.getByRole('alert').filter({hasText:'Adres servisi test kesintisi'})).toBeVisible();
 await expect(page.getByText(/Henüz kayıtlı adresin yok/)).not.toBeVisible();
 fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByText(/Henüz kayıtlı adresin yok/)).toBeVisible();
 await page.getByRole('button',{name:'Adres ekle',exact:true}).click();await page.getByLabel('Adres başlığı').fill('Kaybolmayan adres');
 await page.route('**/api/v1/me/addresses',r=>r.request().method()==='POST'?r.fulfill({status:400,json:{title:'Test adres doğrulaması'}}):r.fulfill({json:[]}));
 await page.getByRole('button',{name:'Kaydet',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'Test adres doğrulaması'})).toBeVisible();await expect(page.getByLabel('Adres başlığı')).toHaveValue('Kaybolmayan adres');
 await page.goto('/hesap/siparisler/');await closeConsent(page);await expect(page.getByText('TEST-ORDER-1',{exact:true})).toBeVisible();
});

test('session outage is not presented as signed out and retry restores account',async({page})=>{
 await mockStore(page,{signedIn:true});let fail=true;await page.route('**/api/v1/me',r=>fail?r.fulfill({status:503,json:{title:'Hesap test kesintisi'}}):r.fallback());
 await page.goto('/hesap/');await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:'Hesap test kesintisi'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Giriş yap',exact:true})).not.toBeVisible();fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByText('Test Kullanıcı',{exact:true}).first()).toBeVisible();
});

test('notification and review read failures never announce empty success',async({page})=>{
 await mockStore(page,{signedIn:true});let fail=true;
 await page.route('**/api/v1/me/notifications',r=>r.fulfill(fail?{status:503,json:{title:'Bildirim test kesintisi'}}:{json:{items:[],unread:0}}));
 await page.route('**/api/v1/me/reviews',r=>r.fulfill(fail?{status:503,json:{title:'Yorum test kesintisi'}}:{json:[]}));
 await page.goto('/hesap/bildirimler/');await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:'Bildirim test kesintisi'})).toBeVisible();await expect(page.getByText('Henüz bildirimin yok.')).not.toBeVisible();
 fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByText('Henüz bildirimin yok.')).toBeVisible();
 fail=true;await page.goto('/hesap/degerlendirmelerim/');await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:'Yorum test kesintisi'})).toBeVisible();await expect(page.getByText('Henüz değerlendirmen yok.')).not.toBeVisible();
 fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByText('Henüz değerlendirmen yok.')).toBeVisible();
});

test('review dialog traps focus, closes with Escape, and keeps a failed draft',async({page})=>{
 await mockStore(page,{signedIn:true});await page.route('**/api/v1/me/reviews',r=>r.fulfill(r.request().method()==='POST'?{status:503,json:{title:'Yorum kayıt test kesintisi'}}:{json:[]}));
 await page.goto('/hesap/degerlendirmelerim/');await closeConsent(page);const trigger=page.getByRole('button',{name:/Değerlendir →/}).first();await trigger.click();const dialog=page.getByRole('dialog',{name:'Ürünü değerlendir'});await expect(dialog).toBeVisible();
 for(let i=0;i<12;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true)}
 await dialog.getByLabel('5 yıldız').check();await dialog.getByLabel('Yorumun').fill('Kaybolmaması gereken test yorumu.');await dialog.getByRole('button',{name:'İncelemeye gönder'}).click();await expect(dialog.getByRole('alert')).toContainText('Yorum kayıt test kesintisi');await expect(dialog.getByLabel('Yorumun')).toHaveValue('Kaybolmaması gereken test yorumu.');
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
});


test('own-image upload and placement remain usable without design or generation writes',async({page},info)=>{
 const {requests}=await mockStore(page);await mockReferenceSurface(page);
 await page.goto('/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-B&mode=pattern');await closeConsent(page);
 await page.getByLabel('Dosya seç',{exact:true}).setInputFiles('public/assets/personalization/sample-pattern.png');
 await expect(page.locator('main img[alt^="Yüklenen"]')).toBeVisible();
 await page.getByRole('button',{name:'Önizlemeye geç →'}).click();await expect(page.locator('canvas[role=img]')).toBeVisible();
 await page.screenshot({path:info.outputPath('uploaded-placement-390.png'),fullPage:true});
 expect(requests.filter(request=>request.path!=='/auth/web/refresh')).toEqual([]);
});

test('saved design rename failure preserves the list and editable name',async({page})=>{
 await mockStore(page,{signedIn:true});let fail=true;
 const design={id:'fixture-design',kind:'upload',name:'Örnek tasarım',productId:'DEMO-P101',productName:'Çay Makinesi 101',variantId:'DEMO-V101-B',color:'Lacivert',profile:[],imageUrl:'/api/v1/me/designs/fixture-design/image',createdAt:new Date().toISOString()};
 await page.route('**/api/v1/me/designs',r=>r.fulfill({json:[design]}));
 await page.route('**/api/v1/me/designs/fixture-design',r=>r.fulfill(fail?{status:503,json:{title:'Tasarım kayıt test kesintisi'}}:{json:{...design,name:'Yeni tasarım adı'}}));
 await page.goto('/hesap/tasarimlarim/');await closeConsent(page);await page.getByRole('button',{name:'Yeniden adlandır'}).click();await page.getByLabel('Tasarım adı').fill('Yeni tasarım adı');await page.getByRole('button',{name:'Kaydet',exact:true}).click();
 await expect(page.getByRole('alert').filter({hasText:'Tasarım kayıt test kesintisi'})).toBeVisible();await expect(page.getByLabel('Tasarım adı')).toHaveValue('Yeni tasarım adı');
 fail=false;await page.getByRole('button',{name:'Kaydet',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Tasarım adı güncellendi.'})).toBeVisible();await expect(page.getByRole('heading',{name:'Yeni tasarım adı'})).toBeVisible();
});

test('slow addresses announce loading before a confirmed empty collection',async({page})=>{
 await mockStore(page,{signedIn:true});let release:()=>void=()=>{};const wait=new Promise<void>(resolve=>{release=resolve});await page.route('**/api/v1/me/addresses',async r=>{await wait;await r.fulfill({json:[]})});
 await page.goto('/hesap/adresler/');await closeConsent(page);try{await expect(page.getByRole('status').filter({hasText:'Adresler yükleniyor…'}).first()).toBeVisible();await expect(page.getByText(/Henüz kayıtlı adresin yok/)).not.toBeVisible()}finally{release()}
 await expect(page.getByText(/Henüz kayıtlı adresin yok/)).toBeVisible();
});


test('order service failure offers retry rather than claiming no orders',async({page})=>{
 await mockStore(page,{signedIn:true});let fail=true;await page.route('**/api/v1/me/orders',r=>r.fulfill(fail?{status:503,json:{title:'Sipariş test kesintisi'}}:{json:[]}));
 await page.goto('/hesap/siparisler/');await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:'Sipariş test kesintisi'})).toBeVisible();await expect(page.getByText('Henüz siparişin yok.')).not.toBeVisible();
 fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByText('Henüz siparişin yok.')).toBeVisible();
});

test('questionnaire failure announces an alert and retries to a fixture result without generation',async({page},info)=>{
 const {state,requests}=await mockStore(page);await mockReferenceSurface(page);let fail=true;
 await page.route('**/api/v1/design-studio/status',r=>r.fulfill({json:{configured:false}}));
 await page.route('**/api/v1/design-studio/sessions',r=>r.fulfill(fail?{status:503,json:{message:'Anket test kesintisi'}}:{json:{id:'fixture-ai',status:'ready',product:state.products[0],variant:state.products[0].variants[0],questions:[],answers:[],imageUrl:'/assets/personalization/sample-pattern.png'}}));
 await page.route('**/assets/personalization/sample-pattern.png',r=>r.fulfill({path:'public/assets/personalization/sample-pattern.png'}));
 await page.goto('/xinobi-u/sorular/?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:'Anket test kesintisi'})).toBeVisible();
 fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByRole('heading',{name:'İşte sana özel yorum.'})).toBeVisible();
 await page.screenshot({path:info.outputPath('ai-result-fixture-390.png'),fullPage:true});expect(requests.filter(request=>request.path.includes('/generation'))).toEqual([]);
});


test('active questionnaire and unavailable generation summary fit all widths and preserve choices',async({page},info)=>{
 test.setTimeout(120000);const {state,requests}=await mockStore(page);await mockReferenceSurface(page);
 await page.route('**/api/v1/design-studio/status',r=>r.fulfill({json:{configured:false}}));
 const questions=Array.from({length:5},(_,i)=>({id:'question-'+i,axis:'style',axisLabel:'Tasarım tercihi '+(i+1),text:'Tasarımında hangi duyguyu öne çıkarmak istersin?',options:[{id:'a',label:'Doğadan ilham alan sakin çizgiler'},{id:'b',label:'Canlı renkler ve hareketli desenler'},{id:'c',label:'Minimal ve sade bir görünüm'}]}));
 const session={id:'fixture-questions',status:'questionnaire',expiresAt:new Date(Date.now()+3600000).toISOString(),bankVersion:'test',product:state.products[0],variant:state.products[0].variants[0],questions,answers:[],imageUrl:null,errorCode:null,errorMessage:null};
 await page.route('**/api/v1/design-studio/sessions',r=>r.fulfill({json:session}));await page.route('**/api/v1/design-studio/sessions/fixture-questions',r=>r.fulfill({json:session}));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/xinobi-u/sorular/?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);await expect(page.getByRole('heading',{name:questions[0].text})).toBeVisible();
  await page.evaluate(()=>{const nodes=[...document.querySelectorAll<HTMLElement>('body *')].filter(e=>!e.closest('svg,canvas,script,style')).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]as const);for(const[e,n]of nodes)if(n)e.style.setProperty('font-size',n*2+'px','important')});
  for(let step=0;step<5;step++){await page.locator('label').filter({has:page.getByRole('radio')}).first().click();expect(await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,offenders:[...document.querySelectorAll<HTMLElement>('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)}).slice(0,5).map(e=>({cls:e.className,text:e.textContent?.slice(0,60)}))}))).toMatchObject({overflow:false});await page.getByRole('button',{name:step===4?'Tercihlerimi gör →':'Devam et →',exact:true}).click()}
  await expect(page.getByRole('heading',{name:'Birlikte şekillenen beş tercih.'})).toBeVisible();await expect(page.getByRole('button',{name:/AI ile tasarımımı oluştur/})).toBeDisabled();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  if(width===390)await page.screenshot({path:info.outputPath('questionnaire-summary-text200.png'),fullPage:true});
 }
 expect(requests.filter(r=>r.path.includes('/generation'))).toEqual([]);
});

for(const route of ['/favoriler/','/sepet/','/odeme/'])test(`catalog failure on ${route} blocks false empty or stale checkout`,async({page})=>{
 await mockStore(page,{signedIn:true,cart:true});let fail=true;
 await page.route(/\/api\/v1\/(?:local-commerce\/state|catalog\/storefront)$/,r=>fail?r.fulfill({status:503,json:{title:'Katalog test kesintisi'}}):r.fallback());
 await page.goto(route);await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:/Ürün ve içerik bağlantısı kurulamadı/})).toBeVisible();await expect(page.getByText('Favori listeniz henüz boş.')).not.toBeVisible();
 if(route==='/odeme/')await expect(page.getByRole('button',{name:'Ödemeyi tamamla'})).toBeDisabled();
 fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).first().click();await expect(page.getByRole('alert').filter({hasText:/Ürün ve içerik bağlantısı kurulamadı/})).not.toBeVisible();
});

test('return policy failure is not treated as ineligible and can be retried',async({page})=>{
 await mockStore(page,{signedIn:true});let fail=true;await page.route('**/api/v1/me/order-options',r=>fail?r.fulfill({status:503,json:{title:'Koşul servisi test kesintisi'}}):r.fallback());
 await page.goto('/hesap/siparisler/iade/?siparis=test-order');await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:'İade seçenekleri yüklenemedi.'})).toBeVisible();await expect(page.getByText('İade edilemez',{exact:true})).not.toBeVisible();
 fail=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByRole('button',{name:'İade talebini gönder'})).toBeVisible();
});


test('Nobi configuration outage retries and a failed message keeps its draft',async({page})=>{
 await mockStore(page);let fail=true;await page.route('**/api/v1/assistant/config',r=>fail?r.fulfill({status:503,json:{title:'Nobi test kesintisi'}}):r.fallback());await page.route('**/api/v1/assistant/messages',r=>r.fulfill({status:503,json:{title:'Mesaj test kesintisi'}}));
 await page.goto('/asistan/');await closeConsent(page);await expect(page.getByRole('alert').filter({hasText:'Nobi şu anda kullanılamıyor.'})).toBeVisible();await expect(page.getByRole('button',{name:'Mesajı gönder'})).toBeDisabled();
 fail=false;await page.getByRole('button',{name:'Nobi’yi tekrar yükle'}).click();await expect(page.getByRole('button',{name:'Kahve seçenekleri'})).toBeVisible();await page.getByLabel('Nobi’ye mesajın').fill('Kaybolmayan test mesajı');await page.getByRole('button',{name:'Mesajı gönder'}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByLabel('Nobi’ye mesajın')).toHaveValue('Kaybolmayan test mesajı');
});
