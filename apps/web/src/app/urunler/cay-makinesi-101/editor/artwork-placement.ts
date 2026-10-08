// Fit an aspect-preserving rectangle in the central mask, with a 20% safety margin.
// Membership is alpha >= 128; the mask itself remains unchanged.
export function containArtwork(mask: ImageData, width: number, height: number) {
 if (![width,height].every(v=>Number.isFinite(v)&&v>0)) throw new Error('Invalid artwork dimensions');
 let left=mask.width,right=-1,top=mask.height,bottom=-1;
 for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++)if(mask.data[(y*mask.width+x)*4+3]>=128){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
 const x=(left+right+1)/2,y=(top+bottom+1)/2;
 const fits=(scale:number)=>{for(let py=Math.floor(y-height*scale/2);py<Math.ceil(y+height*scale/2);py++)for(let px=Math.floor(x-width*scale/2);px<Math.ceil(x+width*scale/2);px++)if(px<0||py<0||px>=mask.width||py>=mask.height||mask.data[(py*mask.width+px)*4+3]<128)return false;return true};
 let low=0,high=Math.min((right-left+1)/width,(bottom-top+1)/height);
 for(let i=0;i<24;i++){const mid=(low+high)/2;if(fits(mid))low=mid;else high=mid}
 if(low<=0)throw new Error('No central artwork region');
 return {x,y,width:width*low*0.8,height:height*low*0.8};
}
