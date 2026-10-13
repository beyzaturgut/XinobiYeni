const fs=require('fs'),path=require('path'),assert=require('assert'),{registry,PRODUCT,VARIANT,SHA}=require('./approved-registry.cjs');
const root=path.resolve(__dirname,'../..'),sharp=require(path.join(root,'node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp')),base=path.join(root,'services/api/App_Data/cm101-sam3-review'),pending=path.join(base,'pending/cbb1dbc9-2582-45dc-85ee-6de5fd27106c'),ref=path.join(base,'refinements/local-refinement-20261009-02');
(async()=>{const output=path.join(base,'manual-editor','TEST-ONLY-approval-'+Date.now());fs.mkdirSync(output,{recursive:true});const catalog=path.join(output,'catalog');fs.mkdirSync(path.join(catalog,'media'),{recursive:true});
fs.copyFileSync(path.join(root,'services/api/App_Data/real-catalog-qa/state.json'),path.join(catalog,'state.json'));const filename='01b20091ecaa4fbb86a9a929bf7b56ee.webp';fs.copyFileSync(path.join(pending,'source.webp'),path.join(catalog,'media',filename));
const config={output,catalogDirectory:catalog,branding:path.join(ref,'branding-protection.png')};const original=await sharp(path.join(pending,'candidate-mask.png')).ensureAlpha().raw().toBuffer(),branding=await sharp(config.branding).ensureAlpha().raw().toBuffer();
const validate=async png=>{const {data,info}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,3543);assert.equal(info.height,5315);let count=0;for(let i=3;i<data.length;i+=4){if(data[i]>original[i]||data[i]&&branding[i]||(data[i]!==0&&data[i]!==255))throw Error('Invalid mask');if(data[i])count++;}if(!count)throw Error('Empty mask');};
let r=registry({root,sharp,config,validate});assert.equal(await r.read(PRODUCT,VARIANT),null);
const png=fs.readFileSync(path.join(ref,'refined-mask.pending.png')),tuple={productId:PRODUCT,variantId:VARIANT,sha256:SHA,width:'3543',height:'5315',boundariesReviewed:'true'};
for(const k of Object.keys(tuple)){await assert.rejects(r.approve(png,{...tuple,[k]:'wrong'}));}
const record=await r.approve(png,tuple);r=registry({root,sharp,config,validate});assert.ok(await r.read(PRODUCT,VARIANT));assert.equal(await r.read(PRODUCT,'another'),null);
await assert.rejects(r.approve(Buffer.from('bad'),tuple));assert.equal((await r.read(PRODUCT,VARIANT)).record.version,record.version);
const state=fs.readFileSync(path.join(catalog,'state.json'));fs.writeFileSync(path.join(catalog,'state.json'),JSON.stringify({products:[]}));assert.equal(await r.read(PRODUCT,VARIANT),null);await assert.rejects(r.approve(png,tuple));fs.writeFileSync(path.join(catalog,'state.json'),state);
const mask=path.join(output,'approved',record.version,'mask.png');fs.writeFileSync(mask,Buffer.from('corrupt'));assert.equal(await r.read(PRODUCT,VARIANT),null);
console.log('PASS: missing approval unavailable, exact identity/review required, immutable isolated test approval, restart persistence, failed approval preserves previous, wrong variant rejected, stale catalog/corrupt mask fail closed');
console.log('TEST ONLY output: '+output);
})().catch(e=>{console.error(e);process.exitCode=1});
