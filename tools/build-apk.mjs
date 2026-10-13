import {spawnSync} from 'node:child_process';
import {mkdir,cp,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
// Release APK for the test environment, copied to paketler/apk/. The name carries the commit; "-dirty" marks a build
// that includes uncommitted apps/mobile changes. Override the API with XINOBI_API_BASE_URL and the web preview origin
// with XINOBI_WEB_PREVIEW_URL.
const root=process.cwd();
const commit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
const dirty=spawnSync('git',['status','--porcelain','--','apps/mobile'],{encoding:'utf8'}).stdout.trim()!=='';
const name=`XinobiYeni-mobile-${commit.slice(0,7)}${dirty?'-dirty':''}.apk`;
const api=process.env.XINOBI_API_BASE_URL||'http://109.104.120.91:8024';
const webPreview=process.env.XINOBI_WEB_PREVIEW_URL||'';
const defines=[`--dart-define=API_BASE_URL=${api}`];
if(webPreview)defines.push(`--dart-define=XINOBI_WEB_PREVIEW_URL=${webPreview}`);
const build=spawnSync('flutter',['build','apk','--release',...defines],{cwd:path.join(root,'apps/mobile'),stdio:'inherit'});
if(build.status!==0)process.exit(build.status||1);
await mkdir(path.join(root,'paketler','apk'),{recursive:true});
const artifact=path.join(root,'paketler','apk',name);
await cp(path.join(root,'apps/mobile/build/app/outputs/flutter-apk/app-release.apk'),artifact);
const bytes=await readFile(artifact);
console.log(JSON.stringify({artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),source:commit,dirty,api},null,2));
