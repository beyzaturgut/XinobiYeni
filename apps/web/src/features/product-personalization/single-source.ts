"use client";
import {useEffect, useState} from 'react';
import {commerceApi} from '../../lib/commerce';
import type {RenderingInputs} from './rendering/accepted-surface-api';
import type {components} from '../../../../../packages/clients/typescript/src/schema';

type Publication = components['schemas']['SingleSourcePublication'];
export type ProductSurface = RenderingInputs & {surfaceId:string;sourceRevision:number};
const origin = /^https?:\/\//.test(commerceApi) ? new URL(commerceApi).origin : '';
const sha = /^[a-f0-9]{64}$/;

export async function loadProductSurface(product:string, signal:AbortSignal):Promise<ProductSurface|null> {
 const root='/api/v1/product-surfaces/'+encodeURIComponent(product);
 const response=await fetch(origin+root+'/rendering-inputs',{signal,cache:'no-store'});
 if(response.status===404)return null;
 if(!response.ok)throw Error('Ürün yüzeyi yüklenemedi.');
 const value:Publication=await response.json(),input=value.inputs;
 if(value.schemaVersion!==1||value.scope!=='single-source-preview'||value.productReference!==product||
    !Number.isSafeInteger(value.sourceRevision)||value.sourceRevision<1||
    !new RegExp(`^source-${value.sourceRevision}-mask-[a-f0-9]{32}$`).test(value.surfaceId)||
    !input||!Number.isSafeInteger(input.width)||!Number.isSafeInteger(input.height)||!Number.isSafeInteger(input.width*input.height)||input.width<=0||input.height<=0||
    !sha.test(input.surfaceVersion)||!sha.test(input.sourceMediaVersion)||input.brandingRequired!==false||input.branding!==null)
  throw Error('Ürün yüzeyi doğrulanamadı.');
 for(const role of ['source','mask'] as const){
  const media=input[role],hash=role==='source'?input.sourceMediaVersion:input.surfaceVersion;
  if(!media||media.sha256!==hash||media.url!==`${root}/${value.surfaceId}/${role}?v=${hash}`)throw Error('Ürün yüzeyi doğrulanamadı.');
 }
 return {...input,branding:null,source:{...input.source,url:origin+input.source.url},mask:{...input.mask,url:origin+input.mask.url},
  surfaceId:value.surfaceId,sourceRevision:value.sourceRevision,surfaceTreatment:'metallic-ink'};
}

// Share only in-flight requests. Resolved versions are never cached across routes/retries.
const pending=new Map<string,Promise<ProductSurface|null>>();
export function currentProductSurface(product:string){
 const existing=pending.get(product);if(existing)return existing;
 const request=loadProductSurface(product,AbortSignal.timeout(15000)).finally(()=>{if(pending.get(product)===request)pending.delete(product)});
 pending.set(product,request);return request;
}
export function useProductSurface(product:string,retry=0){
 const key=product+':'+retry;
 const [state,setState]=useState<{key:string;status:'ready'|'error';inputs:ProductSurface|null}>();
 useEffect(()=>{
  if(!product)return;
  let active=true;
  currentProductSurface(product).then(inputs=>{if(active)setState({key,status:'ready',inputs})})
   .catch(()=>{if(active)setState({key,status:'error',inputs:null})});
  return()=>{active=false};
 },[product,key]);
 if(!product)return {status:'unavailable' as const,inputs:null};
 if(state?.key!==key)return {status:'loading' as const,inputs:null};
 return {status:state.status==='error'?'error' as const:state.inputs?'ready' as const:'unavailable' as const,inputs:state.inputs};
}
