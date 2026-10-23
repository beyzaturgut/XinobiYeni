'use client';
// The native app executes authenticated requests. Tokens never enter the WebView,
// its URLs or browser storage; only the app-owned channel can answer a request.
declare global {interface Window {XinobiCommerce?:{postMessage:(message:string)=>void}}}
type Reply={id:string;status?:number;body?:unknown;base64?:string;contentType?:string;error?:string};
const pending=new Map<string,{resolve:(value:Reply)=>void;reject:(error:Error)=>void}>();
let listening=false,nextRequest=0;
export const isNativeCommerce=()=>typeof window!=='undefined'&&Boolean(window.XinobiCommerce);
if(isNativeCommerce())document.documentElement.dataset.embedded='app';
export function nativeCommerce(action:string,payload:unknown={}):Promise<Reply>{
 if(!isNativeCommerce())return Promise.reject(new Error('Uygulama bağlantısı hazır değil.'));
 if(!listening){window.addEventListener('xinobi-commerce-response',event=>{
  const reply=(event as CustomEvent<Reply>).detail,request=pending.get(reply?.id);if(!request)return;
  pending.delete(reply.id);if(reply.error)request.reject(new Error(reply.error));else request.resolve(reply);
 });listening=true}
 return new Promise((resolve,reject)=>{
  const id=Date.now().toString(36)+':'+(++nextRequest),timer=setTimeout(()=>{pending.delete(id);reject(new Error('Uygulama yanıt vermedi. Yeniden deneyin.'))},action==='login'?600000:45000);
  pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value)},reject:error=>{clearTimeout(timer);reject(error)}});
  window.XinobiCommerce!.postMessage(JSON.stringify({id,action,payload}));
 });
}
export async function nativeAccountResponse(path:string,init:RequestInit={},binary=false):Promise<Response>{
 let body:unknown=init.body;
 if(body instanceof FormData){const fields:Record<string,unknown>={};for(const [key,value] of body.entries()){
  if(typeof value==='string')fields[key]=value;
  else {const bytes=new Uint8Array(await value.arrayBuffer());let encoded='';for(let i=0;i<bytes.length;i+=16384)encoded+=String.fromCharCode(...bytes.subarray(i,i+16384));fields[key]={base64:btoa(encoded),name:value.name,type:value.type}}
 }body={form:fields}}
 const reply=await nativeCommerce('account',{path,method:init.method??'GET',body,binary});
 const bytes=reply.base64?Uint8Array.from(atob(reply.base64),c=>c.charCodeAt(0)):null;
 return new Response(reply.status===204?null:bytes??JSON.stringify(reply.body??null),{status:reply.status??500,headers:{'Content-Type':reply.contentType??'application/json'}});
}
