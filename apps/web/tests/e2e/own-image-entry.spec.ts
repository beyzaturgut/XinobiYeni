import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const seed=JSON.parse(readFileSync("../../services/api/LocalCommerce/seed.json","utf8"));
const entry="/xinobi-u/kendi-gorselin/";
test("XINOBI U offers two separate exact-identity paths",async({page})=>{
 await page.route("**/api/v1/local-commerce/state",r=>r.fulfill({json:seed}));let posts=0;page.on("request",r=>{if(r.method()==="POST")posts++});
 await page.goto("/xinobi-u/");const card=page.locator("article").filter({has:page.getByRole("heading",{name:"Çay Makinesi 101",exact:true})});
 await expect(card.getByRole("link",{name:"Tarzını Keşfet"})).toHaveAttribute("href","/xinobi-u/sorular/?product=DEMO-P101&variant=DEMO-V101-B");
 await expect(card.getByRole("link",{name:"Çay Makinesi 101 için tasarım oluştur"})).toHaveAttribute("href","/xinobi-u/sorular/?product=DEMO-P101&variant=DEMO-V101-B");
 await expect(card.locator('[data-preview-readiness="ready"]')).toBeVisible();
 await card.getByRole("link",{name:"Kendi görselini kullan"}).click();await expect(page).toHaveURL(url=>url.pathname.replace(/\/$/, "")===entry.slice(0,-1) && url.searchParams.get("product")==="DEMO-P101" && url.searchParams.get("variant")==="DEMO-V101-B");
 await expect(page.getByRole("status")).toContainText("Seçili varyantın geliştirme önizlemesi hazır");await expect(page.getByLabel("Görsel seç",{exact:true})).toBeVisible();
 await expect(page.locator('canvas')).toHaveCount(0);expect(posts).toBe(0);
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
for(const [product,variant] of [["DEMO-P101","DEMO-V101-R"],["DEMO-P101","DEMO-V101-S"],["DEMO-P101","DEMO-V101-G"],["DEMO-P102","DEMO-V102-R"]])test("own-image path fails closed: "+variant,async({page})=>{
 let posts=0;const masks:string[]=[];page.on("request",r=>{if(r.method()==="POST")posts++;if(r.url().includes("designable.png"))masks.push(r.url())});
 await page.goto(entry+"?product="+product+"&variant="+variant);await expect(page.getByRole("status")).toContainText("Bu seçili ürün/varyant için geliştirme ürün önizlemesi kullanılamıyor.");
 await expect(page.locator("main")).toHaveAttribute("data-product-reference",product);await expect(page.locator("main")).toHaveAttribute("data-variant-reference",variant);
 await expect(page.getByRole("link",{name:"Tarzını Keşfet"})).toHaveAttribute("href","/xinobi-u/sorular/?product="+product+"&variant="+variant);await expect(page.locator('input[type=file],canvas')).toHaveCount(0);expect(masks).toHaveLength(0);expect(posts).toBe(0);
});
test("product color selection carries the exact variant into the own-image path",async({page})=>{
 await page.route("**/api/v1/local-commerce/state",r=>r.fulfill({json:seed}));await page.goto("/urunler/cay-makinesi-101/");await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 for(const [variant,color] of [["DEMO-V101-B","Lacivert"],["DEMO-V101-R","Kırmızı"],["DEMO-V101-S","Gümüş gri"],["DEMO-V101-G","Rose gold"]]){await page.getByRole("button",{name:color+" rengini seç"}).click();await expect(page.getByRole("link",{name:"Kendi görselini kullan"})).toHaveAttribute("href",entry+"?product=DEMO-P101&variant="+variant)}
});
test("missing identity and disabled preview never imply own-image readiness",async({page})=>{
 await page.goto(entry);await expect(page.getByRole("status")).toContainText("bir ürün ve varyant seçin");await expect(page.locator('input[type=file],canvas')).toHaveCount(0);
 await page.route("**/rendering-inputs",r=>r.fulfill({status:404}));await page.goto(entry+"?product=DEMO-P101&variant=DEMO-V101-B");await expect(page.getByRole("status")).toContainText("kullanılamıyor");await expect(page.getByRole("heading",{name:"Seçili varyantın geliştirme önizlemesi hazır."})).toHaveCount(0);
});
