import {expect,type Page} from '@playwright/test';
/** XINOBI U own-image flow: the upload step shows the prepared file; the canvas appears on the placement step. */
export async function expectPrepared(page:Page){await expect(page.locator('main img[alt^="Yüklenen"]')).toBeVisible()}
export async function openPlacement(page:Page,timeout?:number){
 await expectPrepared(page);await page.getByRole('button',{name:'Önizlemeye geç →'}).click();
 await expect(page.locator('canvas[role=img]')).toBeVisible({timeout});
}
