import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const navLabels = async () => {
  const header = page.locator("header").first();
  return {
    main: await header.getByRole("navigation", { name: "Ana menü" }).locator(":scope > a, :scope > div > button").allTextContents(),
    corporateMenus: await header.getByRole("navigation", { name: "Kurumsal menü" }).count(),
  };
};
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
const home = await navLabels();
if (home.main.join("|") !== "Ürünler|Kategoriler|XINOBI U|Xinobi dünyası") throw new Error(`Home navigation is incorrect: ${home.main.join("|")}`);
if (home.corporateMenus !== 0) throw new Error("Header must be a single strip without the corporate menu");
const header = page.locator("header").first();
if ((await header.locator("img").first().boundingBox()).height < 40) throw new Error("Header logo must be at least 40px high");
const mainNav = page.locator("header").first().getByRole("navigation", { name: "Ana menü" });
await mainNav.getByRole("button", { name: "Kategoriler" }).hover();
const menu = page.locator("#home-category-menu");
await menu.waitFor({ state: "visible" });
if ((await menu.getByRole("link").count()) === 0) throw new Error("Category dropdown has no category links");
if ((await menu.getByRole("link", { name: "XINOBI U", exact: true }).count()) !== 0) throw new Error("XINOBI U must be a main menu item, not a category");
await page.goto("http://127.0.0.1:3000/urunler", { waitUntil: "networkidle" });
const products = await navLabels();
if (products.main.join("|") !== home.main.join("|")) throw new Error(`Product page header differs: ${products.main.join("|")}`);
console.log("web navigation: single-strip header, logo size, Xinobi dünyası beside XINOBI U, category hover dropdown, same header on product page = OK");
await browser.close();
