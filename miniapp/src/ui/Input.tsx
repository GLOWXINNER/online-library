import React from "react";
import styles from "./Input.module.css";

export function InputField({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <input className={styles.input} {...props} />
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <textarea className={styles.textarea} {...props} />
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}
