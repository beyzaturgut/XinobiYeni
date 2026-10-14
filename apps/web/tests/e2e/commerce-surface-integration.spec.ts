import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
import path from "node:path";
const source=JSON.parse(readFileSync(path.resolve("../../tests/fixtures/demo-commerce.json"),"utf8"));
const editor="/urunler/cay-makinesi-101/editor/";
test("commerce product link preserves exact selected identity",async({page})=>{
 await page.goto("/urunler/detay/?id=DEMO-P101");
 await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 await page.getByRole("button",{name:"Gümüş gri rengini seç"}).click();
 await expect(page.getByRole("link",{name:/XINOBI U ile kişiselleştir/})).toHaveAttribute("href",/product=DEMO-P101&variant=DEMO-V101-S/);
});
test("commerce blue uses exact accepted surface; unsupported never renders",async({page})=>{
 await page.goto(editor+"?product=DEMO-P101&variant=DEMO-V101-B");
 await expect(page.locator("canvas[role=img]")).toBeVisible();
 await expect(page.locator("canvas[role=img]")).toHaveAttribute("width","1066");
 await expect(page.getByRole("link",{name:"Basit moda dön"})).toHaveAttribute("href",/variant=DEMO-V101-B&product=DEMO-P101/);
 for(const variant of ["DEMO-V101-S","DEMO-V101-R","DEMO-V101-G","blue"]){
  await page.goto(editor+"?product=DEMO-P101&variant="+variant);
  await expect(page.getByRole("status")).toContainText("kullanılamıyor");
  await expect(page.locator("canvas[role=img]")).toHaveCount(0);
 }
});
test("existing generated design uses canonical renderer, no generation requests",async({page},testInfo)=>{
 const id="a".repeat(64), product=source.products.find((p:{id:string})=>p.id==="DEMO-P101");
 let posts=0;
 page.on("request",r=>{if(r.method()==="POST")posts++});
 await page.addInitScript(id=>sessionStorage.setItem("xinobi-u-selected-session",id),id);
 await page.route("**/api/v1/design-studio/**",async r=>{
  if(r.request().method()!=="GET")throw new Error("Unexpected generation");
  if(r.request().url().endsWith("/image"))await r.fulfill({contentType:"image/png",body:readFileSync("public/assets/personalization/sample-pattern.png")});
  else await r.fulfill({json:{id,status:"ready",product,variant:product.variants[0],imageUrl:"/api/v1/design-studio/sessions/"+id+"/image"}});
 });
 await page.goto("/xinobi-u/onizleme/");
 await expect(page.locator("canvas[role=img]")).toBeVisible();
 await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 await page.getByLabel("Yatay konum",{exact:false}).fill("580");
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath("xinobi-integration-canonical-"+width+".png"),fullPage:true});
 }
 expect(posts).toBe(0);
});

// The fixed Tea Maker entry was retired (2bb0b6d): every former identity shows the retirement notice, offers the live
// XINOBI U product list and never starts a questionnaire, editor or generation from the old page.
test("retired Tea Maker personalization entry never starts a design",async({page})=>{
 let generationRequests=0;
 page.on("request",r=>{if(r.method()==="POST"&&r.url().endsWith("/generation"))generationRequests++});
 for(const query of ["","?variant=blue","?product=DEMO-P101&variant=DEMO-V101-B","?product=other&variant=DEMO-V101-B","?product=DEMO-P101&variant=DEMO-V101-S","?variant=red"]){
  await page.goto("/urunler/cay-makinesi-101/kisisellestir/"+query);
  await expect(page.getByRole("status")).toContainText("artık katalogda yer almıyor");
  await expect(page.getByRole("link",{name:/Güncel ürünlerden birini seç/})).toHaveAttribute("href",/^\/xinobi-u\/?$/);
  await expect(page.getByRole("link",{name:"Soruları yanıtla",exact:false})).toHaveCount(0);
  await expect(page.getByRole("link",{name:"Gelişmiş editörde devam et",exact:false})).toHaveCount(0);
  await expect(page.locator("canvas[role=img]")).toHaveCount(0);
 }
 expect(generationRequests).toBe(0);
});
