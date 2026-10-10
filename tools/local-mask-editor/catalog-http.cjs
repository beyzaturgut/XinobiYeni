const fs=require('fs'),path=require('path');
function createCatalogHttp({root,sharp,port,adminOrigin,legacyRead=null,registry=require('./catalog-registry.cjs').createRegistry({root,sharp})}){
 const prefix='/api/v1/dev/catalog-surfaces/';
 const families=require('./family-registry.cjs').createFamilyRegistry({registry,sharp,legacyRead});
 const selection=require('./mask-selection.cjs').createMaskSelection({registry,sharp,legacyRead});
 const reviewChecks=require('./review-checks.cjs').checks(registry);
 const send=(res,value,status=200)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(value));};
 async function body(req){let size=0,parts=[];for await(const b of req){size+=b.length;if(size>32000000)throw Error('Dosya sınırı aşıldı.');parts.push(b);}return JSON.parse(Buffer.concat(parts).toString());}
 return async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1:'+port);if(!u.pathname.startsWith(prefix)&&!u.pathname.startsWith('/catalog-editor/'))return false;
 try{
 if(req.headers.host!=='127.0.0.1:'+port||!['127.0.0.1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))throw Error('Yalnızca localhost erişimi.');
 const origin=req.headers.origin;if(origin&&origin!==adminOrigin&&origin!=='http://127.0.0.1:'+port&&!(origin==='http://127.0.0.1:3032'&&req.method==='POST'&&u.pathname.endsWith('/review-check')))throw Error('Origin reddedildi.');
 if(req.method==='POST'&&(!origin||req.headers['content-type']!=='application/json'))throw Error('Açık yerel işlem gerekli.');
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'self' "+adminOrigin);
 if(req.method==='GET'&&u.pathname===prefix+'mask-selection-capabilities'){send(res,{multipleMasks:true,maxResults:8});return true;}
 const parts=u.pathname.split('/').filter(Boolean).map(decodeURIComponent);
 if(parts[0]==='catalog-editor'){
 const [,id,p,v,role='']=parts,c=await registry.candidate(id,p,v);
 if(req.method==='GET'){
 if(role===''){let html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8').replaceAll('href="/','href="').replaceAll('src="/','src="');html=html.replace('<label><input id="reviewed" type="checkbox">Halka, sap, emzik ve marka sınırlarını kontrol edip düzelttim.</label>','').replace('<option value="pan">Kaydır</option>','<option value="pan">Kaydır</option><option value="protect">Koruma ekle</option><option value="unprotect">Koruma kaldır</option>');if(c.r.familyGeometry){html=html.replace('<span id="regions">','<p id="family-warning">Aile geometrisinden türetilmiş aday; onaylı maske değildir. Eksik yüzeyler: '+c.r.familyGeometry.missing.join(', ')+'</p><label><input type="checkbox" id="family-reviewed"> Hizalama, sap/ağız/metal sınırları ve hedef fotoğraftaki logo korumasını ayrıca inceledim.</label><span id="regions">');}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return true;}
 if(role==='editor.css'){res.setHeader('Content-Type','text/css');res.end(fs.readFileSync(path.join(__dirname,role)));return true;}
 if(role==='editor.js'){
 let js=fs.readFileSync(path.join(__dirname,role),'utf8').replaceAll("image('/","image('").replaceAll("fetch('/","fetch('");
 js=js.replace("if(!$('reviewed').checked){status.textContent='Onaydan önce belirsiz sınırları düzeltip kontrol kutusunu işaretleyin.';return;}\n ",'');
 js=js.replace("source=await image('source');","window.catalogBranding=await base64(await (await fetch('branding')).blob());source=await image('source');");
 js=js.replace('mask[n]=m[n*4+3];','mask[n]=b.data[n*4+3]?0:m[n*4+3];');
 js=js.replaceAll('body:blob','body:JSON.stringify({mask:await base64(blob),branding:await currentBranding()})').replaceAll("headers:{'Content-Type':'image/png'}","headers:{'Content-Type':'application/json'}");
 js=js.replaceAll('seçili CM101 Metallic Navy kaynağı','seçili katalog varyantı kaynağı').replace("boundariesReviewed:'true'","boundariesReviewed:'true',brandingReviewed:'true'");
 if(c.r.familyGeometry){js=js.replace("const res=await fetch('approve?'+query", "if(!document.getElementById('family-reviewed').checked)throw Error('Aile hizalamasını ve hedef branding sınırlarını inceleyin.');query.set('familyAlignmentReviewed','true');query.set('familyBrandingReviewed','true');const res=await fetch('approve?'+query");}js+=`\nwindow.catalogProtectionEnabled=true;\nasync function currentBranding(){const c=document.createElement('canvas');c.width=w;c.height=h;const context=c.getContext('2d');context.drawImage(source,0,0);const d=context.getImageData(0,0,w,h);for(let n=0;n<w*h;n++)d.data[n*4+3]=brand.alpha[n]?255:0;context.putImageData(d,0,0);return base64(await new Promise(resolve=>c.toBlob(resolve,'image/png')));}\nasync function base64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});}\n`;
 res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(js);return true;}
 if(role==='config'){send(res,{...c.s,bytes:undefined,regions:[],sourceSha256:c.s.sha256,familyGeometry:c.r.familyGeometry||null});return true;}
 if(['source','mask','original','branding'].includes(role)){res.setHeader('Content-Type',role==='source'?'image/'+(c.s.image.endsWith('.jpg')?'jpeg':c.s.image.endsWith('.png')?'png':'webp'):'image/png');res.end(role==='source'?c.s.bytes:role==='branding'?(c.editedBranding||c.initialBranding||await (async()=>{const old=legacyRead?await legacyRead(p,v):null;return old&&old.record.sourceSha256===c.s.sha256?old.branding:await registry.emptyBrand(c.s)})()):role==='mask'?(c.editedMask||c.mask):(c.original||c.mask));return true;}
 }
 if(req.method==='POST'&&['save','approve'].includes(role)){const input=await body(req);const tuple={...Object.fromEntries(u.searchParams),candidateId:id,productId:p,variantId:v};if(role==='save')Object.assign(tuple,{sha256:c.s.sha256,width:c.s.width,height:c.s.height});const r=await registry.publish(tuple,Buffer.from(input.mask||'','base64'),input.branding?Buffer.from(input.branding,'base64'):null,role==='approve');send(res,role==='approve'?{approved:true,version:r.version}:{directory:'pending-local-correction:'+r.version});return true;}
 throw Error('Editör işlemi bulunamadı.');
 }
 const tail=parts.slice(4);
 if(tail[0]==='readiness'&&req.method==='GET'){send(res,{scope:'development-review',variants:await registry.readiness(legacyRead)});return true;}
 if(tail[0]==='review-media'&&req.method==='GET'){const [,p,v,id,role]=tail;if(!['source','mask','branding'].includes(role))throw Error('Medya bulunamadı.');const d=await registry.draftRead(p,v,id,u.searchParams.get('version')),b=role==='source'?d.s.bytes:d[role];if(u.searchParams.get('v')!==require('./catalog-registry.cjs').hash(b))throw Error('Taslak medya özeti değişti.');res.setHeader('Content-Type',role==='source'?({'webp':'image/webp','png':'image/png','jpg':'image/jpeg'}[require('path').extname(d.s.image).slice(1)]||'application/octet-stream'):'image/png');res.end(b);return true;}

 if(tail[0]==='media'&&req.method==='GET'){const [,p,v,version,role]=tail;if(!['source','mask','branding'].includes(role))throw Error('Medya bulunamadı.');const a=await registry.read(p,v,version);if(!a)throw Error('Onay bulunamadı.');const b=role==='source'?a.s.bytes:a[role];if(u.searchParams.get('v')!==require('./catalog-registry.cjs').hash(b))throw Error('Medya özeti eşleşmiyor.');res.setHeader('Content-Type',role==='source'?'image/'+(a.s.image.endsWith('.jpg')?'jpeg':a.s.image.endsWith('.png')?'png':'webp'):'image/png');res.end(b);return true;}
 const [p,v,action]=tail;
 if(req.method==='GET'&&action==='family-context'){send(res,await families.context(p,v));return true;}
 if(req.method==='POST'&&action==='family-reference'){const input=await body(req);if(input.referenceVariantId!==v)throw Error('Seçili referans varyant değişmiş.');send(res,await families.publish(p,input));return true;}
 if(req.method==='POST'&&action==='family-draft'){send(res,await families.derive(p,v,await body(req)));return true;}
 if(req.method==='GET'&&action==='review-inputs'){const id=u.searchParams.get('candidate'),d=await registry.draftRead(p,v,id),r=d.record,media=(role,sha256)=>({url:prefix+'review-media/'+encodeURIComponent(p)+'/'+encodeURIComponent(v)+'/'+id+'/'+role+'?version='+r.version+'&v='+sha256,sha256});send(res,{scope:'development-review',productReference:p,variantReference:v,candidateId:id,version:r.version,approved:false,inputs:{surfaceVersion:r.maskSha256,sourceMediaVersion:d.s.sourceVersion,width:d.s.width,height:d.s.height,displayName:d.s.name+' · '+d.s.color,source:media('source',d.s.sha256),mask:media('mask',r.maskSha256),brandingRequired:r.brandingRequired,branding:media('branding',r.brandingSha256)}});return true;}
 if(req.method==='POST'&&action==='review-check'){send(res,await reviewChecks.record(p,v,u.searchParams.get('candidate'),await body(req)));return true;}

 if(req.method==='GET'&&action==='rendering-inputs'){const a=await registry.read(p,v);if(!a){send(res,{scope:'development-preview',productReference:p,variantReference:v,previewAvailable:false,inputs:null});return true;}
 const {s,record:r}=a,media=(role,sha256)=>({url:prefix+'media/'+encodeURIComponent(p)+'/'+encodeURIComponent(v)+'/'+r.version+'/'+role+'?v='+sha256,sha256});send(res,{scope:'development-preview',productReference:p,variantReference:v,previewAvailable:true,inputs:{surfaceVersion:r.maskSha256,sourceMediaVersion:s.sourceVersion,width:s.width,height:s.height,displayName:s.name+' · '+s.color,source:media('source',s.sha256),mask:media('mask',r.maskSha256),brandingRequired:r.brandingRequired,branding:r.brandingRequired?media('branding',r.brandingSha256):null}});return true;}
 if(req.method==='GET'&&action==='candidate-source'){const c=await registry.candidate(u.searchParams.get('candidate'),p,v);res.setHeader('Content-Type','image/'+(c.s.image.endsWith('.jpg')?'jpeg':c.s.image.endsWith('.png')?'png':'webp'));res.end(c.s.bytes);return true;}
 if(req.method==='GET'&&action==='candidate-options'){const result=await selection.choices(p,v,u.searchParams.get('candidate'));send(res,{options:result.options,source:{sha256:result.c.s.sha256,width:result.c.s.width,height:result.c.s.height}});return true;}
 if(req.method==='GET'&&action==='choice-mask'){const result=await selection.mask(p,v,u.searchParams.get('candidate'),u.searchParams.get('choice'));res.setHeader('Content-Type','image/png');res.end(result.bytes);return true;}
 if(req.method==='POST'&&action==='combine-masks'){send(res,await selection.combine(p,v,await body(req)));return true;}
 if(req.method==='GET'&&action==='status'){const s=await registry.source(p,v);let a=null,error=null;try{a=await registry.read(p,v);if(!a&&legacyRead){const old=await legacyRead(p,v);if(old&&old.record.sourceSha256===s.sha256)a=old;}}catch{error='Onaylı maske eski veya bozuk; önizleme kapalı.';}send(res,{source:{...s,bytes:undefined},accepted:a?{version:a.record.version,acceptedAt:a.record.acceptedAt}:null,error,candidates:await registry.pending(p,v),versions:[...await registry.versions(p,v),...(legacyRead?await (async()=>{const old=await legacyRead(p,v);return old&&old.record.sourceSha256===s.sha256?[{version:'legacy:'+old.record.version,acceptedAt:old.record.acceptedAt}]:[]})():[])]});return true;}
 if(req.method==='POST'&&action==='activate'){const input=await body(req);if(typeof input.version==='string'&&input.version.startsWith('legacy:')&&legacyRead){const old=await legacyRead(p,v),s=await registry.source(p,v);if(!old||'legacy:'+old.record.version!==input.version||old.record.sourceSha256!==s.sha256)throw Error('Önceki onay doğrulanamadı.');await registry.useLegacy(p,v);}else await registry.activate(p,v,input.version);send(res,{activated:true});return true;}
 throw Error('İşlem bulunamadı.');
 }catch(e){send(res,{message:e.code==='ENOENT'?'Kaynak görsel veya maske bulunamadı.':e.message},400);return true;}
 };
}
module.exports={createCatalogHttp};
