import { requireRolePage } from "@/src/server/auth/require-role-page";
import AdminAssignmentsClient from "./ui";

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  await requireRolePage("admin");

  const sp = await searchParams;
  const initialStudentIdRaw = sp?.studentId ? Number(sp.studentId) : NaN;
  const initialStudentId =
    Number.isFinite(initialStudentIdRaw) && initialStudentIdRaw > 0
      ? initialStudentIdRaw
      : null;

  return <AdminAssignmentsClient initialStudentId={initialStudentId} />;
}
