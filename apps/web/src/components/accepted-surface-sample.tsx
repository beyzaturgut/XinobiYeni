"use client";
import {useEffect,useState,type ReactNode} from "react";
import {loadAcceptedSurface,type RenderingInputs} from "../app/urunler/cay-makinesi-101/editor/accepted-surface-api";
import ProductPatternPreview from "../app/urunler/cay-makinesi-101/editor/product-pattern-preview";
/** Representative live preview when an approved surface is available; keep the marketing photo if loading or decoding fails. */
export default function AcceptedSurfaceSample({patternSrc,fallback}:{patternSrc:string;fallback?:ReactNode}){
 const [inputs,setInputs]=useState<RenderingInputs|null>(null);
 useEffect(()=>{const abort=new AbortController();loadAcceptedSurface("DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1",abort.signal,"DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6").then(value=>{if(!abort.signal.aborted)setInputs(value)}).catch(()=>{});return()=>abort.abort()},[]);
 if(!inputs)return fallback??<p role="status">Ürün yüzeyi geliştirme önizlemesi kullanılamıyor.</p>;
 const scale=Math.min(1,1280/Math.max(inputs.width,inputs.height));
 const width=Math.round(inputs.width*scale),height=Math.round(inputs.height*scale);
 return <ProductPatternPreview errorFallback={fallback} sourceWidth={width} sourceHeight={height} assetWidth={inputs.assetWidth??inputs.width} assetHeight={inputs.assetHeight??inputs.height} surfaceTreatment={inputs.surfaceTreatment} surfaceInkExposureStops={inputs.surfaceInkExposureStops} productSrc={inputs.source.url} designableMaskSrc={inputs.mask.url} brandingOverlaySrc={inputs.branding?.url} patternSrc={patternSrc} patternTransform={{x:width/2,y:height*.65,scale:1.2,rotation:0}} alt="Kabul edilmiş yüzeyde desenli Tea Maker geliştirme önizlemesi"/>;
}
