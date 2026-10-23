import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {mediaReferences,restoreLocalMedia} from './restore-local-media.mjs';
const one='a'.repeat(32)+'.png',two='b'.repeat(32)+'.webp';
const prefix='/api/v1/local-commerce/media/';
test('only exact public catalogue file names are collected',()=>{
 assert.deepEqual(mediaReferences([prefix+one,{x:prefix+one},prefix+'../private.png','https://foreign.test/'+one,'/api/v1/me/designs/id/image']),[one]);
});
test('restore preserves existing files and rejects HTML instead of saving it as an image',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'xinobi-media-test-'));
 try{
  const media=path.join(dir,'media'),state=path.join(dir,'state.json');await mkdir(media);
  await writeFile(state,JSON.stringify({products:[{image:prefix+one,cover:prefix+two}]}));
  await writeFile(path.join(media,one),'existing-file');let calls=0;
  const options={origin:'https://catalog.example',statePath:state,mediaDirectory:media,fetchImpl:async(url,request)=>{calls++;assert.equal(url.pathname,prefix+two);assert.equal(request.method,'GET');assert.equal(request.credentials,'omit');return new Response('<html>missing</html>')}};
  const failed=await restoreLocalMedia(options);assert.equal(failed.existing,1);assert.equal(failed.failed.length,1);assert.equal(await readFile(path.join(media,one),'utf8'),'existing-file');assert.deepEqual(await readdir(media),[one]);
  const webp=Buffer.from('RIFFxxxxWEBPpayload');
  const restored=await restoreLocalMedia({...options,fetchImpl:async()=>new Response(webp)});
  assert.equal(restored.restored,1);assert.equal(restored.failed.length,0);assert.deepEqual(await readFile(path.join(media,two)),webp);assert.equal(calls,1);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('local SQL catalogue endpoint can supply references instead of an older file snapshot',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'xinobi-media-api-test-'));
 try{
  const calls=[];const bytes=Buffer.from([137,80,78,71,13,10,26,10,1]);
  const result=await restoreLocalMedia({origin:'https://catalog.example',stateUrl:'http://127.0.0.1:5003/api/v1/local-commerce/state',mediaDirectory:dir,fetchImpl:async(url,options)=>{
   calls.push(url.origin);assert.equal(options.credentials,'omit');
   return url.hostname==='127.0.0.1'?Response.json({products:[{image:prefix+one}]}):new Response(bytes);
  }});
  assert.equal(result.restored,1);assert.deepEqual(calls,['http://127.0.0.1:5003','https://catalog.example']);assert.deepEqual(await readFile(path.join(dir,one)),bytes);
 }finally{await rm(dir,{recursive:true,force:true})}
});
