import {test,expect} from '@playwright/test';
// Byte-exact guard for the Tea Maker demo preview (blue variant, sample pattern). The reference is the editor output
// accepted on 14.10.2026 at bccef08, after fe93107 moved the editor to LocalPatternPreview; it replaces the 7 October
// reference (9401386), from which the accepted output differed in 40,380 of 6,822,400 bytes. Any rendering change now
// needs a new, deliberately accepted reference.
const reference='9d70df5b176489a0385a80d35661b493e41ba592dcccedc1195139a08040aaa3';
test('demo pixels remain byte-exact against the accepted 14 October rendering',async({page})=>{
 test.setTimeout(120000);await page.goto('/urunler/cay-makinesi-101/editor/');const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();
 await expect(canvas).toHaveAttribute('width','1066');await expect(canvas).toHaveAttribute('height','1600');
 const digest=await canvas.evaluate(async(c:HTMLCanvasElement)=>{
  const bytes=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
 });
 console.log('Preview pixel SHA-256:',digest);expect(digest).toBe(reference);
});
