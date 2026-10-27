import {test,expect} from '@playwright/test';
import {artworkReadOnly} from './artwork-read-only';

test.beforeEach(async({page})=>artworkReadOnly(page));
for(const width of [390,1440])test(`shared preview keeps one product composition through colour changes at ${width}`,async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width,height:900});await page.goto('/xinobi-u/mobil-onizleme/');
 const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click();
 // The retired demo added an unsaveable second artwork layer. All customer previews now use the single composition.
 await expect(canvas).toHaveCount(1);await expect(page.locator('#local-pattern,#artwork-scale')).toHaveCount(0);
 const originalPixels=await canvas.evaluate((node:HTMLCanvasElement)=>node.toDataURL());
 await page.locator('#pattern-scale').fill('1.4');
 await expect.poll(()=>canvas.evaluate((node:HTMLCanvasElement)=>node.toDataURL())).not.toBe(originalPixels);
 await page.getByRole('button',{name:'Geri al',exact:true}).click();await expect(page.locator('#pattern-scale')).toHaveValue('1.2');
 await expect.poll(()=>canvas.evaluate((node:HTMLCanvasElement)=>node.toDataURL())).toBe(originalPixels);
 const colours=page.getByRole('group',{name:/Ürün rengi/});
 const original=await colours.locator('button[aria-pressed=true]').getAttribute('aria-label');
 const other=colours.locator('button[aria-pressed=false]').first();await expect(other).toBeEnabled();await other.click();
 await expect(canvas).toHaveCount(1);await expect(canvas).toBeVisible();
 await colours.getByRole('button',{name:original!,exact:true}).click();
 await expect.poll(()=>canvas.evaluate((node:HTMLCanvasElement)=>node.toDataURL())).toBe(originalPixels);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
