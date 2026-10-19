// Isolated fetch contracts only: no network, SQL, cookie values or real accounts.
import assert from 'node:assert/strict'
import {adminRequest} from '../src/admin-request.ts'
globalThis.window=new EventTarget()
const base='http://127.0.0.1:5003/api/v1/local-commerce'
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}})
let refreshes=0, customerCalls=0
let releaseRefresh
const gate=new Promise(resolve=>{releaseRefresh=resolve})
const requests=new Map()
globalThis.fetch=async(url,options)=>{
 assert.equal(options.credentials,'include');assert.equal(options.headers['X-Xinobi-Csrf'],'1')
 if(url.includes('/auth/web/'))customerCalls++
 if(url.endsWith('/auth/admin/refresh')){refreshes++;await gate;return json({})}
 const count=(requests.get(url)||0)+1;requests.set(url,count)
 return count===1?json({},401):json({ok:true})
}
const calls=['/quotes','/orders','/reviews'].map(path=>adminRequest(base,path))
await new Promise(resolve=>setTimeout(resolve,10));releaseRefresh()
assert.deepEqual(await Promise.all(calls),[{ok:true},{ok:true},{ok:true}])
assert.equal(refreshes,1);assert.equal(customerCalls,0)
// A delayed old response must not rotate the newly issued refresh cookie twice.
let releaseLate
const late=new Promise(resolve=>{releaseLate=resolve})
let count=0
globalThis.fetch=async(url)=>{if(url.endsWith('/refresh')){refreshes++;return json({})}count++;if(count===1){await late;return json({},401)}return json({ok:true})}
const delayed=adminRequest(base,'/quotes')
const {refreshStaffSession}=await import('../src/admin-request.ts')
await refreshStaffSession(base);releaseLate();await delayed
assert.equal(refreshes,2)
let expired=0;window.addEventListener('xinobi:admin-session-expired',()=>expired++)
for(const status of [403,404,409,503]){
 let calls=0;globalThis.fetch=async()=>{calls++;return json({code:'test_failure',title:'Failure'},status)}
 await assert.rejects(adminRequest(base,'/quotes'),error=>error.status===status&&error.code==='test_failure')
 assert.equal(calls,1)
}
let failedCalls=0;globalThis.fetch=async()=>{failedCalls++;return json({},401)}
await assert.rejects(adminRequest(base,'/orders'),error=>error.status===401)
assert.equal(failedCalls,2);assert.equal(expired,1)
failedCalls=0
await assert.rejects(adminRequest(base.replace('/local-commerce',''),'/auth/admin/login','POST',{}))
assert.equal(failedCalls,1);assert.equal(expired,1)
globalThis.fetch=async(_url,options)=>{assert.ok(options.body instanceof FormData);assert.equal(options.headers['Content-Type'],undefined);return new Response(null,{status:204})}
assert.equal(await adminRequest(base,'/media','POST',new FormData()),undefined)
console.log('PASS: staff-only single-flight/late-401 refresh, bounded retry, auth exclusion, 401/403/404/409/503, session expiry, multipart and 204')
