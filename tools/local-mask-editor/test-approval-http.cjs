const fs=require('fs'),path=require('path'),assert=require('assert'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'../..'),base=path.join(root,'services/api/App_Data/cm101-sam3-review'),pending=path.join(base,'pending/cbb1dbc9-2582-45dc-85ee-6de5fd27106c'),ref=path.join(base,'refinements/local-refinement-20261009-02');
(async()=>{const output=path.join(base,'manual-editor','TEST-ONLY-http-'+Date.now());fs.mkdirSync(output,{recursive:true});
const config={source:path.join(pending,'source.webp'),original:path.join(pending,'candidate-mask.png'),mask:path.join(ref,'refined-mask.pending.png'),branding:path.join(ref,'branding-protection.png'),sourceSha256:'f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935',output,regions:[]};
const file=path.join(output,'config.json');fs.writeFileSync(file,JSON.stringify(config));const child=spawn(process.execPath,[path.join(__dirname,'server.cjs'),file],{env:{...process.env,MASK_EDITOR_PORT:'3047'},stdio:['ignore','pipe','pipe']});let started=false;await new Promise((resolve,reject)=>{child.stdout.on('data',d=>{if(d.toString().includes('mask editor:')){started=true;resolve();}});child.on('exit',()=>{if(!started)reject(Error('Isolated test server did not start'));});});
try{const {PRODUCT,VARIANT}=require('./approved-registry.cjs'),origin='http://127.0.0.1:3047',endpoint=origin+'/api/v1/dev/cm101-approved/'+PRODUCT+'/'+VARIANT+'/rendering-inputs';
assert.equal((await(await fetch(endpoint)).json()).previewAvailable,false);
const query=new URLSearchParams({productId:PRODUCT,variantId:VARIANT,sha256:config.sourceSha256,width:'3543',height:'5315',boundariesReviewed:'true'});
const headers={Origin:origin,'Content-Type':'image/png'},png=fs.readFileSync(config.mask);
const wrong=new URLSearchParams(query);wrong.set('variantId','wrong');assert.equal((await fetch(origin+'/approve?'+wrong,{method:'POST',headers,body:png})).status,400);
const res=await fetch(origin+'/approve?'+query,{method:'POST',headers,body:png});assert.equal(res.status,200);const record=await res.json();assert.equal(record.approved,true);
const bundle=await(await fetch(endpoint)).json();assert.equal(bundle.previewAvailable,true);assert.equal(bundle.inputs.width,3543);assert.equal(bundle.inputs.height,5315);
for(const role of ['source','mask','branding']){const response=await fetch(origin+bundle.inputs[role].url);assert.equal(response.status,200);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(require('crypto').createHash('sha256').update(bytes).digest('hex'),bundle.inputs[role].sha256);}
assert.equal((await(await fetch(origin+'/api/v1/dev/cm101-approved/'+PRODUCT+'/wrong/rendering-inputs')).json()).previewAvailable,false);
assert.equal((await fetch(origin+'/approve?'+query,{method:'POST',headers:{...headers,Origin:'http://evil.test'},body:png})).status,400);
console.log('PASS: isolated HTTP approval -> validated bundle -> exact source/mask/branding bytes, wrong identities and origins blocked. No real customer mask approved.');
}finally{child.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
