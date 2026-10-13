import Link from "next/link";

// The former demo product URL remains available for old bookmarks.
export default function ProductExperience() {
  return <section><p role="status">Bu örnek ürün artık katalogda yer almıyor.</p><Link href="/urunler">Güncel ürünleri incele →</Link></section>;
}
