import type { Page } from '@playwright/test';

export async function artworkReadOnly(page: Page) {
  await page.route('**/*', route => ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())
    ? route.continue()
    : route.abort('blockedbyclient'));
}
