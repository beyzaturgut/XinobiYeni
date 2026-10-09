import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
import path from "node:path";
const source=JSON.parse(readFileSync(path.resolve("../../services/api/LocalCommerce/seed.json"),"utf8"));
const editor="/urunler/cay-makinesi-101/editor/";
test("commerce product link preserves exact selected identity",async({page})=>{
 await page.route("**/api/v1/local-commerce/state",r=>r.fulfill({json:source}));
 await page.goto("/urunler/cay-makinesi-101/");
 await page.getByRole("button",{name:"Çerez tercih panelini kapat"}).click();
 await page.getByRole("button",{name:"Gümüş gri rengini seç"}).click();
 await expect(page.getByRole("link",{name:"Kişiselleştirme seçenekleri"})).toHaveAttribute("href",/product=DEMO-P101&variant=DEMO-V101-S/);
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

const personalization="/urunler/cay-makinesi-101/kisisellestir/";
for(const [name,query] of [
 ["direct",""],
 ["legacy blue","?variant=blue"],
 ["explicit commerce","?product=DEMO-P101&variant=DEMO-V101-B"],
]){
 test("Tea Maker questionnaire entry preserves "+name+" identity",async({page})=>{
  let generationRequests=0;
  page.on("request",r=>{if(r.method()==="POST"&&r.url().endsWith("/generation"))generationRequests++});
  await page.goto(personalization+query);
  const action=page.getByRole("link",{name:"Soruları yanıtla",exact:false});
  await expect(action).toHaveCount(1);
  await expect(action).toBeVisible();
  const href=await action.getAttribute("href");
  const target=new URL(href!,"http://localhost");
  expect(target.pathname.replace(/\/$/,"")).toBe("/xinobi-u/sorular");
  expect([...target.searchParams.entries()].sort()).toEqual([
   ["product","DEMO-P101"],["variant","DEMO-V101-B"],
  ]);
  const editorAction=page.getByRole("link",{name:"Gelişmiş editörde devam et",exact:false});
  const editorTarget=new URL((await editorAction.getAttribute("href"))!,"http://localhost");
  expect(editorTarget.searchParams.get("product")).toBe(query.includes("product=")?"DEMO-P101":null);
  expect(editorTarget.searchParams.get("variant")).toBe(query.includes("product=")?"DEMO-V101-B":"blue");
  expect(generationRequests).toBe(0);
 });
}
test("Tea Maker questionnaire fallback never replaces unsupported explicit identities",async({page})=>{
 for(const query of [
  "?product=other&variant=DEMO-V101-B",
  "?product=DEMO-P101&variant=DEMO-V101-S",
  "?product=DEMO-P101&variant=blue",
  "?variant=red",
 ]){
  await page.goto(personalization+query);
  await expect(page.getByRole("status")).toContainText("kullanılamıyor");
  await expect(page.getByRole("link",{name:"Soruları yanıtla",exact:false})).toHaveCount(0);
  await expect(page.getByRole("link",{name:"Gelişmiş editörde devam et",exact:false})).toHaveCount(0);
  await expect(page.locator("canvas[role=img]")).toHaveCount(0);
 }
});
