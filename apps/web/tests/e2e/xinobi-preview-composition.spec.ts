import { test, expect } from '@playwright/test';
import { artworkReadOnly } from './artwork-read-only';

test.beforeEach(async ({ page }) => artworkReadOnly(page));
for (const width of [390, 1440]) test(`pattern survives single artwork overlay and removal at ${width}`, async ({ page }) => {
  // Upload, full-resolution pixel checks and two accepted-surface renders.
  test.setTimeout(120000);
  let media: {mask:{url:string};branding?:{url:string}} | undefined;
  // The e2e build renders the packaged reviewed bundle for this variant, as live builds do.
  page.on('response', async response => {
    if(response.url().includes('/assets/product-previews/') && response.url().includes('/inputs.json') && response.status()===200) {
      const value=await response.json();
      if(value.inputs && value.variantReference==='DEMO-V-5a46bb98-c95c-42b9-9f12-e4286f628cca') media=value.inputs;
    }
  });
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/xinobi-u/mobil-onizleme/');
  const base = page.locator('canvas[role=img]').first();
  await expect(base).toBeVisible();
  const cookie = page.getByRole('button', { name: 'Çerez tercih panelini kapat' });
  if (await cookie.isVisible()) await cookie.click();
  await page.locator('#pattern-scale').fill('1.4');
  let baseline = await base.evaluate(node => (node as HTMLCanvasElement).toDataURL());
  await page.locator('#local-pattern').setInputFiles('public/assets/personalization/sample-pattern.png');
  const overlay = page.getByRole('img', { name: 'Eklenen görsel katmanı', exact: true });
  await expect(overlay).toBeVisible();
  await expect(page.locator('canvas[role=img]')).toHaveCount(2);
  expect(await base.evaluate(node => (node as HTMLCanvasElement).toDataURL())).toBe(baseline);
  expect(media).toBeTruthy();
  const protection=await overlay.evaluate(async (node, media)=>{
    const c=node as HTMLCanvasElement, ctx=c.getContext('2d')!, rgba=ctx.getImageData(0,0,c.width,c.height).data;
    async function pixels(url:string,smooth:boolean){const image=new Image();image.src=url;await image.decode();const b=document.createElement('canvas');b.width=c.width;b.height=c.height;const x=b.getContext('2d')!;x.imageSmoothingEnabled=smooth;x.drawImage(image,0,0,c.width,c.height);return x.getImageData(0,0,c.width,c.height).data;}
    const mask=await pixels(media.mask.url,false),branding=media.branding?await pixels(media.branding.url,true):null;
    let outside=0,protectedPixels=0,painted=0;
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]){painted++;if(mask[i]===0)outside++;if(branding&&branding[i]>0)protectedPixels++;}
    return{outside,protectedPixels,painted};
  },media!);
  expect(protection.painted).toBeGreaterThan(0);
  expect(protection.outside).toBe(0);
  expect(protection.protectedPixels).toBe(0);
  await expect(page.locator('#pattern-scale')).toHaveValue('1.4');
  const a = (await base.boundingBox())!, b = (await overlay.boundingBox())!;
  for (const key of ['x','y','width','height'] as const) expect(b[key]).toBeCloseTo(a[key], 0);
  const before = await overlay.evaluate(node => (node as HTMLCanvasElement).toDataURL());
  await page.locator('#artwork-scale').fill('1.3');
  await page.locator('#artwork-rotation').fill('25');
  await expect.poll(() => overlay.evaluate(node => (node as HTMLCanvasElement).toDataURL())).not.toBe(before);
  expect(await base.evaluate(node => (node as HTMLCanvasElement).toDataURL())).toBe(baseline);
  // Varying only the accepted surface must not remount either placement state
  // or release the uploaded photo URL. Return to the original variant to check
  // the exact original pattern and artwork pixels as well.
  await page.locator('#pattern-x').fill('1200');
  await page.locator('#pattern-y').fill('2300');
  await page.locator('#pattern-rotation').fill('10');
  await page.locator('#pattern-curvature').fill('0.5');
  await page.locator('#artwork-x').fill('1250');
  await page.locator('#artwork-y').fill('2350');
  const patternBeforeSwitch=await base.evaluate(node=>(node as HTMLCanvasElement).toDataURL());
  const artworkBeforeSwitch=await overlay.evaluate(node=>(node as HTMLCanvasElement).toDataURL());
  const selector=page.getByRole('region',{name:'Önizleme rengi'});
  const original=await selector.getAttribute('data-preview-variant');
  const controlValues: Record<string,string>={};
  for(const id of ['pattern-x','pattern-y','pattern-scale','pattern-rotation','pattern-curvature','artwork-x','artwork-y','artwork-scale','artwork-rotation'])controlValues[id]=await page.locator(`#${id}`).inputValue();
  await selector.locator('button[aria-pressed=false]').first().click();
  await expect(selector).not.toHaveAttribute('data-preview-variant',original!);
  await expect(overlay).toBeVisible();
  expect(await selector.getAttribute('data-preview-variant')).not.toBe(original);
  expect(await selector.getAttribute('data-session-variant')).toBe(original);
  for(const id of ['pattern-scale','pattern-rotation','pattern-curvature','artwork-rotation'])await expect(page.locator(`#${id}`)).toHaveValue(controlValues[id]);
  await expect(page.locator('canvas[role=img]')).toHaveCount(2);
  await page.screenshot({path:`../../artifacts/t17-2-variant-photo-${width}.png`,fullPage:true});
  await selector.locator('button').first().click();
  await expect(selector).toHaveAttribute('data-preview-variant',original!);
  await expect(overlay).toBeVisible();
  expect(await selector.getAttribute('data-preview-variant')).toBe(original);
  expect(await base.evaluate(node=>(node as HTMLCanvasElement).toDataURL())).toBe(patternBeforeSwitch);
  expect(await overlay.evaluate(node=>(node as HTMLCanvasElement).toDataURL())).toBe(artworkBeforeSwitch);
  for(const [id,value] of Object.entries(controlValues))await expect(page.locator(`#${id}`)).toHaveValue(value);
  baseline=patternBeforeSwitch;
  // Drag from an actual painted artwork pixel, rather than guessing a product coordinate.
  const point = await overlay.evaluate(node => {
    const c=node as HTMLCanvasElement, d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
    for(let y=0;y<c.height;y+=4) for(let x=0;x<c.width;x+=4) if(d[(y*c.width+x)*4+3]>200)return{x,y,width:c.width,height:c.height};
    throw Error('Artwork has no painted pixels');
  });
  await overlay.scrollIntoViewIfNeeded();
  const box = (await overlay.boundingBox())!, x = Number(await page.locator('#artwork-x').inputValue());
  await page.mouse.move(box.x+point.x*box.width/point.width, box.y+point.y*box.height/point.height);
  await page.mouse.down(); await page.mouse.move(box.x+point.x*box.width/point.width+10, box.y+point.y*box.height/point.height+5); await page.mouse.up();
  expect(Number(await page.locator('#artwork-x').inputValue())).not.toBe(x);
  expect(await base.evaluate(node => (node as HTMLCanvasElement).toDataURL())).toBe(baseline);
  await page.screenshot({ path:`../../artifacts/t17-1-composition-${width}.png`, fullPage:true });
  await page.getByRole('button', { name:'Görseli kaldır', exact:true }).click();
  await expect(overlay).toHaveCount(0);
  expect(await base.evaluate(node => (node as HTMLCanvasElement).toDataURL())).toBe(baseline);
});

