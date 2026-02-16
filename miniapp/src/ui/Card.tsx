import React from "react";
import styles from "./Card.module.css";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={[styles.card, className ?? ""].join(" ")}>{children}</div>;
}

export function CardPad({ children }: { children: React.ReactNode }) {
  return <div className={styles.pad}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.sub}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
