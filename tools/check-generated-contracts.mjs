import assert from 'node:assert/strict'
import {readFile,readdir,access} from 'node:fs/promises'
import path from 'node:path'

const spec=JSON.parse(await readFile('packages/contracts/openapi/v1.json','utf8'))
const ts=await readFile('packages/clients/typescript/src/schema.d.ts','utf8')
const dartRoot='packages/clients/dart/lib'
async function files(directory){
 const result=[]
 for(const item of await readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,item.name)
  if(item.isDirectory())result.push(...await files(file));else if(file.endsWith('.dart'))result.push(file)
 }
 return result
}
const dartFiles=await files(dartRoot)
let parts=0
for(const file of dartFiles){
 const source=await readFile(file,'utf8')
 for(const match of source.matchAll(/\bpart '([^']+)';/g)){await access(path.join(path.dirname(file),match[1]));parts++}
}
const apiFiles=dartFiles.filter(file=>file.includes(path.join('src','api')+path.sep))
const dartApi=(await Promise.all(apiFiles.map(file=>readFile(file,'utf8')))).join('\n')
let operations=0
for(const item of Object.values(spec.paths))for(const operation of Object.values(item)){
 if(!operation?.operationId)continue
 const id=operation.operationId,method=id[0].toLowerCase()+id.slice(1)
 assert.ok(ts.includes(`operations["${id}"]`),`TypeScript operation missing: ${id}`)
 assert.ok(dartApi.includes(`${method}(`),`Dart operation missing: ${id}`)
 operations++
}
console.log(`PASS: ${operations} OpenAPI operations present in TS/Dart; ${parts} Dart part files exist`)
