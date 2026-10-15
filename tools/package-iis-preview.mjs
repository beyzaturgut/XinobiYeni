import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {readCommerceSnapshot} from './commerce-snapshot-source.mjs';
import {publishProductPreviews} from './publish-product-previews.mjs';
const root=process.cwd();
const sha=spawnSync('git',['rev-parse','--short','HEAD'],{encoding:'utf8'}).stdout.trim();
// Once the local catalog is migrated, its old state.json is an archive, never a deployment source.
const state=await readCommerceSnapshot(path.join(root,'services/api/App_Data/local-commerce'));
const web=path.join(root,'apps/web');
const publicDir=path.join(web,'public');
// The live storefront must not publish or poll a stale admin-state snapshot (which can include drafts).
await rm(path.join(publicDir,'commerce-preview'),{recursive:true,force:true});
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
await map(state); // Keep packaged media copies for existing asset references; the catalog itself comes from the API.
await publishProductPreviews(root,publicDir,state);
// XINOBI U on the test server (ADR-002 Ek B); the API must list this site's origin in XinobiU:AllowedOrigins.
// Same-origin through the site's /api proxy, over HTTP (8014) or the HTTPS entry alike.
// IIS ARR forwards /api to the API site; needs ARR proxy and HTTP_X_FORWARDED_PROTO allowed (docs/runbooks/https-reverse-proxy.md).
const apiOrigin=process.env.XINOBI_API_ORIGIN||'http://localhost:8024';
const designApi=process.env.XINOBI_DESIGN_API_URL??'/api/v1/design-studio';
const build=spawnSync('pnpm',['--filter','web','build'],{stdio:'inherit',env:{...process.env,NEXT_PUBLIC_COMMERCE_API_URL:'',NEXT_PUBLIC_COMMERCE_SNAPSHOT_URL:'',NEXT_PUBLIC_CATALOG_URL:'/api/v1/catalog/storefront',NEXT_PUBLIC_DESIGN_API_URL:designApi}});
if(build.status!==0)process.exit(build.status||1);
const out=path.join(web,'out');
await writeFile(path.join(out,'web.config'),`<?xml version="1.0" encoding="utf-8"?><configuration><system.webServer><defaultDocument enabled="true"><files><clear/><add value="index.html"/></files></defaultDocument><staticContent><remove fileExtension=".webp"/><mimeMap fileExtension=".webp" mimeType="image/webp"/></staticContent><rewrite><rules><rule name="API (HTTPS)" stopProcessing="true"><match url="^api/(.*)"/><conditions><add input="{HTTPS}" pattern="^on$"/></conditions><serverVariables><set name="HTTP_X_FORWARDED_HOST" value="{HTTP_HOST}"/><set name="HTTP_X_FORWARDED_PROTO" value="https"/></serverVariables><action type="Rewrite" url="${apiOrigin}/api/{R:1}"/></rule><rule name="API (HTTP)" stopProcessing="true"><match url="^api/(.*)"/><serverVariables><set name="HTTP_X_FORWARDED_HOST" value="{HTTP_HOST}"/><set name="HTTP_X_FORWARDED_PROTO" value="http"/></serverVariables><action type="Rewrite" url="${apiOrigin}/api/{R:1}"/></rule></rules></rewrite></system.webServer></configuration>`);
await mkdir(path.join(root,'paketler','web'),{recursive:true});
const artifact=path.join(root,'paketler','web',`XinobiYeni-web-${sha}.zip`);
const zip=spawnSync('zip',['-q','-r',artifact,'out'],{cwd:web,stdio:'inherit'});if(zip.status!==0)process.exit(zip.status||1);
const bytes=await readFile(artifact);console.log(JSON.stringify({artifact,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),source:sha},null,2));
