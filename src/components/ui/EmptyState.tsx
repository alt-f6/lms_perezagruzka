import React from "react";
import { Card } from "./Card";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      {description ? <div style={{ color: "var(--muted)" }}>{description}</div> : null}
    </Card>
  );
}
