import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {publishProductPreviews} from './publish-product-previews.mjs';

test('only active exact source associations publish reviewed previews; stale bundles disappear',async()=>{
 const output=await mkdtemp(path.join(tmpdir(),'xinobi-preview-publication-'));
 try{
  const state=JSON.parse(await readFile('fixtures/product-surfaces/xinobi-u-accepted/catalog-state.fragment.json','utf8'));
  const variants=await publishProductPreviews(process.cwd(),output,state);
  assert.equal(variants.length,8);
  const product=state.products.find(item=>item.variants.some(v=>v.id===variants[0]));
  const file=path.join(output,'assets/product-previews',product.id,variants[0],'inputs.json');
  const bundle=JSON.parse(await readFile(file,'utf8'));
  assert.equal(bundle.scope,'representative-preview');
  assert.equal(bundle.variantReference,variants[0]);
  // Changing the source invalidates the mask even when the SKU, product and variant identities stay the same.
  product.variants.find(v=>v.id===variants[0]).image='/assets/replacement.webp';
  const next=await publishProductPreviews(process.cwd(),output,state);
  assert.equal(next.length,7);
  assert(!next.includes(variants[0]));
  await assert.rejects(readFile(file),{code:'ENOENT'});
  product.active=false;
  const hidden=await publishProductPreviews(process.cwd(),output,state);
  assert(product.variants.every(v=>!hidden.includes(v.id)));
 }finally{await rm(output,{recursive:true,force:true});}
});
