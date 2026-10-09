'use client';
import {commerceApi} from './commerce';

export type Money={amountMinor:number;currency:string};
export type QuoteItem={productId:string;productName:string;quantity:number;unitPrice?:Money|null;lineTotal?:Money|null};
export type Quote={id:string;code:string;company:string;contactName:string;email:string;phone?:string|null;taxNumber?:string|null;items:QuoteItem[];personalization:boolean;personalizationNote?:string|null;desiredDate?:string|null;purpose?:string|null;note?:string|null;status:'received'|'reviewing'|'offered'|'accepted'|'rejected'|'closed';createdAt:string;offer?:{total:Money;validUntil:string;note?:string|null;at:string}|null;messages:{from:'customer'|'store';text:string;at:string}[];history:{status:string;at:string;actor:string;note?:string|null}[]};
export type QuoteOptions={purposes:string[];minQuantity:number;maxQuantity:number;maxItems:number};
export type CreateQuote={company:string;contactName:string;email:string;phone?:string;taxNumber?:string;items:{productId:string;quantity:number}[];personalization:boolean;personalizationNote?:string;desiredDate?:string|null;purpose?:string|null;note?:string};

const api=commerceApi?commerceApi.replace(/\/local-commerce\/?$/,''):'';

/** Quote calls send the session cookie (a signed-in sender also sees the request in the account) and the CSRF header. */
async function call<T>(path:string,init:RequestInit={}):Promise<T>{
  if(!api)throw new Error('Kurumsal teklif servisi henüz kullanıma açılmadı.');
  let response:Response;
  try{response=await fetch(api+path,{...init,credentials:'include',cache:'no-store',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json','X-Xinobi-Csrf':'1'}})}
  catch{throw new Error('Teklif servisine ulaşılamadı. Lütfen tekrar dene.')}
  const body=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(body?.title||(response.status===429?'Çok fazla deneme yaptın. Biraz sonra tekrar dene.':'İşlem tamamlanamadı.'));
  return body as T;
}

export const quoteOptions=()=>call<QuoteOptions>('/quotes/options');
export const createQuote=(request:CreateQuote)=>call<Quote>('/quotes',{method:'POST',body:JSON.stringify(request)});
export const trackQuote=(code:string,email:string)=>call<Quote>(`/quotes/${encodeURIComponent(code.trim())}?email=${encodeURIComponent(email.trim())}`);
export const sendQuoteMessage=(code:string,email:string,text:string)=>call<Quote>(`/quotes/${encodeURIComponent(code)}/messages`,{method:'POST',body:JSON.stringify({email,text})});
export const decideQuote=(code:string,email:string,decision:'accept'|'reject',note:string)=>call<Quote>(`/quotes/${encodeURIComponent(code)}/decision`,{method:'POST',body:JSON.stringify({email,decision,note:note.trim()||null})});

export const quoteStatusText:Record<Quote['status'],string>={received:'Talep alındı',reviewing:'İnceleniyor',offered:'Teklif hazır',accepted:'Kabul edildi',rejected:'Reddedildi',closed:'Kapandı'};
export const tl=(money?:Money|null)=>money?new Intl.NumberFormat('tr-TR',{style:'currency',currency:money.currency}).format(money.amountMinor/100):'—';
