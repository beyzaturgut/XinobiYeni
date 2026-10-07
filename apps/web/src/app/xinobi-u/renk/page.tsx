'use client';
import {Suspense, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';

// The colour step was removed (the pattern covers the body); old links go straight to the questions.
function Redirect(){
  const router=useRouter();const product=useSearchParams().get('product');
  useEffect(()=>{router.replace(product?`/xinobi-u/sorular?product=${encodeURIComponent(product)}`:'/xinobi-u')},[router,product]);
  return <p role="status">Sorulara yönlendiriliyorsun…</p>;
}
export default function Page(){return <Suspense fallback={null}><Redirect/></Suspense>}
