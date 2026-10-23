"use client";
import Image from "next/image";
import Link from "next/link";
import {Suspense,useEffect,useState,type DragEvent} from "react";
import {useSearchParams} from "next/navigation";
import {useCommerce,mediaUrl,commerceApi} from "../../../lib/commerce";
import {fileMeta,useLocalPatternFile} from "../../../features/product-personalization/use-local-pattern-file";
import {startingVariant,useAcceptedVariants} from "../../../features/product-personalization/accepted-variants";
import FlowSteps from "../flow-steps";
import PlacementStudio from "./placement-studio";
import flow from "../flow.module.css";
import styles from "./own-image.module.css";

type Mode="pattern"|"artwork";
const accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
const sampleSrc="/assets/personalization/sample-pattern.png";


const previewHash='#onizleme';
const onPreview=()=>typeof window!=='undefined'&&window.location.hash===previewHash;

/** Steps 3 (upload) and 4 (placement) share this component, so the locally prepared image survives the step change.
 *  A changed query would remount the page, so the step is a history entry with a hash (the back button returns to
 *  the upload) and the upload type only rewrites the address. */
function Flow({product,variant,initialMode,embedded}:{product:string;variant:string;initialMode:Mode;embedded:boolean}){
 const [mode,setMode]=useState(initialMode),[previewing,setPreviewing]=useState(onPreview);
 // In the mobile app the app bar leads back to its own method screen; the site's chrome and web back links stay hidden.
 useEffect(()=>{if(!embedded)return;document.documentElement.dataset.embedded='app';return()=>{delete document.documentElement.dataset.embedded}},[embedded]);
 useEffect(()=>{const sync=()=>setPreviewing(onPreview());window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync)}},[]);
 const {state}=useCommerce();
 const selected=state?.products.find(item=>item.id===product&&item.active);
 const [retry,setRetry]=useState(0),[activeId,setActiveId]=useState(variant),[dragging,setDragging]=useState(false),[sampleError,setSampleError]=useState('');
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
 const pick=async(file:File|undefined)=>{if(file){setSampleError('');await local.select(file)}};
 async function trySample(){setSampleError('');try{const response=await fetch(sampleSrc);if(!response.ok)throw new Error();const blob=await response.blob();void local.select(new File([blob],'ornek-desen.png',{type:blob.type||'image/png'}))}catch{setSampleError('Örnek görsel yüklenemedi.')}}
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
     <div className={styles.kinds} role="group" aria-label="Yükleme türü">{(['artwork','pattern'] as const).map(kind=><button type="button" key={kind} aria-pressed={mode===kind} onClick={()=>switchMode(kind)}>{kind==='pattern'?'Desen':'Görsel'}</button>)}</div>
     {local.url&&local.source?<div className={styles.fileCard}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
      <img src={local.url} alt={pattern?'Yüklenen desen':'Yüklenen görsel'}/>
      <div><p className={styles.fileReady}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>{pattern?'Desen hazır':'Görsel hazır'}</p><p className={styles.fileName}>{local.source.name}</p><p className={styles.fileMeta}>{fileMeta(local.source)}</p></div>
      <div className={styles.fileActions}><label className={styles.pickSmall}>Değiştir<input id="local-pattern" type="file" accept={accept} disabled={local.busy} onChange={event=>{const input=event.currentTarget,file=input.files?.[0];void pick(file).finally(()=>{if(input.files?.[0]===file)input.value=''})}}/></label><button type="button" aria-label={pattern?'Deseni kaldır':'Görseli kaldır'} onClick={local.remove}>Kaldır</button></div>
     </div>:<div className={`${styles.drop} ${dragging?styles.dragging:''}`} onDragOver={(event:DragEvent)=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={(event:DragEvent)=>{event.preventDefault();setDragging(false);pick(event.dataTransfer.files?.[0])}}>
      <span className={styles.dropIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg></span>
      <p className={styles.dropTitle}>{pattern?'Desenini buraya sürükle':'Görselini buraya sürükle'}</p>
      <p>{embedded?'ya da cihazından bir dosya seç':'ya da bilgisayarından bir dosya seç'}</p>
      <div className={styles.dropActions}><label className={styles.pick}>Dosya seç<input id="local-pattern" type="file" accept={accept} disabled={local.busy} aria-describedby="local-image-help" onChange={event=>{const input=event.currentTarget,file=input.files?.[0];void pick(file).finally(()=>{if(input.files?.[0]===file)input.value=''})}}/></label><button type="button" className={styles.sample} disabled={local.busy} onClick={()=>void trySample()}>Örnek görselle dene</button></div>
     </div>}
     {local.busy&&<div className={styles.busy}><p role="status">Görsel hazırlanıyor…</p><button type="button" className={flow.secondary} onClick={local.cancel}>Hazırlamayı iptal et</button></div>}
     {(local.error||sampleError)&&<p role="alert" className={flow.error}>{local.error||sampleError}</p>}
     <ul className={styles.chips}><li>PNG, JPEG veya WebP</li><li>Boyut ve çözünürlük sınırı yok</li><li>Büyük görseller otomatik optimize edilir</li></ul>
     <div className={styles.privacy}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><p id="local-image-help">Görselin yalnızca bu tarayıcıda önizlenir. <strong>Tasarımımı kaydet</strong> dersen hesabına yüklenir ve yalnızca sen görürsün.</p></div>
    </>}
    <div className={`${flow.actions} ${styles.uploadActions}`}>
     {!embedded&&<Link className={flow.secondary} href={methodHref}>Geri</Link>}
     {ready&&local.url?<button type="button" className={flow.primary} onClick={openPreview}>Önizlemeye geç →</button>:<button type="button" className={flow.primary} disabled>{pattern?'Önizlemeye geçmek için desen yükle':'Önizlemeye geçmek için görsel yükle'}</button>}
    </div>
   </section>
   <aside className={styles.aside} aria-label="Seçtiğin ürün">
    {selected&&<div className={styles.productCard}>
     <div className={styles.productImage}>{image&&<Image src={mediaUrl(image,commerceApi)} alt={selected.name} width={400} height={400}/>}</div>
     <div className={styles.productText}><p className={styles.productKicker}>Seçtiğin ürün</p><p className={styles.productName}>{selected.name}</p><p>Rengi ve görselin yerleşimini bir sonraki adımda önizleme üzerinde ayarlayacaksın.</p>{!embedded&&<Link href="/xinobi-u">Başka ürün seç <span aria-hidden="true">→</span></Link>}</div>
    </div>}
    <div className={styles.tips}><p>İyi bir sonuç için</p><ul><li>Net ve yüksek çözünürlüklü bir görsel seç.</li><li>Önemli öğeleri görselin ortasına yakın tut.</li><li>Desenlerde kenarları birbirine uyan, tekrar eden görseller daha iyi sonuç verir.</li></ul></div>
   </aside>
  </div>
 </main>;
}
function Entry(){const query=useSearchParams();const product=query.get("product")??"",variant=query.get("variant")??"";return <Flow key={product} product={product} variant={variant} initialMode={query.get("mode")==="pattern"?"pattern":"artwork"} embedded={query.get("mobile")==="1"}/>}
export default function OwnImageEntry(){return <Suspense fallback={<p role="status">Seçim yükleniyor…</p>}><Entry/></Suspense>}
