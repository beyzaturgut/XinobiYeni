import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {sourceChecksum} from '../src/features/product-surfaces/source-checksum.ts';

test('source checksum preserves file verification with and without Web Crypto',async()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 const fixtures=[new Uint8Array(),new TextEncoder().encode('abc'),...[55,56,63,64,65,1000,1048580].map(length=>Uint8Array.from({length},(_,i)=>(i*137+31)%256))];
 try{
  for(const crypto of [webcrypto,undefined]){
   Object.defineProperty(globalThis,'crypto',{configurable:true,value:crypto});
   for(const fixture of fixtures){
    const expected=createHash('sha256').update(fixture).digest('hex');
    assert.equal(await sourceChecksum(Uint8Array.from(fixture).buffer),expected);
   }
  }
 }finally{
  if(original)Object.defineProperty(globalThis,'crypto',original);
  else Reflect.deleteProperty(globalThis,'crypto');
 }
});
