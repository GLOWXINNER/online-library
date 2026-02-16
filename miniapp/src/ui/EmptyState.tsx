import styles from "./EmptyState.module.css";

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.box}>
      <div className={styles.title}>{title}</div>
      <div className={styles.text}>{text}</div>
    </div>
  );
}