test('accepted colour selection preserves original identity and loads exact surface URLs', async ({ page }) => {
  // The e2e build reads the packaged reviewed bundles (/assets/product-previews/{product}/{variant}/inputs.json), as live builds do.
  const inputs: {productReference:string;variantReference:string;inputs?:{source:{url:string};mask:{url:string};branding?:{url:string}|null}}[]=[];
  const requestedMedia: string[]=[];
  page.on('request',request=>{if(request.url().includes('/assets/product-previews/')&&!request.url().includes('/inputs.json'))requestedMedia.push(request.url());});
  page.on('response', async response => {
    if(response.url().includes('/assets/product-previews/') && response.url().includes('/inputs.json') && response.status()===200) inputs.push(await response.json());
  });
  await page.goto('/xinobi-u/mobil-onizleme/');
  const selector=page.getByRole('region',{name:'Önizleme rengi'});
  await expect(selector.getByRole('button').first()).toBeVisible();
  const original=await selector.getAttribute('data-session-variant');
  const buttons=selector.getByRole('button'); expect(await buttons.count()).toBeGreaterThan(1);
  await selector.locator('button[aria-pressed=false]').first().click();
  await expect(selector).not.toHaveAttribute('data-preview-variant',original!);
  await expect(page.locator('canvas[role=img]')).toBeVisible();
  const selected=await selector.getAttribute('data-preview-variant');
  expect(selected).not.toBe(original);
  expect(await selector.getAttribute('data-session-variant')).toBe(original);
  await expect(selector.getByText(/yalnızca önizleniyor/)).toHaveCount(0);
  await expect(selector).toHaveAttribute("data-active-variant",selected!);
  await page.reload();
  await expect(page.getByRole("region",{name:"Önizleme rengi"})).toHaveAttribute("data-active-variant",selected!);
  const bundle=inputs.findLast(value=>value.variantReference===selected && value.inputs);
  expect(bundle).toBeTruthy();
  for(const media of [bundle!.inputs!.source,bundle!.inputs!.mask,bundle!.inputs!.branding]) if(media) {
    expect(media.url).toContain(`/${bundle!.productReference}/${selected}/`);
    expect(requestedMedia.some(url=>url.endsWith(media.url))).toBe(true);
  }
  const originalBundle=inputs.find(value=>value.variantReference===original && value.inputs);
  expect(bundle!.inputs!.mask.url).not.toBe(originalBundle!.inputs!.mask.url);
  await expect(page.locator('#pattern-controls-title')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
