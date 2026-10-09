const http=require('http');
const port=5021,webOrigin='http://127.0.0.1:3032',session=/^\/api\/v1\/design-studio\/sessions\/[a-f0-9]{64}(?:\/image)?$/;
function createProxy({generationEnabled=false, upstreamFetch=fetch}={}) { return http.createServer(async(req,res)=>{try{
if(req.headers.host!=='127.0.0.1:'+port||req.socket.remoteAddress!=='127.0.0.1'){res.writeHead(403).end();return;}
const url=new URL(req.url,'http://127.0.0.1:'+port),pathname=url.pathname.replace(/\/$/,'');
const create=req.method==='POST'&&pathname==='/api/v1/design-studio/sessions'&&!url.search;
const generate=generationEnabled&&req.method==='POST'&&/^\/api\/v1\/design-studio\/sessions\/[a-f0-9]{64}\/generation$/.test(pathname)&&!url.search;
const read=req.method==='GET'&&!url.search&&(pathname==='/api/v1/design-studio/status'||session.test(pathname));
if(!create&&!read&&!generate){res.writeHead(405,{'Content-Type':'application/json'}).end(JSON.stringify({message:'Yerel önizlemede üretim ve diğer yazma işlemleri kapalı.'}));return;}
if(req.headers.origin&&req.headers.origin!==webOrigin){res.writeHead(403).end();return;}
let targets=[5020,5013],options={redirect:'error',signal:AbortSignal.timeout(10000)};
if(create||generate){
if(req.headers.origin!==webOrigin||!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){res.writeHead(403).end();return;}
const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>16384){res.writeHead(413).end();return;}chunks.push(c);}
const body=JSON.parse(Buffer.concat(chunks).toString()),keys=Object.keys(body);
if(generate){
if(keys.length!==1||keys[0]!=='answers'||!Array.isArray(body.answers)||body.answers.length!==5||body.answers.some(a=>!a||Object.keys(a).some(k=>!['questionId','optionId'].includes(k))||typeof a.questionId!=='string'||typeof a.optionId!=='string')){res.writeHead(400).end();return;}
// Never fall back to the demo provider; the owning API validates answers and exact catalog identity.
targets=[5020];
}else{
if(keys.some(k=>!['productId','variantId','browserId'].includes(k))||typeof body.productId!=='string'||!body.productId||!(body.variantId===null||typeof body.variantId==='string')||typeof body.browserId!=='string'){res.writeHead(400).end();return;}
targets=[body.productId==='DEMO-P101'?5013:5020];
}
options={...options,method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
}
for(const target of targets){
const response=await upstreamFetch('http://127.0.0.1:'+target+pathname,options);
if(read&&response.status===404&&target===targets[0]&&targets.length>1)continue;
res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'application/json','Cache-Control':'no-store'});res.end(Buffer.from(await response.arrayBuffer()));return;
}
res.writeHead(404).end();
}catch{res.writeHead(502,{'Content-Type':'application/json'}).end(JSON.stringify({message:'Yerel soru API bağlantısı kurulamadı.'}));}
}); }
module.exports={createProxy};
if(require.main===module) createProxy({generationEnabled:process.env.DESIGN_STUDIO_PREVIEW_GENERATION_ENABLED==='true'}).listen(port,'127.0.0.1',()=>console.log('Local design proxy http://127.0.0.1:'+port+'; generation opt-in '+(process.env.DESIGN_STUDIO_PREVIEW_GENERATION_ENABLED==='true')));
