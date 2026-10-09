const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..');
const sharp=require(path.join(root,'node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const base=path.join(root,'services/api/App_Data/cm101-sam3-review');
const pending=path.join(base,'pending/cbb1dbc9-2582-45dc-85ee-6de5fd27106c');
const config=process.argv[2]?JSON.parse(fs.readFileSync(path.resolve(process.argv[2]),'utf8')):{
 source:path.join(pending,'source.webp'),original:path.join(pending,'candidate-mask.png'),
 mask:path.join(base,'refinements/local-refinement-20261009-02/refined-mask.pending.png'),
 branding:path.join(base,'refinements/local-refinement-20261009-02/branding-protection.png'),
 sourceSha256:'f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935',
 output:path.join(base,'manual-editor'),regions:[
 {name:'Sol halka',x:630,y:3970,width:170,height:750},{name:'Sağ halka / sap',x:2300,y:3930,width:220,height:790},
 {name:'Emzik',x:650,y:2150,width:220,height:850},{name:'Logo',x:1200,y:3700,width:750,height:700}]};
const port=Number(process.env.MASK_EDITOR_PORT||3045);
const adminOrigin=process.env.MASK_EDITOR_ADMIN_ORIGIN||'http://127.0.0.1:5176';
const adminUrl=new URL(adminOrigin);
if(adminUrl.protocol!=='http:'||!['127.0.0.1','localhost'].includes(adminUrl.hostname)||adminUrl.origin!==adminOrigin)throw Error('Invalid local Admin origin');
config.productId ||= 'DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6';
config.variantId ||= 'DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1';
async function decode(b){return sharp(b,{limitInputPixels:40000000}).ensureAlpha().raw().toBuffer({resolveWithObject:true});}
async function init(){
 const bytes={};for(const k of ['source','original','mask','branding'])bytes[k]=fs.readFileSync(config[k]);
 if(hash(bytes.source)!==config.sourceSha256)throw Error('Source checksum mismatch');
 const raw={};for(const k of Object.keys(bytes))raw[k]=await decode(bytes[k]);
 const {width,height}=raw.source.info;
 for(const k of Object.keys(raw))if(raw[k].info.width!==width||raw[k].info.height!==height)throw Error('Image dimensions mismatch');
 function validate(d){if(d.info.width!==width||d.info.height!==height)throw Error('Mask dimensions mismatch');for(let i=3;i<d.data.length;i+=4){
 const a=d.data[i];if(a!==0&&a!==255)throw Error('Mask alpha must be binary');
 if(a>raw.original.data[i])throw Error('Mask expansion outside original candidate');
 if(a&&raw.branding.data[i])throw Error('Branding overlaps mask');
 }}
 validate(raw.mask);
 const approvals=require('./approved-registry.cjs').registry({root,sharp,config,validate:async png=>{
 for(const k of Object.keys(bytes))if(hash(fs.readFileSync(config[k]))!==hash(bytes[k]))throw Error('Review input changed');
 const d=await decode(png);validate(d);
 let count=0;for(let i=3;i<d.data.length;i+=4)if(d.data[i])count++;if(!count)throw Error('Empty mask');
 }});
 const originals=Object.fromEntries(Object.keys(bytes).map(k=>[k,hash(bytes[k])]));
 const server=http.createServer(async(req,res)=>{
 try{
 if(req.headers.host!==`127.0.0.1:${port}`)throw Error('Invalid host');
 if(req.headers.origin&&req.headers.origin!==`http://127.0.0.1:${port}`)throw Error('Invalid origin');
 if(req.headers['sec-fetch-site']==='cross-site' && !(req.method==='GET' && req.headers['sec-fetch-dest']==='iframe'))throw Error('Cross-site blocked');
 const apiUrl=new URL(req.url,'http://127.0.0.1:'+port);
 const apiMatch=apiUrl.pathname.match(/^\/api\/v1\/dev\/cm101-approved\/([^/]+)\/([^/]+)\/rendering-inputs\/?$/);
 if(req.method==='GET'&&apiMatch){
 const product=decodeURIComponent(apiMatch[1]),variant=decodeURIComponent(apiMatch[2]),accepted=await approvals.read(product,variant);
 const input=accepted?{surfaceVersion:accepted.record.maskSha256,sourceMediaVersion:'cm101:'+accepted.record.sourceSha256,width:3543,height:5315,source:{url:'/api/v1/dev/cm101-approved/media/'+accepted.record.version+'/source?v='+accepted.record.sourceSha256,sha256:accepted.record.sourceSha256},mask:{url:'/api/v1/dev/cm101-approved/media/'+accepted.record.version+'/mask?v='+accepted.record.maskSha256,sha256:accepted.record.maskSha256},brandingRequired:true,branding:{url:'/api/v1/dev/cm101-approved/media/'+accepted.record.version+'/branding?v='+accepted.record.brandingSha256,sha256:accepted.record.brandingSha256}}:null;
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify({scope:'development-preview',productReference:product,variantReference:variant,previewAvailable:!!accepted,inputs:input}));
 }
 const mediaMatch=apiUrl.pathname.match(/^\/api\/v1\/dev\/cm101-approved\/media\/([a-f0-9-]{36})\/(source|mask|branding)$/);
 if(req.method==='GET'&&mediaMatch){
 const {PRODUCT,VARIANT}=require('./approved-registry.cjs'),accepted=await approvals.read(PRODUCT,VARIANT),role=mediaMatch[2];
 if(!accepted||accepted.record.version!==mediaMatch[1]||apiUrl.searchParams.get('v')!==hash(accepted[role])){res.statusCode=404;return res.end();}
 res.setHeader('Content-Type',role==='source'?'image/webp':'image/png');res.setHeader('Cache-Control','no-store');return res.end(accepted[role]);
 }
 if(req.method==='POST'&&apiUrl.pathname==='/approve'){
 if(req.headers.origin!=='http://127.0.0.1:'+port||req.headers['content-type']!=='image/png')throw Error('Approval origin/type rejected');
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>24000000)throw Error('Mask too large');chunks.push(c);}
 const record=await approvals.approve(Buffer.concat(chunks),Object.fromEntries(apiUrl.searchParams));
 res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({approved:true,version:record.version}));
 }
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'self' "+adminOrigin);
 if(req.method==='GET'&&req.url==='/config'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({width,height,productId:config.productId,variantId:config.variantId,sourceSha256:config.sourceSha256,regions:config.regions||[]}));}
 if(req.method==='GET'&&/^\/(source|original|mask|branding)$/.test(req.url)){const k=req.url.slice(1);res.setHeader('Content-Type',k==='source'?'image/webp':'image/png');return res.end(bytes[k]);}
 const requested=new URL(req.url,'http://127.0.0.1:'+port);
 if(requested.pathname==='/' && requested.search){
 const expected={productId:config.productId,variantId:config.variantId,sha256:config.sourceSha256,width:String(width),height:String(height)};
 for(const [key,value] of Object.entries(expected))if(requested.searchParams.getAll(key).length!==1||requested.searchParams.get(key)!==value)throw Error('Selected catalog source does not match local candidate');
 req.url='/';
 }
 if(req.method==='GET'&&['/','/editor.js','/editor.css'].includes(req.url)){const file=req.url==='/'?'index.html':req.url.slice(1);res.setHeader('Content-Type',file.endsWith('js')?'text/javascript':file.endsWith('css')?'text/css':'text/html');return res.end(fs.readFileSync(path.join(__dirname,file)));}
 if(req.method==='POST'&&req.url==='/save'){
 if(req.headers.origin!==`http://127.0.0.1:${port}`||req.headers['content-type']!=='image/png')throw Error('Save origin/type rejected');
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>24000000)throw Error('Export too large');chunks.push(c);}
 for(const k of Object.keys(bytes))if(hash(fs.readFileSync(config[k]))!==originals[k])throw Error('Input changed; restart editor');
 const png=Buffer.concat(chunks),d=await decode(png);validate(d);
 const id=new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomUUID();
 const staging=path.join(config.output,'.pending-'+id),dest=path.join(config.output,id);
 fs.mkdirSync(staging,{recursive:true});
 fs.writeFileSync(path.join(staging,'mask.pending.png'),png,{flag:'wx'});
 fs.writeFileSync(path.join(staging,'branding-protection.png'),bytes.branding,{flag:'wx'});
 const overlay=Buffer.alloc(width*height*4);
 for(let i=0;i<overlay.length;i+=4){if(d.data[i+3]){overlay[i]=0;overlay[i+1]=180;overlay[i+2]=255;overlay[i+3]=95;}if(raw.branding.data[i+3]){overlay[i]=255;overlay[i+1]=180;overlay[i+2]=0;overlay[i+3]=150;}}
 const review=await sharp(bytes.source).composite([{input:overlay,raw:{width,height,channels:4}}]).png().toBuffer();
 fs.writeFileSync(path.join(staging,'review-full-resolution.png'),review,{flag:'wx'});
 for(let n=0;n<(config.regions||[]).length;n++){const r=config.regions[n];if(r.x<0||r.y<0||r.x+r.width>width||r.y+r.height>height)throw Error('Invalid review region');await sharp(review).extract({left:r.x,top:r.y,width:r.width,height:r.height}).png().toFile(path.join(staging,'closeup-'+n+'.png'));}
 fs.writeFileSync(path.join(staging,'validation.json'),JSON.stringify({status:'pending-manual-review',productId:config.productId,variantId:config.variantId,width,height,sourceSha256:config.sourceSha256,maskSha256:hash(png),inputs:originals,expansionPixels:0,brandingOverlap:0,approved:false},null,2),{flag:'wx'});
 fs.renameSync(staging,dest);res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({directory:dest}));
 }
 res.statusCode=404;res.end('Not found');
 }catch(e){res.statusCode=400;res.end(e.message);}
 });
 server.listen(port,'127.0.0.1',()=>console.log(`Development-only mask editor: http://127.0.0.1:${port}`));
}
init().catch(e=>{console.error(e.message);process.exitCode=1});
