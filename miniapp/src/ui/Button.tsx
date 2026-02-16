import React from "react";
import styles from "./Button.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "sm";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        size === "sm" && styles.small,
        disabled && styles.disabled,
        className ?? "",
      ].filter(Boolean).join(" ")}
      disabled={disabled}
      {...rest}
    />
  );
}
