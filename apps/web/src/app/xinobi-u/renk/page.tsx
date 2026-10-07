import {Suspense} from 'react';
import SiteHeader from '../../../components/site-header';
import ColorSelection from './color-selection';
export default function Page(){return <><SiteHeader/><Suspense fallback={<p>Ürün yükleniyor…</p>}><ColorSelection/></Suspense></>}
