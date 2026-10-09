// Opaque surface print: transfer relative illumination, never source metal RGB.
// A deliberately bounded quarter-stop exposure range keeps artwork colour/contrast
// legible. Neutral illumination is byte-exact artwork; alpha remains coverage.
export const MAX_SURFACE_EXPOSURE_STOPS = 0.25;
const linear=Float32Array.from({length:256},(_,b)=>{const v=b/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
const tables=new Uint8Array(257*256);
for(let level=0;level<=256;level++)for(let value=0;value<256;value++){
 const v=Math.min(1,linear[value]*2**((level/128-1)*MAX_SURFACE_EXPOSURE_STOPS));
 tables[level*256+value]=Math.round(255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055));
}
type SurfaceLighting={multipliers:Float32Array;activePixels:Uint32Array};
export function applySurfaceInk(artwork:ImageData,source:ImageData,lighting:SurfaceLighting){
 if(artwork.width!==source.width||artwork.height!==source.height||lighting.multipliers.length!==source.width*source.height)throw Error("Unaligned surface ink");
 for(const pixel of lighting.activePixels){const i=pixel*4;if(!artwork.data[i+3])continue;
 // Never make source cutouts or anti-aliased exterior edges more opaque.
 if(source.data[i+3]!==255){artwork.data[i+3]=0;continue;}
 // Existing lighting is percentile-normalized to neutral 1, bounded to 0.6–1.4.
 // Map only that relative field to exposure, not the photograph's absolute colour.
 const relative=Math.max(-1,Math.min(1,(lighting.multipliers[pixel]-1)/0.4));
 const table=Math.round((relative+1)*128)*256;
 for(let c=0;c<3;c++)artwork.data[i+c]=tables[table+artwork.data[i+c]];
 }
}
