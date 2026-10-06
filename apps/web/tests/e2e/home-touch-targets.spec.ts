import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`${width}px: slider dokunma alanı ve klavye seçimi`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Çerez tercih panelini kapat" }).click();
    const hero = page.getByRole("region", { name: "Xinobi ürün tanıtımları" });
    for (let index = 1; index <= 3; index++) {
      const button = hero.getByRole("button", { name: `${index}. görsel`, exact: true });
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      // Küçük görünen noktanın dışındaki alan da tıklanabilir olmalı.
      await button.click({ position: { x: 2, y: 2 } });
      await expect(button).toHaveAttribute("aria-current", "true");
      await expect(hero.locator("img")).toHaveAttribute("src", `/assets/banners/home-slider-${index}.png`);
    }
    const first = hero.getByRole("button", { name: "1. görsel", exact: true });
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await expect(hero.getByRole("button", { name: "2. görsel", exact: true })).toHaveAttribute("aria-current", "true");
    if (width < 1024) {
      const header = page.locator("header");
      for (const control of [header.getByRole("link", { name: "Ara", exact: true }), header.getByRole("link", { name: "Sepet", exact: true }), header.locator("summary")]) {
        const box = await control.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });
}
