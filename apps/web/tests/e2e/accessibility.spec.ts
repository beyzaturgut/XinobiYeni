import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const routes = [
  "/",
  "/urunler/",
  "/arama/",
  "/urunler/cay-makinesi-101/",
  "/urunler/cay-makinesi-101/kisisellestir/",
  "/urunler/cay-makinesi-101/editor/",
  "/favoriler/",
  "/sepet/",
  "/odeme/",
  "/odeme/sonuc/",
  "/hesap/giris/",
  "/hesap/",
  "/hesap/siparisler/",
  "/hesap/siparisler/iade/",
  "/kurumsal/teklif/",
  "/kurumsal/teklif/takip/",
  "/studio/ai/",
  "/asistan/",
  "/xinobi/",
  "/yasal/",
];

async function closeConsent(page: Page) {
  await page.getByRole("button", { name: "Çerez tercih panelini kapat" }).click();
}

async function tabUntil(page: Page, target: Locator, limit = 30) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`Hedef ${limit} Tab adımı içinde odağa alınamadı.`);
}

for (const route of routes) {
  test(`erişilebilirlik taraması: ${route}`, async ({ page }) => {
    await page.goto(route);
    await closeConsent(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );
    const summary = blockingViolations.flatMap((violation) =>
      violation.nodes.map((node) => {
        const data = node.any[0]?.data as { fgColor?: string; bgColor?: string; contrastRatio?: number } | null;
        return `${violation.id} ${node.target.join(" ")} ${data?.fgColor ?? ""}/${data?.bgColor ?? ""} ${data?.contrastRatio ?? ""}`;
      }),
    );
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("üyelik akışında ileri ve geri klavye odağı görünür kontrollere ulaşır", async ({ page }) => {
  await page.goto("/hesap/giris/");
  await closeConsent(page);

  const loginTab = page.getByRole("tab", { name: "Giriş" });
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await tabUntil(page, loginTab);
  await expect(loginTab).toBeFocused();

  const registerTab = page.getByRole("tab", { name: "Yeni hesap" });
  await page.keyboard.press("Tab");
  await expect(registerTab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(registerTab).toHaveAttribute("aria-selected", "true");

  const passwordToggle = page.getByRole("button", { name: "Parolayı göster" });
  await tabUntil(page, passwordToggle);
  await expect(passwordToggle).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByPlaceholder("En az 8 karakter")).toBeFocused();
});

test("ödeme sonucu sekmeleri ileri ve geri klavyeyle değiştirilebilir", async ({ page }) => {
  await page.goto("/odeme/sonuc/");
  await closeConsent(page);

  const pending = page.getByRole("button", { name: "Bekliyor" });
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await tabUntil(page, pending);
  await expect(pending).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Başarısız" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(pending).toBeFocused();
});
