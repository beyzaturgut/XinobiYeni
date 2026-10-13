const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),cm=require('./install-cm101-checkpoint.cjs'),{createRegistry,hash}=require('./local-mask-editor/catalog-registry.cjs');
const VERSION='fe618b58-1ced-4edd-9063-6d6c49961e65',PACKAGE=path.join(root,'fixtures/product-surfaces/ec501-metallic-silver',VERSION);
const sharp=require(path.join(root,'node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp'));
async function validate(directory=PACKAGE){
 const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'))),names=['acceptance.json','current.json','demo-state.json','source.webp','mask.png','branding.png'];
 if(manifest.schemaVersion!==1||manifest.version!==VERSION||Object.keys(manifest.files).sort().join()!==names.sort().join())throw Error('Invalid checkpoint manifest');
 const files={};for(const n of names){const b=fs.readFileSync(path.join(directory,n));if(b.length!==manifest.files[n].bytes||hash(b)!==manifest.files[n].sha256)throw Error('Checkpoint integrity failure: '+n);files[n]=b;}
 const record=JSON.parse(files['acceptance.json']),pointer=JSON.parse(files['current.json']),state=JSON.parse(files['demo-state.json']);
 if(record.version!==VERSION||pointer.version!==VERSION||record.productId!==manifest.productId||record.variantId!==manifest.variantId||record.sourceImage!==manifest.sourceImageReference||record.sourceSha256!==hash(files['source.webp'])||record.sourceVersion!==hash(Buffer.from(record.sourceImage+'\n'+record.sourceSha256))||record.maskSha256!==hash(files['mask.png'])||record.brandingSha256!==hash(files['branding.png'])||record.boundariesReviewed!==true||record.brandingReviewed!==true||record.brandingRequired!==true||!record.acceptedAt||record.provenance!=='REAL ROBOFLOW OUTPUT'||record.approvalKind!=='explicit-development-admin-review')throw Error('Invalid reviewed acceptance');
 if(!/^\/api\/v1\/local-commerce\/media\/[a-f0-9]{32}\.webp$/.test(record.sourceImage))throw Error('Invalid local media reference');
 const product=state.products?.find(p=>p.id===record.productId),variant=product?.variants.find(v=>v.id===record.variantId);
 if(state.products.length!==1||product?.variants.length!==1||!product.active||product.personalizable!==true||variant?.image!==record.sourceImage)throw Error('Invalid minimal demo catalog');
 const info=await sharp(files['source.webp'],{limitInputPixels:20000000}).metadata();if(info.width!==record.width||info.height!==record.height)throw Error('Source dimensions mismatch');
 await createRegistry({root,sharp}).validate(files['mask.png'],files['branding.png'],null,{bytes:files['source.webp'],width:record.width,height:record.height});return {manifest,record,files,state};
}
async function install(destination,packageDirectory=PACKAGE){
 destination=path.resolve(destination);if(fs.existsSync(destination))throw Error('Destination exists; refusing overwrite');if(!fs.existsSync(path.dirname(destination)))throw Error('Destination parent must exist');
 const ec=await validate(packageDirectory);await cm.validate();const staging=destination+'.install-'+crypto.randomUUID();await cm.install(staging);
 const catalog=path.join(staging,'catalog'),state=JSON.parse(fs.readFileSync(path.join(catalog,'state.json')));if(state.products.some(p=>p.id===ec.record.productId))throw Error('Duplicate product');state.products.push(...ec.state.products);fs.writeFileSync(path.join(catalog,'state.json'),JSON.stringify(state,null,2)+'\n');fs.writeFileSync(path.join(catalog,'media',path.basename(ec.record.sourceImage)),ec.files['source.webp'],{flag:'wx'});
 const registry=createRegistry({root,sharp,catalogDirectory:catalog,directory:path.join(staging,'catalog-surfaces')}),parent=path.join(registry.directory,'accepted',registry.key(ec.record.productId,ec.record.variantId)),folder=path.join(parent,VERSION);fs.mkdirSync(folder,{recursive:true});for(const n of ['mask.png','branding.png','acceptance.json'])fs.writeFileSync(path.join(folder,n),ec.files[n],{flag:'wx'});fs.writeFileSync(path.join(parent,'current.json'),ec.files['current.json'],{flag:'wx'});
 if(!(await registry.read(ec.record.productId,ec.record.variantId)))throw Error('Restored acceptance unavailable');
 const config=JSON.parse(fs.readFileSync(path.join(staging,'editor-config.json')));for(const key of ['source','original','mask','branding','catalogDirectory','output'])config[key]=path.join(destination,path.relative(staging,config[key]));config.catalogSurfaceDirectory=path.join(destination,'catalog-surfaces');fs.writeFileSync(path.join(staging,'editor-config.json'),JSON.stringify(config,null,2)+'\n');fs.renameSync(staging,destination);return destination;
}
module.exports={validate,install,PACKAGE,VERSION};
if(require.main===module)install(process.argv[2]||path.join(root,'services/api/App_Data/personalization-checkpoint-demo')).then(p=>console.log('Restored existing CM101 + EC501 approvals: '+p)).catch(e=>{console.error(e.message);process.exitCode=1});
