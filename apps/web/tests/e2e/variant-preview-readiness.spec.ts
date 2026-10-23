import {test,expect} from "@playwright/test";
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
// Eligibility (the XINOBI U product list) and exact readiness (the method step) stay separate.
test("XINOBI U eligibility remains separate from exact preview readiness",async({page})=>{
 await page.goto("/xinobi-u/");await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 for(const [name,product] of [["Çay Makinesi 101","DEMO-P101"],["Kahve Makinesi 101","DEMO-P102"]])
  await expect(page.locator("article").filter({has:page.getByRole("heading",{name,exact:true})}).getByRole("link").first()).toHaveAttribute("href",new RegExp("^/xinobi-u/renk/?\\?product="+product+"$"));
 await page.goto("/xinobi-u/renk/?product=DEMO-P102");await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 await expect(page.locator('[data-product-reference="DEMO-P102"]')).toHaveAttribute("data-preview-readiness","unavailable");
 await expect(page.getByRole("link",{name:/→$/}).filter({hasText:/Görsel yükle|Sorulara başla|Desen yükle/})).toHaveCount(0);
});
test("method step keeps the questionnaire identity on a colour with an accepted surface",async({page})=>{
 for(const requested of ["DEMO-V101-B","DEMO-V101-R","DEMO-V101-S","DEMO-V101-G"]){
  await page.goto("/xinobi-u/renk/?product=DEMO-P101&variant="+requested);
  await expect(page.locator('[data-preview-readiness]')).toHaveAttribute("data-preview-readiness","ready");
  await expect(page.locator('[data-preview-readiness]')).toHaveAttribute("data-variant-reference","DEMO-V101-B");
  const ask=page.getByRole("radio",{name:/Sorularla tasarla/});await ask.dispatchEvent("click");await expect(ask).toBeChecked();
  await expect(page.getByRole("link",{name:"Sorulara başla →"})).toHaveAttribute("href","/xinobi-u/sorular/?product=DEMO-P101&variant=DEMO-V101-B");
 }
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("readiness network error offers a retry",async({page})=>{
 let release!:()=>void;const wait=new Promise<void>(resolve=>{release=resolve});let failing=true;
 await page.route("**/commerce/DEMO-P101/DEMO-V101-S/rendering-inputs",async r=>{if(!failing)return r.fallback();await wait;await r.fulfill({status:503})});
 await page.goto("/xinobi-u/renk/?product=DEMO-P101");await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 await expect(page.locator('[data-preview-readiness="loading"]')).toBeAttached();await expect(page.getByRole("link",{name:"Görsel yükle →"})).toHaveCount(0);
 release();await expect(page.locator('[data-preview-readiness="error"]')).toContainText("doğrulanamıyor");
 failing=false;await page.getByRole("button",{name:"Tekrar dene"}).click();
 await expect(page.getByRole("link",{name:"Görsel yükle →"})).toHaveAttribute("href","/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-B");
});
