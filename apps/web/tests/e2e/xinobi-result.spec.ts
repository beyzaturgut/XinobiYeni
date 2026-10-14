import { test, expect } from '@playwright/test';
import { artworkReadOnly } from './artwork-read-only';

test('ready result waits for explicit preview action and reuses the session', async ({ page }) => {
  await artworkReadOnly(page);
  const product = 'DEMO-499cf715-33cd-4144-8c40-2245181e8625', variant = 'DEMO-V-5a46bb98-c95c-42b9-9f12-e4286f628cca';
  // Offline ready-session contract; never creates a real session or generation.
  let reads = 0;
  await page.route('**/design-studio/sessions/abcdef', route => route.fulfill({ json: {
    id: 'abcdef', status: ++reads === 1 ? 'running' : 'ready', product: { id: product, name: 'CM121' }, variant: { id: variant, color: 'Metalik Gümüş', image: '/assets/personalization/sample-pattern.png' },
    questions: [], answers: [], imageUrl: '/api/v1/design-studio/sessions/abcdef/image',
  } }));
  await page.route('**/design-studio/sessions/abcdef/image', route => route.fulfill({ path: 'public/assets/personalization/sample-pattern.png' }));
  await page.addInitScript(({product,variant}) => sessionStorage.setItem(`xinobi-u-session:${product}:${variant}`, 'abcdef'), {product,variant});
  await page.goto(`/xinobi-u/sorular?product=${product}&variant=${variant}`);
  await expect(page.getByRole('heading', {name:'İşte sana özel yorum.'})).toBeVisible();
  await expect(page.getByText('Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.')).toBeVisible();
  await expect(page.getByRole('button', {name:'Yeni anket başlat'})).toBeVisible();
  expect(page.url()).toContain('/sorular');
  await page.waitForTimeout(5500); // No interaction: span multiple polling ticks.
  await expect(page.getByRole('heading', {name:'İşte sana özel yorum.'})).toBeVisible();
  expect(page.url()).toContain('/sorular');
  const close = page.getByRole('button', {name:'Çerez tercih panelini kapat'});
  if (await close.isVisible()) await close.click();
  await page.getByRole('button', {name:'Üründe gelişmiş önizlemeyi aç'}).click();
  await expect(page).toHaveURL(/\/xinobi-u\/onizleme/);
  expect(await page.evaluate(() => sessionStorage.getItem('xinobi-u-selected-session'))).toBe('abcdef');
});
