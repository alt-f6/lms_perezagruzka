import type { ReactNode } from "react";
import { requireRole } from "@/src/server/auth/require-role";
import StudentShell from "@/src/components/StudentShell";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole("student");

  return (
    <StudentShell>
      {children}
    </StudentShell>
  );
}
