export type DesignPlacement = {
  sourceWidth: number; sourceHeight: number; surfaceVersion: string;
  x: number; y: number; scale: number; rotation: number; curvatureStrength: number;
  bodyAdjustments?: Partial<Record<'upper-body'|'lower-body',{x?:number;y?:number;scale?:number;rotation?:number}>>;
};

export function validDesignPlacement(value: unknown): value is DesignPlacement {
  if (!value || typeof value !== 'object') return false;
  const item=value as DesignPlacement;
  if (![item.sourceWidth,item.sourceHeight,item.x,item.y,item.scale,item.rotation,item.curvatureStrength].every(Number.isFinite)
    || item.sourceWidth<=0 || item.sourceHeight<=0 || item.sourceWidth>6000 || item.sourceHeight>6000
    || item.scale<=0 || item.scale>10 || item.curvatureStrength<0 || item.curvatureStrength>1
    || typeof item.surfaceVersion!=='string' || !/^[a-f0-9]{64}$/.test(item.surfaceVersion)) return false;
  return item.bodyAdjustments===undefined || Boolean(item.bodyAdjustments && typeof item.bodyAdjustments==='object'
    && Object.entries(item.bodyAdjustments).every(([key,body])=>(key==='upper-body'||key==='lower-body') && body && typeof body==='object'
      && Object.entries(body).every(([field,value])=>['x','y','scale','rotation'].includes(field)&&Number.isFinite(value)&&(field!=='scale'||(value as number)>0))));
}
