export type DesignPlacement = {
  sourceWidth: number; sourceHeight: number; surfaceVersion: string;
  x: number; y: number; scale: number; rotation: number; curvatureStrength: number;
  bodyAdjustments?: Partial<Record<'upper-body'|'lower-body',{x?:number;y?:number;scale?:number;rotation?:number}>>;
  mode?: 'pattern'|'artwork';
  fillMask?: boolean;
};

export function validDesignPlacement(value: unknown): value is DesignPlacement {
  if (!value || typeof value !== 'object') return false;
  const item=value as DesignPlacement;
  if (![item.sourceWidth,item.sourceHeight,item.x,item.y,item.scale,item.rotation,item.curvatureStrength].every(Number.isFinite)
    || item.sourceWidth<=0 || item.sourceHeight<=0
    || item.scale<=0 || item.scale>10 || item.curvatureStrength<0 || item.curvatureStrength>1
    || typeof item.surfaceVersion!=='string' || !/^[a-f0-9]{64}$/.test(item.surfaceVersion)) return false;
  if(item.fillMask!==undefined&&typeof item.fillMask!=='boolean')return false;
  if(item.mode!==undefined&&item.mode!=='pattern'&&item.mode!=='artwork')return false;
  return item.bodyAdjustments===undefined || Boolean(item.bodyAdjustments && typeof item.bodyAdjustments==='object'
    && Object.entries(item.bodyAdjustments).every(([key,body])=>(key==='upper-body'||key==='lower-body') && body && typeof body==='object'
      && Object.entries(body).every(([field,value])=>['x','y','scale','rotation'].includes(field)&&Number.isFinite(value)&&(field!=='scale'||(value as number)>0))));
}

const placementKey=(design:string,product:string,variant:string)=>`xinobi-design-placement:${JSON.stringify([design,product,variant])}`;
export function readDesignPlacement(design:string,product:string,variant:string):DesignPlacement|undefined{
  try{const value=JSON.parse(localStorage.getItem(placementKey(design,product,variant))??'null');return validDesignPlacement(value)?value:undefined}catch{return undefined}
}
export function saveDesignPlacement(design:string,product:string,variant:string,value:DesignPlacement){
  try{localStorage.setItem(placementKey(design,product,variant),JSON.stringify(value))}catch{/* Current editor/cart state still retains the placement when storage is unavailable. */}
}
