import {blockedRequestCount} from './helpers/isolated-browser.mjs'
import assert from 'node:assert/strict'
import http from 'node:http'
import {createRequire} from 'node:module'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
let calls=0
const server=http.createServer((req,res)=>{calls++;res.setHeader('Access-Control-Allow-Origin','*');res.end('should not be reached')})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage();await page.setContent('<p>Synthetic isolation probe</p>')
 const target='http://127.0.0.1:'+server.address().port+'/private-file'
 const before=blockedRequestCount(page.context())
 assert.equal(await page.evaluate(url=>fetch(url).then(()=>true,()=>false),target),false)
 assert.ok(blockedRequestCount(page.context())>before,'Guard must intercept before network access')
 await page.route('**/api/v1/synthetic-probe',route=>route.fulfill({json:{synthetic:true},headers:{'Access-Control-Allow-Origin':'*'}}))
 assert.deepEqual(await page.evaluate(url=>fetch(url).then(r=>r.json()),target.replace('/private-file','/api/v1/synthetic-probe')),{synthetic:true})
 assert.equal(calls,0,'Even another loopback server must not receive a request')
 console.log('PASS browser guard blocks unmocked network before reaching a synthetic server and permits explicit API fixtures')
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
