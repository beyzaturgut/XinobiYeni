import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { type AdminView, categoryForView, topNavigation } from './admin-navigation'

export default function AdminHeader({ can, navigate, name, notice, view }: { can:(permission:string)=>boolean; navigate:(view:AdminView)=>void; name?:string; notice:string; view:AdminView }) {
  const [open,setOpen]=useState<string|null>(null)
  const root=useRef<HTMLElement>(null),popup=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement|null>(null)
  const hover=useRef(false)
  const groups=topNavigation.map(group=>({...group,links:group.links.filter(link=>can(link.permission))})).filter(group=>group.links.length)
  const current=groups.find(group=>group.name===open)
  const activeCategory=categoryForView(view)
  function close(restore=false){setOpen(null);hover.current=false;if(restore)trigger.current?.focus()}
  function go(next:AdminView){close(true);navigate(next)}
  function toggle(id:string,button:HTMLButtonElement){trigger.current=button;setOpen(hover.current?id:open===id?null:id);hover.current=false}
  function focusMenu(id:string,button:HTMLButtonElement,last=false){
    trigger.current=button;hover.current=false;setOpen(id)
    requestAnimationFrame(()=>{const buttons=popup.current?.querySelectorAll<HTMLButtonElement>('.navigation-links button');(buttons?.length?buttons[last?buttons.length-1:0]:popup.current?.querySelector<HTMLButtonElement>('button'))?.focus()})
  }
  useLayoutEffect(()=>{
    const element=root.current
    if(!element)return
    const observer=new ResizeObserver(()=>document.documentElement.style.setProperty('--admin-navigation-height',element.getBoundingClientRect().height+'px'))
    observer.observe(element)
    return()=>{observer.disconnect();document.documentElement.style.removeProperty('--admin-navigation-height')}
  },[])
  useLayoutEffect(()=>{
    if(!open)return
    function position(){
      const anchor=trigger.current?.getBoundingClientRect(),element=popup.current
      if(!anchor||!element)return
      const width=Math.min((current?.links.length??0)>3?460:300,innerWidth-24);element.style.width=width+'px'
      const below=innerHeight-anchor.bottom-20,above=anchor.top-20,flip=below<180&&above>below
      const maxHeight=Math.max(0,flip?above:below),height=Math.min(element.scrollHeight,maxHeight)
      Object.assign(element.style,{left:Math.max(12,Math.min(anchor.left,innerWidth-width-12))+'px',top:Math.max(12,flip?anchor.top-height-8:anchor.bottom+8)+'px',maxHeight:maxHeight+'px'})
    }
    position();window.addEventListener('resize',position);window.addEventListener('scroll',position,true)
    return()=>{window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true)}
  },[open,current?.links.length])
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){setOpen(null);hover.current=false}}
    document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)
  },[])
  return <>
    <div className="utility-bar"><span className="utility-label">XINOBI <span>· Merkezi yönetim</span></span><span role="status" className="connection-status">{notice}</span></div>
    <header className="panel-header unified-navigation" ref={root} onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();close(true)}}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))close()}} onMouseLeave={()=>{if(hover.current&&!root.current?.contains(document.activeElement))close()}}>
      <button className="panel-brand" aria-label="Xinobi operasyon özeti" onClick={()=>{close();navigate('dashboard')}}>XINOBI<small>YÖNETİM PANELİ</small></button>
      <nav aria-label="Ana modüller" style={{'--nav-count':groups.length} as CSSProperties}>{groups.map(group=>{
        const multiple=group.links.length>1
        return <button key={group.name} data-category={group.name} data-nav-view={multiple?undefined:group.links[0].view} aria-current={activeCategory===group.name?'true':undefined} aria-expanded={multiple?open===group.name:undefined} aria-controls={multiple&&open===group.name?'admin-header-popup':undefined}
          onPointerEnter={event=>{if(event.pointerType==='mouse'&&multiple){trigger.current=event.currentTarget;hover.current=true;setOpen(group.name)}}}
          onClick={event=>{if(multiple)toggle(group.name,event.currentTarget);else{close();navigate(group.links[0].view)}}} onKeyDown={event=>{
            if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
              event.preventDefault();const buttons=Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(':scope>button'));const index=buttons.indexOf(event.currentTarget);close()
              buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length]?.focus()
            }else if((event.key==='ArrowDown'||event.key==='ArrowUp')&&multiple){event.preventDefault();focusMenu(group.name,event.currentTarget,event.key==='ArrowUp')}
          }}>{group.name}{multiple&&<span className="category-chevron" aria-hidden="true">⌄</span>}</button>
      })}</nav>
      <div className="header-tools">{can('notifications.read')&&<button aria-label="Bildirim menüsü" aria-expanded={open==='notifications'} aria-controls={open==='notifications'?'admin-header-popup':undefined} onClick={event=>toggle('notifications',event.currentTarget)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3m5 3h4"/></svg></button>}
        <button className="profile-trigger" aria-label="Profil menüsü" aria-expanded={open==='profile'} aria-controls={open==='profile'?'admin-header-popup':undefined} onClick={event=>toggle('profile',event.currentTarget)}><span className="profile-initial" aria-hidden="true">{name?.trim().slice(0,1).toLocaleUpperCase('tr-TR')||'X'}</span><span>Hoş geldiniz<small>{name||'Yönetici'}</small></span><span aria-hidden="true">⌄</span></button>
      </div>
      {open&&<div ref={popup} id="admin-header-popup" className="module-menu mega-menu" aria-label={current?.name??(open==='profile'?'Profil':'Bildirimler')} onKeyDown={event=>{
        if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return
        const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.navigation-links button'))
        if(!buttons.length)return
        event.preventDefault();const index=buttons.indexOf(document.activeElement as HTMLButtonElement)
        buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length]?.focus()
      }}>
        <div className="mega-heading"><strong>{current?.name??(open==='profile'?'Yönetici profili':'Bildirimler')}</strong><button aria-label="Menüyü kapat" onClick={()=>close(true)}>×</button></div>
        {current?<div className={'navigation-links'+(current.links.length>3?' navigation-links-wide':'')}>{current.links.map(link=><button key={link.view} data-nav-view={link.view} aria-current={view===link.view?'page':undefined} onClick={()=>go(link.view)}>{link.label}</button>)}</div>
          :<div className="profile-content">{open==='profile'?<><strong>{name||'Yönetici oturumu'}</strong><p>Hesap ve rol ayarları üst menüde, işlem geçmişi sol menüdedir.</p></>:<p>Gönderim durumlarını sol menüdeki Bildirim kayıtları sayfasından inceleyebilirsiniz.</p>}</div>}
      </div>}
    </header>
  </>
}
