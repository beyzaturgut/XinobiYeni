import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const tag=process.argv[2];
if(!/^xinobi-[a-f0-9]{7}$/.test(tag||''))throw new Error('Usage: node tools/publish-release.mjs xinobi-<7 character commit>');
const token=process.env.GITHUB_TOKEN;
if(!token)throw new Error('Set GITHUB_TOKEN in this terminal (repository Contents: write). Never put it in source or arguments.');
const repository='beyzaturgut/XinobiYeni';
const dir=`paketler/releases/${tag}`;
const files=await Promise.all(['xinobi.zip','xinobi.zip.sha256','deploy-release.ps1'].map(async name=>({name,bytes:await readFile(`${dir}/${name}`)})));
const digest=createHash('sha256').update(files[0].bytes).digest('hex');
if(files[1].bytes.toString().trim()!==digest)throw new Error('Package SHA256 mismatch; refusing upload.');
const metadata=spawnSync('unzip',['-p',`${dir}/xinobi.zip`,'release.json'],{encoding:'utf8'});
if(metadata.status!==0)throw new Error('Package release metadata missing.');
const packagedCommit=JSON.parse(metadata.stdout).commit;
const revision=spawnSync('git',['rev-parse',`${tag.slice(7)}^{commit}`],{encoding:'utf8'});
if(revision.status!==0)throw new Error('Cannot resolve release commit.');
if(revision.stdout.trim()!==packagedCommit)throw new Error('Package commit differs from release commit.');
const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
async function api(url,options={}){const r=await fetch(url,{...options,headers:{...headers,...options.headers}});if(!r.ok)throw new Error(`GitHub request failed (${r.status}); release may remain draft. Inspect Releases before retrying.`);return r.json();}
// Draft first: a failed asset upload cannot become the downloadable release.
const release=await api(`https://api.github.com/repos/${repository}/releases`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tag_name:tag,target_commitish:revision.stdout.trim(),name:tag,draft:true,body:'Combined IIS web, admin and API package. Database migrations are separate.'})});
for(const file of files)await api(`${release.upload_url.split('{')[0]}?name=${encodeURIComponent(file.name)}`,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file.bytes});
const published=await api(release.url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({draft:false})});
console.log(published.html_url);
