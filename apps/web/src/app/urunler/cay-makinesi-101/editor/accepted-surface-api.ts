// Temporary provider-unaware development rendering seam.
export type RenderingMedia={url:string;sha256:string;originalSha256?:string};
export type RenderingInputs={surfaceVersion:string;sourceMediaVersion:string;width:number;height:number;assetWidth?:number;assetHeight?:number;source:RenderingMedia;mask:RenderingMedia;brandingRequired:boolean;branding:RenderingMedia|null;displayName?:string;surfaceTreatment?:"metallic-ink";surfaceInkExposureStops?:number};
export const MAX_CATALOG_PREVIEW_PIXELS=20_000_000;
const LARGE_CATALOG_PREVIEW_TARGET_PIXELS=16_000_000;
const MAX_CATALOG_SOURCE_DIMENSION=7_000,MAX_CATALOG_SOURCE_PIXELS=30_000_000;
export function catalogPreviewDimensions(width:number,height:number){
 const pixels=width*height,scale=pixels>MAX_CATALOG_PREVIEW_PIXELS?Math.sqrt(LARGE_CATALOG_PREVIEW_TARGET_PIXELS/pixels):1;
 return{width:Math.max(1,Math.floor(width*scale)),height:Math.max(1,Math.floor(height*scale))};
}
export const surfaceRoot="/api/v1/dev/product-surfaces/cay-makinesi-101";
function catalogMedia(value:unknown):value is RenderingMedia { if(!value||typeof value!=="object")return false;const item=value as RenderingMedia;return typeof item.sha256==="string"&&/^[a-f0-9]{64}$/.test(item.sha256)&&typeof item.url==="string"&&/^\/api\/v1\/dev\/cm101-approved\/media\/[a-f0-9-]{36}\/(source|mask|branding)\?v=[a-f0-9]{64}$/.test(item.url)&&item.url.endsWith("?v="+item.sha256); }
const checksum=/^[a-f0-9]{64}$/;
function media(value:unknown):value is RenderingMedia{
 if(!value||typeof value!=="object")return false;
 const item=value as RenderingMedia;
 return typeof item.url==="string"&&/^\/assets\/[a-zA-Z0-9/_-]+\.(png|webp)\?v=[a-f0-9]{64}$/.test(item.url)&&typeof item.sha256==="string"&&checksum.test(item.sha256)&&item.url.endsWith("?v="+item.sha256);
}
const CM_PRODUCT="DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6", CM_VARIANT="DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1";
const CM121_PRODUCT="DEMO-499cf715-33cd-4144-8c40-2245181e8625", CM121_VARIANT="DEMO-V-5a46bb98-c95c-42b9-9f12-e4286f628cca";

async function loadCatalogSurface(product:string,variant:string,signal:AbortSignal):Promise<RenderingInputs|null>{
 const base='/api/v1/dev/catalog-surfaces/'+encodeURIComponent(product)+'/'+encodeURIComponent(variant);
 const r=await fetch(base+'/rendering-inputs',{signal,cache:'no-store'});if(r.status===404)return null;if(!r.ok)throw Error('Preview unavailable');const value=await r.json();
 if(value.scope!=='development-preview'||value.productReference!==product||value.variantReference!==variant)throw Error('Invalid exact identity');
 if(value.previewAvailable===false&&value.inputs===null)return null;const input=value.inputs as RenderingInputs;
 if(value.previewAvailable!==true||!input||!Number.isInteger(input.width)||!Number.isInteger(input.height)||input.width<=0||input.height<=0||input.width>MAX_CATALOG_SOURCE_DIMENSION||input.height>MAX_CATALOG_SOURCE_DIMENSION||input.width*input.height>MAX_CATALOG_SOURCE_PIXELS||!checksum.test(input.surfaceVersion)||!checksum.test(input.sourceMediaVersion)||typeof input.brandingRequired!=='boolean'||input.brandingRequired&&!input.branding)throw Error('Invalid accepted catalog bundle');
 let version:string|undefined;for(const [role,item] of [['source',input.source],['mask',input.mask],['branding',input.branding]] as const){if(role==='branding'&&item===null)continue;if(!item||!checksum.test(item.sha256))throw Error('Invalid media checksum');
 const prefix='/api/v1/dev/catalog-surfaces/media/'+encodeURIComponent(product)+'/'+encodeURIComponent(variant)+'/';if(!item.url.startsWith(prefix)||!item.url.endsWith('/'+role+'?v='+item.sha256))throw Error('Mixed source identity');const current=item.url.slice(prefix.length).split('/')[0];if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(current)||version&&version!==current)throw Error('Mixed accepted versions');version=current;
 }if(input.mask.sha256!==input.surfaceVersion)throw Error('Invalid mask version');const preview=catalogPreviewDimensions(input.width,input.height);return {...input,assetWidth:input.width,assetHeight:input.height,...preview,surfaceTreatment:'metallic-ink',...(product===CM121_PRODUCT&&variant===CM121_VARIANT?{surfaceInkExposureStops:0.55}:{})};
}

