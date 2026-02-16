import styles from "./Alert.module.css";

export function Alert({
  type = "info",
  children,
}: {
  type?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  return <div className={`${styles.alert} ${styles[type]}`}>{children}</div>;
}
