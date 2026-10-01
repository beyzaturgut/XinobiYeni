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

test("üyelik sekmeleri, parola görünürlüğü ve parola yenileme görünümü çalışır", async ({ page }) => {
  await page.goto("/hesap/giris/");
  await closeConsent(page);
  await page.getByRole("tab", { name: "Yeni hesap" }).click();
  await expect(page.getByRole("heading", { name: "Yeni hesabınızı oluşturun." })).toBeVisible();
  await expect(page.getByLabel(/Üyelik koşullarını/)).not.toBeChecked();
  const password = page.getByPlaceholder("En az 8 karakter");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Parolayı göster" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("tab", { name: "Giriş" }).click();
  await page.getByRole("button", { name: "Parolamı unuttum" }).click();
  await expect(page.getByRole("heading", { name: "Parolanızı yenileyin." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yenileme bağlantısı gönder" })).toBeDisabled();
});

test("sipariş seçimi detay ve teslimat çizgisini günceller", async ({ page }) => {
  await page.goto("/hesap/siparisler/");
  await closeConsent(page);
  await page.getByRole("button", { name: /DEMO-2312/ }).click();
  await expect(page.getByRole("heading", { name: "DEMO-2312" })).toBeVisible();
  const detail = page.locator("section[aria-labelledby='order-title']");
  await expect(detail.getByText("Kahve Makinesi 101", { exact: true })).toBeVisible();
  await expect(page.getByText("Demo kargo durumu")).toBeVisible();
  await expect(page.getByRole("button", { name: "Kargoyu takip et" })).toBeDisabled();
});

test("iade formu geçerli girişlerle demo özeti hazırlar", async ({ page }) => {
  await page.goto("/hesap/siparisler/iade/");
  await closeConsent(page);
  await page.getByLabel("İptal talebi").check();
  await page.getByLabel("Neden").selectOption({ label: "Yanlış ürün seçtim" });
  await page.getByLabel("Açıklama").fill("Yanlış ürün seçildiği için iptal etmek istiyorum.");
  await page.getByRole("button", { name: "Demo talep özetini hazırla" }).click();
  await expect(page.getByRole("heading", { name: "İptal önizlemesi" })).toBeVisible();
  await expect(page.getByText("Demo özet hazırlandı; talep sunucuya gönderilmedi.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Talebi gönder" })).toBeDisabled();
});

test("teklif revizyonu ve demo geri bildirim notu birlikte güncellenir", async ({ page }) => {
  await page.goto("/kurumsal/teklif/takip/");
  await closeConsent(page);
  await page.getByRole("button", { name: "Revizyon 1" }).click();
  await expect(page.getByRole("heading", { name: "Revizyon 1" })).toBeVisible();
  await expect(page.getByText("20", { exact: true })).toBeVisible();
  await page.getByLabel("Talebiniz").fill("Termin ve renk seçeneklerinin güncellenmesini rica ederiz.");
  await page.getByRole("button", { name: "Demo revizyon notunu hazırla" }).click();
  await expect(page.getByText("Demo revizyon notu hazırlandı; sunucuya gönderilmedi.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Teklifi onayla" })).toBeDisabled();
});

test("gelişmiş editör katman, görünürlük, kilit ve yüz seçimlerini yönetir", async ({ page }) => {
  await page.goto("/urunler/cay-makinesi-101/editor/");
  await closeConsent(page);
  await page.locator("aside[aria-label='Tasarım araçları'] button").filter({ hasText: "Metin" }).click();
  await expect(page.getByText("3 öğe")).toBeVisible();
  await expect(page.getByText("Metin katmanı demo çalışma alanına eklendi.")).toBeVisible();
  await page.getByRole("button", { name: "Yeni metin katmanını gizle" }).click();
  await expect(page.getByRole("button", { name: "Yeni metin katmanını göster" })).toBeVisible();
  await page.getByRole("button", { name: "Bana özel katmanının kilidini kapat" }).click();
  await expect(page.getByRole("button", { name: "Bana özel katmanının kilidini aç" })).toBeVisible();
  await page.getByRole("button", { name: "Arka yüz" }).click();
  await expect(page.getByRole("heading", { name: "Arka yüz" })).toBeVisible();
  await page.getByRole("button", { name: "Demo taslağı hazırla" }).click();
  await expect(page.getByText("Demo taslak hazırlandı; sunucuya kalıcı kayıt yapılmadı.")).toBeVisible();
});

test("katalog arama, kategori, sıralama ve boş durumdan sıfırlama akışlarını çalıştırır", async ({ page }) => {
  await page.goto("/urunler/");
  await closeConsent(page);
  await page.getByRole("button", { name: "Kahve", exact: true }).click();
  await expect(page.getByText("3 ürün varyantı")).toBeVisible();
  await page.getByLabel("Ürünlerde ara").fill("kırmızı");
  await expect(page.getByText("1 ürün varyantı")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kahve Makinesi 101" })).toBeVisible();
  await page.getByLabel("Sırala").selectOption("name");
  await page.getByLabel("Ürünlerde ara").fill("bulunmayan ürün");
  await expect(page.getByRole("heading", { name: "Aradığınız ürün bulunamadı." })).toBeVisible();
  await page.getByRole("button", { name: "Filtreleri temizle" }).click();
  await expect(page.getByText("10 ürün varyantı")).toBeVisible();
});

test("ürün detayında renk varyantı görsel ve seçili durumla birlikte değişir", async ({ page }) => {
  await page.goto("/urunler/cay-makinesi-101/");
  await closeConsent(page);
  const red = page.getByRole("button", { name: "Kırmızı rengini seç" });
  await red.click();
  await expect(red).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("group", { name: "Renk: Kırmızı" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Xinobi Çay Makinesi 101, Kırmızı" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Satış bilgisi hazırlanıyor" })).toBeDisabled();
});

test("katalog favorisi tarayıcı listesine taşınır ve listeden kaldırılır", async ({ page }) => {
  await page.goto("/urunler/");
  await closeConsent(page);
  const favorite = page.getByRole("button", { name: "Çay Makinesi 101 Lacivert ürününü favorilere ekle" });
  await favorite.click();
  await expect(page.getByRole("button", { name: "Çay Makinesi 101 Lacivert ürününü favorilerden çıkar" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/favoriler/");
  await expect(page.getByText("1 favori ürün")).toBeVisible();
  await page.getByRole("button", { name: "Çay Makinesi 101 Lacivert ürününü favorilerden çıkar" }).click();
  await expect(page.getByRole("heading", { name: "Favori listeniz henüz boş." })).toBeVisible();
});

test("ödeme formu girişleri korur ve yöntem açıklamasını değiştirir", async ({ page }) => {
  await page.goto("/odeme/");
  await closeConsent(page);
  await page.getByLabel("Ad soyad").fill("Demo Kullanıcı");
  await page.getByLabel("Telefon").fill("0555 000 00 00");
  await page.getByLabel("E-posta").fill("demo@example.com");
  await page.getByLabel("Havale / EFT").check();
  await expect(page.getByText("Banka bilgileri etkin değil")).toBeVisible();
  await expect(page.getByLabel("Ad soyad")).toHaveValue("Demo Kullanıcı");
  await expect(page.getByRole("button", { name: "Ödemeyi başlat" })).toBeDisabled();
});

test("basit kişiselleştirme metin sınırı, stil, renk ve demo taslağı uygular", async ({ page }) => {
  await page.goto("/urunler/cay-makinesi-101/kisisellestir/");
  await closeConsent(page);
  const text = page.getByLabel("İsim veya kısa mesaj");
  await text.fill("Xinobi için uzun demo metni");
  await expect(text).toHaveValue("Xinobi için uzun demo me");
  await page.getByRole("button", { name: /Geometrik/ }).click();
  await page.getByRole("button", { name: "Xinobi teal rengini seç" }).click();
  await expect(page.getByRole("button", { name: /Geometrik/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Xinobi teal rengini seç" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Demo taslağını hazırla" }).click();
  await expect(page.getByText("Demo taslağınız bu oturum için hazırlandı. Kalıcı kayıt yapılmadı.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Siparişe devam et" })).toBeDisabled();
});
