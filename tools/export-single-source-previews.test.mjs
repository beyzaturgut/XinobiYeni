import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {exportSingleSourcePreviews} from './export-single-source-previews.mjs';

const bytes = Buffer.from('isolated-fixture');
const sha = createHash('sha256').update(bytes).digest('hex');
const id = 'source-1-mask-' + 'a'.repeat(32);
const media = role => ({url:`/api/v1/product-surfaces/product/${id}/${role}?v=${sha}`,sha256:sha});
const publication = () => ({schemaVersion:1,scope:'single-source-preview',productReference:'product',surfaceId:id,sourceRevision:1,
 inputs:{width:71,height:93,surfaceVersion:sha,sourceMediaVersion:sha,source:media('source'),mask:media('mask'),brandingRequired:false,branding:null}});
const inspect = async () => ({width:71,height:93,format:'png'});
function fixture(transform = value => value, alterMedia = false) {
 let reads = 0;
 return async url => url.pathname.endsWith('/rendering-inputs')
  ? Response.json(transform(publication(), ++reads)) : new Response(alterMedia ? 'corrupt' : bytes);
}

test('exports only explicit source publication after hashes, dimensions and final freshness check', async () => {
 const value = await exportSingleSourcePreviews('http://localhost:5003',['product'],{fetcher:fixture(),inspect});
 assert.equal(value.publications[0].inputs.width,71);
 assert.equal(value.publications[0].surfaceId,id);
 assert.equal(value.scope,'single-source-release-audit');
});
test('never follows retired, missing, mixed or stale approval through variant fallback', async () => {
 for (const status of [404,409,410,503]) await assert.rejects(exportSingleSourcePreviews('https://example.com',['product'],{fetcher:async()=>new Response('',{status}),inspect}));
 await assert.rejects(exportSingleSourcePreviews('https://example.com',['product'],{fetcher:fixture(v=>({...v,productReference:'other'})),inspect}));
 await assert.rejects(exportSingleSourcePreviews('https://example.com',['product'],{fetcher:fixture((v,n)=>n===2?{...v,sourceRevision:2}:v),inspect}),/changed/);
 await assert.rejects(exportSingleSourcePreviews('https://example.com',['product'],{fetcher:fixture(v=>({...v,inputs:{...v.inputs,mask:{...v.inputs.mask,url:'https://external.test/mask'}}})),inspect}),/identity/);
});
test('rejects corrupt bytes and different canvas without modifying source', async () => {
 await assert.rejects(exportSingleSourcePreviews('https://example.com',['product'],{fetcher:fixture(undefined,true),inspect}),/checksum/);
 await assert.rejects(exportSingleSourcePreviews('https://example.com',['product'],{fetcher:fixture(),inspect:async()=>({width:72,height:93,format:'png'})}),/dimensions/);
});
test('rejects credential URLs, duplicate IDs and unsafe origins before network access', async () => {
 for(const origin of ['http://example.com','https://user:password@example.com','https://example.com?token=secret'])
  await assert.rejects(exportSingleSourcePreviews(origin,['product'],{fetcher:()=>{throw Error('unexpected request');},inspect}),/origin/);
 await assert.rejects(exportSingleSourcePreviews('https://example.com',['product','product'],{inspect}),/unique/);
});
