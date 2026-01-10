import { requireRolePage } from "@/src/server/auth/require-role-page";
import AdminLessonEditClient from "./ui";

type Props = { params: { id: string } | Promise<{ id: string }> };

export default async function AdminLessonEditPage(props: Props) {
  await requireRolePage("admin");

  const p = await Promise.resolve(props.params);
  const lessonId = Number(p.id);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return (
      <div style={{ padding: 24 }}>
        <a href="/admin/lessons" style={{ textDecoration: "underline" }}>← Назад к урокам</a>
        <div style={{ marginTop: 12, fontWeight: 900 }}>Некорректный ID урока</div>
      </div>
    );
  }

  return <AdminLessonEditClient lessonId={lessonId} />;
}
