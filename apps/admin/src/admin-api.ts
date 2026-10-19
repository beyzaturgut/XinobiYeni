import {commerceApi} from './commerce'
import {adminRequest,refreshStaffSession} from './admin-request'


// All panel modules renew staff cookies through this one shared request, never customer cookies.
export async function refreshAdminSession():Promise<boolean>{
 return refreshStaffSession(commerceApi)
}

export async function adminCall<T>(path:string,body?:unknown):Promise<T>{
 const api=commerceApi.replace(/\/local-commerce\/?$/,'')
 return adminRequest<T>(api,path,body===undefined?'GET':'POST',body)
}
