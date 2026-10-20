import {spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,cp,writeFile,readFile,readdir,rm,realpath,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
// Publishes the committed API (a clean worktree of HEAD, so local data, appsettings.Local.json and uncommitted work stay out)
// for IIS with the ASP.NET Core Hosting Bundle. Production reads the catalogue from SQL Server; credentials stay on the server.
const root=process.cwd();
const commit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
const sha=commit.slice(0,7);
// The site's public origin. The IP test server is served over HTTP on 8014; its /api proxies to this API through IIS ARR
// (docs/runbooks/https-reverse-proxy.md). The self-signed HTTPS entry stays as a secondary origin.
const publicOrigin=process.env.XINOBI_PUBLIC_ORIGIN||'http://109.104.120.91:8014';
const httpsOrigin=process.env.XINOBI_HTTPS_ORIGIN||'https://109.104.120.91';
const assetBaseUrl=process.env.XINOBI_ASSET_BASE_URL||publicOrigin;
const publicIsHttps=new URL(publicOrigin).protocol==='https:';
// XINOBI U on the test server (ADR-002 Ek B). Sessions and images live outside the api folder so a redeploy keeps them.
const designDataDirectory=process.env.XINOBI_DESIGN_DATA_DIRECTORY||'C:\\inetpub\\wwwroot\\XinobiYeniApi\\data';
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
 await writeFile(path.join(output,'appsettings.Production.json'),JSON.stringify({Catalog:{StorageProvider:"SqlServer",AssetBaseUrl:assetBaseUrl},AdminCatalog:{RequireHttps:publicIsHttps},Admin:{PublicOrigin:publicOrigin},ReverseProxy:{Enabled:true,AllowedHosts:[...new Set([new URL(publicOrigin).hostname,new URL(httpsOrigin).hostname])]},XinobiU:{Enabled:true,AllowedOrigins:[...new Set([publicOrigin,assetBaseUrl,httpsOrigin])]},DesignStudio:{DataDirectory:designDataDirectory,DailyGenerationLimit:30}},null,2)+'\n');
 // One-command install that keeps the server-only settings outside the api folder (tools/install-api-iis.ps1).
 await cp(path.join(source,'tools/install-api-iis.ps1'),path.join(temporary,'install-api.ps1'));
 await writeFile(path.join(temporary,'DEPLOY.txt'),`XINOBI — API (IIS)\nSource commit: ${commit}\n\nKurulum (sunucuda, yönetici PowerShell, ZIP'i açtığınız klasörde):\n  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\\install-api.ps1 -WhatIf\n  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\\install-api.ps1\n\nSunucuya özel ayarlar (SQL, admin katalog, depolama, e-posta, anahtarlar) C:\\XinobiData\\config\\appsettings.Server.json içindedir ve api klasörünün dışında kalır;\nbetik ilk kurulumda bunları mevcut api klasöründen oraya kopyalar. api/appsettings.Production.json yalnız paket varsayılanlarıdır ve sunucu dosyası onu ezer.\nEski api klasörü silinmez, api-previous-<tarih> adıyla saklanır.\n\nApi klasörü: ASP.NET Core API (net10.0, framework-dependent). Requires the .NET 10 ASP.NET Core Hosting Bundle on the server.\nPublic origin: ${publicOrigin}.\nNo database, user records, API keys or SMTP credentials are included. No remote deployment was performed by creating this archive.\n`);
 await mkdir(path.join(root,'paketler','mobil'),{recursive:true});
 const artifact=path.join(root,'paketler','mobil',`XinobiYeni-api-${sha}.zip`);
 const packed=path.join(temporary,'api.zip');
 run('zip',['-q','-r',packed,'api','install-api.ps1','DEPLOY.txt'],{cwd:temporary});
 await cp(packed,artifact);
 const bytes=await readFile(artifact);
 console.log(JSON.stringify({artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),source:commit,catalogStorageProvider:"SqlServer",publicOrigin,assetBaseUrl,designDataDirectory},null,2));
}finally{
 run('git',['worktree','remove','--force',source]);
}
