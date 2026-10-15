import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,cp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd();
const commit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
const sha=commit.slice(0,7);
for(const script of ['tools/package-iis-preview.mjs','tools/package-admin-iis.mjs']){
 const result=spawnSync(process.execPath,[script],{stdio:'inherit',cwd:root});
 if(result.status!==0)process.exit(result.status||1);
}
const temporary=await mkdtemp(path.join(tmpdir(),'xinobi-combined-deploy-'));
await cp(path.join(root,'apps/web/out'),path.join(temporary,'out'),{recursive:true});
const admin=spawnSync('unzip',['-q',path.join(root,'paketler','web',`XinobiYeni-admin-${sha}.zip`),'-d',path.join(temporary,'out')],{stdio:'inherit'});
if(admin.status!==0)process.exit(admin.status||1);
await writeFile(path.join(temporary,'DEPLOY.txt'),`XINOBI — Web + Admin\nSource commit: ${commit}\n\nout/: web storefront (live SQL catalog through /api/v1/catalog/storefront) and uploaded media\nout/admin/: admin panel (same origin as the site; HTTP on the IP test server)\n\nBack up the existing deployment before replacing out. Keep the admin directory protected by its web.config.\nout/web.config proxies /api to http://localhost:8024 with IIS ARR. BEFORE replacing out: enable the ARR proxy and allow the\nHTTP_X_FORWARDED_PROTO server variable on the site (docs/runbooks/https-reverse-proxy.md), otherwise the site returns 500.\nThis package does not contain ASP.NET API, databases, user records or SMTP credentials.\nAdmin requires a configured production API at /api/v1 and a staff account. Enable AdminCatalog:Enabled on the SQL-backed production API; see docs/runbooks/live-sql-catalog.md. This archive alone does not configure the API.\nNo remote deployment was performed by creating this archive.\n`);
const packed=path.join(temporary,'deploy.zip');
const zip=spawnSync('zip',['-q','-r',packed,'out','DEPLOY.txt'],{cwd:temporary,stdio:'inherit'});
if(zip.status!==0)process.exit(zip.status||1);
await mkdir(path.join(root,'paketler','web'),{recursive:true});
const artifact=path.join(root,'paketler','web',`XinobiYeni-deploy-${sha}.zip`);
await cp(packed,artifact);
const bytes=await readFile(artifact);
console.log(JSON.stringify({artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),source:commit,web:'out/',admin:'out/admin/'},null,2));
