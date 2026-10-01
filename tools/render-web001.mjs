import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const targets = [
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-320", width: 320, height: 720 },
];

for (const target of targets) {
  const page = await browser.newPage({ viewport: target, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:4175/design/screens/WEB-001/prototype.html", {
    waitUntil: "networkidle",
  });
  await page.screenshot({
    path: `design/screens/WEB-001/${target.name}.png`,
    fullPage: true,
  });
  const result = await page.evaluate(() => ({
    title: document.title,
    images: [...document.images].map((item) => ({
      src: item.getAttribute("src"),
      complete: item.complete,
      width: item.naturalWidth,
    })),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    h1Count: document.querySelectorAll("h1").length,
    mainCount: document.querySelectorAll("main").length,
    nobiLabel: document.querySelector(".nobi")?.textContent?.trim(),
  }));
  if (result.images.some((item) => !item.complete || item.width === 0)) {
    throw new Error(`${target.name}: broken image`);
  }
  if (result.overflow || result.h1Count !== 1 || result.mainCount !== 1 || !result.nobiLabel) {
    throw new Error(`${target.name}: structure or overflow validation failed`);
  }
  console.log(`${target.name}: images=${result.images.length}, overflow=${result.overflow}, h1=${result.h1Count}`);
  await page.close();
}

await browser.close();
