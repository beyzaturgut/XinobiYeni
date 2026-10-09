const fs=require('fs'),path=require('path'),crypto=require('crypto');
const PRODUCT='DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6',VARIANT='DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1',SHA='f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935',IMAGE='/api/v1/local-commerce/media/01b20091ecaa4fbb86a9a929bf7b56ee.webp';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function registry({root,sharp,config,validate}) {
 const folder=path.join(config.output,'approved'),catalog=config.catalogDirectory||path.join(root,'services/api/App_Data/real-catalog-qa');
 async function source(){
 const state=JSON.parse(fs.readFileSync(path.join(catalog,'state.json'),'utf8'));
 const products=state.products.filter(p=>p.id===PRODUCT&&p.active&&p.personalizable===true);
 const variants=products.length===1?products[0].variants.filter(v=>v.id===VARIANT&&v.image===IMAGE):[];
 if(variants.length!==1)throw Error('Catalog identity unavailable');
 const bytes=fs.readFileSync(path.join(catalog,'media',path.basename(IMAGE)));
 if(hash(bytes)!==SHA)throw Error('Catalog source checksum mismatch');
 const info=await sharp(bytes).metadata();if(info.width!==3543||info.height!==5315)throw Error('Catalog dimensions mismatch');return bytes;
 }
 async function read(product,variant){
 if(product!==PRODUCT||variant!==VARIANT)return null;
 try{const sourceBytes=await source(),pointer=JSON.parse(fs.readFileSync(path.join(folder,'current.json'),'utf8'));
 if(!/^[a-f0-9-]{36}$/.test(pointer.version))return null;
 const dir=path.join(folder,pointer.version),record=JSON.parse(fs.readFileSync(path.join(dir,'acceptance.json'),'utf8'));
 if(record.version!==pointer.version||record.productId!==PRODUCT||record.variantId!==VARIANT||record.sourceSha256!==SHA||record.width!==3543||record.height!==5315||record.boundariesReviewed!==true)return null;
 const mask=fs.readFileSync(path.join(dir,'mask.png')),branding=fs.readFileSync(path.join(dir,'branding.png'));
 if(hash(mask)!==record.maskSha256||hash(branding)!==record.brandingSha256||hash(branding)!==hash(fs.readFileSync(config.branding)))return null;
 await validate(mask);
 return {record,source:sourceBytes,mask,branding};
 }catch{return null;}
 }
 async function approve(png,tuple){
 const expected={productId:PRODUCT,variantId:VARIANT,sha256:SHA,width:'3543',height:'5315',boundariesReviewed:'true'};
 for(const[k,v]of Object.entries(expected))if(tuple[k]!==v)throw Error('Approval identity / explicit review mismatch');
 await source();await validate(png);const branding=fs.readFileSync(config.branding);
 const version=crypto.randomUUID(),dir=path.join(folder,version);fs.mkdirSync(dir,{recursive:true});
 const record={version,productId:PRODUCT,variantId:VARIANT,sourceSha256:SHA,width:3543,height:5315,maskSha256:hash(png),brandingSha256:hash(branding),boundariesReviewed:true,acceptedAt:new Date().toISOString(),provenance:'explicit-local-admin-review'};
 fs.writeFileSync(path.join(dir,'mask.png'),png,{flag:'wx'});fs.writeFileSync(path.join(dir,'branding.png'),branding,{flag:'wx'});fs.writeFileSync(path.join(dir,'acceptance.json'),JSON.stringify(record,null,2),{flag:'wx'});
 await source();const tmp=path.join(folder,'current-'+version+'.tmp');fs.writeFileSync(tmp,JSON.stringify({version}),{flag:'wx'});fs.renameSync(tmp,path.join(folder,'current.json'));return record;
 }
 return {read,approve};
}
module.exports={registry,PRODUCT,VARIANT,SHA};
