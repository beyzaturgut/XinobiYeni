// Browser-only demo limits: cap retained file data and decoded/rendering memory.
export const MAX_PATTERN_BYTES = 8 * 1024 * 1024;
export const MAX_PATTERN_DIMENSION = 4096;
export const MAX_PATTERN_PIXELS = 8 * 1024 * 1024;
export async function validateLocalPattern(file: File): Promise<void> {
 if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Yalnız PNG, JPEG veya WebP görselleri seçebilirsiniz.');
 if (!file.size || file.size > MAX_PATTERN_BYTES) throw new Error('Görsel boş olmamalı ve en fazla 8 MB olmalıdır.');
 const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
 const png = [137,80,78,71,13,10,26,10].every((v,i)=>header[i]===v);
 const jpeg = header[0]===255 && header[1]===216 && header[2]===255;
 const webp = String.fromCharCode(...header.slice(0,4))==='RIFF' && String.fromCharCode(...header.slice(8,12))==='WEBP';
 if (!(file.type==='image/png'?png:file.type==='image/jpeg'?jpeg:webp)) throw new Error('Dosyanın içeriği seçilen görsel biçimiyle eşleşmiyor.');
 let bitmap: ImageBitmap;
 try { bitmap = await createImageBitmap(file); } catch { throw new Error('Görsel okunamadı. Geçerli bir PNG, JPEG veya WebP seçin.'); }
 try {
  if (!bitmap.width || !bitmap.height || bitmap.width>MAX_PATTERN_DIMENSION || bitmap.height>MAX_PATTERN_DIMENSION || bitmap.width*bitmap.height>MAX_PATTERN_PIXELS)
   throw new Error('Görselin her kenarı en fazla 4096 piksel, toplamı en fazla 8 megapiksel (8.388.608 piksel) olmalıdır.');
 } finally { bitmap.close(); }
}
