import assert from 'node:assert/strict'
import http from 'node:http'
import {fileURLToPath} from 'node:url'
import {createServer} from 'vite'

// Only this synthetic loopback responder is used; no actual API or credentials.
const calls=[]
const backend=http.createServer((req,res)=>{calls.push({url:req.url,method:req.method});req.resume();res.setHeader('Content-Type','application/json');res.end(JSON.stringify({synthetic:true,path:req.url}))})
await new Promise(resolve=>backend.listen(0,'127.0.0.1',resolve))
let vite
try{
 process.env.PRODUCT_SURFACES_CATALOG_API_URL='http://127.0.0.1:'+backend.address().port
 process.env.XINOBI_QA_MODE='false'
 const config=(await import('../vite.config.ts')).default
 vite=await createServer({...config,configFile:false,root:fileURLToPath(new URL('..',import.meta.url)),server:{...config.server,host:'127.0.0.1',port:0,strictPort:true},logLevel:'silent'})
 await vite.listen();const base='http://127.0.0.1:'+vite.httpServer.address().port
 for(const [path,method] of [['/api/v1/admin/session','GET'],['/api/v1/auth/admin/refresh','POST'],['/api/v1/local-commerce/catalog-management/list','GET']]){
  const response=await fetch(base+path,{method,headers:{'X-Xinobi-Csrf':'1'},...(method==='POST'?{body:'synthetic'}:{})})
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{synthetic:true,path})
 }
 assert.equal(calls.length,3);assert.equal(calls[1].method,'POST')
 console.log('PASS relative admin session, refresh and catalog URLs reach the same synthetic API through Vite')
}finally{await vite?.close();await new Promise(resolve=>backend.close(resolve))}
