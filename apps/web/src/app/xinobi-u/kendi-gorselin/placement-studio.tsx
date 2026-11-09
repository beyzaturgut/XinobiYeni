"use client";
import Link from "next/link";
import {useCallback,useRef,useState,type ReactNode} from "react";
import ProductPatternPreview,{type PatternTransform} from "../../../features/product-personalization/rendering/product-pattern-preview";
import {defaultPatternTransform,usePatternPlacement} from "../../../features/product-personalization/rendering/use-pattern-placement";
import {DEFAULT_CURVATURE_STRENGTH} from "../../../features/product-personalization/rendering/product-surface-warp";
import type {RenderingInputs} from "../../../features/product-personalization/rendering/accepted-surface-api";
import {usePrintAreaOutline} from "../../../features/product-personalization/print-area-outline";
import {fileMeta,type LocalPatternSource} from "../../../features/product-personalization/use-local-pattern-file";
import SaveDesignButton from "../../../components/save-design-button";
import {money} from "../../../lib/commerce";
import {useEmbeddedApp} from "../../../lib/embedded-app";
import type {DesignPlacement} from "../../../lib/design-placement";
import type {Product,Variant} from "../../../../../../packages/commerce/client";
import styles from "./own-image.module.css";

type Snapshot={transform:PatternTransform;curvature:number};
const validHex=(hex?:string|null)=>Boolean(hex&&/^#[a-fA-F0-9]{6}$/.test(hex));
const signed=(value:number,unit:string)=>(value>0?'+':'')+value+' '+unit;

/** Step 4: the uploaded image on the selected colour's accepted surface, with the placement controls of the design. */
export default function PlacementStudio({singleSource=false,product,variants,surfaces,active,onActiveChange,mode,file,patternUrl,source,changeHref,onChange,price,initialPlacement,onDraftChange,onRendered,actions,cover,sourceDescription,canChange=false,changeLabel='Değiştir'}:{singleSource?:boolean;product:Pick<Product,'id'|'name'>;variants:Pick<Variant,'id'|'color'|'hex'>[];surfaces:Record<string,RenderingInputs>;active:Pick<Variant,'id'|'color'|'hex'>;onActiveChange:(id:string)=>void;mode:"pattern"|"artwork";file?:File;initialPlacement?:DesignPlacement;onDraftChange?:(value:DesignPlacement)=>void;onRendered?:(canvas:HTMLCanvasElement)=>void;actions?:ReactNode;cover?:boolean;sourceDescription?:string;canChange?:boolean;changeLabel?:string;patternUrl:string;source:LocalPatternSource;changeHref:string;onChange:()=>void;price?:number}){
 const inputs=surfaces[active.id];
 const fillMask=initialPlacement?.fillMask??cover??mode==='pattern';
 const renderKey=JSON.stringify([inputs.source.url,inputs.mask.url,patternUrl,mode,fillMask]);
 const [preview,setPreview]=useState<{key:string;canvas:HTMLCanvasElement}|null>(null);
 const previewCanvas=preview?.key===renderKey?preview.canvas:null;
 const [placement,setPlacement]=useState<DesignPlacement>();
 const onPlacementChange=useCallback((value:DesignPlacement)=>{setPlacement(value);onDraftChange?.(value)},[onDraftChange]);
 const {patternTransform,setPatternTransform,curvatureStrength,setCurvatureStrength,patternBodyAdjustments,transfer}=usePatternPlacement({renderingInputs:inputs,placementMode:mode,fillMask,onPlacementChange,initialPlacement});
 const rendered=useCallback((canvas:HTMLCanvasElement)=>{setPreview({key:renderKey,canvas});onRendered?.(canvas)},[onRendered,renderKey]);
 const [past,setPast]=useState<Snapshot[]>([]),[future,setFuture]=useState<Snapshot[]>([]);
 const [zoom,setZoom]=useState(100),[showArea,setShowArea]=useState(false);
 const [switching,setSwitching]=useState(false),[notice,setNotice]=useState('');
 const app=useEmbeddedApp();
 const lastChange=useRef({key:'',at:0}),transferGeneration=useRef(0);
 const origin=defaultPatternTransform(inputs,mode,fillMask);
 const current:Snapshot={transform:patternTransform,curvature:curvatureStrength};
 // Continuous slider or drag input within a moment counts as one step for undo.
 function change(key:string,next:Partial<PatternTransform>,curvature?:number){
  const now=Date.now(),merge=key!==''&&lastChange.current.key===key&&now-lastChange.current.at<700;
  lastChange.current={key,at:now};
  if(!merge)setPast(items=>[...items,current].slice(-50));
  setFuture([]);
  setPatternTransform(value=>({...value,...next}));
  if(curvature!==undefined)setCurvatureStrength(curvature);
 }
 function restore(snapshot:Snapshot){setPatternTransform(snapshot.transform);setCurvatureStrength(snapshot.curvature);lastChange.current={key:'',at:0}}
 function undo(){const previous=past.at(-1);if(!previous)return;setPast(past.slice(0,-1));setFuture([current,...future]);restore(previous)}
 function redo(){const next=future[0];if(!next)return;setFuture(future.slice(1));setPast([...past,current]);restore(next)}
 async function selectColour(id:string){
  const next=surfaces[id];
  if(!next||switching||id===active.id)return;
  // Colours approved with one shared mask keep identical surface coordinates; the placement carries over unchanged.
  if(next.mask.sha256===inputs.mask.sha256&&next.width===inputs.width&&next.height===inputs.height){transferGeneration.current++;setNotice('');onActiveChange(id);return}
  const ticket=++transferGeneration.current;setSwitching(true);setNotice('');
  const commit=await transfer.prepare(next);
  if(ticket!==transferGeneration.current)return;
  if(commit&&commit()){onActiveChange(id);setPast([]);setFuture([]);setNotice('Yerleşim bu renge uyarlandı; görselin konumu biraz değişebilir.')}
  else setNotice('Güvenli yerleşim aktarımı yapılamadı. Görseli tek bir gövdenin içine taşıyıp yeniden deneyin; mevcut önizleme korundu.');
  setSwitching(false);
 }
 const sliders=[
  {key:'x',label:'Yatay konum',min:0,max:inputs.width,step:1,value:patternTransform.x,display:signed(Math.round((patternTransform.x-origin.x)/inputs.width*100),'%')},
  {key:'y',label:'Dikey konum',min:0,max:inputs.height,step:1,value:patternTransform.y,display:signed(Math.round((patternTransform.y-origin.y)/inputs.height*100),'%')},
  {key:'scale',label:'Ölçek',min:.25,max:3,step:.05,value:patternTransform.scale,display:Math.round(patternTransform.scale*100)+' %'},
  {key:'rotation',label:'Dönüş',min:-180,max:180,step:1,value:patternTransform.rotation,display:signed(patternTransform.rotation,'°')},
  {key:'curvature',label:'Yüzey kavisi',min:0,max:1,step:.05,value:curvatureStrength,display:Math.round(curvatureStrength*100)+' %'},
 ] as const;
 const outline=usePrintAreaOutline(inputs.mask.url);
 return <div className={styles.studio}>
  <section className={styles.canvasPanel} aria-label="Ürün önizlemesi">
   <div className={styles.toolbar}>
    <div className={styles.toolGroup}>
     <button type="button" className={styles.iconButton} aria-label="Geri al" disabled={!past.length} onClick={undo}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg></button>
     <button type="button" className={styles.iconButton} aria-label="Yinele" disabled={!future.length} onClick={redo}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg></button>
     <span className={styles.toolDivider} aria-hidden="true"/>
     <button type="button" className={styles.zoomButton} aria-label="Uzaklaştır" disabled={zoom<=50} onClick={()=>setZoom(value=>Math.max(50,value-25))}>−</button>
     <span className={styles.zoomLabel} aria-live="polite">{zoom}%</span>
     <button type="button" className={styles.zoomButton} aria-label="Yakınlaştır" disabled={zoom>=200} onClick={()=>setZoom(value=>Math.min(200,value+25))}>+</button>
    </div>
    <div className={styles.toolGroup}>
     <label className={styles.areaToggle}><input type="checkbox" checked={showArea} onChange={()=>setShowArea(value=>!value)}/>Baskı alanını göster</label>
     <span className={styles.representative}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>Temsilidir</span>
    </div>
   </div>
   <div className={styles.canvasStage}>
    <div className={`${styles.zoom} ${singleSource?styles.singleZoom:''}`} style={{transform:`scale(${zoom/100})`}}>
     <ProductPatternPreview previewPixelBudget={singleSource?2_000_000:undefined} onRendered={rendered} surfaceTreatment={inputs.surfaceTreatment} surfaceInkExposureStops={inputs.surfaceInkExposureStops} sourceWidth={inputs.width} sourceHeight={inputs.height} assetWidth={inputs.assetWidth??inputs.width} assetHeight={inputs.assetHeight??inputs.height} productSrc={inputs.source.url} designableMaskSrc={inputs.mask.url} brandingOverlaySrc={inputs.branding?.url} patternSrc={patternUrl} placementMode={mode} fillMask={fillMask} onArtworkMove={mode==='artwork'?(x,y)=>change('drag',{x,y}):undefined} patternTransform={patternTransform} bodyPlacementAdjustments={patternBodyAdjustments} curvatureStrength={curvatureStrength} alt={singleSource?`${product.name}, tasarımlı ürün önizlemesi`:`${product.name}, ${active.color}, tasarımlı ürün önizlemesi`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
      {showArea&&outline&&<img className={styles.printArea} src={outline} alt=""/>}
     </ProductPatternPreview>
    </div>
   </div>
   <div className={styles.canvasNotes}><span>Temsili dijital önizleme. Baskı konumu, ölçüsü ve renk tonu üretimde doğrulanır.</span><span aria-live="polite">{notice||(app?'Kaydedene kadar değişiklikler yalnızca bu ekranda tutulur.':'Değişiklikler yalnızca bu tarayıcı oturumunda tutulur.')}</span></div>
  </section>
  <aside className={styles.settings} aria-label="Tasarım ayarları">
   {!singleSource&&variants.length>0&&<fieldset className={styles.colours} aria-busy={switching}>
    <legend>Ürün rengi: <strong>{active.color}</strong></legend>
    <div>{variants.map(variant=><button type="button" key={variant.id} title={variant.color} aria-label={`${variant.color} rengini seç`} aria-pressed={variant.id===active.id} disabled={switching} className={validHex(variant.hex)?undefined:styles.noHex} style={validHex(variant.hex)?{background:variant.hex!}:undefined} onClick={()=>void selectColour(variant.id)}/>)}</div>
    {switching&&<p role="status">Renk hazırlanıyor…</p>}
   </fieldset>}
   <div className={styles.fileSummary}>
    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
    <img src={patternUrl} alt={mode==='pattern'?'Yüklenen desen':'Yüklenen görsel'}/>
    <div><p>{source.name}</p><p>{sourceDescription??(source.size?fileMeta(source):'Kayıtlı tasarım')}</p></div>
    {(file||canChange)&&<Link href={changeHref} onClick={event=>{event.preventDefault();onChange()}}>{changeLabel}</Link>}
   </div>
   <section className={styles.placementPanel} aria-labelledby="pattern-controls-title">
    <div className={styles.placementPanelHead}><p id="pattern-controls-title">Yerleşim</p><button type="button" onClick={()=>change('',origin,DEFAULT_CURVATURE_STRENGTH)}>Sıfırla</button></div>
    <div className={styles.quick}><button type="button" onClick={()=>change('',{x:origin.x,y:origin.y})}>Ortala</button><button type="button" onClick={()=>change('',fillMask?{...origin}:{x:origin.x,y:origin.y,scale:1.9,rotation:0})}>Alanı doldur</button></div>
    <div className={styles.sliders}>{sliders.map(slider=><div key={slider.key}>
     <label htmlFor={`pattern-${slider.key}`}><span>{slider.label}</span><span>{slider.display}</span></label>
     <input id={`pattern-${slider.key}`} type="range" min={slider.min} max={slider.max} step={slider.step} value={slider.value} onChange={event=>{const value=Number(event.target.value);if(slider.key==='curvature')change('curvature',{},value);else change(slider.key,{[slider.key]:value})}}/>
    </div>)}</div>
   </section>
   <div className={styles.checkout}>
    <div><span className={styles.printCheck}><i aria-hidden="true"/>Baskı kontrolü: Bekliyor</span>{!singleSource&&<span className={styles.price}>{money(price)}</span>}</div>
    <fieldset className={styles.checkoutActions} disabled={!previewCanvas||switching}>{actions??(!singleSource&&file&&<SaveDesignButton key={patternUrl} stacked previewCanvas={previewCanvas} placement={placement} source={{file,productId:product.id,variantId:active.id}}/>)}</fieldset>
   </div>
  </aside>
 </div>;
}
