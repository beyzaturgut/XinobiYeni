'use client';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import NobiChat from './nobi-chat';
import NobiMark from './nobi-mark';
import styles from './nobi.module.css';

/** Fixed "Nobi'ye sor" button at the bottom right of every page (K-08) with the chat panel; the full page lives at /asistan. */
export default function NobiLauncher(){
  const path=usePathname();
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};
    document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);
  },[open]);
  if(path?.startsWith('/asistan'))return null;
  return <>
    <section id="nobi-panel" className={styles.panel} aria-labelledby="nobi-title" hidden={!open}>
      <header className={styles.head}><div><NobiMark compact/><div><p>NOBI</p><h2 id="nobi-title">Size nasıl yardımcı olabilirim?</h2></div></div><button type="button" onClick={()=>setOpen(false)} aria-label="Nobi panelini kapat">×</button></header>
      {open&&<NobiChat onNavigate={()=>setOpen(false)}/>}
    </section>
    <button className={styles.launcher} data-app-chrome="" type="button" aria-label="Nobi’ye sor" aria-expanded={open} aria-controls="nobi-panel" onClick={()=>setOpen(value=>!value)}><NobiMark/><b>Nobi’ye sor</b></button>
  </>;
}
