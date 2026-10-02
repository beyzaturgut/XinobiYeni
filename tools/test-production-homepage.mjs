import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await desktop.goto("http://127.0.0.1:4181/", { waitUntil: "load", timeout: 10000 });
console.log("production home: desktop loaded");
const desktopConsentClose = desktop.getByRole("button", { name: "Çerez tercih panelini kapat" });
if (await desktopConsentClose.isVisible()) await desktopConsentClose.click();

if (await desktop.locator("header [aria-label='Hızlı işlemler'] > a").count() !== 3) throw new Error("Desktop header icons are incomplete");
if (await desktop.locator("#kategoriler a:has(img)").count() !== 5) throw new Error("Category rail must contain five categories");
for (let index = 0; index < 3; index += 1) {
  await desktop.getByRole("button", { name: `${index + 1}. görsel` }).click();
  const source = await desktop.locator("section[aria-label='Xinobi ürün tanıtımları'] img").getAttribute("src");
  if (!source?.includes(`home-slider-${index + 1}.png`)) throw new Error(`Slide ${index + 1} is incorrect: ${source}`);
}
const media = await desktop.locator("#urunler article > div:first-child").evaluateAll((items) => items.map((item) => ({ height: item.getBoundingClientRect().height, bottom: item.getBoundingClientRect().bottom })));
if (Math.max(...media.map((item) => item.height)) - Math.min(...media.map((item) => item.height)) > 1) throw new Error(`Product media heights differ: ${JSON.stringify(media)}`);
await desktop.getByRole("button", { name: "Nobi’ye sor" }).click();
if (!(await desktop.getByRole("heading", { name: "Size nasıl yardımcı olabilirim?" }).isVisible())) throw new Error("Nobi panel did not open");
if (await desktop.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error("Desktop horizontal overflow");
await desktop.screenshot({ path: "test/2026-10-02/TST-070-production-home-desktop.png", fullPage: true, animations: "disabled", timeout: 15000 });
console.log("production home: desktop captured");

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://127.0.0.1:4181/", { waitUntil: "load", timeout: 10000 });
const mobileConsentClose = mobile.getByRole("button", { name: "Çerez tercih panelini kapat" });
if (await mobileConsentClose.isVisible()) await mobileConsentClose.click();
if (await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error("Mobile horizontal overflow");
await mobile.screenshot({ path: "test/2026-10-02/TST-070-production-home-mobile.png", fullPage: true, animations: "disabled", timeout: 15000 });

console.log("production home: 3 slides, 5 categories, aligned products, Nobi panel, desktop/mobile overflow = OK");
await browser.close();
