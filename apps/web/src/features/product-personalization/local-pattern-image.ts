// Retained preview limits; larger originals are optimized before these apply.
export const MAX_PATTERN_BYTES = 8 * 1024 * 1024;
export const MAX_PATTERN_DIMENSION = 4096;
export const MAX_PATTERN_PIXELS = 8 * 1024 * 1024;
const MAX_INPUT_BYTES = 64 * 1024 * 1024;
const MAX_INPUT_PIXELS = 100_000_000;
const invalidImage = 'Görsel okunamadı. Geçerli bir PNG, JPEG veya WebP seçin.';

function checkCancelled(signal?: AbortSignal) {
 if (signal?.aborted) throw new DOMException('İşlem iptal edildi.', 'AbortError');
}
function orientation(bytes: Uint8Array): number {
 let start = 0;
 if (String.fromCharCode(...bytes.subarray(0, 6)) === 'Exif\0\0') start = 6;
 if (bytes.length < start + 8) return 1;
 const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
 const little = bytes[start] === 73 && bytes[start + 1] === 73;
 if (!little && !(bytes[start] === 77 && bytes[start + 1] === 77)) return 1;
 if (view.getUint16(start + 2, little) !== 42) return 1;
 const ifd = start + view.getUint32(start + 4, little);
 if (ifd < start + 8 || ifd + 2 > bytes.length) return 1;
 const count = Math.min(view.getUint16(ifd, little), 256);
 for (let n = 0; n < count; n++) {
  const entry = ifd + 2 + n * 12;
  if (entry + 12 > bytes.length) break;
  if (view.getUint16(entry, little) === 0x112 && view.getUint16(entry + 2, little) === 3 && view.getUint32(entry + 4, little) === 1) {
   const value = view.getUint16(entry + 8, little);
   return value >= 1 && value <= 8 ? value : 1;
  }
 }
 return 1;
}

async function imageSize(file: File, signal?: AbortSignal) {
 if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Yalnız PNG, JPEG veya WebP görselleri seçebilirsiniz.');
 if (!file.size) throw new Error('Görsel dosyası boş olmamalıdır.');
 if (file.size > MAX_INPUT_BYTES) throw new Error('Bu görsel işlenemeyecek kadar büyük. Lütfen 64 MiB veya daha küçük bir dosya seçin.');
 checkCancelled(signal);
 const bytes = new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer());
 const view = new DataView(bytes.buffer);
 const tag = (at: number) => String.fromCharCode(...bytes.subarray(at, at + 4));
 let width = 0, height = 0, exif = 1;
 const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
 const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
 const webp = tag(0) === 'RIFF' && tag(8) === 'WEBP';
 if (!(file.type === 'image/png' ? png : file.type === 'image/jpeg' ? jpeg : webp)) throw new Error('Dosyanın içeriği seçilen görsel biçimiyle eşleşmiyor.');
 if (png && bytes.length >= 33 && tag(12) === 'IHDR' && view.getUint32(8) === 13) {
  width = view.getUint32(16); height = view.getUint32(20);
 } else if (jpeg) {
  let at = 2;
  while (at + 4 <= bytes.length) {
   if (bytes[at++] !== 255) break;
   while (bytes[at] === 255) at++;
   const marker = bytes[at++];
   if (marker === 0xda || marker === 0xd9 || at + 2 > bytes.length) break;
   const length = view.getUint16(at);
   if (length < 2 || at + length > bytes.length) break;
   if (marker === 0xe1 && String.fromCharCode(...bytes.subarray(at + 2, at + 8)) === 'Exif\0\0') exif = orientation(bytes.subarray(at + 2, at + length));
   if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && length >= 8) {
    height = view.getUint16(at + 3); width = view.getUint16(at + 5);
   }
   at += length;
  }
 } else if (webp && bytes.length >= 30) {
  const chunk = tag(12);
  if (chunk === 'VP8X') {
   width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
   height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
  } else if (chunk === 'VP8L' && bytes[20] === 0x2f) {
   const bits = view.getUint32(21, true); width = 1 + (bits & 0x3fff); height = 1 + ((bits >>> 14) & 0x3fff);
  } else if (chunk === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 1 && bytes[25] === 0x2a) {
   width = view.getUint16(26, true) & 0x3fff; height = view.getUint16(28, true) & 0x3fff;
  }
 }
 if (!width || !height) throw new Error(invalidImage);
 if (width > 32768 || height > 32768 || width * height > MAX_INPUT_PIXELS) throw new Error('Görselin çözünürlüğü güvenli işleme sınırını aşıyor. Lütfen daha küçük bir fotoğraf seçin.');
 // Read chunk headers/EXIF only, skipping compressed PNG/WebP pixels.
 if (png || webp) {
  let at = png ? 8 : 12;
  for (let n = 0; n < 128 && at + 8 <= file.size; n++) {
   checkCancelled(signal);
   const chunk = new Uint8Array(await file.slice(at, at + 8).arrayBuffer());
   const data = new DataView(chunk.buffer);
   const length = data.getUint32(png ? 0 : 4, webp);
   const name = String.fromCharCode(...chunk.subarray(png ? 4 : 0, png ? 8 : 4));
   if (at + 8 + length > file.size) throw new Error(invalidImage);
   if (name === 'eXIf' || name === 'EXIF') { exif = orientation(new Uint8Array(await file.slice(at + 8, at + 8 + Math.min(length, 65536)).arrayBuffer())); break; }
   if (name === 'IEND') break;
   at += 8 + length + (png ? 4 : length % 2);
  }
 }
 return exif >= 5 ? { width: height, height: width, swapped: true } : { width, height, swapped: false };
}

