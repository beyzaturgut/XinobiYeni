type Run = { y:number; start:number; end:number; id:number };
type BodyRun = { y:number; start:number; end:number };
export type BodySurfaceId = "upper-body" | "lower-body" | `body-${number}`;
export type BodyPlacementAdjustment = { x?:number; y?:number; scale?:number; rotation?:number };

// Split by actual 8-connected alpha components, not empty image rows. Product
// silhouettes can have overlapping vertical bounds while remaining separate.
// The source mask is never changed; returned runs are used only for placement/clipping.
export function separatedBodyPlacements(mask: ImageData, width: number, height: number, artwork: boolean) {
 const parent:number[]=[];
 const runs:Run[]=[];
 let previous:Run[]=[];
 const find=(value:number):number=>{let root=value;while(parent[root]!==root)root=parent[root];while(parent[value]!==value){const next=parent[value];parent[value]=root;value=next;}return root;};
 const unite=(left:number,right:number)=>{left=find(left);right=find(right);if(left!==right)parent[right]=left;};
 for(let y=0;y<mask.height;y++){
  const current:Run[]=[];let x=0;
  while(x<mask.width){while(x<mask.width&&mask.data[(y*mask.width+x)*4+3]<128)x++;if(x===mask.width)break;const start=x;while(x+1<mask.width&&mask.data[(y*mask.width+x+1)*4+3]>=128)x++;const end=x;
   if(runs.length>=500000)throw new Error('Mask component structure exceeds the safe analysis limit');
   const run:Run={y,start,end,id:parent.length};parent.push(run.id);
   for(const neighbor of previous){if(neighbor.end<start-1)continue;if(neighbor.start>end+1)break;unite(run.id,neighbor.id);}
   current.push(run);runs.push(run);x++;
  }
  previous=current;
 }
 const groups=new Map<number,{top:number;bottom:number;left:number;right:number;area:number;runs:BodyRun[]}>();
 for(const run of runs){const root=find(run.id);let group=groups.get(root);if(!group){group={top:run.y,bottom:run.y,left:run.start,right:run.end,area:0,runs:[]};groups.set(root,group);}group.top=Math.min(group.top,run.y);group.bottom=Math.max(group.bottom,run.y);group.left=Math.min(group.left,run.start);group.right=Math.max(group.right,run.end);group.area+=run.end-run.start+1;group.runs.push({y:run.y,start:run.start,end:run.end});}
 const minimumArea=Math.max(64,Math.floor(mask.width*mask.height*.00025));
 const componentGroups:{top:number;bottom:number;left:number;right:number;area:number;runs:BodyRun[]}[]=[];
 groups.forEach(group=>componentGroups.push(group));
 const bodies=componentGroups.filter(group=>group.area>=minimumArea).sort((a,b)=>a.top-b.top||a.left-b.left);
 if(bodies.length<=1)return [];
 if(bodies.length>8)throw new Error('Mask has too many separated regions; review boundaries');
 // Keep small disconnected mask islands in the drawing clip path, while leaving
 // placement geometry based only on the significant body components above.
 const clipRuns=bodies.map(body=>[...body.runs]);
 for(const island of componentGroups.filter(group=>group.area<minimumArea)){
  const centerX=(island.left+island.right+1)/2,centerY=(island.top+island.bottom+1)/2;
  let owner=0,nearest=Number.POSITIVE_INFINITY;
  bodies.forEach((body,index)=>{
   const dx=centerX<body.left?body.left-centerX:centerX>body.right+1?centerX-(body.right+1):0;
   const dy=centerY<body.top?body.top-centerY:centerY>body.bottom+1?centerY-(body.bottom+1):0;
   const distance=dx*dx+dy*dy;
   if(distance<nearest){nearest=distance;owner=index;}
  });
  clipRuns[owner].push(...island.runs);
 }
 return bodies.map((body,index)=>{
  const boxWidth=body.right-body.left+1,boxHeight=body.bottom-body.top+1;
  const fit=artwork?(()=>{const scale=Math.min(boxWidth/width,boxHeight/height)*.6;return{x:(body.left+body.right+1)/2,y:(body.top+body.bottom+1)/2,width:width*scale,height:height*scale};})():(()=>{const ratio=Math.max(boxWidth/width,boxHeight/height);return{x:(body.left+body.right+1)/2,y:(body.top+body.bottom+1)/2,width:width*ratio,height:height*ratio};})();
  const id:BodySurfaceId=bodies.length===2?(index===0?'upper-body':'lower-body'):`body-${index+1}`;
  return {...fit,top:body.top,bottom:body.bottom,left:body.left,right:body.right,runs:clipRuns[index],id};
 });
}
