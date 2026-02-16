import styles from "./Spinner.module.css";

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <span className={styles.wrap}>
      <span className={styles.dot} />
      <span>{label}</span>
    </span>
  );
}