export async function loadAcceptedSurface(variantReference:string,signal:AbortSignal,commerceProduct?:string):Promise<RenderingInputs|null>{
 if(commerceProduct&&commerceProduct!=='DEMO-P101'){const generic=await loadCatalogSurface(commerceProduct,variantReference,signal);if(generic)return generic;}
 const productReference=commerceProduct??"cay-makinesi-101";
 const cm=commerceProduct===CM_PRODUCT&&variantReference===CM_VARIANT;
 const route=cm?"/api/v1/dev/cm101-approved/"+CM_PRODUCT+"/"+CM_VARIANT+"/rendering-inputs":commerceProduct?"/api/v1/dev/product-surfaces/commerce/"+encodeURIComponent(commerceProduct)+"/"+encodeURIComponent(variantReference)+"/rendering-inputs":surfaceRoot+"/"+encodeURIComponent(variantReference)+"/rendering-inputs";
 const response=await fetch(route,{signal,cache:"no-store"});
 if(response.status===404)return null;
 if(!response.ok)throw new Error("Preview unavailable");
 const value=await response.json();
 if(value.scope!=="development-preview"||value.productReference!==productReference||value.variantReference!==variantReference)throw new Error("Invalid preview bundle");
 if(value.previewAvailable===false&&value.inputs===null)return null;
 const input=value.inputs as RenderingInputs|undefined;
 const supported=cm|| (commerceProduct?commerceProduct==="DEMO-P101"&&variantReference==="DEMO-V101-B":variantReference==="blue");
 if(value.previewAvailable!==true||!supported||!input||input.width!==(cm?3543:1066)||input.height!==(cm?5315:1600)||!checksum.test(input.surfaceVersion)||typeof input.sourceMediaVersion!=="string"||!input.sourceMediaVersion||!(cm?catalogMedia(input.source):media(input.source))||!(cm?catalogMedia(input.mask):media(input.mask))||typeof input.brandingRequired!=="boolean"||(input.branding!==null&&!(cm?catalogMedia(input.branding):media(input.branding)))||(input.brandingRequired&&!input.branding))throw new Error("Invalid preview inputs");
 if(cm) {
 const paths=[input.source,input.mask,input.branding!].map(item=>new URL(item.url,"http://localhost").pathname.split("/"));
 if(paths[0].at(-1)!=="source"||paths[1].at(-1)!=="mask"||paths[2].at(-1)!=="branding"||paths[0].at(-2)!==paths[1].at(-2)||paths[1].at(-2)!==paths[2].at(-2))throw new Error("Mixed accepted versions");
 }
 if(cm && (input.source.sha256!=="f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935" || !input.brandingRequired))throw new Error("Invalid CM101 source");
 return input;
}
