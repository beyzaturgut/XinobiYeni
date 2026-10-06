import { Suspense } from 'react';
import ProductDetail from './product-detail';
export default function Page() { return <Suspense fallback={<p>Ürün yükleniyor…</p>}><ProductDetail /></Suspense>; }
