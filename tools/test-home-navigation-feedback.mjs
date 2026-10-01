import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
const mainNav = page.getByRole("navigation", { name: "Ana menü" });
const labels = await mainNav.locator(":scope > a, :scope > div > button").allTextContents();
if (labels.join("|") !== "Ürünler|Kategoriler|Xinobi dünyası") throw new Error(`Home navigation is incorrect: ${labels.join("|")}`);
await mainNav.getByRole("button", { name: "Kategoriler" }).hover();
await page.waitForTimeout(200);
if (!(await mainNav.getByText("XINOBI U", { exact: true }).isVisible())) throw new Error("Category dropdown did not open on hover");
await page.goto("http://127.0.0.1:3000/urunler", { waitUntil: "networkidle" });
const productLabels = await page.getByRole("navigation", { name: "Ürün sayfası menüsü" }).getByRole("link").allTextContents();
if (productLabels.join("|") !== "Ana sayfa|Ürünler|Ara ve karşılaştır|XINOBI U") throw new Error(`Product navigation is incorrect: ${productLabels.join("|")}`);
console.log("web navigation: home tabs, category hover dropdown, product-page tabs = OK");
await browser.close();
