import { test, expect } from '@playwright/test';
import { artworkReadOnly } from './artwork-read-only';

test.beforeEach(async ({ page }) => artworkReadOnly(page));
for (const width of [360, 390, 1440]) {
  test(`XINOBI preview keeps placement controls and separates badge at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/xinobi-u/mobil-onizleme/');
    const canvas = page.locator('canvas[role=img]');
    await expect(canvas).toBeVisible();
    const cookieClose = page.getByRole('button', { name: 'Çerez tercih panelini kapat' });
    if (await cookieClose.isVisible()) await cookieClose.click();
    await expect(page.getByRole('group', { name: 'Ürün yüzü' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Şekil', exact: false })).toHaveCount(0);
    await expect(page.getByText('Şablonlar', { exact: true })).toHaveCount(0);
    await expect(page.getByText('D04 koruması', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Katmanlar', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Özellikler', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Metin', {exact:true})).toHaveCount(0);
    await expect(page.getByRole('button',{name:/Görsel yükle/})).toBeVisible();
    await expect(page.locator('#pattern-controls-title')).toBeVisible();
    const badge = await page.getByText('Temsilidir', { exact: true }).boundingBox();
    const image = await canvas.boundingBox();
    expect(badge!.y + badge!.height).toBeLessThanOrEqual(image!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const before = await canvas.evaluate(node => (node as HTMLCanvasElement).toDataURL());
    await page.locator('#pattern-scale').fill('1.5');
    await expect(page.locator('#pattern-scale')).toHaveValue('1.5');
    await expect.poll(() => canvas.evaluate(node => (node as HTMLCanvasElement).toDataURL())).not.toBe(before);
    for (const [id, value] of [['x','1100'], ['y','2000'], ['rotation','20'], ['curvature','0.5']]) {
      await page.locator(`#pattern-${id}`).fill(value);
      await expect(page.locator(`#pattern-${id}`)).toHaveValue(value);
    }
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.screenshot({ path: `../../artifacts/t17-preview-${width}.png`, fullPage: true });
  });
}
test('normal shopping editor retains its original UI', async ({ page }) => {
  await page.goto('/urunler/cay-makinesi-101/editor/');
  await expect(page.locator('canvas[role=img]')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Ürün yüzü' })).toBeVisible();
  await expect(page.getByText('D04 koruması', { exact: true })).toBeVisible();
  await expect(page.getByText('Katmanlar', { exact: true })).toBeVisible();
  await expect(page.getByText('Özellikler', { exact: true })).toBeVisible();
  await expect(page.getByText('Metin', { exact: true })).toBeVisible();
});

for (const width of [320, 360, 390, 1440]) {
  test(`preview swatches are compact without changing colour selection at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/xinobi-u/mobil-onizleme/');
    const selector = page.getByRole('region', { name: 'Önizleme rengi' });
    await expect(selector.getByRole('button').first()).toBeVisible();
    const circles = selector.locator('fieldset button > span');
    const dimensions = await circles.evaluateAll(nodes => nodes.map(node => {
      const r = node.getBoundingClientRect(); return { width: r.width, height: r.height, y: r.y };
    }));
    for (const r of dimensions) {
      expect(r.width).toBe(38); expect(r.height).toBe(38);
      expect(r.y).toBeCloseTo(dimensions[0].y, 0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/xinobi-u/renk/?product=DEMO-499cf715-33cd-4144-8c40-2245181e8625');
    const original = page.getByRole('button', { name: 'Metalik gümüş rengini seç', exact: true }).locator('span');
    await expect(original).toBeVisible();
    await expect(original).toHaveCSS('width', '48px');
  });
}
