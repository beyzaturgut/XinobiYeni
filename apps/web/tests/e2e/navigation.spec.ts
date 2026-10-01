import { expect, test, type Page } from "@playwright/test";

async function closeConsent(page: Page) {
  await page.getByRole("button", { name: "Çerez tercih panelini kapat" }).click();
}

async function verifyNavigation(page: Page, route: string) {
  await page.goto(route);
  await closeConsent(page);

  const hrefs = await page.locator("a[href]").evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute("href")).filter((href): href is string => Boolean(href)))],
  );

  for (const href of hrefs) {
    if (href.startsWith("#")) {
      await expect(page.locator(href), `${route} içinde ${href} hedefi bulunamadı`).toHaveCount(1);
      continue;
    }

    if (href.startsWith("/") && !href.includes("#")) {
      const response = await page.request.get(href);
      expect(response.ok(), `${route} içindeki ${href} bağlantısı ${response.status()} döndürdü`).toBe(true);
    }
  }
}

test("ana sayfa iç ve rota bağlantıları geçerli hedeflere ulaşır", async ({ page }) => {
  await verifyNavigation(page, "/");
});

test("Xinobi dünyası menü, CTA ve alt menü bağlantıları geçerlidir", async ({ page }) => {
  await verifyNavigation(page, "/xinobi/");
});

test("yasal merkez menü ve geri dönüş bağlantıları geçerlidir", async ({ page }) => {
  await verifyNavigation(page, "/yasal/");
});
