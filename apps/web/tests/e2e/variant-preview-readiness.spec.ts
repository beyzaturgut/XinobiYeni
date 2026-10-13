import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const seed=JSON.parse(readFileSync("../../tests/fixtures/demo-commerce.json","utf8"));
const pairs=[["DEMO-P101","DEMO-V101-B",true],["DEMO-P101","DEMO-V101-R",false],["DEMO-P101","DEMO-V101-S",false],["DEMO-P101","DEMO-V101-G",false],["DEMO-P102","DEMO-V102-R",false]] as const;
for(const [product,variant,ready] of pairs)test("exact preview readiness "+variant,async({page,request})=>{
 const bundle=await(await request.get("/api/v1/dev/product-surfaces/commerce/"+product+"/"+variant+"/rendering-inputs")).json();
 expect(bundle.productReference).toBe(product);expect(bundle.variantReference).toBe(variant);expect(bundle.previewAvailable).toBe(ready);
 const masks:string[]=[];let posts=0;page.on("request",r=>{if(r.method()==="POST")posts++;if(r.url().includes("designable.png"))masks.push(r.url())});
 await page.goto("/urunler/cay-makinesi-101/editor/?product="+product+"&variant="+variant);
 if(ready)await expect(page.locator("canvas[role=img]")).toBeVisible();else{
  expect(bundle.inputs).toBeNull();await expect(page.getByRole("status")).toContainText("Bu seçili ürün/varyant için geliştirme ürün önizlemesi kullanılamıyor.");await expect(page.locator("canvas[role=img]")).toHaveCount(0);expect(masks).toHaveLength(0);
 }expect(posts).toBe(0);
});
test("XINOBI U eligibility remains separate from exact preview readiness",async({page})=>{
 await page.route("**/api/v1/local-commerce/state",r=>r.fulfill({json:seed}));await page.goto("/xinobi-u/");
 for(const [variant,status] of [["DEMO-V101-B","ready"],["DEMO-V102-R","unavailable"],["DEMO-V104","unavailable"]])await expect(page.locator('[data-variant-reference="'+variant+'"]')).toHaveAttribute("data-preview-readiness",status);
 await expect(page.getByRole("link",{name:"Kahve Makinesi 101 için tasarım oluştur"})).toHaveAttribute("href","/xinobi-u/sorular/?product=DEMO-P102&variant=DEMO-V102-R");
});
test("selected color preserves questionnaire identity and exact readiness",async({page})=>{
 await page.route("**/api/v1/local-commerce/state",r=>r.fulfill({json:seed}));await page.goto("/urunler/cay-makinesi-101/");await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 for(const [variant,color,status] of [["DEMO-V101-B","Lacivert","ready"],["DEMO-V101-R","Kırmızı","unavailable"],["DEMO-V101-S","Gümüş gri","unavailable"],["DEMO-V101-G","Rose gold","unavailable"]]){
 await page.getByRole("button",{name:color+" rengini seç"}).click();await expect(page.locator('[data-variant-reference="'+variant+'"]')).toHaveAttribute("data-preview-readiness",status);await expect(page.getByRole("link",{name:"Kişiselleştirme seçenekleri"})).toHaveAttribute("href","/xinobi-u/sorular/?product=DEMO-P101&variant="+variant);
 }await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("changed variant never retains ready state; network error does not block questions",async({page})=>{
 await page.route("**/api/v1/local-commerce/state",r=>r.fulfill({json:seed}));await page.goto("/urunler/cay-makinesi-101/");await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();await expect(page.locator('[data-preview-readiness="ready"]')).toBeVisible();
 let release!:()=>void;const wait=new Promise<void>(resolve=>{release=resolve});await page.route("**/commerce/DEMO-P101/DEMO-V101-S/rendering-inputs",async r=>{await wait;await r.fulfill({status:503})});
 await page.getByRole("button",{name:"Gümüş gri rengini seç"}).click();await expect(page.locator('[data-preview-readiness="loading"]')).toBeVisible();await expect(page.locator('[data-preview-readiness="ready"]')).toHaveCount(0);release();await expect(page.locator('[data-preview-readiness="error"]')).toContainText("şu anda doğrulanamıyor");await expect(page.getByRole("link",{name:"Kişiselleştirme seçenekleri"})).toHaveAttribute("href",/variant=DEMO-V101-S/);
});
