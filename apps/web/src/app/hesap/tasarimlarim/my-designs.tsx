'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {deleteDesign,designImageUrl,myDesigns,myDesignConfigurations,type MyDesignConfiguration,renameDesign,useDemoCommerce,type MyDesign} from '../../../lib/demo-commerce';
import styles from './designs.module.css';

function DesignImage({design}:{design:MyDesign}){
  const [src,setSrc]=useState<string|null>(null);
  useEffect(()=>{let url:string|null=null;let active=true;designImageUrl(design).then(value=>{url=value;if(active)setSrc(value);else URL.revokeObjectURL(value)}).catch(()=>{});return()=>{active=false;if(url)URL.revokeObjectURL(url)}},[design]);
  // eslint-disable-next-line @next/next/no-img-element -- object URL of a private image
  return src?<img src={src} alt={design.name}/>:<span aria-hidden="true"/>;
}

/** Designs kept in the account (K-21): AI designs and own images, each tried again on its product. */
export default function MyDesigns(){
  const {user,ready}=useDemoCommerce();
  if(!ready)return <p role="status">Yükleniyor…</p>;
  if(!user)return <Link href="/hesap">Tasarımlarını görmek için giriş yap →</Link>;
  return <AccountDesigns key={user.id}/>;
}
function AccountDesigns(){
  const [configs,setConfigs]=useState<MyDesignConfiguration[]>([]);
  const [designs,setDesigns]=useState<MyDesign[]|null>(null),[error,setError]=useState(''),[editing,setEditing]=useState<string|null>(null),[name,setName]=useState('');
  useEffect(()=>{let active=true;Promise.all([myDesigns(),myDesignConfigurations()]).then(([value,configurations])=>{if(active){setDesigns(value);setConfigs(configurations)}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Tasarımlar yüklenemedi.')});return()=>{active=false}},[]);
  return <div className={styles.shell}>
    <div className={styles.title}><h1>Tasarımlarım</h1><Link href="/xinobi-u">Yeni tasarım oluştur →</Link></div>
    <p className={styles.caption}>XINOBI U ile oluşturduğun ve yüklediğin tasarımlar hesabında saklanır; web ve mobilde aynı listeyi görürsün. Görseller yalnız sana görünür.</p>
    {error?<p role="alert">{error}</p>:!designs?<p role="status">Tasarımlar yükleniyor…</p>:designs.length===0?<p>Henüz kayıtlı tasarımın yok. XINOBI U sonucunda “Tasarımımı kaydet” dediğinde burada görünür.</p>:
      <ul className={styles.grid}>{designs.map(design=><li key={design.id}>
        <div className={styles.media}><DesignImage design={design}/><span className={styles.badge}>Temsilidir</span></div>
        {editing===design.id?<form onSubmit={async event=>{event.preventDefault();try{const saved=await renameDesign(design.id,name);setDesigns(list=>list!.map(item=>item.id===saved.id?saved:item));setEditing(null)}catch(e){setError(e instanceof Error?e.message:'Ad değiştirilemedi.')}}}><input aria-label="Tasarım adı" value={name} maxLength={60} onChange={event=>setName(event.target.value)} autoFocus/><button>Kaydet</button></form>:<h2>{design.name}</h2>}
        <p>{design.productName}{design.color?` · ${design.color}`:''} · {design.kind==='ai'?'AI tasarımı':'Kendi görselim'} · {new Date(design.createdAt).toLocaleDateString('tr-TR')}</p>
        {design.profile.length>0&&<details><summary>Tasarım profili</summary><ul>{design.profile.map(line=><li key={line}>{line}</li>)}</ul></details>}
        <div className={styles.actions}>
          <Link href={`/hesap/tasarimlarim/onizleme?id=${design.id}`}>Ürün üzerinde gör</Link>
          {configs.filter(item=>item.designId===design.id).map(config=><Link key={config.id} href={'/hesap/tasarimlarim/onizleme?'+new URLSearchParams({id:design.id,configuration:config.id,variant:config.variantId})}>Kayıtlı yerleşimi aç · Revizyon {config.revision}</Link>)}

          <button type="button" onClick={()=>{setEditing(design.id);setName(design.name)}}>Yeniden adlandır</button>
          <button type="button" onClick={async()=>{if(!window.confirm(`“${design.name}” silinsin mi?`))return;try{await deleteDesign(design.id);setDesigns(list=>list!.filter(item=>item.id!==design.id))}catch(e){setError(e instanceof Error?e.message:'Silinemedi.')}}}>Sil</button>
        </div>
      </li>)}</ul>}
  </div>;
}
