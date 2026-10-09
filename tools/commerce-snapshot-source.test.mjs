import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {readCommerceSnapshot} from './commerce-snapshot-source.mjs';

test('SQL catalog packaging refuses stale files, unavailable API and a File-backed API',async()=>{
 const folder=await mkdtemp(path.join(os.tmpdir(),'xinobi-snapshot-test-'));
 try{
  await writeFile(path.join(folder,'state.json'),JSON.stringify({products:['old']}));
  assert.deepEqual(await readCommerceSnapshot(folder,()=>{throw new Error('API must not be called');}),{products:['old']});
  await writeFile(path.join(folder,'catalog-sql.enabled'),'verified import');
  await assert.rejects(readCommerceSnapshot(folder,async()=>{throw new Error('API offline');}),/API offline/);
  await assert.rejects(readCommerceSnapshot(folder,async()=>({ok:false,status:503})),/503/);
  await assert.rejects(readCommerceSnapshot(folder,async()=>({ok:true,headers:new Headers({'x-xinobi-catalog-storage':'File'})})),/not using SQL/);
  const live={products:['new']};
  assert.deepEqual(await readCommerceSnapshot(folder,async(url)=>{
   assert.equal(url,'http://127.0.0.1:5003/api/v1/local-commerce/state');
   return {ok:true,headers:new Headers({'x-xinobi-catalog-storage':'SqlServer'}),json:async()=>live};
  }),live);
 }finally{await rm(folder,{recursive:true,force:true});}
});
