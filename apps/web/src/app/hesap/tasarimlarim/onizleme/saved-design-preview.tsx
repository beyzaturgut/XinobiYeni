'use client';
import Link from 'next/link';
import PlacementStudio from '../../../xinobi-u/kendi-gorselin/placement-studio';
import DesignAccountAccess from '../../../../components/design-account-access';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {uploadDesign,saveConfigurationPreview,designImageUrl,myDesigns,myDesignConfigurations,getDesignConfiguration,saveDesignConfiguration,setDesignConfigurationFavorite,useDemoCommerce,type MyDesign,type MyDesignConfiguration} from '../../../../lib/demo-commerce';
import {useCommerce} from '../../../../lib/commerce';
import {readDesignPlacement,saveDesignPlacement,type DesignPlacement} from '../../../../lib/design-placement';
import {designDisplayName,useCartReady,flushNativeCart,addToCart,updateCartDesign,useCart,cartLineKey} from '../../../../lib/cart';
import DesignUploadCard,{DesignUploadAside,type UploadMode} from '../../../xinobi-u/kendi-gorselin/design-upload-card';
import FlowSteps from '../../../xinobi-u/flow-steps';
import {useAcceptedVariants} from '../../../../features/product-personalization/accepted-variants';
import {useLocalPatternFile} from '../../../../features/product-personalization/use-local-pattern-file';
import styles from '../../../xinobi-u/studio.module.css';
import flow from '../../../xinobi-u/flow.module.css';
import uploadStyles from '../../../xinobi-u/kendi-gorselin/own-image.module.css';
import buttons from '../../../../components/save-design.module.css';

