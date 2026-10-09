'use client';
import {useSyncExternalStore} from 'react';
import {commerceApi} from './commerce';

// Accounts are real: the shared /api/v1/auth and /api/v1/me contract (web: HttpOnly session cookies + CSRF header, ADR-004).
// Addresses and orders live on the server too, so the web and the mobile app see the same data. Orders are demo orders:
// the server prices them from the catalogue; no payment is taken and stock is not reserved (D03/D05 pending).
export type DemoUser={id:string;name:string;email:string;createdAt?:string;phone?:string|null};
export type Money={amountMinor:number;currency:string};
export type CustomerAddress={id:string;title:string;fullName:string;phone:string;city:string;district:string;line:string;postalCode?:string|null;isDefault:boolean};
export type AddressInput=Omit<CustomerAddress,'id'>;
export type OrderLine={productId:string;variantId:string;name:string;color:string;imageUrl?:string|null;unitPrice:Money;quantity:number;lineTotal:Money};
export type OrderShipment={carrier:string;trackingNumber:string;trackingUrl?:string|null;shippedAt:string;deliveredAt?:string|null};
export type OrderEvent={status:string;at:string;actor:string;note?:string|null};
export type OrderRequestLine={variantId:string;quantity:number};
export type OrderRequest={id:string;type:'cancel'|'return';status:'requested'|'approved'|'rejected'|'completed';reason:string;description?:string|null;lines:OrderRequestLine[];createdAt:string;decidedAt?:string|null;resolution?:string|null};
export type CustomerOrder={id:string;number:string;createdAt:string;status:string;address:CustomerAddress;lines:OrderLine[];total:Money;shipment?:OrderShipment|null;history?:OrderEvent[]|null;requests?:OrderRequest[]|null};
export type OrderOptions={cancelReasons:string[];returnReasons:string[];carriers:string[];returnWindowDays:number};
export type InboxItem={id:string;kind:string;title:string;body:string;link?:string|null;createdAt:string;read:boolean};
export type EmailChallenge={verificationId:string;email:string;expiresAt:string;previewCode?:string|null};

const api=commerceApi?commerceApi.replace(/\/local-commerce\/?$/,''):'';
type Snapshot={user?:DemoUser;ready:boolean;addresses:CustomerAddress[];orders:CustomerOrder[];inbox:InboxItem[];unread:number};
const empty:Snapshot={ready:false,addresses:[],orders:[],inbox:[],unread:0};
let session:Snapshot=empty;
let loading:Promise<void>|null=null;
const listeners=new Set<()=>void>();
function publish(next:Partial<Snapshot>){session={...session,...next};listeners.forEach(listener=>listener())}
function signedOut(){publish({user:undefined,ready:true,addresses:[],orders:[],inbox:[],unread:0})}

