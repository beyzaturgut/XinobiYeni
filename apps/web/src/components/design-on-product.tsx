'use client';
import {useEffect,useState} from 'react';
import {configurationPreviewPath,useDemoCommerce,privateImageUrl} from '../lib/demo-commerce';
import {loadCachedAcceptedSurface,type RenderingInputs} from '../app/urunler/cay-makinesi-101/editor/accepted-surface-api';
import ProductPatternPreview from '../app/urunler/cay-makinesi-101/editor/product-pattern-preview';
import PrivateDesignImage from './private-design-image';
import type {DesignPlacement} from '../lib/design-placement';
import styles from './design-on-product.module.css';

/** A saved design worn on its product colour's approved surface, with the editor's starting placement; colours without
 *  an approved surface (or a failed render) show the design itself. Always labelled "Temsilidir" (K-12). */
type Props={productId:string;variantId:string;designPath:string;kind?:'ai'|'upload';alt:string;className?:string;placement?:DesignPlacement;configurationId?:string;configurationRevision?:number};
export default function DesignOnProduct(props:Props){
 const {user}=useDemoCommerce();
 if(!user)return <span className={props.className}>Tasarımını görmek için giriş yap.</span>;
 const key=[user.id,props.productId,props.variantId,props.designPath,props.configurationId,props.configurationRevision].join(':');
 const fallback=<ComposedDesign key={key} {...props}/>;
 return props.configurationId&&props.configurationRevision?<PrivateDesignImage key={key} path={configurationPreviewPath(props.configurationId,props.configurationRevision)} alt={props.alt} className={props.className} fit="contain" fallback={fallback}/>:fallback;
}
function ComposedDesign({productId,variantId,designPath,kind,alt,className,placement}:Props){
  const [inputs,setInputs]=useState<RenderingInputs|null|undefined>(undefined),[src,setSrc]=useState<string|null>(null);
  useEffect(()=>{let active=true;loadCachedAcceptedSurface(productId,variantId).then(value=>{if(active)setInputs(value)}).catch(()=>{if(active)setInputs(null)});return()=>{active=false}},[productId,variantId]);
  useEffect(()=>{let url:string|null=null;let active=true;privateImageUrl(designPath).then(value=>{url=value;if(active)setSrc(value);else URL.revokeObjectURL(value)}).catch(()=>{});return()=>{active=false;if(url)URL.revokeObjectURL(url)}},[designPath]);
  if(inputs&&placement&&placement.surfaceVersion!==inputs.surfaceVersion)return <span><PrivateDesignImage className={className} path={designPath} alt={alt}/><small>Ürün yüzeyi değişti; kayıtlı yerleşimin önizlemesi doğrulanamıyor.</small></span>;
  if(inputs===null)return <PrivateDesignImage className={className} path={designPath} alt={alt}/>;
  const artwork=placement?.mode?placement.mode==='artwork':kind==='upload'||Boolean(placement);
  const selected=inputs&&placement?.surfaceVersion===inputs.surfaceVersion?placement:undefined;
  const ratio=inputs&&selected?inputs.width/selected.sourceWidth:1;
  return <span className={`${styles.frame} ${className??''}`}>
    {inputs&&src?<ProductPatternPreview surfaceTreatment={inputs.surfaceTreatment} surfaceInkExposureStops={inputs.surfaceInkExposureStops} sourceWidth={inputs.width} sourceHeight={inputs.height} assetWidth={inputs.assetWidth??inputs.width} assetHeight={inputs.assetHeight??inputs.height} productSrc={inputs.source.url} designableMaskSrc={inputs.mask.url} brandingOverlaySrc={inputs.branding?.url} patternSrc={src} placementMode={artwork?'artwork':'pattern'} fillMask={selected?.fillMask} curvatureStrength={selected?.curvatureStrength} bodyPlacementAdjustments={selected?.bodyAdjustments} patternTransform={selected?{x:selected.x*ratio,y:selected.y*(inputs.height/selected.sourceHeight),scale:selected.scale*ratio,rotation:selected.rotation}:{x:inputs.width/2,y:inputs.height*.65,scale:artwork?1:1.2,rotation:0}} alt={alt}/>:<span className={styles.loading} aria-hidden="true"/>}
    <small className={styles.label}>Temsilidir</small>
  </span>;
}
