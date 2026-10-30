import type {ComponentProps} from 'react'
/** Keep the native modal/backdrop and each module's close/dirty-state behavior. */
export default function AdminDialog({onKeyDown,...props}:ComponentProps<'dialog'>){
 return <dialog {...props} onKeyDown={event=>{
  onKeyDown?.(event)
  if(event.defaultPrevented||event.key!=='Tab')return
  const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex]')].filter(element=>element.tabIndex>=0&&!element.matches(':disabled')&&element.getClientRects().length>0)
  const first=controls[0],last=controls.at(-1)
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
 }}/>
}
