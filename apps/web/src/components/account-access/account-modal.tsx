'use client';
import {useEffect,useRef} from 'react';
import AccountAccess from './account-access';
import styles from '../../app/hesap/account.module.css';
export default function AuthModal({mode,onClose}: {mode:'login'|'register';onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const element=ref.current;const previous=document.activeElement;element?.showModal();return()=>{element?.close();if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true})}},[]);
  function close() {ref.current?.close();}
  return <dialog ref={ref} className={styles.modal} aria-label={mode==='login'?'Giriş yap':'Hesap oluştur'} onClose={event=>{if(!event.currentTarget.open)onClose()}} onKeyDown={event=>{
    if(event.key!=='Tab')return;
    const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex]')].filter(element=>element.tabIndex>=0&&!element.matches(':disabled')&&element.getClientRects().length>0);
    const first=controls[0],last=controls.at(-1);if(!first){event.preventDefault();return}
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}}}>
    <button className={styles.close} aria-label="Pencereyi kapat" onClick={close}>×</button>
    <p className={styles.eyebrow}>XINOBI Üye Portalı</p>
    <AccountAccess initialMode={mode} onAuthenticated={close}/>
  </dialog>;
}
