'use client';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {designImageUrl,myDesigns,myDesignConfigurations,getDesignConfiguration,saveDesignConfiguration,setDesignConfigurationFavorite,useDemoCommerce,type MyDesign,type MyDesignConfiguration} from '../../../../lib/demo-commerce';
import {useCommerce} from '../../../../lib/commerce';
import {readDesignPlacement,saveDesignPlacement,type DesignPlacement} from '../../../../lib/design-placement';
import {addToCart,updateCartDesign,useCart,cartLineKey} from '../../../../lib/cart';
import AcceptedSurfaceEditor from '../../../urunler/cay-makinesi-101/editor/accepted-surface-editor';
import styles from '../../../xinobi-u/studio.module.css';

export default function SavedDesignPreview(){
 const params=useSearchParams(),{user,ready}=useDemoCommerce();
 if(!ready)return <main className={styles.main}><p role="status">Hesap yükleniyor…</p></main>;
 if(!user)return <main className={styles.main}><Link href="/hesap">Giriş yap →</Link></main>;
 return <Loader key={user.id+':'+params.toString()} id={params.get('id')??''} variant={params.get('variant')??''} configuration={params.get('configuration')??''} revision={Number(params.get('revision'))||undefined} target={params.get('line')??''}/>;
}
function Loader({id,variant,configuration,revision,target}:{id:string;variant:string;configuration:string;revision?:number;target:string}){
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
 return <Editor {...data} variant={variant} target={target}/>;
}
function Editor({design,src,config:initial,variant:requested,target}:{design:MyDesign;src:string;config?:MyDesignConfiguration;variant:string;target:string}){
 const router=useRouter(),{state}=useCommerce(),cart=useCart();
 const active=useRef(true),saving=useRef(false);
 useEffect(()=>{active.current=true;return()=>{active.current=false}},[]);
 const [original]=useState(()=>cart.find(row=>cartLineKey(row)===target));
 const [chosen,setChosen]=useState(requested||initial?.variantId||design.variantId||'');
 const [config,setConfig]=useState(initial),[draft,setDraft]=useState<DesignPlacement>(),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('');
 const product=state?.products.find(item=>item.id===design.productId&&item.active),color=product?.variants.find(item=>item.id===chosen);
 const base=chosen===initial?.variantId?initial.placement:original?.variantId===chosen?original.designPlacement:readDesignPlacement(design.id,design.productId,chosen);
 const change=useCallback((value:DesignPlacement)=>setDraft(value),[]);
 const missing=Boolean(target&&(!original||!cart.some(row=>cartLineKey(row)===target)));
 async function save(action:'save'|'add'|'favorite'){
  if(saving.current||!draft||!product?.personalizable||!color||missing)return;
  saving.current=true;setBusy(true);setError('');
  try{
   const existing=config?.variantId===chosen?config:undefined;
   const saved=await saveDesignConfiguration(design.id,chosen,draft,existing,action==='favorite'||existing?.favorite||false);
   if(!active.current)return;
   if(action==='favorite')await setDesignConfigurationFavorite(saved.id,true);
   if(!active.current)return;
   if(target)updateCartDesign(target,original?.configurationRevision,{id:design.id,name:design.name,placement:draft,configurationId:saved.id,configurationRevision:saved.revision});
   else if(action==='add')addToCart(product.id,color.id,color.stock,{id:design.id,name:design.name,placement:draft,configurationId:saved.id,configurationRevision:saved.revision});
   saveDesignPlacement(design.id,design.productId,chosen,draft);setConfig(saved);setNotice(action==='favorite'?'Tasarım yerleşimi favorilerine kaydedildi.':'Yerleşim kaydedildi.');
   if(target)router.push('/sepet');
  }catch(e){if(active.current)setError(e instanceof Error?e.message:'Yerleşim kaydedilemedi.')}finally{saving.current=false;if(active.current)setBusy(false)}
 }
 return <><header className={styles.main}><section className={styles.intro}><p className={styles.kicker}>Tasarımlarım · Yerleşim düzenle</p><h1>{design.name}</h1><p>{design.productName}</p></section>
  {product&&<label>Renk <select disabled={Boolean(target)||busy} value={chosen} onChange={e=>{if(draft&&!window.confirm('Kaydedilmemiş yerleşimi bırakıp renk değiştirmek istiyor musun?'))return;setChosen(e.target.value);setDraft(undefined);setNotice('')}}><option value="" disabled>Renk seç</option>{chosen&&!color&&<option value={chosen} disabled>Bu renk artık kullanılamıyor</option>}{product.variants.map(item=><option key={item.id} value={item.id}>{item.color}</option>)}</select></label>}
  {!product?.personalizable&&state&&<p role="alert">Ürün artık kişiselleştirme için kullanılamıyor.</p>}
  {product&&!color&&<p role="alert">Önizlemek için geçerli bir renk seç. Eski veya eksik renk başka renkle değiştirilmez.</p>}
  {missing&&<p role="alert">Düzenlediğin sepet satırı kaldırılmış. Satır yeniden oluşturulmaz.</p>}
  <p className={styles.note}>Temsilidir. Kaydetmeden çıkarsan sepet veya favori yerleşimi değişmez. Dijital önizleme fiziksel baskı onayı değildir.</p>
  <div className={styles.entryActions}><button disabled={busy||!draft||missing||!product?.personalizable} onClick={()=>void save('save')}>{busy?'Kaydediliyor…':target?'Sepet satırını kaydet':'Yerleşimi kaydet'}</button>{!target&&<><button disabled={busy||!draft||!color||color.stock<=0||!product?.personalizable} onClick={()=>void save('add')}>Bu tasarımla sepete ekle</button><button disabled={busy||!draft||!product?.personalizable} onClick={()=>void save('favorite')}>Yerleşimi favorilere kaydet</button></>}<Link href={target?'/sepet':'/hesap/tasarimlarim'}>İptal</Link></div>
  {error&&<p role="alert">{error}</p>}<p role="status">{notice}</p></header>
  {color&&product?.personalizable&&<AcceptedSurfaceEditor key={chosen} commerceProduct={design.productId} commerceVariant={chosen} patternSrc={src} placementMode={base?.mode??(design.kind==='upload'?'artwork':'pattern')} initialPlacement={base} onPlacementChange={change}/>}</>;
}
