import AxeBuilder from '@axe-core/playwright';
import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';
import {mockAcceptedSurfaces} from './preview-readiness-fixtures';
test.setTimeout(120000);
const routes=['/','/urunler/','/arama/','/urunler/detay/?id=DEMO-P101','/karsilastir/','/sepet/','/odeme/','/hesap/','/hesap/adresler/','/hesap/siparisler/','/hesap/tasarimlarim/','/kurumsal/teklif/','/xinobi-u/renk/?product=DEMO-P101&variant=DEMO-V101-B'];
for(const width of [320,390,768,1440])test(`${width}px critical pages: axe and 200% text`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:900});await mockStore(page,{signedIn:true,cart:true});await mockAcceptedSurfaces(page);
 await page.route('**/api/v1/catalog/products/*/reviews*',route=>route.fulfill({json:{summary:{productId:'DEMO-P101',count:0,average:0,distribution:[0,0,0,0,0]},items:[],page:1,pageSize:10}}));
 const failures:string[]=[];
 for(const route of routes){
  await page.goto(route);await closeConsent(page);await expect(page.locator('main')).toBeVisible();
  // Wait for the page's catalog/account content rather than auditing its first loading frame.
  if(route.startsWith('/kurumsal/'))await expect(page.getByLabel('Firma adı')).toBeVisible();
  else if(route.startsWith('/xinobi-u/'))await expect(page.locator('[data-preview-readiness]')).toHaveAttribute('data-preview-readiness','ready');
  else await expect(page.getByRole('link',{name:/Sepet, 1 ürün/})).toBeVisible();
  const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  for(const v of report.violations)if(['critical','serious'].includes(v.impact||''))failures.push(`${route}: ${v.id} ${v.nodes.map(n=>n.target.join(' ')).join('; ')}`);
  const plain=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);if(!plain)failures.push(`${route}: normal horizontal overflow`);
  // Fixed pixel typography does not respond to root font-size. Double each element's computed text size instead.
  await page.evaluate(()=>{const rows=[...document.querySelectorAll<HTMLElement>('body *')].filter(e=>!e.closest('svg,canvas,script,style')).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)] as const);for(const [e,size] of rows)if(size)e.style.setProperty('font-size',`${size*2}px`,'important')});
  const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth>innerWidth+1,offscreen:[...document.querySelectorAll<HTMLElement>('header[data-app-chrome] a,header[data-app-chrome] button,header[data-app-chrome] summary')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1}).map(e=>e.getAttribute('aria-label')||e.textContent?.trim())}));
  const clippedSearch=await page.evaluate(()=>{const link=document.querySelector<HTMLElement>('a[aria-label="Ara"]'),label=link?.querySelector('span');if(!link||!label||!label.getClientRects().length)return false;const range=document.createRange();range.selectNodeContents(label);return range.getBoundingClientRect().right>link.getBoundingClientRect().right+1});
  if(clippedSearch)failures.push(`${route}: enlarged search label overlaps neighbouring controls`);
  if(overflow.page||overflow.offscreen.length)failures.push(`${route}: 200% text overflow ${JSON.stringify(overflow)}`);
  if(route==='/urunler/detay/?id=DEMO-P101')await page.screenshot({path:testInfo.outputPath(`detail-text-200-${width}.png`),fullPage:true});
 }
 expect(failures,failures.join('\n')).toEqual([]);
});
test('keyboard focus for search, mobile menu and Nobi',async({page})=>{
 test.setTimeout(30000);
 await mockStore(page);await page.setViewportSize({width:390,height:900});await page.goto('/urunler/');await closeConsent(page);
 const search=page.getByRole('searchbox',{name:'Ürünlerde ara'});await search.focus();
 expect(await search.evaluate(e=>getComputedStyle(e).outlineStyle)).not.toBe('none');
 // A native summary has button semantics; no ARIA menu roles are imposed on navigation links.
 await page.locator('summary[aria-label="Menü"]').focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('navigation',{name:'Mobil menü'})).toBeVisible();await page.keyboard.press('Tab');await page.keyboard.press('Escape');
 await expect(page.getByRole('navigation',{name:'Mobil menü'})).toBeHidden();await expect(page.locator('summary[aria-label="Menü"]')).toBeFocused();
 const launcher=page.getByRole('button',{name:'Nobi’ye sor',exact:true});await launcher.focus();await page.keyboard.press('Enter');
 const panel=page.getByRole('region',{name:'Size nasıl yardımcı olabilirim?'});await expect(panel.getByRole('textbox',{name:'Nobi’ye mesajın'})).toBeFocused();
 await page.keyboard.press('Escape');await expect(panel).toBeHidden();await expect(launcher).toBeFocused();
 await page.keyboard.press('Enter');await panel.getByRole('button',{name:'Nobi panelini kapat'}).click();await expect(launcher).toBeFocused();
});
test('account dialog keyboard containment, close focus and error announcement',async({page})=>{
 test.setTimeout(30000);
 await mockStore(page);await page.goto('/hesap/');await closeConsent(page);
 const trigger=page.getByRole('button',{name:'Giriş yap',exact:true});await trigger.click();const dialog=page.getByRole('dialog',{name:'Giriş yap'});
 const report=await new AxeBuilder({page}).include('dialog').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();expect(report.violations.filter(v=>['critical','serious'].includes(v.impact||''))).toEqual([]);
 for(let i=0;i<14;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true)}
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 await trigger.click();await page.route('**/auth/web/login',r=>r.fulfill({status:400,json:{title:'E-posta veya parola hatalı.'}}));await dialog.getByLabel('E-posta adresi',{exact:true}).fill('test@example.com');await dialog.getByLabel('Parola',{exact:true}).fill('wrong-password');await dialog.getByRole('button',{name:'Giriş yap',exact:true}).click();await expect(dialog.getByRole('alert')).toContainText('E-posta veya parola hatalı.');
});
