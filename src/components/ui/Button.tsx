"use client";

import React from "react";

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
  const { variant = "primary", style, ...rest } = props;

  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    cursor: "pointer",
    background: variant === "primary" ? "rgba(255,255,255,0.10)" : "transparent",
    color: "var(--text)",
  };

  return <button {...rest} style={{ ...base, ...style }} />;
}
