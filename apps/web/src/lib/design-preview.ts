/** A small product composite for native cart/favorite cards; the raw artwork remains a separate private asset. */
export async function designPreviewBlob(source: HTMLCanvasElement): Promise<Blob> {
 const canvas=document.createElement('canvas');
 const ratio=Math.min(1,480/Math.max(source.width,source.height));
 canvas.width=Math.max(1,Math.round(source.width*ratio));canvas.height=Math.max(1,Math.round(source.height*ratio));
 try {
  const context=canvas.getContext('2d');if(!context)throw new Error('Önizleme hazırlanamadı.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(source,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));
  if(!blob)throw new Error('Önizleme hazırlanamadı.');return blob;
 } finally {canvas.width=0;canvas.height=0}
}
