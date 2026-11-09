import {createHash} from 'node:crypto';
import {writeFile, rename} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const checksum = /^[a-f0-9]{64}$/;

// Explicit product IDs only. This exports a release audit manifest, not offline media or approval authority.
// The runtime API remains authoritative after source replacement, revoke or product withdrawal.
export async function exportSingleSourcePreviews(origin, products, {fetcher = fetch, inspect} = {}) {
 const api = new URL(origin);
 if (api.username || api.password || api.search || api.hash || api.pathname !== '/' ||
     !(api.protocol === 'https:' || api.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(api.hostname)))
  throw Error('Use an HTTPS origin or local development origin without credentials');
 if (!Array.isArray(products) || !products.length || new Set(products).size !== products.length || products.some(id => !/^[a-zA-Z0-9-]+$/.test(id)))
  throw Error('Select unique explicit product IDs');
 if (!inspect) {
  const web = createRequire(path.resolve('apps/web/package.json'));
  const sharp = createRequire(web.resolve('next/package.json'))('sharp');
  inspect = bytes => sharp(bytes, {limitInputPixels: false}).metadata();
 }
 const get = async url => {
  const response = await fetcher(new URL(url, api), {redirect:'error', cache:'no-store', signal:AbortSignal.timeout(30000)});
  if (!response.ok) throw Error(`Surface publication unavailable (${response.status})`);
  return response;
 };
 const publications = [];
 for (const product of products) {
  const endpoint = `/api/v1/product-surfaces/${encodeURIComponent(product)}/rendering-inputs`;
  const value = await (await get(endpoint)).json(), input = value.inputs;
  if (value.schemaVersion !== 1 || value.scope !== 'single-source-preview' || value.productReference !== product ||
      !Number.isInteger(value.sourceRevision) || value.sourceRevision <= 0 ||
      !new RegExp(`^source-${value.sourceRevision}-mask-[a-f0-9]{32}$`).test(value.surfaceId) ||
      !input || !Number.isSafeInteger(input.width) || input.width <= 0 || !Number.isSafeInteger(input.height) || input.height <= 0 ||
      !checksum.test(input.sourceMediaVersion) || !checksum.test(input.surfaceVersion) || input.brandingRequired !== false || input.branding !== null)
   throw Error('Invalid single-source identity');
  for (const role of ['source','mask']) {
   const media = input[role], expected = role === 'source' ? input.sourceMediaVersion : input.surfaceVersion;
   const url = `/api/v1/product-surfaces/${encodeURIComponent(product)}/${value.surfaceId}/${role}?v=${expected}`;
   if (!media || media.sha256 !== expected || media.url !== url) throw Error('Mixed surface media identity');
   const response = await get(url), limit = (role === 'source' ? 25 : 32) * 1024 * 1024;
   const reader = response.body.getReader(), chunks = []; let size = 0;
   try {
    while (true) { const {done,value:chunk} = await reader.read(); if(done) break; size += chunk.length;
     if(size > limit) throw Error('Surface media exceeds transfer budget'); chunks.push(Buffer.from(chunk)); }
   } finally { await reader.cancel(); }
   const bytes = Buffer.concat(chunks);
   if (hash(bytes) !== media.sha256) throw Error('Surface media checksum mismatch');
   const metadata = await inspect(bytes);
   if (metadata.width !== input.width || metadata.height !== input.height || role === 'mask' && metadata.format !== 'png')
    throw Error('Surface media dimensions or format mismatch');
  }
  // Prevent exporting an approval that changed while files were fetched. No variant/static fallback.
  const current = await (await get(endpoint)).json();
  if (JSON.stringify(current) !== JSON.stringify(value)) throw Error('Surface changed during export');
  publications.push(value);
 }
 return {schemaVersion:1, scope:'single-source-release-audit', apiOrigin:api.origin, publications};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
 const [origin, output, ...products] = process.argv.slice(2);
 if (!origin || !output || !products.length) throw Error('Usage: node tools/export-single-source-previews.mjs <api-origin> <output.json> <product-id> [...]');
 const manifest = await exportSingleSourcePreviews(origin, products);
 const temporary = `${output}.${process.pid}.tmp`;
 await writeFile(temporary, JSON.stringify(manifest,null,2) + '\n', {flag:'wx'});
 await rename(temporary, output);
 console.log(`Verified ${manifest.publications.length} single-source publication(s).`);
}
