import {test,expect,type Page} from '@playwright/test';
async function setup(page:Page,width=1440){
 await page.setViewportSize({width,height:1000});await page.goto('/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-B');
 await page.getByLabel('Görsel seç',{exact:true}).setInputFiles('public/assets/personalization/sample-pattern.png');
 await expect(page.locator('canvas[role=img]')).toBeVisible();await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click();
 await page.locator('canvas[role=img]').scrollIntoViewIfNeeded();
}
async function geometry(page:Page){return (await page.locator('canvas[role=img]').boundingBox())!}
for(const width of [1440,390])test('artwork drag uses source coordinates and shared sliders at '+width,async({page})=>{
 await setup(page,width);const r=await geometry(page),sx=r.x+442*r.width/1066,sy=r.y+925*r.height/1600;
 await page.mouse.move(sx,sy);await expect(page.locator('canvas[role=img]')).toHaveCSS('cursor','grab');
 await page.mouse.down();await expect(page.locator('canvas[role=img]')).toHaveCSS('cursor','grabbing');
 await page.mouse.move(sx+20*r.width/1066,sy+30*r.height/1600,{steps:4});
 expect(Number(await page.locator('#pattern-x').inputValue())).toBeCloseTo(553,0);expect(Number(await page.locator('#pattern-y').inputValue())).toBeCloseTo(1070,0);
 await page.mouse.up();const x=await page.locator('#pattern-x').inputValue();await page.mouse.move(sx+60,sy+60);await expect(page.locator('#pattern-x')).toHaveValue(x);
 await page.locator('#pattern-x').fill('580');await expect(page.locator('#pattern-x')).toHaveValue('580');
 await page.locator('#pattern-scale').fill('1.5');await page.locator('#pattern-rotation').fill('45');await expect(page.locator('#pattern-rotation')).toHaveValue('45');
});
test('empty canvas does not drag; cancellation releases drag state',async({page})=>{
 await setup(page);const r=await geometry(page);await page.mouse.move(r.x+5,r.y+5);await page.mouse.down();await page.mouse.move(r.x+30,r.y+30);await page.mouse.up();await expect(page.locator('#pattern-x')).toHaveValue('533');
 await page.mouse.move(r.x+442*r.width/1066,r.y+925*r.height/1600);await page.mouse.down();
 await page.locator('canvas[role=img]').dispatchEvent('pointercancel',{pointerId:1,clientX:r.x,clientY:r.y});
 await page.mouse.move(r.x+200,r.y+200);await expect(page.locator('#pattern-x')).toHaveValue('533');await expect(page.locator('canvas[role=img]')).not.toHaveCSS('cursor','grabbing');await page.mouse.up();
});
test('generated pattern mode does not support dragging',async({page})=>{
 await page.goto('/urunler/cay-makinesi-101/editor/');await expect(page.locator('canvas[role=img]')).toBeVisible();await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click();
 const r=await geometry(page);await page.mouse.move(r.x+r.width/2,r.y+r.height*.6);await page.mouse.down();await page.mouse.move(r.x+r.width*.6,r.y+r.height*.65);await page.mouse.up();await expect(page.locator('#pattern-x')).toHaveValue('533');await expect(page.locator('#pattern-y')).toHaveValue('1040');
});

test('touch pointer dragging updates artwork and ends on release',async({page})=>{
 await setup(page,390);const r=await geometry(page),x=r.x+442*r.width/1066,y=r.y+925*r.height/1600;
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+15*r.width/1066,y:y+20*r.height/1600}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect(Number(await page.locator('#pattern-x').inputValue())).toBeCloseTo(548,0);expect(Number(await page.locator('#pattern-y').inputValue())).toBeCloseTo(1060,0);
 await expect(page.locator('canvas[role=img]')).not.toHaveCSS('cursor','grabbing');await cdp.detach();
});
