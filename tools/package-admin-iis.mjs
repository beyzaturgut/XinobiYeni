import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,cp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd();
const sha=spawnSync('git',['rev-parse','--short','HEAD'],{encoding:'utf8'}).stdout.trim();
const api=process.env.VITE_COMMERCE_API_URL||'/api/v1/local-commerce';
if(!api.startsWith('/api/')&&!/^https:\/\//.test(api))throw new Error('Production admin requires a same-origin API path or HTTPS API URL.');
const env={...process.env,VITE_COMMERCE_API_URL:api};
for(const command of [['pnpm',['--filter','admin','exec','tsc','-b']],['pnpm',['--filter','admin','exec','vite','build','--base=/admin/']]]){
 const result=spawnSync(command[0],command[1],{stdio:'inherit',env});if(result.status!==0)process.exit(result.status||1);
}
const temporary=await mkdtemp(path.join(tmpdir(),'xinobi-admin-package-'));
await cp(path.join(root,'apps/admin/dist'),path.join(temporary,'admin'),{recursive:true});
await writeFile(path.join(temporary,'admin/web.config'),`<?xml version="1.0" encoding="utf-8"?>
<configuration><system.webServer><security><access sslFlags="Ssl" /></security><defaultDocument enabled="true"><files><clear /><add value="index.html" /></files></defaultDocument></system.webServer></configuration>`);
await mkdir(path.join(root,'paketler','web'),{recursive:true});
const artifact=path.join(root,'paketler','web',`XinobiYeni-admin-${sha}.zip`);
// Build a fresh archive so removed chunks from a previous build cannot survive.
const archived=path.join(temporary,'package.zip');
const zip=spawnSync('zip',['-q','-r',archived,'admin'],{cwd:temporary,stdio:'inherit'});if(zip.status!==0)process.exit(zip.status||1);
await cp(archived,artifact);
const bytes=await readFile(artifact);
console.log(JSON.stringify({artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),api,source:sha},null,2));
