import {commerceApi} from './commerce'

let refreshing:Promise<boolean>|undefined

export async function adminCall<T>(path:string,body?:unknown):Promise<T>{
 const api=commerceApi.replace(/\/local-commerce\/?$/,'')
 if(!api)throw new Error('Yönetim API adresi yapılandırılmadı.')
 let response:Response
 const send=()=>fetch(api+path,{method:body===undefined?'GET':'POST',credentials:'include',headers:{'Content-Type':'application/json','X-Xinobi-Csrf':'1'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)})
 try{
  response=await send()
  // The panel can remain open longer than the access cookie. Renew only through
  // the staff refresh endpoint, which still enforces the existing MFA grant.
  if(response.status===401&&path.startsWith('/admin/')){
   refreshing??=fetch(api+'/auth/admin/refresh',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','X-Xinobi-Csrf':'1'},body:'{}',signal:AbortSignal.timeout(20000)}).then(value=>value.ok).catch(()=>false).finally(()=>{refreshing=undefined})
   if(await refreshing)response=await send()
  }
 }
 catch{throw new Error('Yönetim servisine ulaşılamadı. Lütfen daha sonra tekrar dene.')}
 if(!response.ok){const problem=await response.json().catch(()=>null);throw Object.assign(new Error(response.status===403?'Bu hesabın yönetim paneline erişim yetkisi yok.':problem?.title||'Yönetim servisi kullanılamıyor.'),{status:response.status})}
 return response.status===204?undefined as T:response.json()
}
