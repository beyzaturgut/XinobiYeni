const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),ts=require('../apps/web/node_modules/typescript');
const base=path.resolve(__dirname,'../apps/web/src/features/product-personalization/rendering');
function load(name){const module={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync(path.join(base,name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module.exports,module,n=>load(n.replace('./','')));return module.exports;}
const {separatedBodyPlacements}=load('separated-body-placement');
for(const [w,h] of [[120,200],[240,360]]){
 const mask={width:w,height:h,data:new Uint8ClampedArray(w*h*4)};
 const boxes=[[Math.round(w*.25),Math.round(h*.1),Math.round(w*.75),Math.round(h*.35)],[Math.round(w*.15),Math.round(h*.5),Math.round(w*.85),Math.round(h*.9)]];
 for(const [l,t,r,b]of boxes)for(let y=t;y<b;y++)for(let x=l;x<r;x++)mask.data[(y*w+x)*4+3]=255;
 for(const [iw,ih] of [[40,40],[30,70],[80,30]]){
  const bodies=separatedBodyPlacements(mask,iw,ih,true);assert.equal(bodies.length,2);
  for(const body of bodies){assert.ok(Math.abs(body.width/body.height-iw/ih)<1e-10);assert.ok(body.y-body.height/2>=body.top);assert.ok(body.y+body.height/2<=body.bottom+1);assert.ok(body.width<w);}
  assert.ok(bodies[0].y<bodies[1].top);assert.notEqual(bodies[0].width,bodies[1].width);
 }
 const patterns=separatedBodyPlacements(mask,40,70,false);assert.equal(patterns.length,2);assert.ok(patterns.every(b=>b.height>=b.bottom-b.top+1));
 for(let y=0;y<Math.round(h*.5);y++)for(let x=0;x<w;x++)mask.data[(y*w+x)*4+3]=0;
 assert.deepEqual(separatedBodyPlacements(mask,40,70,true),[],'Single body must retain original renderer path');
}
const overlap={width:120,height:200,data:new Uint8ClampedArray(120*200*4)};
for(let y=15;y<130;y++)for(let x=55;x<95;x++)overlap.data[(y*120+x)*4+3]=255;
for(let y=100;y<180;y++)for(let x=10;x<50;x++)overlap.data[(y*120+x)*4+3]=255;
const overlapBodies=separatedBodyPlacements(overlap,40,60,true);
assert.equal(overlapBodies.length,2,'overlapping vertical extents remain separate physical components');
assert.deepEqual(overlapBodies.map(b=>[b.top,b.bottom]),[[15,129],[100,179]]);
assert.ok(overlapBodies[0].runs.every(r=>r.start>=55&&r.end<95));
assert.ok(overlapBodies[1].runs.every(r=>r.start>=10&&r.end<50));
assert.ok(overlapBodies[0].bottom>=overlapBodies[1].top,'test must have no transparent row between regions');
console.log('PASS two sizes; square/portrait/landscape independently contained; generated fill per body; single-body legacy path unchanged');