function fits(width: number, height: number, bytes: number) {
 return width > 0 && height > 0 && width <= MAX_PATTERN_DIMENSION && height <= MAX_PATTERN_DIMENSION && width * height <= MAX_PATTERN_PIXELS && bytes <= MAX_PATTERN_BYTES;
}

export async function prepareLocalPattern(file: File, signal?: AbortSignal): Promise<File> {
 const size = await imageSize(file, signal);
 checkCancelled(signal);
 const unchanged = fits(size.width, size.height, file.size);
 const ratio = unchanged ? Math.min(1, 128 / Math.max(size.width, size.height)) : Math.min(1, MAX_PATTERN_DIMENSION / size.width, MAX_PATTERN_DIMENSION / size.height, Math.sqrt(MAX_PATTERN_PIXELS / (size.width * size.height)));
 let width = Math.max(1, Math.floor(size.width * ratio)), height = Math.max(1, Math.floor(size.height * ratio));
 let bitmap: ImageBitmap;
 // Default decoding applies EXIF. Some Chromium versions reject the historical
 // explicit "from-image" enum value; do not override the browser default.
 // Resize dimensions refer to the oriented bitmap; imageSize already swaps
 // the axes for EXIF rotations. Swapping again distorts portrait photographs.
 try { bitmap = await createImageBitmap(file, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' }); }
 catch { throw new Error(invalidImage); }
 let canvas: HTMLCanvasElement | undefined;
 try {
  checkCancelled(signal);
  if (bitmap.width !== width || bitmap.height !== height) throw new Error(invalidImage);
  if (unchanged) return file;
  canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Görsel bu cihazda hazırlanamadı. Lütfen daha küçük bir fotoğraf deneyin.');
  for (let attempt = 0; attempt < 4; attempt++) {
   checkCancelled(signal);
   canvas.width = width; canvas.height = height;
   context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
   context.drawImage(bitmap, 0, 0, width, height);
   // Never encode transparent PNG/WebP as JPEG. Prefer lossless PNG, then
   // alpha-preserving WebP; limit quality reduction before reducing dimensions.
   const encodings: [string, number | undefined][] = file.type === 'image/png' ? [['image/png', undefined], ['image/webp', .92], ['image/webp', .86], ['image/webp', .8]] : [[file.type, .92], [file.type, .86], [file.type, .8]];
   for (const [type, quality] of encodings) {
    checkCancelled(signal);
    const blob = await new Promise<Blob | null>(resolve => canvas!.toBlob(resolve, type, quality));
    checkCancelled(signal);
    if (blob && blob.size > 0 && fits(width, height, blob.size)) {
     const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
     return new File([blob], `${file.name.replace(/\.[^.]*$/, '')}-preview.${extension}`, { type: blob.type, lastModified: file.lastModified });
    }
   }
   const smaller = ratio * Math.pow(.85, attempt + 1);
   width = Math.max(1, Math.floor(size.width * smaller)); height = Math.max(1, Math.floor(size.height * smaller));
  }
  throw new Error('Görsel uygun boyuta getirilemedi. Lütfen daha küçük bir fotoğraf deneyin.');
 } catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') throw error;
  throw new Error('Görsel bu cihazda hazırlanamadı. Lütfen daha küçük veya başka bir fotoğraf deneyin.');
 } finally {
  bitmap.close();
  if (canvas) { canvas.width = 0; canvas.height = 0; }
 }
}
