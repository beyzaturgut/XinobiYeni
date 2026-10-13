'use client';
import {commerceApi} from './commerce';

export type Money={amountMinor:number;currency:string};
export type AssistantProduct={id:string;name:string;category:string;imageUrl?:string|null;priceFrom?:Money|null;inStock:boolean;personalizable:boolean};
export type AssistantAction={kind:'compare'|'quote'|'xinobi_u'|'handoff'|'lead'|'orders'|'link';label:string;productIds?:string[]|null;url?:string|null};
export type AssistantMessage={id:string;role:'user'|'assistant';text:string;products:AssistantProduct[];actions:AssistantAction[];at:string;source?:string|null};
export type AssistantConfig={enabled:boolean;aiAnswers:boolean;greeting:string;quickReplies:string[];whatsAppAvailable:boolean;disclaimer:string};

const api=commerceApi?commerceApi.replace(/\/local-commerce\/?$/,''):'/api/v1';
const clientKey='xinobi-nobi-client',conversationKey='xinobi-nobi-conversation';

/** A random id this browser keeps; anonymous conversations belong to it. */
export function clientId(){
  try{let id=localStorage.getItem(clientKey);if(!id){id=crypto.randomUUID();localStorage.setItem(clientKey,id)}return id}
  catch{return crypto.randomUUID()}
}
export const storedConversation=()=>{try{return localStorage.getItem(conversationKey)}catch{return null}};
export const rememberConversation=(id:string|null)=>{try{if(id)localStorage.setItem(conversationKey,id);else localStorage.removeItem(conversationKey)}catch{}};

async function call<T>(path:string,init:RequestInit={}):Promise<T>{
  if(!api)throw new Error('Nobi şu anda kullanılamıyor.');
  let response:Response;
  try{response=await fetch(api+path,{...init,credentials:'include',cache:'no-store',signal:AbortSignal.timeout(40000),headers:{'Content-Type':'application/json','X-Xinobi-Csrf':'1'}})}
  catch{throw new Error('Nobi\'ye ulaşılamadı. Bağlantını kontrol edip tekrar dene.')}
  const body=await response.json().catch(()=>null);
  if(!response.ok)throw Object.assign(new Error(body?.title||'Nobi şu anda yanıt veremiyor.'),{code:body?.code});
  return body as T;
}

export const assistantConfig=()=>call<AssistantConfig>('/assistant/config');
export const sendMessage=(message:string,conversationId:string|null)=>call<{conversationId:string;reply:AssistantMessage;remaining:number}>('/assistant/messages',{method:'POST',body:JSON.stringify({conversationId,clientId:clientId(),message,channel:'web'})});
export const conversation=(id:string)=>call<{id:string;messages:AssistantMessage[];leadSent:boolean;handedOff:boolean}>(`/assistant/conversations/${encodeURIComponent(id)}?clientId=${clientId()}`);
export const sendLead=(id:string,lead:{name:string;email:string;phone?:string;topic:string;consent:boolean})=>call(`/assistant/conversations/${encodeURIComponent(id)}/lead`,{method:'POST',body:JSON.stringify({...lead,clientId:clientId()})});
export const handoff=(id:string)=>call<{channel:string;url?:string|null;message:string}>(`/assistant/conversations/${encodeURIComponent(id)}/handoff`,{method:'POST',body:JSON.stringify({clientId:clientId()})});
