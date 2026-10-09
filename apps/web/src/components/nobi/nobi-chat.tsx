'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {assistantConfig,conversation,handoff,rememberConversation,sendLead,sendMessage,storedConversation,type AssistantAction,type AssistantConfig,type AssistantMessage} from '../../lib/assistant';
import {setCompare} from '../../lib/compare';
import CompareToggle from '../compare-toggle';
import NobiMark from './nobi-mark';
import styles from './nobi.module.css';

const money=(value?:{amountMinor:number;currency:string}|null)=>value?new Intl.NumberFormat('tr-TR',{style:'currency',currency:value.currency}).format(value.amountMinor/100):'Fiyat tanımlanmadı';

function LeadForm({conversationId,onDone}:{conversationId:string;onDone:()=>void}){
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState(''),[topic,setTopic]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  return <form className={styles.lead} onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');try{await sendLead(conversationId,{name,email,phone:phone||undefined,topic,consent});onDone()}catch(e){setError(e instanceof Error?e.message:'Gönderilemedi.')}finally{setBusy(false)}}}>
    <strong>Ekibimiz sana dönsün</strong>
    <label>Adın<input required value={name} maxLength={80} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>
    <label>E-posta<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
    <label>Telefon (isteğe bağlı)<input type="tel" value={phone} maxLength={20} onChange={e=>setPhone(e.target.value)} autoComplete="tel"/></label>
    <label>Konu<textarea required rows={2} maxLength={500} value={topic} onChange={e=>setTopic(e.target.value)}/></label>
    <label className={styles.consent}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Bu bilgilerle benimle iletişime geçilmesine onay veriyorum.</span></label>
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <button disabled={busy||!consent}>{busy?'Gönderiliyor…':'Gönder'}</button>
  </form>;
}

