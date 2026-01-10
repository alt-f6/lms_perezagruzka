import React from "react";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        color: "var(--muted)",
        fontSize: 12,
      }}
    >
      {children}
    </span>
  );
}
