import {spawnSync} from 'node:child_process';
import {mkdtemp, readFile, writeFile, cp, mkdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
const run=(cmd,args,options={})=>{const r=spawnSync(cmd,args,{encoding:'utf8',...options});if(r.status!==0)throw new Error(`${cmd} failed: ${r.stderr||r.status}`);return r.stdout?.trim();};
if(run('git',['status','--porcelain','--untracked-files=normal']))throw new Error('Commit all source changes before packaging a release.');
const commit=run('git',['rev-parse','HEAD']);
const sha=commit.slice(0,7);
for(const script of ['tools/package-deploy.mjs','tools/package-api-iis.mjs'])run(process.execPath,[script],{stdio:'inherit'});
const dir=await mkdtemp(path.join(tmpdir(),'xinobi-release-'));
try {
 run('unzip',['-q',path.resolve(`paketler/web/XinobiYeni-deploy-${sha}.zip`),'-d',dir]);
 run('unzip',['-q',path.resolve(`paketler/mobil/XinobiYeni-api-${sha}.zip`),'api/*','-d',dir]);
 await cp('tools/deploy-release.ps1',path.join(dir,'deploy-release.ps1'));
 await writeFile(path.join(dir,'release.json'),JSON.stringify({commit},null,2));
 const output=path.resolve('paketler/releases',`xinobi-${sha}`);
 await mkdir(output,{recursive:true});
 run('zip',['-q','-r',path.join(output,'xinobi.zip'),'out','api','release.json','deploy-release.ps1'],{cwd:dir});
 const bytes=await readFile(path.join(output,'xinobi.zip'));
 await writeFile(path.join(output,'xinobi.zip.sha256'),createHash('sha256').update(bytes).digest('hex')+'\n');
 await cp('tools/deploy-release.ps1',path.join(output,'deploy-release.ps1'));
 console.log(`Release prepared: ${output}\nPublish: node tools/publish-release.mjs xinobi-${sha}`);
} finally {await rm(dir,{recursive:true,force:true});}
