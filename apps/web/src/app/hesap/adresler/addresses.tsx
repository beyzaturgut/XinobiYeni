'use client';
import Link from 'next/link';
import {useState,type FormEvent} from 'react';
import {deleteAddress,localPhone,saveAddress,useDemoCommerce,type AddressInput,type CustomerAddress} from '../../../lib/demo-commerce';
import styles from '../account.module.css';

const blank=(name='',phone=''):AddressInput=>({title:'',fullName:name,phone,city:'',district:'',line:'',postalCode:'',isDefault:false});

/** The signed-in customer's delivery addresses (server-side, shared with mobile): list, add, edit, delete, choose the default. */
export default function Addresses(){
  const {user,addresses,ready}=useDemoCommerce();
  const [editing,setEditing]=useState<CustomerAddress|'new'|null>(null);
  if(!ready)return <div className={styles.shell}><p role="status">Adresler yükleniyor…</p></div>;
  if(!user)return <div className={styles.shell}><h1>Adreslerim</h1><p><Link href="/hesap/giris">Adreslerini görmek için giriş yap →</Link></p></div>;
  return <div className={styles.shell}>
    <div className={styles.titleRow}><div><p className={styles.eyebrow}><Link href="/hesap">← Hesabım</Link></p><h1>Adreslerim</h1></div>
      {editing===null&&<button className={styles.primary} onClick={()=>setEditing('new')}>Adres ekle</button>}</div>
    {editing!==null?<AddressForm key={editing==='new'?'new':editing.id} address={editing==='new'?undefined:editing} initial={editing==='new'?blank(user.name,localPhone(user.phone)):undefined} onDone={()=>setEditing(null)}/>:
      addresses.length===0?<p className={styles.note}>Henüz kayıtlı adresin yok. Sipariş verirken kullanacağın bir teslimat adresi ekle.</p>:
      <ul className={styles.addressList}>{addresses.map(address=><li key={address.id}><div><strong>{address.title}{address.isDefault&&<em>Varsayılan</em>}</strong><small>{address.fullName} · {localPhone(address.phone)}</small><small>{address.line}, {address.district}/{address.city}{address.postalCode?` ${address.postalCode}`:''}</small></div>
        <div className={styles.addressActions}>{!address.isDefault&&<button className={styles.secondary} onClick={()=>saveAddress({...address,isDefault:true},address.id)}>Varsayılan yap</button>}<button className={styles.secondary} onClick={()=>setEditing(address)}>Düzenle</button></div></li>)}</ul>}
  </div>;
}

function AddressForm({address,initial,onDone}:{address?:CustomerAddress;initial?:AddressInput;onDone:()=>void}){
  const [form,setForm]=useState<AddressInput>(address?{...address,phone:localPhone(address.phone),postalCode:address.postalCode??''}:initial!);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const set=(field:keyof AddressInput)=>(event:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setForm(current=>({...current,[field]:field==='isDefault'?(event.target as HTMLInputElement).checked:event.target.value}));
  async function run(action:()=>Promise<unknown>){setBusy(true);setError('');try{await action();onDone()}catch(problem){setError(problem instanceof Error?problem.message:'İşlem tamamlanamadı.');setBusy(false)}}
  function submit(event:FormEvent){event.preventDefault();run(()=>saveAddress({...form,postalCode:form.postalCode?.trim()||null},address?.id))}
  return <form className={`${styles.form} ${styles.addressForm}`} onSubmit={submit} noValidate><h3>{address?'Adresi düzenle':'Yeni adres'}</h3>
    <label>Adres başlığı<input value={form.title} maxLength={40} placeholder="Ev, İş" onChange={set('title')}/></label>
    <label>Teslim alacak kişi<input value={form.fullName} maxLength={80} autoComplete="name" onChange={set('fullName')}/></label>
    <label>Telefon<input value={form.phone} type="tel" autoComplete="tel" placeholder="0532 123 45 67" onChange={set('phone')}/></label>
    <div className={styles.pair}><label>İl<input value={form.city} maxLength={40} autoComplete="address-level1" onChange={set('city')}/></label><label>İlçe<input value={form.district} maxLength={60} autoComplete="address-level2" onChange={set('district')}/></label></div>
    <label>Açık adres<textarea value={form.line} maxLength={250} rows={3} autoComplete="street-address" onChange={set('line')}/></label>
    <label>Posta kodu (isteğe bağlı)<input value={form.postalCode??''} inputMode="numeric" maxLength={5} autoComplete="postal-code" onChange={set('postalCode')}/></label>
    <label className={styles.check}><input type="checkbox" checked={form.isDefault} disabled={address?.isDefault} onChange={set('isDefault')}/>Varsayılan adresim olsun</label>
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <div className={styles.addressActions}><button className={styles.primary} disabled={busy}>{busy?'Kaydediliyor…':'Kaydet'}</button><button type="button" className={styles.secondary} onClick={onDone} disabled={busy}>Vazgeç</button>
      {address&&<button type="button" className={styles.logout} disabled={busy} onClick={()=>run(()=>deleteAddress(address.id))}>Adresi sil</button>}</div>
  </form>;
}
