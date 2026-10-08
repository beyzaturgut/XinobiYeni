import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=process.cwd();
const sha=spawnSync('git',['rev-parse','--short','HEAD'],{encoding:'utf8'}).stdout.trim();
const state=JSON.parse(await readFile('services/api/App_Data/local-commerce/state.json','utf8'));
const web=path.join(root,'apps/web');
const publicDir=path.join(web,'public');
await mkdir(path.join(publicDir,'commerce-preview'),{recursive:true});
await mkdir(path.join(publicDir,'assets/deploy-media'),{recursive:true});
async function map(value){
 if(typeof value==='string'&&value.startsWith('/api/v1/local-commerce/media/')){
  const name=path.basename(value);if(!/^[a-f0-9]{32}\.(png|jpg|webp|mp4|webm)$/.test(name))throw new Error('Invalid media name');
  await copyFile(path.join(root,'services/api/App_Data/local-commerce/media',name),path.join(publicDir,'assets/deploy-media',name));return '/assets/deploy-media/'+name;
 }
 if(Array.isArray(value))return Promise.all(value.map(map));
 if(value&&typeof value==='object')return Object.fromEntries(await Promise.all(Object.entries(value).map(async([key,value])=>[key,await map(value)])));
 return value;
}
await writeFile(path.join(publicDir,'commerce-preview/state.json'),JSON.stringify(await map(state)));
const build=spawnSync('pnpm',['--filter','web','build'],{stdio:'inherit',env:{...process.env,NEXT_PUBLIC_COMMERCE_API_URL:'',NEXT_PUBLIC_COMMERCE_SNAPSHOT_URL:'/commerce-preview/state.json'}});
if(build.status!==0)process.exit(build.status||1);
const out=path.join(web,'out');
await writeFile(path.join(out,'web.config'),`<?xml version="1.0" encoding="utf-8"?><configuration><system.webServer><defaultDocument enabled="true"><files><clear/><add value="index.html"/></files></defaultDocument><staticContent><remove fileExtension=".webp"/><mimeMap fileExtension=".webp" mimeType="image/webp"/></staticContent></system.webServer></configuration>`);
await mkdir(path.join(root,'paketler'),{recursive:true});
const artifact=path.join(root,'paketler',`XinobiYeni-web-${sha}.zip`);
const zip=spawnSync('zip',['-q','-r',artifact,'out'],{cwd:web,stdio:'inherit'});if(zip.status!==0)process.exit(zip.status||1);
const bytes=await readFile(artifact);console.log(JSON.stringify({artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),source:sha},null,2));
