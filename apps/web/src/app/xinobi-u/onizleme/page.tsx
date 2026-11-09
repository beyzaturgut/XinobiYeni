import {Suspense} from 'react';
import StudioHeader from '../studio-header';
import ProductPreview from './product-preview';
export default function Page() { return <><StudioHeader /><Suspense fallback={<p role="status">Tasarım yükleniyor…</p>}><ProductPreview /></Suspense></>; }
