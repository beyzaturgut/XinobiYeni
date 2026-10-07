export const resources = ['catalog', 'content', 'orders', 'quotes', 'integration', 'ai', 'settings', 'audit'] as const
export type Resource = typeof resources[number]
export type Role = { id: string; name: string; locked: boolean; permissions: string[] }
export type Settings = { revision: number; currency: 'TRY'; timezone: 'Europe/Istanbul'; orderNotice: boolean; lowStock: number }
export type Audit = { id: string; at: string; actor: string; action: string; entity: string; before: unknown; after: unknown; correlation: string }
export type AdminState = { roles: Role[]; settings: Settings; audit: Audit[] }
export const initialAdminState: AdminState = {
 roles: [{id:'admin',name:'Demo yönetici',locked:true,permissions:resources.flatMap(r=>[`${r}.read`,`${r}.write`])}, {id:'operator',name:'Demo operasyon',locked:false,permissions:['catalog.read','orders.read','quotes.read']}],
 settings:{revision:1,currency:'TRY',timezone:'Europe/Istanbul',orderNotice:true,lowStock:5},audit:[]
}
export function allowed(role:Role,resource:string,action:string):boolean {
 return resources.includes(resource as Resource) && ['read','write'].includes(action) && role.permissions.includes(`${resource}.${action}`)
}
export function changeSettings(state:AdminState,base:number,lowStock:number,orderNotice:boolean):{state?:AdminState;error?:string} {
 if(base!==state.settings.revision)return {error:'Taslak sürümü eskidi; güncel ayarları yeniden açın.'}
 if(!Number.isInteger(lowStock)||lowStock<0||lowStock>10000)return {error:'Stok eşiği 0–10000 arasında tam sayı olmalı.'}
 const next:Settings={...state.settings,revision:base+1,lowStock,orderNotice}
 return {state:{...state,settings:next,audit:[...state.audit,entry(state,'settings.update','demo-settings',state.settings,next)]}}
}
function entry(state:AdminState,action:string,entity:string,before:unknown,after:unknown):Audit {
 const id=`DEMO-AUDIT-${state.audit.length+1}`
 return {id,at:new Date().toISOString(),actor:'Demo yönetici · oturum örneği',action,entity,before,after,correlation:`demo-correlation-${state.audit.length+1}`}
}
export function changeRole(state:AdminState,id:string,permissions:string[]):{state?:AdminState;error?:string} {
 const role=state.roles.find(r=>r.id===id)
 if(!role||role.locked)return {error:'Sabit demo yönetici rolü değiştirilemez.'}
 const valid=new Set(resources.flatMap(r=>[`${r}.read`,`${r}.write`]))
 if(permissions.some(p=>!valid.has(p))||new Set(permissions).size!==permissions.length)return {error:'Geçersiz veya yinelenen yetki.'}
 const next={...role,permissions:[...permissions]}
 return {state:{...state,roles:state.roles.map(r=>r.id===id?next:r),audit:[...state.audit,entry(state,'role.update',id,{permissions:role.permissions},{permissions:next.permissions})]}}
}
