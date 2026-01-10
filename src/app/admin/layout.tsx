import React from "react";
import { requireRolePage } from "@/src/server/auth/require-role-page";
import { TopNav } from "@/src/components/TopNav";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRolePage("admin");

  return (
    <div style={{ minHeight: "100vh" }}>
      <TopNav
        title="Admin"
        items={[
          { href: "/admin/lessons", label: "Уроки" },
          { href: "/admin/students", label: "Ученики" },
          { href: "/admin/assignments", label: "Назначения" },
        ]}
      />
      <main style={{ padding: 20 }}>{children}</main>
    </div>
  );
}
