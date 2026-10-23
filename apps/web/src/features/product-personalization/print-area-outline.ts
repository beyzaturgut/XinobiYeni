"use client";
import {useEffect,useState} from 'react';

/** A dashed white outline of the accepted print area, drawn once from the surface mask's alpha at a working size.
 *  Returns a data URL (no object URL to manage) that is laid over the preview at the same aspect ratio. */
export function usePrintAreaOutline(maskUrl:string){
 const [outline,setOutline]=useState<{mask:string;src:string}>();
 useEffect(()=>{
  let active=true;const image=new Image();image.crossOrigin='anonymous';image.src=maskUrl;
  image.decode().then(()=>{
   if(!active)return;
   const scale=Math.min(1,900/Math.max(image.naturalWidth,image.naturalHeight));
   const width=Math.max(1,Math.round(image.naturalWidth*scale)),height=Math.max(1,Math.round(image.naturalHeight*scale));
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(image,0,0,width,height);
   const alpha=context.getImageData(0,0,width,height).data,result=context.createImageData(width,height),pixels=result.data;
   const inside=(x:number,y:number)=>x>=0&&y>=0&&x<width&&y<height&&alpha[(y*width+x)*4+3]>127;
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(!inside(x,y)||((x+y)>>3)%2)continue;
    // Two pixels thick at the working size, so it stays visible once scaled down to the stage.
    if(inside(x-2,y)&&inside(x+2,y)&&inside(x,y-2)&&inside(x,y+2))continue;
    const index=(y*width+x)*4;pixels[index]=pixels[index+1]=pixels[index+2]=255;pixels[index+3]=235;
   }
   context.putImageData(result,0,0);
   const src=canvas.toDataURL('image/png');canvas.width=canvas.height=0;
   if(active)setOutline({mask:maskUrl,src});
  }).catch(()=>{/* The outline is a visual aid only; the preview itself reports surface errors. */});
  return()=>{active=false;image.src='data:,'};
 },[maskUrl]);
 return outline?.mask===maskUrl?outline.src:undefined;
}
