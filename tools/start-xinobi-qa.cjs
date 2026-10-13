// D: only; no builds, installs, paid requests or process termination.
const fs=require('fs'),path=require('path'),net=require('net'),crypto=require('crypto'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function plan(root,cloudflare=false,roboflow=false,checkpoint=false){
 const api=path.join(root,'services/api/App_Data/integration-runtime/catalog-generic-api/Xinobi.Api.dll');
 const content=path.join(root,'services/api/App_Data/questionnaire-preview-api');
 const runtime=path.join(root,'services/api/App_Data/integration-runtime');
 const checkpointDirectory=checkpoint==='catalog'?'services/api/App_Data/personalization-checkpoint-demo':'services/api/App_Data/cm101-checkpoint-demo';
 const real=path.join(root,checkpoint?checkpointDirectory+'/catalog':'services/api/App_Data/real-catalog-qa');
 const design=path.join(root,'services/api/App_Data/questionnaire-preview-sessions');
 const apiEnv={ASPNETCORE_ENVIRONMENT:'Development',ASPNETCORE_CONTENTROOT:content,DOTNET_ENVIRONMENT:'Development'};
 const common=['--ProductSurfaces:ExperimentalCatalogWorkspace:Enabled=false','--ProductSurfaces:Segmentation:Provider=reference','--ProductSurfaces:Segmentation:ExternalInferenceEnabled=false','--ProductSurfaces:Segmentation:SingleAutomaticSmokeEnabled=false','--ProductSurfaces:Segmentation:SingleInteractiveSmokeEnabled=false','--ProductSurfaces:Segmentation:CatalogAutomatic:Enabled=false','--ProductSurfaces:Segmentation:CatalogAutomatic:RealAttemptEnabled=false','--ProductSurfaces:Roboflow:DailyLimit=0','--DesignStudio:DisableGenerationLimit=true','--Email:DeliveryMode=Preview','--Logging:EventLog:LogLevel:Default=None','--Logging:LogLevel:System.Net.Http.HttpClient=None'];
 function apiService(name,ports,data,worker,review){return {name,ports,exe:'dotnet',cwd:root,args:[api,...common,'--urls='+ports.map(p=>'http://127.0.0.1:'+p).join(';'),'--LocalCommerce:DataDirectory='+data,'--DesignStudio:DataDirectory='+(worker?design:review?path.join(data,'design-studio'):path.join(runtime,'catalog-unused-sessions')),'--DesignStudio:WorkerEnabled='+worker,'--DesignStudio:ExternalInferenceEnabled='+worker,'--ProductSurfaces:DevelopmentReview:Enabled='+review,'--ProductSurfaces:DevelopmentReview:RepositoryRoot='+root,'--ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled='+review,'--ProductSurfaces:DevelopmentStorefrontPreview:Enabled='+review,'--ProductSurfaces:DevelopmentStorefrontPreview:RepositoryRoot='+root],env:apiEnv,health:'http://127.0.0.1:'+ports[0]+(review?'/api/v1/admin/dev/product-surfaces/tea-maker-101-blue/review':'/api/v1/local-commerce/state')};}
 // The real session directory is shared by offline and enabled modes; never reset daily usage.
 const designApi=apiService('design-api',[5020],real,cloudflare,false);
 const directoryIndex=designApi.args.findIndex(a=>a.startsWith('--DesignStudio:DataDirectory='));designApi.args[directoryIndex]='--DesignStudio:DataDirectory='+design;
 if(roboflow) {
  for(const [key,value] of Object.entries({'ProductSurfaces:Segmentation:Provider':'roboflow','ProductSurfaces:Segmentation:ExternalInferenceEnabled':'true','ProductSurfaces:DevelopmentReview:Enabled':'true','ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled':'false','ProductSurfaces:Cm101Candidate:Enabled':'true','ProductSurfaces:Cm101AdminAutomatic:Enabled':'true','ProductSurfaces:CatalogCandidate:Enabled':'true'})) {
    const prefix='--'+key+'=',i=designApi.args.findIndex(a=>a.startsWith(prefix)); if(i>=0)designApi.args[i]=prefix+value;else designApi.args.push(prefix+value);
  }
 }
 return [apiService('demo-api',[5013,5003],path.join(runtime,'demo-renderer-check'),false,true),apiService('catalog-api',[5019],real,false,false),designApi,
 {name:'design-proxy',ports:[5021],exe:process.execPath,cwd:root,args:['tools/questionnaire-preview-proxy.cjs'],env:{DESIGN_STUDIO_PREVIEW_GENERATION_ENABLED:String(cloudflare)},health:'http://127.0.0.1:5021/api/v1/design-studio/status'},
 {name:'mask-editor',ports:[3046],exe:process.execPath,cwd:root,args:['tools/local-mask-editor/server.cjs',...(checkpoint?[path.join(root,checkpointDirectory,'editor-config.json')]:[])],env:{MASK_EDITOR_PORT:'3046',MASK_EDITOR_ADMIN_ORIGIN:'http://127.0.0.1:5176'},health:'http://127.0.0.1:3046/config'},
 {name:'admin',ports:[5176],exe:process.execPath,cwd:path.join(root,'apps/admin'),args:['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5176','--strictPort'],env:{XINOBI_QA_MODE:'true',PRODUCT_SURFACES_API_URL:'http://127.0.0.1:5013',PRODUCT_SURFACES_CATALOG_API_URL:'http://127.0.0.1:5019',VITE_COMMERCE_API_URL:'/api/v1/local-commerce',VITE_PRODUCT_SURFACES_CATALOG_API_URL:'/api/v1/local-commerce'},health:'http://127.0.0.1:5176/'},
  {name:'web',ports:[3032],exe:process.execPath,cwd:path.join(root,'apps/web'),args:['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3032'],env:{PRODUCT_SURFACES_DEV_PREVIEW_PROXY:'true',PRODUCT_SURFACES_DEV_PREVIEW_API_PORT:'5013',PRODUCT_SURFACES_XINOBI_U_API_PORT:'5020',NEXT_PUBLIC_COMMERCE_API_URL:'/api/v1/local-commerce',NEXT_PUBLIC_DESIGN_API_URL:'/api/v1/design-studio'},health:'http://127.0.0.1:3032/xinobi-u/'}];
}
function inspectSessions(file){
 if(!fs.existsSync(file))return {pending:0,usedToday:0};
 let state;try{state=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}catch{throw Error('Corrupt design session state; worker must remain off');}
 if(!state||!state.sessions||typeof state.sessions!=='object'||Array.isArray(state.sessions))throw Error('Unknown design session state; worker must remain off');
 let pending=0,usedToday=0;for(const s of Object.values(state.sessions)){
  if(!s||!['questionnaire','queued','running','ready','failed'].includes(s.status))throw Error('Unknown design session status');
  if(['queued','running'].includes(s.status))pending++;
  if(s.startedAt){if(!Number.isFinite(Date.parse(s.startedAt)))throw Error('Invalid generation timestamp');if(new Date(s.startedAt).toISOString().slice(0,10)===new Date().toISOString().slice(0,10))usedToday++;}
 }return {pending,usedToday};
}
async function checkPorts(services,probe=port=>new Promise(resolve=>{const s=net.createServer();s.once('error',()=>resolve(false));s.listen({host:'127.0.0.1',port,exclusive:true},()=>s.close(()=>resolve(true)));})){
 const busy=[];for(const s of services)for(const port of s.ports)if(!await probe(port))busy.push(port);
 if(busy.length)throw Error('Ports already in use: '+busy.join(', ')+'. No process stopped or started. Keep existing services; do not terminate unknown processes.');
}
function requiredFiles(root){return ['services/api/App_Data/integration-runtime/catalog-generic-api/Xinobi.Api.dll','services/api/DesignStudio/question-bank.json','services/api/LocalCommerce/seed.json','apps/web/node_modules/next/dist/bin/next','apps/admin/node_modules/vite/bin/vite.js','services/api/App_Data/real-catalog-qa/state.json','services/api/App_Data/cm101-sam3-review/pending/cbb1dbc9-2582-45dc-85ee-6de5fd27106c/source.webp','services/api/App_Data/cm101-sam3-review/refinements/local-refinement-20261009-02/refined-mask.pending.png','services/api/App_Data/cm101-sam3-review/refinements/local-refinement-20261009-02/branding-protection.png'].map(f=>path.join(root,f));}
function inspectCatalog(root,checkpoint=false){
 const base=path.join(root,checkpoint?(checkpoint==='catalog'?'services/api/App_Data/personalization-checkpoint-demo/catalog':'services/api/App_Data/cm101-checkpoint-demo/catalog'):'services/api/App_Data/real-catalog-qa'),state=JSON.parse(fs.readFileSync(path.join(base,'state.json'),'utf8').replace(/^\uFEFF/,''));
 if(!Array.isArray(state.products))throw Error('Invalid catalog');
 const variants=state.products.flatMap(p=>p.variants);
 if(new Set(state.products.map(p=>p.id)).size!==state.products.length||new Set(variants.map(v=>v.id)).size!==variants.length)throw Error('Duplicate catalog identities');
 const media=new Set();function visit(v){if(typeof v==='string'&&v.startsWith('/api/v1/local-commerce/media/')){if(!/^\/api\/v1\/local-commerce\/media\/[a-f0-9]{32}\.(png|jpg|webp|mp4|webm)$/.test(v))throw Error('Invalid local media reference');media.add(path.basename(v));}else if(v&&typeof v==='object')Object.values(v).forEach(visit);}visit(state);
 for(const file of media)if(!fs.statSync(path.join(base,'media',file)).isFile())throw Error('Missing catalog media');
 const product=state.products.find(p=>p.id==='DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6'),variant=product?.variants.find(v=>v.id==='DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1');
 if(!product?.active||product.personalizable!==true||variant?.image!=='/api/v1/local-commerce/media/01b20091ecaa4fbb86a9a929bf7b56ee.webp'||hash(fs.readFileSync(path.join(base,'media/01b20091ecaa4fbb86a9a929bf7b56ee.webp')))!=='f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935')throw Error('CM101 exact source mismatch');
 return {products:state.products.length,variants:variants.length,media:media.size};
}
function prepareContent(root){
 const base=path.join(root,'services/api/App_Data/questionnaire-preview-api');
 if(fs.existsSync(path.join(base,'appsettings.Local.json')))throw Error('Isolated API content root has local settings; refusing startup');
 const copies=[['DesignStudio/question-bank.json','DesignStudio/question-bank.json'],['LocalCommerce/seed.json','LocalCommerce/seed.json']];
 for(const [src,dest]of copies){const from=path.join(root,'services/api',src),to=path.join(base,dest);if(fs.existsSync(to)&&hash(fs.readFileSync(to))!==hash(fs.readFileSync(from)))throw Error('Isolated content differs: '+dest);}
 for(const [src,dest]of copies){const to=path.join(base,dest);if(!fs.existsSync(to)){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(path.join(root,'services/api',src),to,fs.constants.COPYFILE_EXCL);}}
}
async function waitReady(service,child,fetcher=fetch){
 const until=Date.now()+90000;while(Date.now()<until){if(child.exitCode!==null&&child.exitCode!==undefined)throw Error(service.name+' exited; inspect its local log');try{const r=await fetcher(service.health,{redirect:'error',signal:AbortSignal.timeout(2000)});if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,250));}throw Error(service.name+' not ready; inspect its local log');
}
async function main(){
 const args=process.argv.slice(2);if(args.some(a=>!['--cloudflare','--roboflow','--check','--checkpoint-demo','--catalog-checkpoint'].includes(a)))throw Error('Use node tools/start-xinobi-qa.cjs [--cloudflare] [--check]');
 if(ROOT.toLowerCase()!=='d:\\xinobiyeni-integration')throw Error('Only D:\\XinobiYeni-integration may be used');
 const cloudflare=args.includes('--cloudflare'),checkpoint=args.includes('--catalog-checkpoint')?'catalog':args.includes('--checkpoint-demo'),services=plan(ROOT,cloudflare,args.includes('--roboflow'),checkpoint);
 if(checkpoint&&args.includes('--roboflow'))throw Error('Checkpoint demo is for existing accepted assets; no new segmentation authorization');
 // All preflight checks run before any process is started.
 await checkPorts(services);
 const disk=fs.statfsSync(ROOT);if(disk.bavail*disk.bsize<256*1024*1024)throw Error('D: needs at least 256 MiB free; no installs/builds performed');
 for(const f of (checkpoint?requiredFiles(ROOT).filter(f=>!f.includes('real-catalog-qa')&&!f.includes('cm101-sam3-review')).concat(path.join(ROOT,checkpoint==='catalog'?'services/api/App_Data/personalization-checkpoint-demo/editor-config.json':'services/api/App_Data/cm101-checkpoint-demo/editor-config.json')):requiredFiles(ROOT)))if(!fs.existsSync(f))throw Error('Missing local prerequisite: '+path.relative(ROOT,f)+'; no install/build performed');
 const jobs=inspectSessions(path.join(ROOT,'services/api/App_Data/questionnaire-preview-sessions/sessions.json'));
 if(cloudflare&&jobs.pending)throw Error('Queued/running design jobs found; refusing worker activation. Nothing reset.');
 let secret={};const secretFile=path.join(process.env.APPDATA||'', 'Microsoft/UserSecrets/52dbd78d-32be-4e05-b699-88c656b45b75/secrets.json');
 if(fs.existsSync(secretFile)){try{secret=JSON.parse(fs.readFileSync(secretFile,'utf8').replace(/^\uFEFF/,''));}catch{throw Error('User Secrets configuration unreadable; no values displayed');}}
 const present=key=>typeof secret[key]==='string'&&secret[key].trim().length>0;
 if(cloudflare&&(!(present('Cloudflare:AccountId')||process.env.Cloudflare__AccountId||process.env.CLOUDFLARE_ACCOUNT_ID)||!(present('Cloudflare:ApiToken')||process.env.Cloudflare__ApiToken||process.env.CLOUDFLARE_API_TOKEN)))throw Error('Cloudflare credential prerequisite missing; no services started');
 if(args.includes('--roboflow')&&!(present('ProductSurfaces:Segmentation:Roboflow:ApiKey')||process.env.ProductSurfaces__Segmentation__Roboflow__ApiKey))throw Error('Roboflow credential prerequisite missing; no services started');
 const catalog=inspectCatalog(ROOT,checkpoint);
 console.log('Preflight: '+JSON.stringify({catalog,cloudflare,utcGenerationsToday:jobs.usedToday,roboflow:args.includes('--roboflow')}));
 if(args.includes('--check'))return;
 prepareContent(ROOT);
 const logs=path.join(ROOT,'services/api/App_Data/integration-runtime/unified-qa');fs.mkdirSync(logs,{recursive:true});
 const records=[];let failed=false;
 for(const service of services){
  const log=fs.openSync(path.join(logs,service.name+'.log'),'a');
  const child=spawn(service.exe,service.args,{cwd:service.cwd,env:{...process.env,...service.env},windowsHide:true,stdio:['ignore',log,log]});fs.closeSync(log);
  records.push({name:service.name,pid:child.pid,ports:service.ports});
  fs.writeFileSync(path.join(logs,'processes.json'),JSON.stringify({launcherPid:process.pid,root:ROOT,startedAt:new Date().toISOString(),cloudflare,processes:records},null,2));
  child.on('error',()=>{failed=true;console.error(service.name+' could not start. No other process automatically stopped.');});
  child.on('exit',code=>{if(!failed){failed=true;console.error(service.name+' exited ('+code+'). Remaining services were not automatically stopped.');}});
  await waitReady(service,child);console.log('Ready: '+service.name+' '+service.health);
 }
 if(cloudflare){const status=await (await fetch('http://127.0.0.1:5020/api/v1/design-studio/status')).json();if(status.configured!==true)console.error('Cloudflare credentials missing/invalid locally; AI button stays disabled. Configure User Secrets without displaying values.');}
 console.log('Admin http://127.0.0.1:5176/ | Web http://127.0.0.1:3032/xinobi-u/');
 console.log('Cloudflare '+(cloudflare?'enabled on explicit UI click; application daily generation limit disabled; usage retained':'OFF; use --cloudflare after consent')+'. Roboflow '+(args.includes('--roboflow')?'explicit CM101 Admin click only':'OFF')+'. No generation requested by launcher.');

 console.log('Logs and owned PIDs: '+logs+'; do not close this terminal while using QA.');
}
module.exports={plan,inspectSessions,checkPorts,inspectCatalog,prepareContent,requiredFiles,waitReady};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
