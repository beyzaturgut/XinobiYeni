import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Publish only the existing reviewed visual prototypes; this does not approve physical printing or edit SQL.
export async function publishProductPreviews(root,publicDir,state){
 const fixture=path.join(root,'fixtures/product-surfaces/xinobi-u-accepted');
 const manifest=JSON.parse(await readFile(path.join(fixture,'manifest.json'),'utf8'));
 const output=path.join(publicDir,'assets/product-previews');
 await rm(output,{recursive:true,force:true});
 const published=[];
 const checked=async(file,expected)=>{const bytes=await readFile(file);if(createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Preview asset checksum mismatch');return bytes;};
 for(const variant of manifest.variants){
  for(const id of [variant.productId,variant.variantId,variant.slug,variant.version])if(!/^[a-zA-Z0-9-]+$/.test(id))throw Error('Invalid preview identity');
  const product=state.products.find(item=>item.active&&item.id===variant.productId);
  const selected=product?.variants.find(item=>item.id===variant.variantId);
  if(!selected||selected.image!==variant.source.sourceImage)continue;
  const versionDir=path.join(fixture,'variants',variant.slug,variant.version);
  const acceptance=JSON.parse(await checked(path.join(versionDir,'acceptance.json'),variant.files['acceptance.json'].sha256));
  if(acceptance.productId!==variant.productId||acceptance.variantId!==variant.variantId||acceptance.version!==variant.version
    ||acceptance.sourceSha256!==variant.source.sha256||acceptance.maskSha256!==variant.files['mask.png'].sha256
    ||acceptance.brandingSha256!==variant.files['branding.png'].sha256||acceptance.sourceImage!==variant.source.sourceImage
    ||acceptance.width!==variant.width||acceptance.height!==variant.height||acceptance.brandingRequired!==variant.brandingRequired||!acceptance.acceptedAt
    ||acceptance.boundariesReviewed!==true||acceptance.brandingReviewed!==true)throw Error('Preview acceptance identity mismatch');
  if(!/^media\/[a-f0-9]{32}\.webp$/.test(variant.source.path))throw Error('Invalid preview source path');
  const base=`/assets/product-previews/${variant.productId}/${variant.variantId}`;
  const target=path.join(output,variant.productId,variant.variantId);
  const mediaTarget=path.join(target,variant.version);
  await mkdir(mediaTarget,{recursive:true});
  const media={};
  for(const [role,file,hash] of [
   ['source',path.join(fixture,variant.source.path),variant.source.sha256],
   ['mask',path.join(versionDir,'mask.png'),variant.files['mask.png'].sha256],
   ['branding',path.join(versionDir,'branding.png'),variant.files['branding.png'].sha256]
  ]){
   await checked(file,hash);
   const name=role==='source'?'source.webp':role+'.png';
   await copyFile(file,path.join(mediaTarget,name));
   media[role]={url:`${base}/${variant.version}/${name}?v=${hash}`,sha256:hash};
  }
  await writeFile(path.join(target,'inputs.json'),JSON.stringify({scope:'representative-preview',productReference:variant.productId,
   variantReference:variant.variantId,sourceImage:variant.source.sourceImage,inputs:{width:variant.width,height:variant.height,
    surfaceVersion:media.mask.sha256,sourceMediaVersion:acceptance.sourceVersion,brandingRequired:variant.brandingRequired,
    displayName:`${variant.productName} · ${variant.color}`,...media}}));
  published.push(variant.variantId);
 }
 return published;
}
