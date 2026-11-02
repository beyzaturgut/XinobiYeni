import {readdir,mkdir} from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {join,resolve} from 'node:path'
import {createServer} from 'vite'
import react from '@vitejs/plugin-react'

const root=fileURLToPath(new URL('..',import.meta.url))
const helper=new URL('./helpers/isolated-browser.mjs',import.meta.url).href
// No API proxy: browser requests require an explicit synthetic fixture or are aborted by the guard.
const server=await createServer({configFile:false,root,plugins:[react()],logLevel:'error',server:{host:'127.0.0.1',port:0,strictPort:true}})
let failures=0
try{
 await server.listen()
 const base='http://127.0.0.1:'+server.httpServer.address().port+'/'
 const excluded=new Set(['run-isolated.mjs','navigation-helper.mjs','consistency-fixtures.mjs'])
 const files=(await readdir(join(root,'tests'))).filter(f=>f.endsWith('.mjs')&&!excluded.has(f)).sort()
 let next=0,passed=0
 async function worker(){while(next<files.length){
  const file=files[next++],output=resolve(root,'../../artifacts/admin-safe-tests',file.replace(/\.mjs$/,''))
  await mkdir(output,{recursive:true})
  await new Promise(done=>{
   const child=spawn(process.execPath,['--import',helper,join(root,'tests',file)],{cwd:root,windowsHide:true,env:{...process.env,ADMIN_UI_URL:base,ADMIN_CONSISTENCY_OUTPUT:output}})
   let log='';child.stdout.on('data',data=>{log+=data});child.stderr.on('data',data=>{log+=data})
   child.on('error',error=>{failures++;console.error(file,error.message);done()})
   child.on('close',code=>{if(code===0){passed++;console.log('PASS '+file)}else{failures++;console.error('FAIL '+file+'\n'+log)}done()})
  })
 }}
 await Promise.all([worker(),worker()])
 console.log(JSON.stringify({passed,total:files.length,failures}))
}finally{await server.close()}
process.exitCode=failures?1:0
