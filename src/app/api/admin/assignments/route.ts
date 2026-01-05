import { NextResponse } from "next/server";
import { requireRole } from "@/src/server/auth/require-role";
import {
  listStudents,
  listLessons,
  listAssignmentsForStudent,
  grantLesson,
  revokeLesson,
} from "@/src/server/repos/assignments.repo";

export async function GET(req: Request) {
  await requireRole("admin");

  const url = new URL(req.url);
  const studentId = Number(url.searchParams.get("studentId") || "");

  const students = await listStudents();
  const lessons = await listLessons();

  if (!Number.isFinite(studentId)) {
    return NextResponse.json({ ok: true, students, lessons, assignedLessonIds: [] });
  }

  const assignedLessonIds = await listAssignmentsForStudent(studentId);
  return NextResponse.json({ ok: true, students, lessons, assignedLessonIds });
}

export async function POST(req: Request) {
  await requireRole("admin");

  const body = await req.json();
  const studentId = Number(body.studentId);
  const lessonId = Number(body.lessonId);
  const action = String(body.action || "");

  if (!Number.isFinite(studentId) || !Number.isFinite(lessonId)) {
    return NextResponse.json({ ok: false, error: "studentId and lessonId required" }, { status: 400 });
  }

  if (action === "grant") {
    await grantLesson(studentId, lessonId);
    return NextResponse.json({ ok: true });
  }

  if (action === "revoke") {
    await revokeLesson(studentId, lessonId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "action must be grant or revoke" }, { status: 400 });
}
