/** A product composition for cards and the full-screen order viewer; raw artwork stays separate. */
export async function designPreviewBlob(source: HTMLCanvasElement): Promise<Blob> {
 const canvas=document.createElement('canvas');
 const ratio=Math.min(1,1440/Math.max(source.width,source.height));
 canvas.width=Math.max(1,Math.round(source.width*ratio));canvas.height=Math.max(1,Math.round(source.height*ratio));
 try {
  const context=canvas.getContext('2d');if(!context)throw new Error('Önizleme hazırlanamadı.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(source,0,0,canvas.width,canvas.height);
  // Preserve more detail for pinch zoom while respecting the API's 2 MB preview limit.
  for(const quality of [.9,.8,.7]){
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
   if(blob&&blob.size<=2*1024*1024)return blob;
  }
  throw new Error('Önizleme kaydedilemedi. Görsel boyutunu küçültüp yeniden deneyin.');
 } finally {canvas.width=0;canvas.height=0}
}
