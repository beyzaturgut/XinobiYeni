import {readFile,mkdir,access,writeFile,link,unlink} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

/** Catalogue media only: no customer designs, credentials, or arbitrary URLs. */
export function mediaReferences(value){
 const names=new Set();
 function visit(item){
  if(typeof item==='string'){
   const match=/^\/api\/v1\/local-commerce\/media\/([a-f0-9]{32}\.(?:png|jpg|webp|mp4|webm))$/.exec(item);
   if(match)names.add(match[1]);
  }else if(Array.isArray(item))item.forEach(visit);
  else if(item&&typeof item==='object')Object.values(item).forEach(visit);
 }
 visit(value);return [...names].sort();
}
function validMedia(bytes,extension){
 if(extension==='png')return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(extension==='jpg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(extension==='webp')return bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 if(extension==='mp4')return bytes.toString('ascii',4,8)==='ftyp';
 return bytes.subarray(0,4).equals(Buffer.from([26,69,223,163]));
}
async function exists(file){try{await access(file);return true}catch(error){if(error.code==='ENOENT')return false;throw error}}
export async function restoreLocalMedia({origin,statePath,stateUrl,mediaDirectory,fetchImpl=fetch}){
 const base=new URL(origin);
 if(!['http:','https:'].includes(base.protocol)||base.username||base.password||base.pathname!=='/'||base.search||base.hash)throw new Error('Use a public HTTP(S) origin without credentials or a path.');
 let state;
 if(stateUrl){
  const local=new URL(stateUrl);
  if(!['http:','https:'].includes(local.protocol)||!['127.0.0.1','localhost','[::1]'].includes(local.hostname)||local.username||local.password)throw new Error('The catalogue URL must be a local HTTP(S) endpoint without credentials.');
  const response=await fetchImpl(local,{method:'GET',credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Local catalogue HTTP '+response.status);
  state=await response.json();
 }else state=JSON.parse(await readFile(statePath,'utf8'));
 const names=mediaReferences(state),result={referenced:names.length,existing:0,restored:0,failed:[]};
 await mkdir(mediaDirectory,{recursive:true});let cursor=0;
 async function worker(){
  while(cursor<names.length){
   const name=names[cursor++],file=path.join(mediaDirectory,name);
   if(await exists(file)){result.existing++;continue}
   const temporary=file+'.'+process.pid+'.download';let written=false;
   try{
    const response=await fetchImpl(new URL('/api/v1/local-commerce/media/'+name,base),{method:'GET',credentials:'omit',redirect:'error',signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error('HTTP '+response.status);
    if(Number(response.headers.get('content-length'))>64*1024*1024)throw new Error('Media exceeds 64 MiB.');
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>64*1024*1024||!validMedia(bytes,path.extname(name).slice(1)))throw new Error('Unexpected media content.');
    await writeFile(temporary,bytes,{flag:'wx'});written=true;
    // link is exclusive: even a file created during the download cannot be overwritten.
    try{await link(temporary,file);result.restored++}catch(error){if(error.code==='EEXIST')result.existing++;else throw error}
   }catch(error){result.failed.push({name,error:error.message})}
   finally{if(written)await unlink(temporary)}
  }
 }
 await Promise.all(Array.from({length:4},()=>worker()));return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1];
 if(!args.includes('--origin'))throw new Error('Usage: node tools/restore-local-media.mjs --origin http://your-public-site[:port] [--state path | --state-url http://127.0.0.1:5003/api/v1/local-commerce/state] [--media directory]');
 const result=await restoreLocalMedia({origin:value('--origin'),stateUrl:args.includes('--state-url')?value('--state-url'):undefined,statePath:args.includes('--state')?value('--state'):'services/api/App_Data/local-commerce/state.json',mediaDirectory:args.includes('--media')?value('--media'):'services/api/App_Data/local-commerce/media'});
 console.log(JSON.stringify(result,null,2));if(result.failed.length)process.exitCode=1;
}
