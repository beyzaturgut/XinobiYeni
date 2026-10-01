import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
for (const target of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: target });
  await page.goto("http://127.0.0.1:3000/urunler/cay-makinesi-101/kisisellestir", { waitUntil: "networkidle" });
  if (!(await page.getByRole("heading", { name: /XINOBI U ile/ }).isVisible())) throw new Error(`${target.name}: campaign heading missing`);
  if (!(await page.getByRole("link", { name: /Tasarımını Oluştur/ }).isVisible())) throw new Error(`${target.name}: campaign CTA missing`);
  if (!(await page.locator("#studio").isVisible())) throw new Error(`${target.name}: studio missing`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) throw new Error(`${target.name}: horizontal overflow`);
  await page.screenshot({ path: `test/2026-10-01/TST-063-personalization-hero-${target.name}.png`, fullPage: true });
  console.log(`${target.name}: campaign hero, CTA, studio, overflow=false`);
  await page.close();
}
await browser.close();
