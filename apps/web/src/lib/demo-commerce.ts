'use client';
import {useSyncExternalStore} from 'react';
import {commerceApi} from './commerce';

// Accounts are real now: the shared /api/v1/auth contract (web: HttpOnly session cookies + CSRF header, ADR-004).
// Orders stay a browser-only demo until payment and order rules (D03/D05) exist, keyed by the real account id.
export type DemoUser={id:string;name:string;email:string};
export type DemoOrder={id:string;userId:string;createdAt:string;total:number;lines:{name:string;color:string;quantity:number;price:number}[]};

const api=commerceApi?commerceApi.replace(/\/local-commerce\/?$/,''):'';
const ordersKey='xinobi-demo-commerce-v1',event='xinobi-demo-commerce-changed';
type Session={user?:DemoUser;ready:boolean};
let session:Session={ready:false};
let loading:Promise<void>|null=null;
const listeners=new Set<()=>void>();
function publish(next:Session){session=next;listeners.forEach(listener=>listener())}

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

/** Reads the cookie session; an expired access cookie is refreshed once. */
async function loadSession(){
  try{publish({user:(await call<DemoUser>('/me'))??undefined,ready:true})}
  catch(error){
    if((error as {status?:number}).status!==401){publish({ready:true});return}
    try{publish({user:(await call<DemoUser>('/auth/web/refresh',{method:'POST'}))??undefined,ready:true})}
    catch{publish({ready:true})}
  }
}

function subscribe(callback:()=>void){
  listeners.add(callback);window.addEventListener(event,callback);window.addEventListener('storage',callback);
  if(!session.ready)loading??=loadSession().finally(()=>{loading=null});
  return()=>{listeners.delete(callback);window.removeEventListener(event,callback);window.removeEventListener('storage',callback)};
}
function ordersRaw(){try{return localStorage.getItem(ordersKey)||'{"orders":[]}'}catch{return '{"orders":[]}'}}
function readOrders():DemoOrder[]{try{const data=JSON.parse(ordersRaw());return Array.isArray(data.orders)?data.orders:[]}catch{return []}}
function writeOrders(orders:DemoOrder[]){localStorage.setItem(ordersKey,JSON.stringify({orders}));window.dispatchEvent(new Event(event))}
type Snapshot={user?:DemoUser;orders:DemoOrder[];ready:boolean};
let snapshotKey='',snapshot:Snapshot={orders:[],ready:false};
function current():Snapshot{
  const raw=ordersRaw(),key=`${session.ready}|${session.user?.id}|${raw}`;
  if(key!==snapshotKey){snapshotKey=key;snapshot={user:session.user,ready:session.ready,orders:readOrders().filter(order=>order.userId===session.user?.id)}}
  return snapshot;
}
const serverSnapshot:Snapshot={orders:[],ready:false};

export function useDemoCommerce():Snapshot{return useSyncExternalStore(subscribe,current,()=>serverSnapshot)}

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
}

export async function demoLogout(){
  try{await call('/auth/web/logout',{method:'POST'})}finally{publish({ready:true})}
}

export function createDemoOrder(lines:DemoOrder['lines'],requestId:string){
  const userId=session.user?.id;
  if(!userId)throw new Error('Önce hesabına giriş yap.');
  const orders=readOrders();
  const existing=orders.find(order=>order.id===requestId&&order.userId===userId);if(existing)return existing;
  if(!lines.length||lines.some(line=>!Number.isInteger(line.quantity)||line.quantity<1||!Number.isFinite(line.price)||line.price<=0))throw new Error('Sepet bilgilerini kontrol et.');
  const order={id:requestId,userId,createdAt:new Date().toISOString(),lines,total:lines.reduce((sum,line)=>sum+line.price*line.quantity,0)};
  writeOrders([order,...orders]);return order;
}
