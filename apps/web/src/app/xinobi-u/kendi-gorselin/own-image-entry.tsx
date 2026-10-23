"use client";
import Link from "next/link";
import {Suspense,useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {useCommerce} from "../../../lib/commerce";
import {useLocalPatternFile} from "../../../features/product-personalization/use-local-pattern-file";
import {startingVariant,useAcceptedVariants} from "../../../features/product-personalization/accepted-variants";
import FlowSteps from "../flow-steps";
import DesignUploadCard,{DesignUploadAside} from './design-upload-card';
import PlacementStudio from "./placement-studio";
import flow from "../flow.module.css";
import styles from "./own-image.module.css";

type Mode="pattern"|"artwork";


const previewHash='#onizleme';
const onPreview=()=>typeof window!=='undefined'&&window.location.hash===previewHash;

/** Steps 3 (upload) and 4 (placement) share this component, so the locally prepared image survives the step change.
 *  A changed query would remount the page, so the step is a history entry with a hash (the back button returns to
 *  the upload) and the upload type only rewrites the address. */
function Flow({product,variant,initialMode,embedded}:{product:string;variant:string;initialMode:Mode;embedded:boolean}){
 const [mode,setMode]=useState(initialMode),[previewing,setPreviewing]=useState(onPreview);
 // In the mobile app the app bar leads back to its own method screen; the site's chrome and web back links stay hidden.
 useEffect(()=>{const sync=()=>setPreviewing(onPreview());window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync)}},[]);
 const {state}=useCommerce();
 const selected=state?.products.find(item=>item.id===product&&item.active);
 const [retry,setRetry]=useState(0),[activeId,setActiveId]=useState(variant);
 const accepted=useAcceptedVariants(selected?.personalizable===true?selected:undefined,retry);
 const local=useLocalPatternFile();
 const start=selected&&accepted.status==="ready"?startingVariant(selected,accepted.surfaces,variant):undefined;
 const active=selected?.variants.find(item=>item.id===activeId&&accepted.surfaces[item.id])??start;
 const href=(next:Mode=mode)=>{const query=new URLSearchParams({product,variant});if(next==='pattern')query.set('mode','pattern');if(embedded)query.set('mobile','1');return '/xinobi-u/kendi-gorselin?'+query};
 const openPreview=()=>{window.history.pushState(null,'',window.location.pathname+window.location.search+previewHash);setPreviewing(true);window.scrollTo(0,0)};
 const backToUpload=()=>{if(onPreview())window.history.back();else setPreviewing(false)};
 const switchMode=(next:Mode)=>{if(next===mode)return;setMode(next);window.history.replaceState(window.history.state,'',href(next).replace('/kendi-gorselin?','/kendi-gorselin/?'))};
 const methodHref='/xinobi-u/renk?'+new URLSearchParams({product,variant});
 const pattern=mode==='pattern';
 const ready=selected?.personalizable===true&&Boolean(start);
 if(ready&&local.url&&local.file&&local.source&&active&&previewing)return <main className={flow.page} data-product-reference={product} data-variant-reference={active.id}>
  <FlowSteps current={3} backHref={href()} backLabel="Görseli değiştir" onBack={backToUpload}/>
  <div className={styles.placementHead}>
   <div><p className={flow.kicker}>XINOBI U · Adım 4 / 4</p><h1 className={`${flow.title} ${styles.placementTitle}`}>Tasarımını yerleştir</h1></div>
  </div>
  <PlacementStudio product={selected!} variants={selected!.variants.filter(item=>accepted.surfaces[item.id])} surfaces={accepted.surfaces} active={active} onActiveChange={setActiveId} mode={mode} file={local.file} patternUrl={local.url} source={local.source} changeHref={href()} onChange={backToUpload} price={state?.prices[active.id]}/>
 </main>;
 const image=start?.image||selected?.originalImage;
 return <main className={flow.page} data-product-reference={product} data-variant-reference={start?.id??variant}>
  <FlowSteps current={2} backHref={methodHref} backLabel="Yönteme dön" hideBack={embedded}/>
  <div className={styles.uploadLayout}>
   <section className={styles.upload} aria-label={pattern?'Desen yükleme':'Görsel yükleme'}>
    <p className={flow.kicker}>XINOBI U · Adım 3 / 4</p>
    <h1 className={flow.title}>{pattern?'Desenini yükle':'Görselini yükle'}</h1>
    <p className={flow.lead}>{pattern?'Desenin, ürünün onaylı kişiselleştirme alanının tamamına uygulanır.':'Dilediğin fotoğrafı veya görseli yükleyerek ürününü kişiselleştir.'}</p>
    <section role="status" className={styles.surfaceStatus}>
     {!product?<p>Devam etmek için önce bir ürün seçin.</p>:!state||selected?.personalizable===true&&accepted.status==="loading"?<p>Ürün hazırlanıyor…</p>:accepted.status==="error"?<><p>Ürün önizlemesi yüklenemedi.</p><button type="button" className={flow.secondary} onClick={()=>setRetry(value=>value+1)}>Önizlemeyi yeniden yükle</button></>:selected?.personalizable===true&&!start?<><p>Bu ürün için onaylı yüzey henüz hazır değil.</p><p>Başka bir ürünün veya rengin maskesi kullanılmaz.</p></>:null}
    </section>
    {selected&&selected.personalizable!==true&&<p role="alert" className={flow.error}>Bu ürün kişiselleştirme programında değil.</p>}
    {ready&&<>
     <DesignUploadCard mode={mode} onModeChange={switchMode} local={local} embedded={embedded} productId={selected?.id}/>
    </>}
    <div className={`${flow.actions} ${styles.uploadActions}`}>
     {!embedded&&<Link className={flow.secondary} href={methodHref}>Geri</Link>}
     {ready&&local.url?<button type="button" className={flow.primary} onClick={openPreview}>Önizlemeye geç →</button>:<button type="button" className={flow.primary} disabled>{pattern?'Önizlemeye geçmek için desen yükle':'Önizlemeye geçmek için görsel yükle'}</button>}
    </div>
   </section>
   <DesignUploadAside product={selected} image={image} allowProductChange={!embedded}/>
  </div>
 </main>;
}
function Entry(){const query=useSearchParams();const product=query.get("product")??"",variant=query.get("variant")??"";return <Flow key={product} product={product} variant={variant} initialMode={query.get("mode")==="pattern"?"pattern":"artwork"} embedded={query.get("mobile")==="1"}/>}
export default function OwnImageEntry(){return <Suspense fallback={<p role="status">Seçim yükleniyor…</p>}><Entry/></Suspense>}
