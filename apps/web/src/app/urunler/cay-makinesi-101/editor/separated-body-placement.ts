type Run = { y:number; start:number; end:number; id:number };
type BodyRun = { y:number; start:number; end:number };

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
 return bodies.map((body,index)=>{
  const boxWidth=body.right-body.left+1,boxHeight=body.bottom-body.top+1;
  const fit=artwork?(()=>{const scale=Math.min(boxWidth/width,boxHeight/height)*.6;return{x:(body.left+body.right+1)/2,y:(body.top+body.bottom+1)/2,width:width*scale,height:height*scale};})():(()=>{const ratio=Math.max(boxWidth/width,boxHeight/height);return{x:(body.left+body.right+1)/2,y:(body.top+body.bottom+1)/2,width:width*ratio,height:height*ratio};})();
  return {...fit,top:body.top,bottom:body.bottom,left:body.left,right:body.right,runs:body.runs,id:'body-'+(index+1)};
 });
}