'use client';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import NobiChat from './nobi-chat';
import NobiMark from './nobi-mark';
import styles from './nobi.module.css';

/** Fixed "Nobi'ye sor" button at the bottom right of every page (K-08) with the chat panel; the full page lives at /asistan. */
export default function NobiLauncher(){
  const path=usePathname();
  const [open,setOpen]=useState(false);
  const launcher=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null);
  const closePanel=()=>{setOpen(false);launcher.current?.focus({preventScroll:true})};
  useEffect(()=>{
    if(!open)return;
    panel.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus({preventScroll:true});
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape'&&(panel.current?.contains(event.target as Node)||event.target===launcher.current)){setOpen(false);launcher.current?.focus({preventScroll:true})}};
    document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);
  },[open]);
  if(path?.startsWith('/asistan'))return null;
  return <>
    <section ref={panel} id="nobi-panel" className={styles.panel} aria-labelledby="nobi-title" hidden={!open}>
      <header className={styles.head}><div><NobiMark compact/><div><p>NOBI</p><h2 id="nobi-title">Size nasıl yardımcı olabilirim?</h2></div></div><button type="button" onClick={closePanel} aria-label="Nobi panelini kapat">×</button></header>
      {open&&<NobiChat onNavigate={()=>setOpen(false)}/>}
    </section>
    <button ref={launcher} className={styles.launcher} data-app-chrome="" type="button" aria-label="Nobi’ye sor" aria-expanded={open} aria-controls="nobi-panel" onClick={()=>setOpen(value=>!value)}><NobiMark/><b>Nobi’ye sor</b></button>
  </>;
}
