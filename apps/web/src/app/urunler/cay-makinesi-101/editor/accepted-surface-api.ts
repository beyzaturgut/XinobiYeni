// Rendering inputs for the product preview: a colour's admin-approved surface mask from the catalogue first,
// then the original development Tea Maker bridge.
import {commerceApi,mediaUrl} from "../../../../lib/commerce";
export type RenderingMedia={url:string;sha256:string};
export type RenderingInputs={surfaceVersion:string;sourceMediaVersion:string;width:number;height:number;source:RenderingMedia;mask:RenderingMedia;brandingRequired:boolean;branding:RenderingMedia|null;label?:string};
export const surfaceRoot="/api/v1/dev/product-surfaces/cay-makinesi-101";
const checksum=/^[a-f0-9]{64}$/;
function media(value:unknown):value is RenderingMedia{
 if(!value||typeof value!=="object")return false;
 const item=value as RenderingMedia;
 return typeof item.url==="string"&&/^\/assets\/[a-zA-Z0-9/_-]+\.(png|webp)\?v=[a-f0-9]{64}$/.test(item.url)&&typeof item.sha256==="string"&&checksum.test(item.sha256)&&item.url.endsWith("?v="+item.sha256);
}
const snapshotUrl=process.env.NEXT_PUBLIC_COMMERCE_SNAPSHOT_URL||"";
type SurfaceVariant={id:string;color:string;image:string;surfaceMask?:string|null;surfaceImage?:string|null};
type SurfaceProduct={id:string;name:string;active:boolean;variants:SurfaceVariant[]};

/** The approved mask the admin recorded on this colour (catalogue state or the deployed snapshot); undefined when there is none. */
export async function loadApprovedSurface(productId:string,variantId:string,signal:AbortSignal):Promise<RenderingInputs|undefined>{
 if(!commerceApi&&!snapshotUrl)return undefined;
 const response=await fetch(commerceApi?commerceApi+"/state":snapshotUrl,{signal,cache:"no-store"});
 if(!response.ok)return undefined;
 const state=await response.json() as {products?:SurfaceProduct[]};
 const product=state.products?.find(item=>item.id===productId&&item.active);
 const variant=product?.variants.find(item=>item.id===variantId);
 // A mask only applies to the exact photo it was approved for.
 if(!product||!variant?.image||!variant.surfaceMask||variant.surfaceImage!==variant.image)return undefined;
 const source=mediaUrl(variant.image,commerceApi),mask=mediaUrl(variant.surfaceMask,commerceApi);
 const photo=new Image();photo.crossOrigin="anonymous";photo.src=source;await photo.decode();
 if(signal.aborted)throw new DOMException("Aborted","AbortError");
 return {surfaceVersion:variant.surfaceMask,sourceMediaVersion:variant.image,width:photo.naturalWidth,height:photo.naturalHeight,
  source:{url:source,sha256:""},mask:{url:mask,sha256:""},brandingRequired:false,branding:null,label:`${product.name} · ${variant.color}`};
}

export async function loadAcceptedSurface(variantReference:string,signal:AbortSignal,commerceProduct?:string):Promise<RenderingInputs|null>{
 if(commerceProduct){
  const approved=await loadApprovedSurface(commerceProduct,variantReference,signal).catch(error=>{if(signal.aborted)throw error;return undefined});
  if(approved)return approved;
 }
 const productReference=commerceProduct??"cay-makinesi-101";
 const route=commerceProduct?"/api/v1/dev/product-surfaces/commerce/"+encodeURIComponent(commerceProduct)+"/"+encodeURIComponent(variantReference)+"/rendering-inputs":surfaceRoot+"/"+encodeURIComponent(variantReference)+"/rendering-inputs";
 const response=await fetch(route,{signal,cache:"no-store"});
 if(response.status===404)return null;
 if(!response.ok)throw new Error("Preview unavailable");
 const value=await response.json();
 if(value.scope!=="development-preview"||value.productReference!==productReference||value.variantReference!==variantReference)throw new Error("Invalid preview bundle");
 if(value.previewAvailable===false&&value.inputs===null)return null;
 const input=value.inputs as RenderingInputs|undefined;
 const supported=commerceProduct?commerceProduct==="DEMO-P101"&&variantReference==="DEMO-V101-B":variantReference==="blue";
 if(value.previewAvailable!==true||!supported||!input||input.width!==1066||input.height!==1600||!checksum.test(input.surfaceVersion)||typeof input.sourceMediaVersion!=="string"||!input.sourceMediaVersion||!media(input.source)||!media(input.mask)||typeof input.brandingRequired!=="boolean"||(input.branding!==null&&!media(input.branding))||(input.brandingRequired&&!input.branding))throw new Error("Invalid preview inputs");
 return input;
}
