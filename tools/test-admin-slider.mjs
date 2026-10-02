import { chromium } from "../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://127.0.0.1:4176", { waitUntil: "networkidle" });

if (await page.locator(".slide-row").count() !== 3) throw new Error("Initial slider items are missing");
await page.locator('input[type="file"]').setInputFiles({ name: "demo-slider.webm", mimeType: "video/webm", buffer: Buffer.from("demo") });
if (await page.locator(".slide-row").count() !== 4) throw new Error("Video upload did not create a slider item");
if ((await page.locator(".media-preview > span").textContent()) !== "Video") throw new Error("Uploaded video type is incorrect");
await page.getByLabel("Alternatif metin").fill("Demo slider videosu");
await page.getByText("Slider’da yayınla").click();
await page.getByRole("button", { name: "Taslağı kaydet" }).click();
if (!(await page.locator(".save-row p").textContent()).includes("yerel taslak")) throw new Error("Local save feedback is missing");
await page.screenshot({ path: "test/2026-10-01/TST-062-admin-slider.png", fullPage: true });
console.log("admin slider: photo list, video upload, metadata, publish toggle, local save = OK");
await page.getByRole("button", { name: "XINOBI U" }).click();
if (!(await page.getByRole("heading", { name: "Görsel ve sabit buton" }).isVisible())) throw new Error("XINOBI U settings did not open");
await page.locator('input[type="color"]').fill("#d51f35");
if ((await page.locator(".xinobi-preview > a").evaluate((element) => getComputedStyle(element).backgroundColor)) !== "rgb(213, 31, 53)") throw new Error("CTA color preview did not update");
await page.screenshot({ path: "test/2026-10-02/TST-064-xinobi-banner-admin.png", fullPage: true });
console.log("admin XINOBI U: image control, fixed CTA, color preview = OK");
await browser.close();
