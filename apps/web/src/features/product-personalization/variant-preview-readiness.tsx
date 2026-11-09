"use client";
import {useProductSurface} from './single-source';
export const previewUnavailableMessage='Bu ürünün onaylı kişiselleştirme yüzeyi henüz hazır değil.';
export type PreviewReadinessStatus='loading'|'ready'|'unavailable'|'error';
export function usePreviewReadiness(product:string,_variant='',retryToken=0):PreviewReadinessStatus{void _variant;return useProductSurface(product,retryToken).status}
export function PreviewReadinessMessage({product,status}:{product:string;variant?:string;color?:string;status:PreviewReadinessStatus}){
 return <p role="status" data-preview-readiness={status} data-product-reference={product}>{status==='loading'?'Ürünün kişiselleştirme yüzeyi kontrol ediliyor…':status==='ready'?'Ürünün kişiselleştirme önizlemesi hazır.':status==='error'?'Ürün yüzeyi şu anda doğrulanamıyor. Tekrar deneyin.':previewUnavailableMessage}</p>;
}
export default function VariantPreviewReadiness(props:{product:string;variant:string;color:string}){return <PreviewReadinessMessage {...props} status={usePreviewReadiness(props.product)}/>}