export default function SavedDesignPreview(){
 const params=useSearchParams(),{user,ready}=useDemoCommerce(),cartReady=useCartReady();
 if(!ready||!cartReady)return <main className={styles.main}><p role="status">Hesap yükleniyor…</p></main>;
 if(!user)return <main className={styles.main}><DesignAccountAccess/></main>;
 return <Loader key={user.id+':'+params.toString()} id={params.get('id')??''} variant={params.get('variant')??''} configuration={params.get('configuration')??''} revision={Number(params.get('revision'))||undefined} target={params.get('line')??''} feedback={params.get('saved')??''}/>;
}
function Loader({id,variant,configuration,revision,target,feedback}:{feedback:string;id:string;variant:string;configuration:string;revision?:number;target:string}){
 const [data,setData]=useState<{design:MyDesign;src:string;config?:MyDesignConfiguration}>(),[error,setError]=useState('');
 useEffect(()=>{let active=true,url:string|undefined;
  Promise.all([myDesigns(),configuration?(revision?getDesignConfiguration(configuration,revision):myDesignConfigurations().then(list=>list.find(item=>item.id===configuration))):Promise.resolve(undefined)]).then(async([list,config])=>{
   const design=list.find(item=>item.id===id);if(!design)throw new Error('Tasarım silinmiş veya bu hesaba ait değil.');
   if(configuration&&(!config||config.designId!==id))throw new Error('Tasarım yerleşimi bulunamadı.');
   url=await designImageUrl(design);if(active)setData({design,src:url,config});else URL.revokeObjectURL(url);
  }).catch(e=>{if(active)setError(e instanceof Error?e.message:'Tasarım yüklenemedi.')});return()=>{active=false;if(url)URL.revokeObjectURL(url)};
 },[id,configuration,revision]);
 if(error)return <main className={styles.main}><p role="alert">{error}</p><Link href="/sepet">Sepete dön</Link></main>;
 if(!data)return <main className={styles.main}><p role="status">Tasarım yükleniyor…</p></main>;
 return <Editor {...data} variant={variant} target={target} feedback={feedback}/>;
}
function Editor({design,src,config:initial,variant:requested,target,feedback}:{design:MyDesign;src:string;config?:MyDesignConfiguration;variant:string;target:string;feedback:string}){
 const router=useRouter(),{state}=useCommerce(),cart=useCart();
 const active=useRef(true),saving=useRef(false),uploaded=useRef<{file:File;design:MyDesign}|null>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false}},[]);
 const [original]=useState(()=>cart.find(row=>cartLineKey(row)===target));
 const [chosen,setChosen]=useState(requested||initial?.variantId||design.variantId||'');
 const [seed,setSeed]=useState<DesignPlacement|undefined>(()=>chosen===initial?.variantId?initial.placement:original?.variantId===chosen?original.designPlacement:readDesignPlacement(design.id,design.productId,chosen));
 const defaultMode=design.kind==='upload'?'artwork':'pattern';
 const [mode,setMode]=useState<UploadMode>(seed?.mode??defaultMode);
 const [config,setConfig]=useState(initial),[draft,setDraft]=useState<DesignPlacement>(),[previewCanvas,setPreviewCanvas]=useState<HTMLCanvasElement|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0),[hideOriginal,setHideOriginal]=useState(false);
 const [notice,setNotice]=useState(feedback==='save'?'Tasarım değişiklikleri kaydedildi.':feedback==='favorite'?'Tasarım yerleşimi favorilerine kaydedildi.':feedback==='add'?'Tasarımlı ürün sepete eklendi.':'');
 const [uploading,setUploading]=useState(()=>typeof window!=='undefined'&&window.location.hash==='#yukleme');
 useEffect(()=>{const sync=()=>setUploading(window.location.hash==='#yukleme');window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync)}},[]);
 const local=useLocalPatternFile();
 const product=state?.products.find(item=>item.id===design.productId&&item.active),color=product?.variants.find(item=>item.id===chosen);
 const accepted=useAcceptedVariants(product?.personalizable?product:undefined,retry),inputs=accepted.surfaces[chosen];
 const patternUrl=local.url??(hideOriginal?undefined:src),source=local.source??{name:design.name,type:'',size:0};
 const placementSeed=seed&&(seed.mode??defaultMode)===mode?(local.file?{...seed,mode,fillMask:mode==='pattern'}:seed):undefined;
 const viewUpload=uploading||!patternUrl;
 const change=useCallback((value:DesignPlacement)=>setDraft(value),[]);
 const missing=Boolean(target&&(!original||!cart.some(row=>cartLineKey(row)===target)));
 const changedSurface=Boolean(inputs&&seed&&seed.surfaceVersion!==inputs.surfaceVersion&&(!draft||draft.surfaceVersion!==inputs.surfaceVersion)&&chosen===(initial?.variantId??original?.variantId));
 function editFile(){setSeed(draft??seed);window.history.pushState(null,'',window.location.pathname+window.location.search+'#yukleme');setUploading(true);window.scrollTo(0,0)}
 function preview(){if(!patternUrl||local.busy)return;window.history.pushState(null,'',window.location.pathname+window.location.search);setUploading(false);window.scrollTo(0,0)}
 function switchMode(next:UploadMode){if(mode!==next){setMode(next);setSeed(undefined);setDraft(undefined)}}
 async function save(action:'save'|'add'|'favorite'){
  if(saving.current||!draft||!previewCanvas||!product?.personalizable||!color||missing||local.busy||!patternUrl)return;
  saving.current=true;setBusy(true);setError('');setNotice('');
  try{
   let savedDesign=design;
   if(local.file){
    if(uploaded.current?.file!==local.file)uploaded.current={file:local.file,design:await uploadDesign(local.file,product.id,chosen,designDisplayName(design.name))};
    savedDesign=uploaded.current.design;
   }
   if(!active.current)return;
   const existing=target?undefined:config;
   const saved=await saveDesignConfiguration(savedDesign.id,chosen,draft,existing,action==='favorite'||(!target&&existing?.favorite)||false);
   if(!active.current)return;
   setConfig(saved);
   await saveConfigurationPreview(saved,previewCanvas);
   if(action==='favorite')await setDesignConfigurationFavorite(saved.id,true);
   if(!active.current)return;
   if(target)updateCartDesign(target,original?.configurationRevision,{id:savedDesign.id,name:savedDesign.name,placement:draft,configurationId:saved.id,configurationRevision:saved.revision},{variantId:chosen,stock:color.stock,expectedDesignId:design.id});
   else if(action==='add')addToCart(product.id,color.id,color.stock,{id:savedDesign.id,name:savedDesign.name,placement:draft,configurationId:saved.id,configurationRevision:saved.revision});
   await flushNativeCart();
   saveDesignPlacement(savedDesign.id,product.id,chosen,draft);
   if(target){router.push('/sepet');return}
   // The URL now points to the saved source, colour and revision; a refresh must reopen this design too.
   const query=new URLSearchParams(window.location.search);query.set('id',savedDesign.id);query.set('variant',chosen);query.set('configuration',saved.id);query.set('revision',String(saved.revision));query.set('saved',action);
   window.history.replaceState(null,'',window.location.pathname+'?'+query);
  }catch(e){if(active.current)setError(e instanceof Error?e.message:'Tasarım kaydedilemedi.')}finally{saving.current=false;if(active.current)setBusy(false)}
 }
 const returnTo=target?'/sepet':initial?.favorite?'/favoriler':'/hesap/tasarimlarim';
 const actions=<div className={`${buttons.wrap} ${buttons.stacked}`}><div className={buttons.actions}>
  <button className={`${buttons.button} ${target?buttons.primary:''}`} disabled={busy||!draft||!previewCanvas||missing||!product?.personalizable} onClick={()=>void save('save')}>{busy?'Kaydediliyor…':target?'Sepet satırını kaydet':'Tasarımımı kaydet'}</button>
  {!target&&<><button disabled={busy||!draft||!previewCanvas||!color||color.stock<=0||!product?.personalizable} className={`${buttons.button} ${buttons.primary}`} onClick={()=>void save('add')}>Bu tasarımla sepete ekle</button><button disabled={busy||!draft||!previewCanvas||!product?.personalizable} className={buttons.button} onClick={()=>void save('favorite')}>Yerleşimi favorilere kaydet</button></>}
 </div>{notice&&<p role="status" className={buttons.saved}>{notice} <Link href={feedback==='favorite'?'/favoriler':'/sepet'}>{feedback==='favorite'?'Favorilere git →':'Sepete git →'}</Link></p>}</div>;
 return <main className={flow.page} data-product-reference={design.productId} data-variant-reference={chosen}>
  <FlowSteps current={viewUpload?2:3} backHref={viewUpload?'#':'#yukleme'} backLabel={viewUpload?'Önizlemeye dön':'Görseli değiştir'} onBack={viewUpload?preview:editFile}/>
  <header><p className={styles.kicker}>Tasarımlarım · Tasarımı düzenle</p><h1 className={flow.title}>{viewUpload?(mode==='pattern'?'Desenini yükle':'Görselini yükle'):design.name}</h1><p>{design.productName}</p>
   <p className={styles.note}>Kaydetmeden çıkarsan sepet veya favori değişmez. Temsili dijital önizleme, baskı onayı değildir.</p><Link href={returnTo}>İptal</Link>
   {missing&&<p role="alert">Düzenlediğin sepet satırı kaldırılmış. Satır yeniden oluşturulmaz.</p>}{error&&<p role="alert">{error}</p>}
  </header>
  {viewUpload?<div className={uploadStyles.uploadLayout}><section className={uploadStyles.upload} aria-label={mode==='pattern'?'Desen yükleme':'Görsel yükleme'}><DesignUploadCard mode={mode} onModeChange={switchMode} local={local} existing={hideOriginal?undefined:{url:src,source:{name:design.name,type:'',size:0}}} onRemove={()=>setHideOriginal(true)} embedded={paramsMobile()} productId={design.productId}/><div className={flow.actions}><button className={flow.primary} disabled={!patternUrl||local.busy} onClick={preview}>Önizlemeye geç →</button></div></section><DesignUploadAside product={product} image={color?.image||product?.originalImage} allowProductChange={false}/></div>
   :!state||accepted.status==='loading'?<p role="status">Ürün önizlemesi yükleniyor…</p>
   :!product?.personalizable?<p role="alert">Ürün artık kişiselleştirme için kullanılamıyor.</p>
   :accepted.status==='error'?<p role="alert">Ürün yüzeyleri yüklenemedi. <button onClick={()=>setRetry(value=>value+1)}>Yeniden dene</button></p>
   :!color||!inputs?<section role="alert"><p>Bu renk için onaylı yüzey yok. Başka bir renk seç.</p>{product.variants.filter(item=>accepted.surfaces[item.id]).map(item=><button key={item.id} onClick={()=>{setChosen(item.id);setSeed(undefined);setDraft(undefined)}}>{item.color} rengini seç</button>)}</section>
   :changedSurface?<section role="alert"><p>Ürün yüzeyi değişti. Eski yerleşim bu yüzeye otomatik uygulanmaz.</p><button onClick={()=>{setSeed(undefined);setDraft(undefined)}}>Güncel yüzeye yeniden yerleştir</button></section>
   :patternUrl&&<div inert={busy}><PlacementStudio product={product} variants={product.variants.filter(item=>accepted.surfaces[item.id])} surfaces={accepted.surfaces} active={color} onActiveChange={setChosen} mode={mode} cover={mode==='pattern'} initialPlacement={placementSeed} patternUrl={patternUrl} source={source} canChange changeHref="#yukleme" onChange={editFile} price={state.prices[chosen]} onDraftChange={change} onRendered={setPreviewCanvas} actions={actions}/></div>}
 </main>;
}
function paramsMobile(){return typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('mobile')==='1'}
