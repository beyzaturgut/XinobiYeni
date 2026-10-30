import {useId,type ReactNode} from 'react'
/** Tables keep their own scroll area; keyboard users can pan without moving the whole page. */
export default function TableRegion({children,className=''}:{children:ReactNode;className?:string}){
 const label=useId()
 return <div className={`table-scroll ${className}`} role="region" aria-labelledby={label} tabIndex={0}><span id={label} className="admin-sr-only">Kaydırılabilir veri tablosu</span>{children}</div>
}
