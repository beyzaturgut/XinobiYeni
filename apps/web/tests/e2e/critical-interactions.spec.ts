import { expect, test, type Page } from "@playwright/test";

async function closeConsent(page: Page) {
  await page.getByRole("button", { name: "Çerez tercih panelini kapat" }).click();
}

test("çerez tercih paneli kapatılır, yeniden açılır ve kategoriler gösterilir", async ({ page }) => {
  await page.goto("/");
  await closeConsent(page);
  await expect(page.getByRole("button", { name: "Çerez tercihleri" })).toBeVisible();
  await page.getByRole("button", { name: "Çerez tercihleri" }).click();
  await page.getByRole("button", { name: "Ayarları yönet" }).click();
  await expect(page.getByRole("group", { name: "Tercih kategorileri" })).toBeVisible();
  await expect(page.getByLabel("Zorunlu")).toBeChecked();
  await page.getByLabel("Analitik").check();
  await page.getByRole("button", { name: "Tercihi uygula" }).click();
  await expect(page.getByText(/yalnızca bu prototip ekranında gösterildi/)).toBeVisible();
});

test("arama Escape ile temizlenir ve karşılaştırma üç ürünle sınırlanır", async ({ page }) => {
  await page.goto("/arama/");
  await closeConsent(page);
  const search = page.getByRole("searchbox", { name: "Ürün, kategori veya özellik ara" });
  await search.fill("kahve");
  await expect(page.getByRole("heading", { name: /kahve.*1 sonuç/i })).toBeVisible();
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await page.getByRole("article").filter({ hasText: "Air Purifier 101" }).getByRole("button", { name: "Karşılaştır" }).click();
  await expect(page.getByRole("article").filter({ hasText: "Yemek Yapma Makinesi" }).getByRole("button", { name: "En fazla 3 ürün" })).toBeDisabled();
});

test("ödeme sonucu senaryoları klavye ile değiştirilebilir", async ({ page }) => {
  await page.goto("/odeme/sonuc/");
  await closeConsent(page);
  const failed = page.getByRole("button", { name: "Başarısız" });
  await failed.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Ödeme onaylanmadı." })).toBeVisible();
  const success = page.getByRole("button", { name: "Başarılı" });
  await success.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Ödeme doğrulandı." })).toBeVisible();
});
