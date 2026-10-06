export type SurfaceControls = { strength: number; offsetX: number; offsetY: number; scale: number };
type Point = [number, number];
type Surface = { path: string; quad: Point[]; curved: boolean; logo?: [number, number, number, number] };
const tea: Surface[] = [
  { path: 'M .253 .158 C .35 .164 .49 .167 .578 .156 C .595 .235 .609 .315 .612 .370 C .48 .408 .31 .395 .223 .369 L .229 .302 C .264 .313 .299 .264 .326 .180 L .253 .167 Z', quad: [[.22,.155],[.59,.155],[.613,.389],[.215,.389]], curved: true },
  { path: 'M .235 .389 C .35 .412 .51 .405 .607 .386 C .626 .505 .636 .650 .636 .740 C .49 .792 .30 .790 .195 .749 C .186 .660 .199 .576 .212 .543 C .249 .556 .285 .513 .291 .427 L .296 .416 L .235 .403 Z', quad: [[.225,.393],[.606,.393],[.638,.776],[.188,.776]], curved: true, logo: [.545,.648,.636,.744] },
];
const coffee: Surface[] = [
  { path: 'M .775 .350 L .892 .328 C .916 .475 .923 .594 .924 .696 L .809 .749 C .801 .598 .788 .453 .775 .350 Z', quad: [[.775,.350],[.892,.328],[.924,.696],[.809,.749]], curved: false },
];
const generic: Surface[] = [
  { path: 'M .36 .38 L .64 .38 L .66 .65 L .34 .65 Z', quad: [[.36,.38],[.64,.38],[.66,.65],[.34,.65]], curved: true },
];
function inverse(x: number, y: number, quad: Point[]) {
  const [p,q,r,s] = quad;
  const a=q[0]-p[0],b=s[0]-p[0],c=p[0]-q[0]+r[0]-s[0];
  const d=q[1]-p[1],e=s[1]-p[1],f=p[1]-q[1]+r[1]-s[1];
  let u=.5,v=.5;
  for(let iteration=0;iteration<5;iteration++){
    const dx=p[0]+a*u+b*v+c*u*v-x,dy=p[1]+d*u+e*v+f*u*v-y;
    const au=a+c*v,bv=b+c*u,du=d+f*v,ev=e+f*u,det=au*ev-bv*du;
    if(Math.abs(det)<.000001)break;
    u-=(dx*ev-dy*bv)/det;v-=(dy*au-dx*du)/det;
  }
  return [u,v];
}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
function sample(image: Uint8ClampedArray, size: number, u: number, v: number, channel: number) {
  // Repeat the artwork so shifting/zooming never moves the physical coating off the body.
  const x=((u%1+1)%1)*(size-1),y=((v%1+1)%1)*(size-1);
  const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(size-1,x0+1),y1=Math.min(size-1,y0+1),fx=x-x0,fy=y-y0;
  return image[(y0*size+x0)*4+channel]*(1-fx)*(1-fy)+image[(y0*size+x1)*4+channel]*fx*(1-fy)+image[(y1*size+x0)*4+channel]*(1-fx)*fy+image[(y1*size+x1)*4+channel]*fx*fy;
}

export function createProductSurface(product: HTMLImageElement, art: HTMLImageElement, source: string) {
  const calibrated=source.includes('tea-maker-101-')||source.includes('coffee-maker-101-');
  const surfaces=source.includes('tea-maker-101-')?tea:source.includes('coffee-maker-101-')?coffee:generic;
  const ratio=Math.min(1,1200/Math.max(product.naturalWidth,product.naturalHeight));
  const width=Math.round(product.naturalWidth*ratio),height=Math.round(product.naturalHeight*ratio);
  const original=document.createElement('canvas');original.width=width;original.height=height;
  const originalContext=original.getContext('2d',{willReadFrequently:true})!;
  originalContext.drawImage(product,0,0,width,height);
  const base=originalContext.getImageData(0,0,width,height);
  const texture=document.createElement('canvas');const textureSize=768;texture.width=textureSize;texture.height=textureSize;
  const textureContext=texture.getContext('2d',{willReadFrequently:true})!;textureContext.drawImage(art,0,0,textureSize,textureSize);
  const texturePixels=textureContext.getImageData(0,0,textureSize,textureSize).data;
  const records: { indices:Uint32Array; values:Float32Array }[]=[];
  for(const surface of surfaces){
    const mask=document.createElement('canvas');mask.width=width;mask.height=height;
    const context=mask.getContext('2d',{willReadFrequently:true})!;
    context.scale(width,height);context.fillStyle='#fff';context.fill(new Path2D(surface.path));
    const maskPixels=context.getImageData(0,0,width,height).data;
    let total=0,count=0;
    for(let i=0;i<width*height;i++)if(maskPixels[i*4+3]>240){const p=i*4;total+=.2126*base.data[p]+.7152*base.data[p+1]+.0722*base.data[p+2];count++}
    const mean=Math.max(18,total/Math.max(1,count));
    const indices:number[]=[],values:number[]=[];
    for(let i=0;i<width*height;i++){
      const p=i*4;if(!maskPixels[p+3])continue;
      const x=(i%width+.5)/width,y=(Math.floor(i/width)+.5)/height;
      const [u,v]=inverse(x,y,surface.quad);if(u<-.02||u>1.02||v<-.02||v>1.02)continue;
      const luminance=.2126*base.data[p]+.7152*base.data[p+1]+.0722*base.data[p+2];
      const gain=clamp(Math.pow(luminance/mean,.72),.40,1.55);
      let opacity=maskPixels[p+3]/255;
      if(surface.logo&&x>surface.logo[0]&&y>surface.logo[1]&&x<surface.logo[2]&&y<surface.logo[3]){
        // Preserve the original printed mark, not a rectangular patch around it.
        const logoContrast=mean>110?clamp((mean*.62-luminance)/30,0,1):clamp((luminance-mean*1.85)/35,0,1);
        opacity*=1-logoContrast;
      }
      const angular=surface.curved ? .5+Math.asin(clamp((u-.5)*2*Math.sin(1.1),-.99,.99))/2.2:u;
      const bow=surface.curved ? .028*Math.sin(Math.PI*clamp(u,0,1)):0;
      indices.push(i);values.push(angular,v+bow,gain,opacity);
    }
    records.push({indices:Uint32Array.from(indices),values:Float32Array.from(values)});
  }
  return { calibrated, render(canvas:HTMLCanvasElement,controls:SurfaceControls){
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
    const ctx=canvas.getContext('2d')!;
    const output=new ImageData(new Uint8ClampedArray(base.data),width,height);
    for(const record of records)for(let j=0;j<record.indices.length;j++){
      const p=record.indices[j]*4,t=j*4;
      const u=(record.values[t]-.5)*100/controls.scale+.5-controls.offsetX/100;
      const v=(record.values[t+1]-.5)*100/controls.scale+.5-controls.offsetY/100;
      const gain=record.values[t+2],alpha=controls.strength/100*record.values[t+3];
      for(let channel=0;channel<3;channel++){
        const pigment=sample(texturePixels,textureSize,u,v,channel);
        const diffuse=pigment*Math.min(gain,1);
        const highlight=(255-pigment)*Math.max(0,gain-1)*.6;
        output.data[p+channel]=base.data[p+channel]*(1-alpha)+clamp(diffuse+highlight,0,255)*alpha;
      }
    }
    ctx.putImageData(output,0,0);
  }};
}
