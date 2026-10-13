import Link from "next/link";
import styles from "./studio.module.css";
export default function PersonalizationStudio() {
  return <section className={styles.actionPanel}><p role="status">Bu örnek ürün artık katalogda yer almıyor.</p><Link href="/xinobi-u">Güncel ürünlerden birini seç →</Link></section>;
}
