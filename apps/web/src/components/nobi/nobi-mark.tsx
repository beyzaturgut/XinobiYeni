import styles from './nobi.module.css';

/** Nobi's face: the assistant's mark on the launcher and in the chat header. */
export default function NobiMark({ compact = false }: { compact?: boolean }) {
  return <svg className={compact ? styles.panelMark : styles.mark} viewBox="0 0 112 108" aria-hidden="true"><path className={styles.antenna} d="M56 22V35" /><circle className={styles.antennaTip} cx="56" cy="14" r="10" /><rect className={styles.shell} x="13" y="31" width="86" height="68" rx="31" /><rect className={styles.face} x="25" y="48" width="62" height="40" rx="17" /><path className={styles.smile} d="M35 68c0-7 4-11 9-11 8 0 7 15 15 15s7-15 15-15c5 0 9 4 9 11" /></svg>;
}
