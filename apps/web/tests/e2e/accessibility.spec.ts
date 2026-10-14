import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

import {mockStore} from './fixtures';

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
    await mockStore(page);
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
  await mockStore(page);
  await page.goto("/hesap/");
  await closeConsent(page);
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();

  // The dialog closes on an outside click, so tab from its initial focus instead.
  const loginTab = page.getByRole("button", { name: "Giriş", exact: true });
  await tabUntil(page, loginTab);
  await expect(loginTab).toBeFocused();

  const registerTab = page.getByRole("button", { name: "Yeni hesap", exact: true });
  await page.keyboard.press("Tab");
  await expect(registerTab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(registerTab).toHaveAttribute("aria-pressed", "true");

  const passwordToggle = page.getByRole("button", { name: "Parolayı göster" });
  await tabUntil(page, passwordToggle);
  await expect(passwordToggle).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByLabel("Parola", {exact: true})).toBeFocused();
});

test("ödeme senaryoları ileri ve geri klavyeyle değiştirilebilir", async ({ page }) => {
  await mockStore(page, {signedIn: true, cart: true});
  await page.goto("/odeme/");
  await closeConsent(page);
  const success = page.getByRole("radio", {name: "Başarılı ödeme", exact: true});
  await success.focus();
  await expect(success).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const failed = page.getByRole("radio", {name: "Başarısız ödeme", exact: true});
  await expect(failed).toBeChecked();
  await expect(failed).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(success).toBeChecked();
  await expect(success).toBeFocused();
});
