import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {createRequire} from 'node:module';

// Historical variant fixture publisher only. New single-source releases use export-single-source-previews.mjs
// and runtime /api/v1/product-surfaces; never infer a source from these variants.
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
   const bytes=await checked(file,hash);
   const name=role==='source'?'source.webp':role+'.png';
   if(role==='source'&&acceptance.workingCopy===true){
    // The mask was accepted on a bounded working copy of a very large photo; publish that same derivation
    // (catalog-registry.cjs: fill resize, WebP q92) so the source, mask and branding share one pixel grid.
    const sharp=await loadSharp(root),info=await sharp(bytes,{limitInputPixels:false}).metadata();
    if(info.width!==acceptance.originalWidth||info.height!==acceptance.originalHeight)throw Error('Preview source original dimensions mismatch');
    const working=await sharp(bytes,{limitInputPixels:false,sequentialRead:true}).resize(variant.width,variant.height,{fit:'fill'}).webp({quality:92,effort:4}).toBuffer();
    const workingHash=createHash('sha256').update(working).digest('hex');
    await writeFile(path.join(mediaTarget,name),working);
    media[role]={url:`${base}/${variant.version}/${name}?v=${workingHash}`,sha256:workingHash};
    continue;
   }
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

let sharpModule;
async function loadSharp(root){
 // The repository has no root sharp dependency; the web app's Next.js install provides it.
 if(!sharpModule){const web=createRequire(path.join(root,'apps/web/package.json'));sharpModule=createRequire(web.resolve('next/package.json'))('sharp');}
 return sharpModule;
}
