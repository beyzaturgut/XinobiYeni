import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const script=new URL('./publish-release.mjs',import.meta.url).pathname;
async function fixture(fn){const root=await mkdtemp(path.join(tmpdir(),'xinobi-publish-test-'));try{await fn(root);}finally{await rm(root,{recursive:true,force:true});}}
async function setup(root){
 const dir=path.join(root,'paketler/releases/xinobi-aaaaaaa');await mkdir(dir,{recursive:true});
 const commit='a'.repeat(40);await writeFile(path.join(root,'release.json'),JSON.stringify({commit}));
 const zipped=spawnSync('zip',['-q',path.join(dir,'xinobi.zip'),'release.json'],{cwd:root});assert.equal(zipped.status,0);
 const bytes=await readFile(path.join(dir,'xinobi.zip'));await writeFile(path.join(dir,'xinobi.zip.sha256'),createHash('sha256').update(bytes).digest('hex'));
 await writeFile(path.join(dir,'deploy-release.ps1'),'# fixture');
 const bin=path.join(root,'bin');await mkdir(bin);await writeFile(path.join(bin,'git'),`#!/bin/sh\nprintf '${commit}\\n'\n`,{mode:0o755});
 const mock=path.join(root,'mock.mjs');await writeFile(mock,`import assert from 'node:assert/strict';let n=0;globalThis.fetch=async(url,opts)=>{n++;if(n===1){assert.equal(JSON.parse(opts.body).draft,true);return {ok:true,json:async()=>({url:'https://api.github.com/release/1',upload_url:'https://uploads.github.com/1{?name}'})};}if(n<=4){assert.equal(opts.method,'POST');if(process.env.FAIL_UPLOAD==='1')return {ok:false,status:500};return {ok:true,json:async()=>({})};}assert.equal(n,5);assert.equal(JSON.parse(opts.body).draft,false);return {ok:true,json:async()=>({html_url:'https://github.com/test/release'})};};process.on('exit',()=>{if(process.env.FAIL_UPLOAD!=='1')assert.equal(n,5);});`);
 return {dir,mock,env:{...process.env,PATH:bin+path.delimiter+process.env.PATH,GITHUB_TOKEN:'fixture-token'}};
}
test('invalid release rejected before any upload',()=>{const r=spawnSync(process.execPath,[script,'latest'],{encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/Usage:/);});
test('valid assets upload as draft before publishing',()=>fixture(async root=>{const f=await setup(root);const r=spawnSync(process.execPath,['--import',f.mock,script,'xinobi-aaaaaaa'],{cwd:root,env:f.env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/https:\/\/github.com\/test\/release/);}));
test('upload failure never publishes draft',()=>fixture(async root=>{const f=await setup(root);const r=spawnSync(process.execPath,['--import',f.mock,script,'xinobi-aaaaaaa'],{cwd:root,env:{...f.env,FAIL_UPLOAD:'1'},encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/release may remain draft/);}));
test('tampered package rejected before network',()=>fixture(async root=>{const f=await setup(root);await writeFile(path.join(f.dir,'xinobi.zip.sha256'),'0'.repeat(64));const r=spawnSync(process.execPath,[script,'xinobi-aaaaaaa'],{cwd:root,env:f.env,encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/SHA256 mismatch/);}));
