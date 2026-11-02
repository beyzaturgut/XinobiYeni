import {createRequire} from 'node:module'
const {chromium}=createRequire(new URL('../../../web/package.json',import.meta.url))('@playwright/test')
const base=new URL(process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/')
if(!['localhost','127.0.0.1','[::1]'].includes(base.hostname)||!['http:','https:'].includes(base.protocol))throw Error('Admin browser tests require a loopback Vite origin')
const counts=new WeakMap()
export const blockedRequestCount=context=>counts.get(context)??0
async function protect(context){
 if(counts.has(context))return
 counts.set(context,0)
 await context.route('**/*',route=>{
  const url=new URL(route.request().url())
  // Page-specific synthetic API responses take precedence over this context guard.
  if(url.origin===base.origin&&!url.pathname.startsWith('/api/'))return route.continue()
  counts.set(context,counts.get(context)+1)
  return route.abort('blockedbyclient')
 })
}
const launch=chromium.launch.bind(chromium)
chromium.launch=async options=>{
 const browser=await launch(options),newPage=browser.newPage.bind(browser),newContext=browser.newContext.bind(browser)
 browser.newPage=async options=>{const page=await newPage(options);await protect(page.context());return page}
 browser.newContext=async options=>{const context=await newContext(options);await protect(context);return context}
 return browser
}
