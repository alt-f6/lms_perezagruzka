import { requireRolePage } from "@/src/server/auth/require-role-page";
import AdminStudentsClient from "./AdminStudentsClient";

export default async function AdminStudentsPage() {
  await requireRolePage("admin");
  return <AdminStudentsClient />;
}
