// Check the exact-source adapter without a browser, provider or live catalogue.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
const require = createRequire(path.resolve('apps/admin/package.json'));
const ts = require('typescript');
const source = readFileSync('apps/web/src/app/urunler/cay-makinesi-101/editor/accepted-surface-api.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const sha = 'a'.repeat(64), maskSha = 'b'.repeat(64);
const bundle = variant => ({ scope: 'development-preview', productReference: 'product', variantReference: variant, previewAvailable: true, inputs: { width: 200, height: 300, surfaceVersion: maskSha, sourceMediaVersion: sha, source: { url: `/api/v1/local-commerce/media/${(variant === 'red' ? 'c' : 'd').repeat(32)}.png?v=${sha}`, sha256: sha }, mask: { url: `/api/v1/local-commerce/media/${'e'.repeat(32)}.png?v=${maskSha}`, sha256: maskSha }, brandingRequired: false, branding: null } });
let response, calls = 0;
const exports = {};
vm.runInNewContext(code, { exports, require: () => ({ commerceApi: '/api/v1/local-commerce' }), process: { env: { NODE_ENV: 'development' } }, AbortController, URL, fetch: async url => { assert.ok(url.includes('/commerce-mask/product/')); calls++; return new Response(JSON.stringify(response)); } });
for (const variant of ['blue', 'red']) {
 response = bundle(variant);
 const result = await exports.loadAcceptedSurface(variant, new AbortController().signal, 'product');
 assert.equal(result.mask.sha256, maskSha); assert.equal(result.width, 200); assert.equal(result.source.url, response.inputs.source.url);
}
response = { ...bundle('red'), variantReference: 'blue' };
await assert.rejects(exports.loadAcceptedSurface('red', new AbortController().signal, 'product'), /identity/);
response = bundle('red'); response.inputs.mask.url = 'https://untrusted.example/mask.png';
await assert.rejects(exports.loadAcceptedSurface('red', new AbortController().signal, 'product'), /media/);
response = bundle('red'); response.inputs.width = 999999;
await assert.rejects(exports.loadAcceptedSurface('red', new AbortController().signal, 'product'), /bundle/);
assert.equal(calls, 5);
console.log('PASS: shared mask with exact colour source, identity mismatch, offsite media and oversized bundle rejection');
