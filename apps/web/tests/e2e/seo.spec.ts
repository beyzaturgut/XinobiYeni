import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';

// Test builds have no NEXT_PUBLIC_SITE_URL, like the live preview server: nothing may be indexed.
test('önizleme derlemesi arama motorlarına kapalıdır',async({page,request})=>{
 const robots=await(await request.get('/robots.txt')).text();
 expect(robots).toContain('Disallow: /');expect(robots).not.toContain('Allow: /');expect(robots).not.toContain('Sitemap:');
 expect(await(await request.get('/sitemap.xml')).text()).not.toContain('<url>');
 await mockStore(page);await page.goto('/');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
 await expect(page.locator('link[rel=canonical]')).toHaveCount(0);
 const graph=JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
 expect(graph['@graph'].map((item:{'@type':string})=>item['@type'])).toEqual(['Organization','WebSite']);
});

test('ürün detayı seçili rengin yapılandırılmış ürün verisini taşır',async({page})=>{
 const {state}=await mockStore(page);await page.goto('/urunler/detay/?id=DEMO-P101');await closeConsent(page);
 const product=state.products.find(item=>item.id==='DEMO-P101')!;
 // Script text is not rendered text, so read it from the DOM rather than with a hasText filter.
 const read=async()=>JSON.parse(await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(node=>node.textContent??'').find(text=>text.includes('"@type":"Product"'))??'null'));
 await expect.poll(read).not.toBeNull();
 let data=await read();
 expect(data).toMatchObject({'@type':'Product',sku:product.variants[0].sku,brand:{name:'Xinobi'},offers:{priceCurrency:'TRY',price:'2400.00',availability:'https://schema.org/InStock'}});
 await page.getByRole('button',{name:'Kırmızı rengini seç'}).click();
 await expect.poll(async()=>(await read()).name).toContain('Kırmızı');
 data=await read();expect(data.sku).toBe(product.variants.find(item=>item.color==='Kırmızı')!.sku);
});
