const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'),VERSION='811f44ed-2d47-49b6-ada2-2824b54d72ef';
const PACKAGE=path.join(ROOT,'fixtures/product-surfaces/cm101-metallic-navy',VERSION);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function validate(directory=PACKAGE){
 const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
 const allowed=['mask.png','branding.png','source.webp','acceptance.json','current.json','demo-state.json'];
 if(manifest.schemaVersion!==1||manifest.version!==VERSION||Object.keys(manifest.files).sort().join()!==allowed.sort().join())throw Error('Invalid package manifest');
 const files={};for(const name of allowed){const b=fs.readFileSync(path.join(directory,name)),entry=manifest.files[name];if(b.length!==entry.bytes||hash(b)!==entry.sha256)throw Error('Package integrity failure: '+name);files[name]=b;}
 const r=JSON.parse(files['acceptance.json']),pointer=JSON.parse(files['current.json']);
 const {PRODUCT,VARIANT,SHA}=require('./local-mask-editor/approved-registry.cjs');
 if(r.version!==VERSION||pointer.version!==VERSION||r.productId!==PRODUCT||r.variantId!==VARIANT||r.sourceSha256!==SHA||r.width!==3543||r.height!==5315||r.boundariesReviewed!==true||r.provenance!=='explicit-local-admin-review'||r.maskSha256!==hash(files['mask.png'])||r.brandingSha256!==hash(files['branding.png'])||SHA!==hash(files['source.webp']))throw Error('Accepted identity mismatch');
 const sharp=require(path.join(ROOT,'node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp'));
 for(const name of ['source.webp','mask.png','branding.png']){const info=await sharp(files[name]).metadata();if(info.width!==3543||info.height!==5315)throw Error('Image registration mismatch');}
 const mask=await sharp(files['mask.png']).ensureAlpha().raw().toBuffer(),branding=await sharp(files['branding.png']).ensureAlpha().raw().toBuffer();let designable=0;
 for(let i=3;i<mask.length;i+=4){if(mask[i]!==0&&mask[i]!==255)throw Error('Nonbinary mask');if(mask[i]&&branding[i])throw Error('Branding overlap');if(mask[i])designable++;}if(!designable)throw Error('Empty mask');
 const state=JSON.parse(files['demo-state.json']),product=state.products.find(p=>p.id===PRODUCT),variant=product?.variants.find(v=>v.id===VARIANT);
 if(!product?.active||product.personalizable!==true||variant?.image!==manifest.sourceImageReference||manifest.sourceImageReference!=='/api/v1/local-commerce/media/01b20091ecaa4fbb86a9a929bf7b56ee.webp')throw Error('Demo catalog mismatch');
 return {manifest,files,designable};
}
async function install(destination,packageDirectory=PACKAGE){
 destination=path.resolve(destination);if(fs.existsSync(destination))throw Error('Destination exists; no overwrite or update is allowed');
 const {manifest,files}=await validate(packageDirectory);const staging=destination+'.install-'+crypto.randomUUID();if(!fs.existsSync(path.dirname(destination)))throw Error('Destination parent must exist');
 fs.mkdirSync(staging);const media=path.join(staging,'catalog/media'),output=path.join(staging,'editor'),accepted=path.join(output,'approved',VERSION);fs.mkdirSync(media,{recursive:true});fs.mkdirSync(accepted,{recursive:true});
 fs.writeFileSync(path.join(staging,'catalog/state.json'),files['demo-state.json'],{flag:'wx'});
 fs.writeFileSync(path.join(media,'01b20091ecaa4fbb86a9a929bf7b56ee.webp'),files['source.webp'],{flag:'wx'});
 for(const name of ['mask.png','branding.png','acceptance.json'])fs.writeFileSync(path.join(accepted,name),files[name],{flag:'wx'});
 // Preserve reviewed pointer bytes; this imports an existing approval, it does not approve a draft.
 fs.writeFileSync(path.join(output,'approved/current.json'),files['current.json'],{flag:'wx'});
 const finalAccepted=path.join(destination,'editor/approved',VERSION);
 fs.writeFileSync(path.join(staging,'editor-config.json'),JSON.stringify({source:path.join(destination,'catalog/media/01b20091ecaa4fbb86a9a929bf7b56ee.webp'),original:path.join(finalAccepted,'mask.png'),mask:path.join(finalAccepted,'mask.png'),branding:path.join(finalAccepted,'branding.png'),sourceSha256:manifest.files['source.webp'].sha256,productId:manifest.productId,variantId:manifest.variantId,catalogDirectory:path.join(destination,'catalog'),output:path.join(destination,'editor'),regions:[]},null,2)+'\n',{flag:'wx'});
 fs.renameSync(staging,destination);return destination;
}
module.exports={validate,install,PACKAGE,VERSION};
if(require.main===module){const args=process.argv.slice(2);if(args.length>1)throw Error('Usage: node tools/install-cm101-checkpoint.cjs [new-empty-destination]');install(args[0]||path.join(ROOT,'services/api/App_Data/cm101-checkpoint-demo')).then(p=>console.log('Installed existing approved CM101 checkpoint: '+p)).catch(e=>{console.error(e.message);process.exitCode=1;});}
