import type { ReactNode } from "react";
import { requireRole } from "@/src/server/auth/require-role";
import AdminShell from "@/src/components/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
