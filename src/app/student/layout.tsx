import React from "react";
import { requireRolePage } from "@/src/server/auth/require-role-page";
import { TopNav } from "@/src/components/TopNav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRolePage("student");

  return (
    <div style={{ minHeight: "100vh" }}>
      <TopNav
        title="Student"
        items={[
          { href: "/student/lessons", label: "Уроки" },
        ]}
      />
      <main style={{ padding: 20 }}>{children}</main>
    </div>
  );
}
