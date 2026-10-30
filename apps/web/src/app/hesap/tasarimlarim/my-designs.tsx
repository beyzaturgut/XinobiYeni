'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {deleteDesign,designImageUrl,myDesigns,myDesignConfigurations,type MyDesignConfiguration,renameDesign,useDemoCommerce,type MyDesign} from '../../../lib/demo-commerce';
import styles from './designs.module.css';

function DesignImage({design}:{design:MyDesign}){
  const [src,setSrc]=useState<string|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
  useEffect(()=>{let url:string|null=null;let active=true;designImageUrl(design).then(value=>{url=value;if(active)setSrc(value);else URL.revokeObjectURL(value)}).catch(()=>{if(active)setError(true)});return()=>{active=false;if(url)URL.revokeObjectURL(url)}},[design,retry]);
  // eslint-disable-next-line @next/next/no-img-element -- object URL of a private image
  return src?<img src={src} alt={design.name}/>:<span role="status">{error?<>Görsel yüklenemedi. <button type="button" onClick={()=>{setError(false);setRetry(value=>value+1)}}>Görseli tekrar yükle</button></>:"Görsel yükleniyor…"}</span>;
}

/** Designs kept in the account (K-21): AI designs and own images, each tried again on its product. */
export default function MyDesigns(){
  const {user,ready}=useDemoCommerce();
  if(!ready)return <p role="status">Yükleniyor…</p>;
  if(!user)return <Link href="/hesap">Tasarımlarını görmek için giriş yap →</Link>;
  return <AccountDesigns key={user.id}/>;
}
function AccountDesigns(){
  const [configs,setConfigs]=useState<MyDesignConfiguration[]>([]),[reload,setReload]=useState(0),[busy,setBusy]=useState(''),[notice,setNotice]=useState('');
  const lock=useRef(false);
  async function action(id:string,work:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(id);setError('');setNotice('');try{await work()}catch(e){setError(e instanceof Error?e.message:'İşlem tamamlanamadı.')}finally{lock.current=false;setBusy('')}}
  const [designs,setDesigns]=useState<MyDesign[]|null>(null),[error,setError]=useState(''),[editing,setEditing]=useState<string|null>(null),[name,setName]=useState('');
  useEffect(()=>{let active=true;Promise.all([myDesigns(),myDesignConfigurations()]).then(([value,configurations])=>{if(active){setDesigns(value);setConfigs(configurations)}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Tasarımlar yüklenemedi.')});return()=>{active=false}},[reload]);
  return <div className={styles.shell}>
    <div className={styles.title}><h1>Tasarımlarım</h1><Link href="/xinobi-u">Yeni tasarım oluştur →</Link></div>
    <p className={styles.caption}>XINOBI U ile oluşturduğun ve yüklediğin tasarımlar hesabında saklanır; web ve mobilde aynı listeyi görürsün. Görseller yalnız sana görünür.</p>
    {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error} {!designs&&<button type="button" onClick={()=>{setError('');setReload(value=>value+1)}}>Tekrar dene</button>}</p>}{!designs?(error?null:<p role="status">Tasarımlar yükleniyor…</p>):designs.length===0?<p>Henüz kayıtlı tasarımın yok. XINOBI U sonucunda “Tasarımımı kaydet” dediğinde burada görünür.</p>:
      <ul className={styles.grid}>{designs.map(design=><li key={design.id}>
        <div className={styles.media}><DesignImage design={design}/><span className={styles.badge}>Temsilidir</span></div>
        {editing===design.id?<form onSubmit={async event=>{event.preventDefault();void action(design.id,async()=>{const saved=await renameDesign(design.id,name);setDesigns(list=>list!.map(item=>item.id===saved.id?saved:item));setEditing(null);setNotice('Tasarım adı güncellendi.')})}}><input aria-label="Tasarım adı" value={name} maxLength={60} onChange={event=>setName(event.target.value)} autoFocus/><button disabled={!!busy}>{busy===design.id?'Kaydediliyor…':'Kaydet'}</button></form>:<h2>{design.name}</h2>}
        <p>{design.productName}{design.color?` · ${design.color}`:''} · {design.kind==='ai'?'AI tasarımı':'Kendi görselim'} · {new Date(design.createdAt).toLocaleDateString('tr-TR')}</p>
        {design.profile.length>0&&<details><summary>Tasarım profili</summary><ul>{design.profile.map(line=><li key={line}>{line}</li>)}</ul></details>}
        <div className={styles.actions}>
          <Link href={`/hesap/tasarimlarim/onizleme?id=${design.id}`}>Ürün üzerinde gör</Link>
          {configs.filter(item=>item.designId===design.id).map(config=><Link key={config.id} href={'/hesap/tasarimlarim/onizleme?'+new URLSearchParams({id:design.id,configuration:config.id,variant:config.variantId})}>Kayıtlı yerleşimi aç · Revizyon {config.revision}</Link>)}

          <button type="button" disabled={!!busy} onClick={()=>{setError('');setEditing(design.id);setName(design.name)}}>Yeniden adlandır</button>
          <button type="button" disabled={!!busy} onClick={()=>{if(!window.confirm(`“${design.name}” silinsin mi?`))return;void action(design.id,async()=>{await deleteDesign(design.id);setDesigns(list=>list!.filter(item=>item.id!==design.id));setNotice('Tasarım silindi.')})}}>Sil</button>
        </div>
      </li>)}</ul>}
  </div>;
}
