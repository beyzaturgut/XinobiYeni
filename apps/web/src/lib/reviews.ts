'use client';
import {useEffect,useState} from 'react';
import {commerceApi} from './commerce';

export type ReviewSummary={productId:string;average:number;count:number;distribution:number[]};
export type PublicReview={id:string;authorName:string;rating:number;title?:string|null;body:string;color?:string|null;createdAt:string;storeReply?:string|null};
export type ReviewPage={summary:ReviewSummary;items:PublicReview[];page:number;pageSize:number};

const api=commerceApi?commerceApi.replace(/\/local-commerce\/?$/,''):'';

async function get<T>(path:string):Promise<T>{
  if(!api)throw new Error('Değerlendirmeler henüz kullanıma açılmadı.');
  const response=await fetch(api+path,{cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('Değerlendirmeler yüklenemedi.');
  return response.json();
}

export const fetchReviews=(productId:string,page=1)=>get<ReviewPage>(`/catalog/products/${encodeURIComponent(productId)}/reviews?page=${page}`);

/** Rating summaries for [ids]; an empty map where reviews are not available (e.g. the static preview). */
export function useReviewSummaries(ids:string[]){
  const key=[...new Set(ids)].sort().join(',');
  const [summaries,setSummaries]=useState<Record<string,ReviewSummary>>({});
  useEffect(()=>{
    if(!key||!api)return;
    let active=true;
    get<{items:ReviewSummary[]}>(`/catalog/review-summaries?ids=${encodeURIComponent(key)}`)
      .then(value=>{if(active)setSummaries(Object.fromEntries(value.items.map(item=>[item.productId,item])))}).catch(()=>{});
    return()=>{active=false};
  },[key]);
  return summaries;
}

export const stars=(rating:number)=>'★★★★★'.slice(0,Math.round(rating))+'☆☆☆☆☆'.slice(0,5-Math.round(rating));
