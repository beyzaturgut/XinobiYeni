import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,cp,writeFile,readFile,readdir,rm,realpath,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
// Publishes the committed API (a clean worktree of HEAD, so local data, appsettings.Local.json and uncommitted work stay out)
// for IIS with the ASP.NET Core Hosting Bundle. Production reads the catalogue snapshot the web package deploys.
const root=process.cwd();
const commit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
const sha=commit.slice(0,7);
const snapshotPath=process.env.XINOBI_CATALOG_SNAPSHOT_PATH||'C:\\inetpub\\wwwroot\\XinobiYeni\\out\\commerce-preview\\state.json';
const assetBaseUrl=process.env.XINOBI_ASSET_BASE_URL||'http://109.104.120.91:8014';
// Resolve the macOS /var → /private/var link: NuGet otherwise sees two paths for the worktree and drops the
// Persistence project's packages (EF Core) from the publish output.
const temporary=await realpath(await mkdtemp(path.join(tmpdir(),'xinobi-api-package-')));
const source=path.join(temporary,'source');
const run=(command,args,options={})=>{const result=spawnSync(command,args,{stdio:'inherit',...options});if(result.status!==0)throw new Error(`${command} ${args[0]} failed (${result.status})`);};
run('git',['worktree','add','--detach',source,commit]);
try{
 const output=path.join(temporary,'api');
 run('dotnet',['publish',path.join(source,'services/api/Xinobi.Api.csproj'),'-c','Release','-o',output,'-p:OpenApiGenerateDocumentsOnBuild=false']);
 await access(path.join(output,'Microsoft.EntityFrameworkCore.SqlServer.dll')).catch(()=>{throw new Error('Publish output is missing EF Core; refusing to package an API that cannot start.');});
 for(const name of await readdir(output))if(/^appsettings\.(Development|Local).*\.json$/.test(name))await rm(path.join(output,name));
 await rm(path.join(output,'App_Data'),{recursive:true,force:true});
 await writeFile(path.join(output,'appsettings.Production.json'),JSON.stringify({Catalog:{SnapshotPath:snapshotPath,AssetBaseUrl:assetBaseUrl}},null,2)+'\n');
 await writeFile(path.join(temporary,'DEPLOY.txt'),`XINOBI — API (IIS)\nSource commit: ${commit}\n\napi/: ASP.NET Core API (net10.0, framework-dependent). Requires the .NET 10 ASP.NET Core Hosting Bundle on the server.\nCopy the contents of api/ into the IIS site's physical path; the generated web.config starts the app through AspNetCoreModuleV2.\nThe application pool should use "No Managed Code".\n\nCatalog: read-only from ${snapshotPath}\n(the snapshot the web package deploys), media from ${assetBaseUrl}. Change appsettings.Production.json if those differ.\nAccounts, cart persistence, admin writes and AI design are not available in this package: they need the SQL Server store.\nNo database, user records, API keys or SMTP credentials are included. No remote deployment was performed by creating this archive.\n`);
 await mkdir(path.join(root,'paketler','mobil'),{recursive:true});
 const artifact=path.join(root,'paketler','mobil',`XinobiYeni-api-${sha}.zip`);
 const packed=path.join(temporary,'api.zip');
 run('zip',['-q','-r',packed,'api','DEPLOY.txt'],{cwd:temporary});
 await cp(packed,artifact);
 const bytes=await readFile(artifact);
 console.log(JSON.stringify({artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),source:commit,snapshotPath,assetBaseUrl},null,2));
}finally{
 run('git',['worktree','remove','--force',source]);
}
