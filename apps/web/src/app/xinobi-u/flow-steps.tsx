import Link from 'next/link';
import styles from './flow.module.css';

const steps = ['Ürün', 'Yöntem', 'Yükleme', 'Önizleme'];

/** Back link and the four-step indicator of the XINOBI U own-design flow; [current] is the zero-based active step. */
export default function FlowSteps({ current, backHref, backLabel, onBack, hideBack = false }: { current: number; backHref: string; backLabel: string; onBack?: () => void; hideBack?: boolean }) {
  return <div className={styles.top}>
    {!hideBack && <Link className={styles.back} href={backHref} onClick={onBack ? event => { event.preventDefault(); onBack(); } : undefined}><span aria-hidden="true">←</span> {backLabel}</Link>}
    <ol className={styles.steps} aria-label="Kişiselleştirme adımları">{steps.map((label, index) => <li key={label} aria-current={index === current ? 'step' : undefined} className={index < current ? styles.stepDone : index === current ? styles.stepCurrent : undefined}>
      <span aria-hidden="true">{index < current ? <svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" /></svg> : index + 1}</span>{label}{index < current && <span className={styles.srOnly}> (tamamlandı)</span>}
    </li>)}</ol>
  </div>;
}