async function call<T>(path:string,init:RequestInit={}):Promise<T|null>{
  if(!api)throw new Error('Hesap servisi henüz kullanıma açılmadı.');
  let response:Response;
  try{response=await fetch(api+path,{...init,credentials:'include',cache:'no-store',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json','X-Xinobi-Csrf':'1',...init.headers}})}
  catch{throw new Error('Hesap servisine ulaşılamadı. Lütfen tekrar dene.')}
  if(response.status===204)return null;
  const body=await response.json().catch(()=>null);
  if(!response.ok)throw Object.assign(new Error(body?.title||(response.status===429?'Çok fazla deneme yaptın. Biraz sonra tekrar dene.':'İşlem tamamlanamadı. Lütfen tekrar dene.')),{status:response.status,code:body?.code});
  return body as T;
}

/** Runs a signed-in request; an expired access cookie is refreshed once and the request retried. */
async function signedIn<T>(path:string,init:RequestInit={}):Promise<T|null>{
  try{return await call<T>(path,init)}
  catch(error){
    if((error as {status?:number}).status!==401)throw error;
    try{publish({user:(await call<DemoUser>('/auth/web/refresh',{method:'POST'}))??undefined})}
    catch{signedOut();throw new Error('Oturumun sona erdi. Tekrar giriş yap.')}
    return call<T>(path,init);
  }
}

async function loadAccountData(){
  const [addresses,orders]=await Promise.all([signedIn<CustomerAddress[]>('/me/addresses'),signedIn<CustomerOrder[]>('/me/orders')]);
  publish({addresses:addresses??[],orders:orders??[]});
  await refreshInbox().catch(()=>{});
}

/** Reloads orders, e.g. after the panel changed a status. */
export async function refreshOrders(){publish({orders:(await signedIn<CustomerOrder[]>('/me/orders'))??[]})}

export async function refreshInbox(){
  const inbox=await signedIn<{items:InboxItem[];unread:number}>('/me/notifications');
  publish({inbox:inbox?.items??[],unread:inbox?.unread??0});
}

/** Marks the given notifications read, or all of them. */
export async function markInboxRead(ids?:string[]){
  await signedIn('/me/notifications/read',{method:'POST',body:JSON.stringify({ids:ids??null})});
  await refreshInbox();
}

export async function orderOptions(){return (await signedIn<OrderOptions>('/me/order-options'))!}

function replaceOrder(order:CustomerOrder){publish({orders:session.orders.map(existing=>existing.id===order.id?order:existing)});void refreshInbox().catch(()=>{});return order}

/** A received order is cancelled at once; one being prepared opens a request the store decides. */
export async function cancelOrder(id:string,reason:string,description:string){
  return replaceOrder((await signedIn<CustomerOrder>(`/me/orders/${encodeURIComponent(id)}/cancellation`,{method:'POST',body:JSON.stringify({reason,description:description.trim()||null})}))!);
}

export async function requestReturn(id:string,reason:string,description:string,lines:OrderRequestLine[]){
  return replaceOrder((await signedIn<CustomerOrder>(`/me/orders/${encodeURIComponent(id)}/returns`,{method:'POST',body:JSON.stringify({reason,description:description.trim()||null,lines})}))!);
}

/** Reads the cookie session; an expired access cookie is refreshed once. */
async function loadSession(){
  try{publish({user:(await call<DemoUser>('/me'))??undefined,ready:true})}
  catch(error){
    if((error as {status?:number}).status!==401){publish({ready:true});return}
    try{publish({user:(await call<DemoUser>('/auth/web/refresh',{method:'POST'}))??undefined,ready:true})}
    catch{signedOut();return}
  }
  if(session.user)await loadAccountData().catch(()=>{});
}

function subscribe(callback:()=>void){
  listeners.add(callback);
  if(!session.ready)loading??=loadSession().finally(()=>{loading=null});
  return()=>{listeners.delete(callback)};
}

export function useDemoCommerce():Snapshot{return useSyncExternalStore(subscribe,()=>session,()=>empty)}

export async function demoAccess(mode:'login'|'register',name:string,email:string,password:string,verification?:{id:string;code:string}){
  email=email.trim().toLowerCase();
  if(!email||password.length<8)throw new Error('Geçerli e-posta ve en az 8 karakterlik parola gir.');
  if(mode==='register'){
    if(!name.trim())throw new Error('Ad soyad gir.');
    if(!verification)throw new Error('Önce e-posta adresini doğrula.');
    const user=await call<DemoUser>('/auth/web/register',{method:'POST',body:JSON.stringify({name:name.trim(),email,password,verificationId:verification.id,verificationCode:verification.code})});
    publish({user:user??undefined,ready:true});
  }else{
    const user=await call<DemoUser>('/auth/web/login',{method:'POST',body:JSON.stringify({email,password})});
    publish({user:user??undefined,ready:true});
  }
  await loadAccountData().catch(()=>{});
}

export async function demoLogout(){
  try{await call('/auth/web/logout',{method:'POST'})}finally{signedOut()}
}

/** [phone]: undefined leaves it unchanged, '' removes it. */
export async function updateAccountProfile(name:string,phone?:string){
  if(!name.trim())throw new Error('Ad soyad gir.');
  const user=await signedIn<DemoUser>('/me',{method:'PATCH',body:JSON.stringify({name:name.trim(),phone:phone?.trim()})});
  publish({user:user??session.user});
}

/** Signs out every other device; the server renews this browser's session cookies. */
export async function changeAccountPassword(currentPassword:string,newPassword:string){
  if(!currentPassword)throw new Error('Mevcut parolanı gir.');
  if(newPassword.length<8)throw new Error('Yeni parola en az 8 karakter olmalı.');
  await signedIn('/me/password',{method:'PUT',body:JSON.stringify({currentPassword,newPassword})});
}

export async function startEmailChange(newEmail:string){
  if(!newEmail.includes('@'))throw new Error('Geçerli bir e-posta adresi gir.');
  return (await signedIn<EmailChallenge>('/me/email-verification',{method:'POST',body:JSON.stringify({newEmail:newEmail.trim()})}))!;
}

export async function confirmEmailChange(challenge:EmailChallenge,code:string,currentPassword:string){
  const user=await signedIn<DemoUser>('/me/email',{method:'PUT',body:JSON.stringify({newEmail:challenge.email,verificationId:challenge.verificationId,verificationCode:code.trim(),currentPassword})});
  publish({user:user??session.user});
}

/** Deletes the account with its addresses and orders; the server clears the session cookies. */
export async function deleteAccount(currentPassword:string){
  if(!currentPassword)throw new Error('Mevcut parolanı gir.');
  await signedIn('/me/deletion',{method:'POST',body:JSON.stringify({currentPassword})});
  signedOut();
}

export async function saveAddress(address:AddressInput,id?:string){
  const saved=await signedIn<CustomerAddress>(id?`/me/addresses/${encodeURIComponent(id)}`:'/me/addresses',{method:id?'PUT':'POST',body:JSON.stringify(address)});
  publish({addresses:(await signedIn<CustomerAddress[]>('/me/addresses'))??[]});
  return saved!;
}

export async function deleteAddress(id:string){
  await signedIn(`/me/addresses/${encodeURIComponent(id)}`,{method:'DELETE'});
  publish({addresses:(await signedIn<CustomerAddress[]>('/me/addresses'))??[]});
}

/** Demo order: the server prices the items from the catalogue. Reusing [requestId] returns the same order instead of a second one. */
export async function placeDemoOrder(addressId:string,items:{productId:string;variantId:string;quantity:number}[],requestId:string){
  const order=(await signedIn<CustomerOrder>('/me/orders',{method:'POST',body:JSON.stringify({addressId,items,clientRequestId:requestId})}))!;
  publish({orders:[order,...session.orders.filter(existing=>existing.id!==order.id)]});
  return order;
}

const statusTexts:Record<string,string>={received:'Sipariş alındı',preparing:'Hazırlanıyor',shipped:'Kargoya verildi',delivered:'Teslim edildi',cancelled:'İptal edildi',returned:'İade edildi'};
export type MyReview={id:string;productId:string;rating:number;title?:string|null;body:string;status:'pending'|'approved'|'rejected';createdAt:string;moderationNote?:string|null};
export async function myReviews(){return (await signedIn<MyReview[]>('/me/reviews'))??[]}
/** Only products from a delivered order can be reviewed; a new submission replaces the earlier one and waits for moderation. */
export async function submitReview(productId:string,rating:number,title:string,body:string){
  return (await signedIn<MyReview>('/me/reviews',{method:'POST',body:JSON.stringify({productId,rating,title:title.trim()||null,body:body.trim()})}))!;
}

export const orderStatusText=(status:string)=>statusTexts[status]??status;
const requestTexts:Record<string,string>={requested:'Değerlendiriliyor',approved:'Onaylandı',rejected:'Kabul edilmedi',completed:'Tamamlandı'};
export const requestStatusText=(request:OrderRequest)=>`${request.type==='cancel'?'İptal':'İade'} talebi · ${requestTexts[request.status]??request.status}`;
/** Main steps of the order timeline; cancelled and returned orders end where they stopped. */
export const orderSteps=['received','preparing','shipped','delivered'] as const;
export const pendingRequest=(order:CustomerOrder,type:'cancel'|'return')=>order.requests?.find(item=>item.type===type&&(item.status==='requested'||item.status==='approved'));
export const canCancel=(order:CustomerOrder)=>(order.status==='received'||order.status==='preparing')&&!pendingRequest(order,'cancel');
/** Delivered orders can be returned for [days] days after delivery while some quantity is left. */
export function returnable(order:CustomerOrder,days:number):Record<string,number>{
  if(order.status!=='delivered')return {};
  const delivered=order.shipment?.deliveredAt??order.history?.findLast(item=>item.status==='delivered')?.at;
  if(delivered&&Date.now()>new Date(delivered).getTime()+days*86400000)return {};
  const left:Record<string,number>={};order.lines.forEach(line=>{left[line.variantId]=(left[line.variantId]??0)+line.quantity});
  order.requests?.filter(item=>item.type==='return'&&item.status!=='rejected').forEach(item=>item.lines.forEach(line=>{left[line.variantId]-=line.quantity}));
  return Object.fromEntries(Object.entries(left).filter(([,count])=>count>0));
}

/** +905321234567 → 0532 123 45 67 for display and editing; the server accepts any common spelling. */
export function localPhone(phone?:string|null){
  if(!phone||!phone.startsWith('+90')||phone.length!==13)return phone??'';
  const d=phone.slice(3);return `0${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,8)} ${d.slice(8)}`;
}
