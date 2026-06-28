import type { ReactNode } from "react";

type Variant = "default" | "accent" | "outline";

const styles: Record<Variant, string> = {
  default: "bg-surface-2 text-muted border border-border",
  accent: "bg-accent-soft text-accent border border-accent/30",
  outline: "bg-transparent text-muted border border-border",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