/** Nobi chat (K-09): product cards from the live catalogue, actions, quick replies, handoff and lead form. Used in the panel and on /asistan. */
export default function NobiChat({onNavigate,full=false}:{onNavigate?:()=>void;full?:boolean}){
  const router=useRouter();
  const [config,setConfig]=useState<AssistantConfig|null>(null);
  const [conversationId,setConversationId]=useState<string|null>(null);
  const [messages,setMessages]=useState<AssistantMessage[]>([]);
  const [text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[remaining,setRemaining]=useState<number|null>(null);
  const [leadOpen,setLeadOpen]=useState(false),[leadSent,setLeadSent]=useState(false),[notice,setNotice]=useState('');
  const list=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{
    let active=true;
    assistantConfig().then(value=>{if(active)setConfig(value)}).catch(()=>{if(active)setError('Nobi şu anda kullanılamıyor.')});
    const stored=storedConversation();
    if(stored)conversation(stored).then(value=>{if(active){setConversationId(value.id);setMessages(value.messages);setLeadSent(value.leadSent)}}).catch(()=>rememberConversation(null));
    return()=>{active=false};
  },[]);
  useEffect(()=>{list.current?.scrollTo({top:list.current.scrollHeight,behavior:'smooth'})},[messages,busy,leadOpen]);
  async function send(message:string){
    const value=message.trim();if(!value||busy)return;
    setBusy(true);setError('');setNotice('');setText('');
    setMessages(current=>[...current,{id:'pending',role:'user',text:value,products:[],actions:[],at:new Date().toISOString()}]);
    try{
      const result=await sendMessage(value,conversationId);
      setConversationId(result.conversationId);rememberConversation(result.conversationId);setRemaining(result.remaining);
      setMessages(current=>[...current.filter(item=>item.id!=='pending'),{id:'u'+result.reply.id,role:'user',text:value,products:[],actions:[],at:new Date().toISOString()},result.reply]);
    }catch(e){
      setMessages(current=>current.filter(item=>item.id!=='pending'));setText(value);
      setError(e instanceof Error?e.message:'Mesaj gönderilemedi.');
    }finally{setBusy(false);input.current?.focus()}
  }
  function go(url:string){onNavigate?.();router.push(url)}
  async function act(action:AssistantAction){
    if(action.kind==='compare'&&action.productIds?.length){setCompare(action.productIds.slice(0,4));go('/karsilastir');return}
    if(action.kind==='lead'){setLeadOpen(true);return}
    if(action.kind==='handoff'&&conversationId){
      try{const result=await handoff(conversationId);setNotice(result.message);if(result.url)window.open(result.url,'_blank','noopener,noreferrer');else setLeadOpen(true)}
      catch(e){setError(e instanceof Error?e.message:'Bağlanılamadı.')}
      return;
    }
    if(action.url)go(action.url);
  }
  function reset(){rememberConversation(null);setConversationId(null);setMessages([]);setLeadOpen(false);setLeadSent(false);setRemaining(null);setNotice('');setError('')}
  return <div className={full?`${styles.chat} ${styles.full}`:styles.chat}>
    <div className={styles.messages} ref={list} aria-live="polite">
      <article className={styles.assistant}><NobiMark compact/><div><p>{config?.greeting??'Merhaba, ben Nobi. Size nasıl yardımcı olabilirim?'}</p></div></article>
      {messages.map(message=>message.role==='user'?<article key={message.id} className={styles.user}><p>{message.text}</p></article>:
        <article key={message.id} className={styles.assistant}><NobiMark compact/><div>
          <p>{message.text}</p>
          {message.products.length>0&&<ul className={styles.cards}>{message.products.map(product=><li key={product.id}>
            {product.imageUrl?<Image src={product.imageUrl} alt="" width={64} height={64} unoptimized/>:<span/>}
            <div><Link href={`/urunler/detay?id=${encodeURIComponent(product.id)}`} onClick={onNavigate}>{product.name}</Link><small>{money(product.priceFrom)} · {product.inStock?'Stokta':'Stokta yok'}{product.personalizable?' · XINOBI U':''}</small></div>
            <CompareToggle productId={product.id} name={product.name} compact/>
          </li>)}</ul>}
          {message.actions.length>0&&<div className={styles.actions}>{message.actions.map(action=><button type="button" key={action.kind+action.label} onClick={()=>void act(action)}>{action.label}</button>)}</div>}
          <small className={styles.source}>{message.source==='ai'?'Yapay zekâ yanıtı · ürün bilgileri katalogdan':'Katalog araması'}</small>
        </div></article>)}
      {busy&&<p className={styles.typing} role="status">Nobi yazıyor…</p>}
      {leadOpen&&conversationId&&!leadSent&&<LeadForm conversationId={conversationId} onDone={()=>{setLeadSent(true);setLeadOpen(false);setNotice('Talebin alındı; ekibimiz seninle iletişime geçecek.')}}/>}
      {notice&&<p className={styles.notice} role="status">{notice}</p>}
    </div>
    {messages.length===0&&config&&<div className={styles.quick}>{config.quickReplies.map(reply=><button type="button" key={reply} onClick={()=>void send(reply)}>{reply}</button>)}</div>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <form className={styles.composer} onSubmit={event=>{event.preventDefault();void send(text)}}>
      <label htmlFor={full?'nobi-message-full':'nobi-message'} className={styles.srOnly}>Nobi’ye mesajın</label>
      <textarea id={full?'nobi-message-full':'nobi-message'} ref={input} rows={2} maxLength={500} value={text} placeholder="Ne aradığını yaz…" onChange={e=>setText(e.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void send(text)}}}/>
      <button disabled={busy||!text.trim()} aria-label="Mesajı gönder">↑</button>
    </form>
    <div className={styles.footer}><small>{config?.disclaimer}{remaining!==null&&remaining<=5?` · Bu konuşmada ${remaining} mesaj hakkın kaldı.`:''}</small>{messages.length>0&&<button type="button" onClick={reset}>Yeni konuşma</button>}</div>
  </div>;
}
