import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const baseUrl = process.env.HOME_TEST_URL ?? "http://127.0.0.1:4181/";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

for (const width of [390, 412]) {
  const page = await browser.newPage({ viewport: { width, height: 915 } });
  await page.goto(baseUrl, { waitUntil: "load", timeout: 10000 });

  const consent = page.locator("aside[aria-label='Çerez tercihleri']");
  const close = page.getByRole("button", { name: "Çerez tercih panelini kapat" });
  const [consentBox, closeBox] = await Promise.all([consent.boundingBox(), close.boundingBox()]);
  if (!consentBox || !closeBox) throw new Error(`${width}px: çerez paneli veya kapatma düğmesi bulunamadı`);
  if (closeBox.x < consentBox.x + consentBox.width - 60 || closeBox.y > consentBox.y + 44) {
    throw new Error(`${width}px: kapatma düğmesi sağ üst köşede değil`);
  }

  await page.getByRole("button", { name: "Ayarları yönet" }).click();
  const optionCount = await page.locator("fieldset label").count();
  if (optionCount !== 3) throw new Error(`${width}px: çerez seçenekleri eksik`);
  if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) {
    throw new Error(`${width}px: çerez paneli yatay taşma oluşturuyor`);
  }
  await page.screenshot({
    path: `test/2026-10-02/TST-073-cookie-mobile-${width}.png`,
    animations: "disabled",
  });

  await close.click();
  const banner = page.locator("section[aria-label='XINOBI U']");
  const bannerImage = banner.locator("img");
  const [bannerBox, imageFit] = await Promise.all([
    banner.boundingBox(),
    bannerImage.evaluate((image) => getComputedStyle(image).objectFit),
  ]);
  if (!bannerBox || Math.abs(bannerBox.width / bannerBox.height - 1942 / 809) > 0.03) {
    throw new Error(`${width}px: XINOBI U banner oranı korunmuyor`);
  }
  if (imageFit !== "contain") throw new Error(`${width}px: XINOBI U görseli tam kadraj gösterilmiyor`);

  const ctaBox = await banner.getByRole("link", { name: /Tasarımını oluştur/i }).boundingBox();
  if (!ctaBox || ctaBox.x < bannerBox.x || ctaBox.x + ctaBox.width > bannerBox.x + bannerBox.width) {
    throw new Error(`${width}px: XINOBI U butonu banner dışına taşıyor`);
  }
  if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) {
    throw new Error(`${width}px: ana sayfada yatay taşma var`);
  }
  await page.screenshot({
    path: `test/2026-10-02/TST-073-home-mobile-${width}.png`,
    fullPage: true,
    animations: "disabled",
    timeout: 15000,
  });
  await page.close();
}

console.log("mobile consent + XINOBI U: 390px/412px = OK");
await browser.close();
