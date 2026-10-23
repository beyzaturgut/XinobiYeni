'use client';
import {useEffect,useRef} from 'react';
import AccountAccess from './account-access';
import styles from '../../app/hesap/account.module.css';
export default function AuthModal({mode,onClose}: {mode:'login'|'register';onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();},[]);
  function close() {ref.current?.close();}
  return <dialog ref={ref} className={styles.modal} aria-label={mode==='login'?'Giriş yap':'Hesap oluştur'} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}}}>
    <button className={styles.close} aria-label="Pencereyi kapat" onClick={close}>×</button>
    <p className={styles.eyebrow}>XINOBI Üye Portalı</p>
    <AccountAccess initialMode={mode} onAuthenticated={close}/>
  </dialog>;
}
