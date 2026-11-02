// Isolated browser snapshots only: every API request intercepted, never real accounts or records.
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
import {navigationItems} from '../src/admin-navigation.ts'
import {mockPanel} from './consistency-fixtures.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/',output=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-admin-consistency'
await mkdir(output,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true}),matrix=[],issues=[]
try{
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();page.setDefaultTimeout(10000);await mockPanel(page)
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  for(const {view}of navigationItems){
   await page.goto(base+'?view='+view);await page.locator('#panel-main>.page-heading').waitFor();await page.waitForTimeout(180)
   const scan=()=>page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,offenders:[...document.querySelectorAll('body *')].filter(e=>{const x=e.getBoundingClientRect();return x.width&&(x.right>innerWidth+1||x.left< -1)&&!e.closest('.table-scroll,[hidden],dialog:not([open])')}).slice(0,5).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60)}))}))
   const normal=await scan();let axe=[]
   if(width===390){const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();axe=a.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));if(axe.length)issues.push({view,width,axe})}
   if(width===390||width===1440)await page.screenshot({path:output+'/'+view+'-'+width+'.png',fullPage:true})
   await page.evaluate(()=>{const sizes=[...document.querySelectorAll('body *')].filter(e=>!e.closest('svg')).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const[e,n]of sizes)if(n)e.style.setProperty('font-size',n*2+'px','important')})
   const enlarged=await scan();matrix.push({view,width,normal,enlarged});if(normal.overflow||enlarged.overflow)issues.push({view,width,normal,enlarged})
  }
  if(errors.length)issues.push({width,errors});await context.close();console.log('matrix',width,'done')
 }
 const states=[]
 for(const mode of ['empty','error','denied']){
  const context=await browser.newContext({viewport:{width:390,height:1000}}),page=await context.newPage();await mockPanel(page,{mode});const errors=[];page.on('pageerror',e=>errors.push(e.message))
  for(const{view}of navigationItems){await page.goto(base+'?view='+view);await page.locator('#panel-main>.page-heading').waitFor();if(mode!=='empty'&&!['integrations','settings'].includes(view))await page.getByRole('alert').first().waitFor();await page.waitForTimeout(200);states.push({view,mode,alerts:await page.getByRole('alert').allTextContents(),statuses:await page.getByRole('status').allTextContents()})}
  if(errors.length)issues.push({mode,errors});await context.close()
 }
 for(const row of states)if(row.mode!=='empty'&&!['integrations','settings'].includes(row.view))assert.ok(row.alerts.length,`${row.view} ${row.mode}: missing error/authorization alert`)
 await writeFile(output+'/matrix.json',JSON.stringify({matrix,states,issues},null,2));assert.deepEqual(issues,[]);console.log('PASS 16 modules × 4 widths × normal/200% text; 16 axe; 48 empty/error/403 entry checks')
}finally{await browser.close()}
