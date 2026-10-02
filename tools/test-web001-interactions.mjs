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
await desktop.mouse.move(900, 300);
await desktop.locator(".nav-trigger").hover();
if (await desktop.locator("#mega-menu").isHidden()) throw new Error("Mega menu did not open on hover");
await desktop.keyboard.press("Escape");

const expectedSlideSuffixes = ["-1.png", "-2.png", "-3.png"];
const actualSlides = [];
for (let index = 0; index < 3; index += 1) {
  await desktop.locator(`[data-slide='${index}']`).click();
  const src = await desktop.locator("[data-hero-image]").getAttribute("src");
  if (!src?.endsWith(expectedSlideSuffixes[index])) throw new Error(`Hero slide ${index + 1} is incorrect: ${src}`);
  await desktop.locator("[data-hero-image]").evaluate((image) => image.complete || new Promise((resolve) => image.addEventListener("load", resolve, { once: true })));
  if ((await desktop.locator("[data-hero-image]").evaluate((image) => image.naturalWidth)) === 0) throw new Error(`Hero slide ${index + 1} is broken`);
  actualSlides.push(src);
}
if (new Set(actualSlides).size !== 3) throw new Error("Hero slides are not three distinct new images");
const ctaSize = await desktop.locator(".u-fixed-cta").evaluate((element) => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }));
if (ctaSize.width > 172 || ctaSize.height > 44) throw new Error(`XINOBI U CTA is still too large: ${ctaSize.width}x${ctaSize.height}`);
if (await desktop.locator(".slider-controls").count()) throw new Error("Hero arrows must not be visible");
if (await desktop.locator(".hero h1, .hero p").count()) throw new Error("Hero must not contain copy");

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

const categoryLabels = await desktop.locator("[data-category-track] .category-card span").allTextContents();
if (categoryLabels.join("|") !== "Çay makineleri|Kahve makineleri|Tost makineleri|Pişirme makineleri|Hava temizleme") throw new Error("Category order/content is incorrect");
if (await desktop.locator(".discover").count()) throw new Error("Discover section must be removed");

console.log("desktop: category menu, image-only hero, category rail, Nobi = OK");
console.log("mobile: drawer, product carousel = OK");
await browser.close();
