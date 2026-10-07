"use client";
import {useEffect,useState} from "react";
import {loadAcceptedSurface,type RenderingInputs} from "../app/urunler/cay-makinesi-101/editor/accepted-surface-api";
import ProductPatternPreview from "../app/urunler/cay-makinesi-101/editor/product-pattern-preview";
export default function AcceptedSurfaceSample({patternSrc}:{patternSrc:string}){
 const [inputs,setInputs]=useState<RenderingInputs|null>(null);
 useEffect(()=>{const abort=new AbortController();loadAcceptedSurface("DEMO-V101-B",abort.signal,"DEMO-P101").then(value=>{if(!abort.signal.aborted)setInputs(value)}).catch(()=>{});return()=>abort.abort()},[]);
 if(!inputs)return <p role="status">Ürün yüzeyi geliştirme önizlemesi kullanılamıyor.</p>;
 return <ProductPatternPreview productSrc={inputs.source.url} designableMaskSrc={inputs.mask.url} brandingOverlaySrc={inputs.branding?.url} patternSrc={patternSrc} patternTransform={{x:533,y:1040,scale:1.2,rotation:0}} alt="Kabul edilmiş yüzeyde desenli Tea Maker geliştirme önizlemesi"/>;
}
