import type {Page} from '@playwright/test';

/** Browser-only accepted-input contract: no provider, approval or real mask is created. */
export async function mockAcceptedSurfaces(page:Page,ready=true){
 const hash='a'.repeat(64);
 await page.route('**/api/v1/dev/**',route=>{
  const path=new URL(route.request().url()).pathname,parts=path.split('/'),variant=parts.at(-2),product=parts.at(-3);
  if(path.includes('/commerce-mask/')&&variant==='DEMO-V101-B'&&ready)return route.fulfill({json:{scope:'development-preview',productReference:product,variantReference:variant,previewAvailable:true,inputs:{width:800,height:800,sourceMediaVersion:hash,surfaceVersion:hash,brandingRequired:false,branding:null,source:{url:'/assets/test.webp?v='+hash,sha256:hash},mask:{url:'/api/v1/local-commerce/media/'+'b'.repeat(32)+'.png?v='+hash,sha256:hash}}}});
  return route.fulfill({status:404});
 });
 await page.route('**/assets/product-previews/**/inputs.json',route=>route.fulfill({status:404}));
}
