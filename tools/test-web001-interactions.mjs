import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto("http://127.0.0.1:4175/design/screens/WEB-001/prototype.html", { waitUntil: "networkidle" });

await desktop.locator(".nav-trigger").click();
if (await desktop.locator("#mega-menu").isHidden()) throw new Error("Mega menu did not open");
await desktop.keyboard.press("Escape");
if (await desktop.locator("#mega-menu").isVisible()) throw new Error("Mega menu did not close with Escape");

const initialSlide = await desktop.locator("[data-hero-index]").textContent();
await desktop.locator("[data-hero-next]").click();
const nextSlide = await desktop.locator("[data-hero-index]").textContent();
if (initialSlide === nextSlide) throw new Error("Hero did not advance");
await desktop.locator("[data-hero-pause]").click();
if ((await desktop.locator("[data-hero-pause]").getAttribute("aria-label")) !== "Otomatik geçişi başlat") throw new Error("Hero pause state missing");

await desktop.locator(".nobi").click();
if (await desktop.locator("#nobi-panel").isHidden()) throw new Error("Nobi did not open");
if (!(await desktop.locator("#nobi-title").textContent()).includes("nasıl yardımcı")) throw new Error("Nobi greeting missing");
await desktop.keyboard.press("Escape");
if (await desktop.locator("#nobi-panel").isVisible()) throw new Error("Nobi did not close with Escape");

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://127.0.0.1:4175/design/screens/WEB-001/prototype.html", { waitUntil: "networkidle" });
await mobile.locator(".menu").click();
if (await mobile.locator("#mega-menu").isHidden()) throw new Error("Mobile drawer did not open");
await mobile.locator(".mega-close").click();
if (await mobile.locator("#mega-menu").isVisible()) throw new Error("Mobile drawer did not close");

const track = mobile.locator("[data-product-track]");
const before = await track.evaluate((element) => element.scrollLeft);
await mobile.locator("[data-product-next]").click();
await mobile.waitForTimeout(500);
const after = await track.evaluate((element) => element.scrollLeft);
if (after <= before) throw new Error("Mobile product carousel did not scroll");

console.log("desktop: mega-menu, hero controls, Nobi = OK");
console.log("mobile: drawer, product carousel = OK");
await browser.close();
