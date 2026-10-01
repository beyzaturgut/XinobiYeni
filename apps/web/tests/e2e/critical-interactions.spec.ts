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

test("sepet adedi değişir ve ürün kaldırılınca boş durum görünür", async ({ page }) => {
  await page.goto("/sepet/");
  await closeConsent(page);
  await page.getByRole("button", { name: "Adedi artır" }).click();
  await expect(page.getByText("2 ürün", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sepetten çıkar" }).click();
  await expect(page.getByRole("heading", { name: "Sepetiniz şu anda boş." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ödemeye geç" })).toBeDisabled();
});

test("hesap profil ve adres demo akışları sunucuya kaydetmeden geri bildirim verir", async ({ page }) => {
  await page.goto("/hesap/");
  await closeConsent(page);
  await page.getByRole("button", { name: /Profili düzenle/ }).click();
  await page.getByLabel("Ad soyad").fill("Demo Kullanıcı");
  await page.getByRole("button", { name: "Demo değişiklikleri uygula" }).click();
  await expect(page.getByText(/Profil değişiklikleri yalnız bu oturumda önizlendi/)).toBeVisible();
  await page.getByRole("button", { name: /Adreslerim/ }).click();
  await page.getByRole("button", { name: "Yeni adres" }).click();
  await page.getByLabel("Adres başlığı").fill("İş");
  await page.getByRole("button", { name: "Demo adresi hazırla" }).click();
  await expect(page.getByText(/Adres değişiklikleri yalnız bu oturumda önizlendi/)).toBeVisible();
});

test("kurumsal teklif özeti seçimleri yansıtır fakat gönderim kapalı kalır", async ({ page }) => {
  await page.goto("/kurumsal/teklif/");
  await closeConsent(page);
  await page.getByRole("button", { name: "Kahve Makinesi 101" }).click();
  await page.getByLabel("Tahmini adet").fill("50");
  await page.getByLabel("Kurumsal kişiselleştirme istiyorum").check();
  await page.getByRole("button", { name: "Demo talep özetini hazırla" }).click();
  await expect(page.getByText("Demo talep özeti hazırlandı; sunucuya gönderilmedi.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Teklif talebini gönder" })).toBeDisabled();
});

test("AI tasarım demo alternatif ve hata durumları arasında güvenle geçer", async ({ page }) => {
  await page.goto("/studio/ai/");
  await closeConsent(page);
  const prompt = page.getByRole("textbox", { name: /Tasarım istemi/ });
  await expect(page.getByRole("button", { name: "Demo alternatifleri göster" })).toBeDisabled();
  await prompt.fill("Sakin dalga çizgileri ve yalın bir görünüm");
  await page.getByRole("button", { name: "Geometrik" }).click();
  await page.getByRole("button", { name: "Demo alternatifleri göster" }).click();
  await expect(page.getByRole("button", { name: /Denge/ })).toBeVisible();
  await page.getByRole("button", { name: /Denge/ }).click();
  await expect(page.getByRole("heading", { name: "Denge" })).toBeVisible();
  await page.getByRole("button", { name: "Hata durumunu önizle" }).click();
  await expect(page.getByRole("heading", { name: "Üretim tamamlanamadı." })).toBeVisible();
  await page.getByRole("button", { name: "İsteme dön" }).click();
  await expect(page.getByRole("heading", { name: "İlk fikrinizi oluşturun." })).toBeVisible();
});

test("satış asistanı sabit öneri, bildirim ve temizleme akışını çalıştırır", async ({ page }) => {
  await page.goto("/asistan/");
  await closeConsent(page);
  await page.getByRole("button", { name: /Kahve seçenekleri/ }).click();
  await expect(page.getByRole("strong").filter({ hasText: "Kahve Makinesi 101" })).toBeVisible();
  await page.getByLabel("Mesajınız").fill("Ofis için seçenek arıyorum");
  await page.getByRole("button", { name: "Gönder" }).click();
  await expect(page.getByText("Demo mesaj hazırlandı; AI sağlayıcısına gönderilmedi.")).toBeVisible();
  await page.getByRole("button", { name: "Konuşmayı temizle" }).click();
  await expect(page.getByRole("button", { name: /Çay makinesi öner/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Canlı desteğe bağlan" })).toBeDisabled();
});
