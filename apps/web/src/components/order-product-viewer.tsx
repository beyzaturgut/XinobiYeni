'use client';
import {useEffect,useRef,useState,type PointerEvent,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import styles from './order-product-viewer.module.css';

type Point={x:number;y:number};
type View={scale:number;x:number;y:number};
const initial:View={scale:1,x:0,y:0};
const middle=(points:Point[])=>points.length>1?{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2}:points[0];
const distance=(points:Point[])=>points.length>1?Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y):0;

/** A top-layer, full-screen product viewer, matching Flutter's 1–5x InteractiveViewer. */
export default function OrderProductViewer({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),viewport=useRef<HTMLDivElement>(null);
 const [view,setView]=useState<View>(initial);
 const current=useRef<View>(initial),pointers=useRef(new Map<number,Point>());
 const gesture=useRef<{view:View;points:Point[]}>({view:initial,points:[]});
 function update(next:View){
  const rect=viewport.current?.getBoundingClientRect();
  const scale=Math.min(5,Math.max(1,next.scale));
  const limitX=(rect?.width??0)*(scale-1)/2,limitY=(rect?.height??0)*(scale-1)/2;
  const value={scale,x:Math.max(-limitX,Math.min(limitX,next.x)),y:Math.max(-limitY,Math.min(limitY,next.y))};
  current.current=value;setView(value);
 }
 function rebase(){gesture.current={view:current.current,points:[...pointers.current.values()].slice(0,2)}}
 function point(event:PointerEvent<HTMLDivElement>):Point{
  const rect=event.currentTarget.getBoundingClientRect();return{x:event.clientX-rect.left-rect.width/2,y:event.clientY-rect.top-rect.height/2};
 }
 function down(event:PointerEvent<HTMLDivElement>){
  if(event.pointerType==='mouse'&&event.button!==0)return;
  pointers.current.set(event.pointerId,point(event));
  try{event.currentTarget.setPointerCapture(event.pointerId)}catch{/* A cancelled pointer may already be inactive. */}
  rebase();
 }
 function move(event:PointerEvent<HTMLDivElement>){
  if(!pointers.current.has(event.pointerId))return;
  pointers.current.set(event.pointerId,point(event));
  const points=[...pointers.current.values()].slice(0,2),start=gesture.current;
  if(points.length!==start.points.length||!points.length){rebase();return;}
  const before=middle(start.points),after=middle(points),length=distance(start.points);
  const scale=points.length>1&&length>0?Math.min(5,Math.max(1,start.view.scale*distance(points)/length)):start.view.scale;
  const ratio=scale/start.view.scale;
  update({scale,x:after.x-(before.x-start.view.x)*ratio,y:after.y-(before.y-start.view.y)*ratio});
 }
 function end(event:PointerEvent<HTMLDivElement>){if(pointers.current.delete(event.pointerId))rebase()}
 function zoom(scale:number){update({...current.current,scale});rebase()}
 useEffect(()=>{
  const element=dialog.current;const overflow=document.body.style.overflow;const previousFocus=document.activeElement;
  document.body.style.overflow='hidden';element?.showModal();element?.focus({preventScroll:true});
  return()=>{document.body.style.overflow=overflow;element?.close();if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus({preventScroll:true})};
 },[]);
 return createPortal(<dialog ref={dialog} className={styles.viewer} aria-labelledby="order-preview-title" onClose={onClose} onKeyDown={event=>{
  if(event.key==='+'||event.key==='='){event.preventDefault();zoom(current.current.scale+.5)}
  if(event.key==='-'){event.preventDefault();zoom(current.current.scale-.5)}
  if(event.key==='0'){event.preventDefault();zoom(1)}
 }}>
  <header className={styles.header}><button type="button" className={styles.back} aria-label="Önizlemeyi kapat" onClick={onClose}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h15"/></svg></button><h2 id="order-preview-title">{title}</h2></header>
  <div ref={viewport} className={styles.viewport} data-zoom={view.scale} aria-label="Ürün görseli" onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onDoubleClick={()=>zoom(current.current.scale>1?1:2)}>
   <div className={styles.composition} style={{transform:`translate(${view.x}px, ${view.y}px) scale(${view.scale})`}}>{children}</div>
  </div>
  <footer className={styles.footer}>
   <p>Yakınlaştırmak için iki parmağınla büyüt.</p>
   <div className={styles.controls} aria-label="Yakınlaştırma kontrolleri"><button type="button" aria-label="Uzaklaştır" disabled={view.scale<=1} onClick={()=>zoom(current.current.scale-.5)}>−</button><output aria-live="polite">%{Math.round(view.scale*100)}</output><button type="button" aria-label="Yakınlaştır" disabled={view.scale>=5} onClick={()=>zoom(current.current.scale+.5)}>+</button><button type="button" onClick={()=>zoom(1)}>Sıfırla</button></div>
  </footer>
 </dialog>,document.body);
}
