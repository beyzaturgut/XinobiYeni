const $=id=>document.getElementById(id),view=$('view'),ctx=view.getContext('2d'),status=$('status');
let w,h,source,mask,original,brand,overlay,oc,scale=1,tx=0,ty=0,stroke=null,history=[],future=[],busy=false,last=null,ready=false,identity=null;
const MAX_HISTORY_PIXELS=2000000;let historyPixels=0;
const point=e=>{const r=view.getBoundingClientRect();return{x:(e.clientX-r.left-tx)/scale,y:(e.clientY-r.top-ty)/scale};};
function draw(){if(!ready)return;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,view.width,view.height);ctx.setTransform(scale,0,0,scale,tx,ty);ctx.drawImage(source,0,0);if($('visible').checked){ctx.globalAlpha=Number($('opacity').value);ctx.drawImage(overlay,0,0);ctx.globalAlpha=1;}ctx.drawImage(brand.canvas,0,0);}
function refresh(){const d=oc.createImageData(w,h);for(let n=0;n<w*h;n++){const k=n*4;d.data[k+1]=180;d.data[k+2]=255;d.data[k+3]=mask[n];}oc.putImageData(d,0,0);if(window.catalogProtectionEnabled){const c=brand.canvas.getContext("2d"),b=c.createImageData(w,h);for(let n=0;n<w*h;n++)b.data.set([255,180,0,brand.alpha[n]?180:0],n*4);c.putImageData(b,0,0);}draw();}
function fit(){scale=Math.min(view.width/w,view.height/h);tx=(view.width-w*scale)/2;ty=(view.height-h*scale)/2;draw();}
function dab(p){const radius=Math.max(.5,Math.min(150,Number($('brush').value)/2));const value=$('tool').value==='add'?255:0;
for(let y=Math.max(0,Math.floor(p.y-radius));y<=Math.min(h-1,Math.ceil(p.y+radius));y++)for(let x=Math.max(0,Math.floor(p.x-radius));x<=Math.min(w-1,Math.ceil(p.x+radius));x++){
if((x+.5-p.x)**2+(y+.5-p.y)**2>radius*radius)continue;const n=y*w+x;
const protection=window.catalogProtectionEnabled&&['protect','unprotect'].includes($('tool').value);if(protection){const next=$('tool').value==='protect'?255:0;if(brand.alpha[n]===next)continue;if(!stroke.has(n))stroke.set(n,[mask[n],brand.alpha[n]]);brand.alpha[n]=next;if(next)mask[n]=0;continue;}if(value&&(!original[n]||brand.alpha[n]))continue;if(mask[n]===value)continue;if(!stroke.has(n))stroke.set(n,[mask[n],brand.alpha[n]]);mask[n]=value;
}}
function line(a,b){const distance=Math.hypot(a.x-b.x,a.y-b.y),step=Math.max(1,Number($('brush').value)/4);const count=Math.max(1,Math.ceil(distance/step));for(let i=1;i<=count;i++)dab({x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count});}
function finish(){if(!stroke)return;if(stroke.size){const change=[...stroke].map(([n,before])=>[n,before[0],mask[n],before[1],brand.alpha[n]]);history.push(change);historyPixels+=change.length;while(historyPixels>MAX_HISTORY_PIXELS&&history.length>1)historyPixels-=history.shift().length;future=[];}stroke=null;last=null;refresh();}
view.onpointerdown=e=>{if(!ready||busy||e.button!==0)return;view.setPointerCapture(e.pointerId);last={displayX:e.clientX,displayY:e.clientY,...point(e)};if($('tool').value!=='pan'){stroke=new Map();dab(last);refresh();}};
view.onpointermove=e=>{if(!last)return;if($('tool').value==='pan'){tx+=e.clientX-last.displayX;ty+=e.clientY-last.displayY;last={displayX:e.clientX,displayY:e.clientY,...point(e)};draw();}else{const p=point(e);line(last,p);last=p;refresh();}};
view.onpointerup=view.onpointercancel=()=>{finish();last=null;};
view.onlostpointercapture=()=>{finish();last=null;};
view.onwheel=e=>{e.preventDefault();if(!ready||last)return;const p=point(e),r=view.getBoundingClientRect();scale=Math.max(.02,Math.min(20,scale*Math.exp(-e.deltaY*.001)));tx=e.clientX-r.left-p.x*scale;ty=e.clientY-r.top-p.y*scale;draw();};
$('undo').onclick=()=>{if(last||busy)return;const c=history.pop();if(c){historyPixels-=c.length;for(const[n,a,,b]of c){mask[n]=a;brand.alpha[n]=b;}future.push(c);refresh();}};
$('redo').onclick=()=>{if(last||busy)return;const c=future.pop();if(c){for(const[n,,b,,a]of c){mask[n]=b;brand.alpha[n]=a;}history.push(c);historyPixels+=c.length;refresh();}};
$('fit').onclick=fit;$('visible').onchange=draw;$('opacity').oninput=draw;
async function image(url){const i=new Image();i.src=url;await i.decode();return i;}
function pixels(i){if(i.width!==w||i.height!==h)throw Error('Boyutlar uyuşmuyor');const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(i,0,0);return {canvas:c,data:x.getImageData(0,0,w,h).data};}
$('save').onclick=async()=>{if(!ready||busy||last)return;busy=true;status.textContent='Doğrulanıyor ve yeni sürüm kaydediliyor…';try{
const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),d=x.createImageData(w,h);for(let n=0;n<mask.length;n++){if(mask[n]>original[n]||(mask[n]&&brand.alpha[n]))throw Error('Maske sınırı / marka koruması ihlali');d.data.set([255,255,255,mask[n]],n*4);}x.putImageData(d,0,0);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const res=await fetch('/save',{method:'POST',headers:{'Content-Type':'image/png'},body:blob});if(!res.ok)throw Error(await res.text());status.textContent='Onaysız yeni sürüm: '+(await res.json()).directory;
}catch(e){status.textContent='Kaydedilemedi: '+e.message;}finally{busy=false;}};
(async()=>{try{const cfg=await(await fetch('/config')).json();w=cfg.width;h=cfg.height;identity=cfg;
source=await image('/source');if(source.width!==w||source.height!==h)throw Error('Kaynak boyutu uyuşmuyor');
const m=pixels(await image('/mask')).data,o=pixels(await image('/original')).data,b=pixels(await image('/branding'));
mask=new Uint8Array(w*h);original=new Uint8Array(w*h);const alpha=new Uint8Array(w*h);
for(let n=0;n<w*h;n++){mask[n]=m[n*4+3];original[n]=o[n*4+3];alpha[n]=b.data[n*4+3];}
const locked=b.canvas.getContext('2d'),bd=locked.getImageData(0,0,w,h);for(let n=0;n<w*h;n++){bd.data[n*4]=255;bd.data[n*4+1]=180;bd.data[n*4+2]=0;bd.data[n*4+3]=alpha[n]?180:0;}locked.putImageData(bd,0,0);brand={canvas:b.canvas,alpha};
overlay=document.createElement('canvas');overlay.width=w;overlay.height=h;oc=overlay.getContext('2d');
for(const r of cfg.regions){const btn=document.createElement('button');btn.textContent=r.name;btn.onclick=()=>{scale=Math.min(view.width/r.width,view.height/r.height);tx=(view.width-r.width*scale)/2-r.x*scale;ty=(view.height-r.height*scale)/2-r.y*scale;draw();};$('regions').append(btn);}
const resize=()=>{view.width=$('viewport').clientWidth;view.height=$('viewport').clientHeight;if(ready)fit();};new ResizeObserver(resize).observe($('viewport'));ready=true;resize();refresh();fit();status.textContent='Hazır · '+w+' × '+h+' · Kaynak SHA-256: '+cfg.sourceSha256;
$('approve').onclick=async()=>{
 if(!ready||busy||last)return;
 if(!$('reviewed').checked){status.textContent='Onaydan önce belirsiz sınırları düzeltip kontrol kutusunu işaretleyin.';return;}
 if(!confirm('Editördeki güncel maskeyi yalnızca seçili CM101 Metallic Navy kaynağı için onaylıyor musunuz?'))return;
 busy=true;try{
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),d=x.createImageData(w,h);
 for(let n=0;n<mask.length;n++){d.data.set([255,255,255,mask[n]],n*4);}x.putImageData(d,0,0);
 const blob=await new Promise(r=>c.toBlob(r,'image/png'));
 const query=new URLSearchParams({productId:identity.productId,variantId:identity.variantId,sha256:identity.sourceSha256,width:String(w),height:String(h),boundariesReviewed:'true'});
 const res=await fetch('/approve?'+query,{method:'POST',headers:{'Content-Type':'image/png'},body:blob});
 if(!res.ok)throw Error(await res.text());const value=await res.json();status.textContent='Güncel maske onaylandı · Sürüm: '+value.version+' · Müşteri önizlemesini yenileyin.';
 }catch(e){status.textContent='Onay başarısız: '+e.message;}finally{busy=false;}
 };
 window.maskEditorTest={point,mask,original,get brand(){return brand},setView:(s,x,y)=>{scale=s;tx=x;ty=y;draw();},getView:()=>({scale,tx,ty}),getSize:()=>({w,h})};
}catch(e){status.textContent='Açılamadı: '+e.message;}})();
