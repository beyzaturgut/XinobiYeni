import {test} from 'node:test';
import assert from 'node:assert/strict';
import {designPreviewBlob} from '../src/lib/design-preview.ts';

function fakeCanvas(sizes){
 const calls=[];
 const canvas={width:0,height:0,getContext:()=>({fillRect(){},drawImage(){}}),toBlob(callback,mime,quality){calls.push({width:canvas.width,height:canvas.height,mime,quality});callback(new Blob([new Uint8Array(sizes.shift()??100)],{type:mime}));}};
 return {canvas,calls};
}
for(const [name,width,height,expectedWidth,expectedHeight] of [['large landscape',2400,1600,1440,960],['small portrait',400,600,400,600]]){
 test(name+' preserves detail and aspect ratio without upscaling',async()=>{
  const {canvas,calls}=fakeCanvas([100]);globalThis.document={createElement:()=>canvas};
  try{const blob=await designPreviewBlob({width,height});assert.equal(blob.type,'image/jpeg');assert.deepEqual(calls[0],{width:expectedWidth,height:expectedHeight,mime:'image/jpeg',quality:.9});assert.equal(canvas.width,0);assert.equal(canvas.height,0);}finally{delete globalThis.document;}
 });
}
test('large compositions reduce JPEG quality to fit the API limit',async()=>{
 const {canvas,calls}=fakeCanvas([3*1024*1024,100]);globalThis.document={createElement:()=>canvas};
 try{assert.equal((await designPreviewBlob({width:2000,height:2000})).size,100);assert.deepEqual(calls.map(c=>c.quality),[.9,.8]);}finally{delete globalThis.document;}
});
test('oversized composition fails before upload and releases canvas',async()=>{
 const {canvas}=fakeCanvas([3*1024*1024,3*1024*1024,3*1024*1024]);globalThis.document={createElement:()=>canvas};
 try{await assert.rejects(designPreviewBlob({width:2000,height:2000}),/Önizleme kaydedilemedi/);assert.equal(canvas.width,0);}finally{delete globalThis.document;}
});
