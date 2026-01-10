import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireRoleApi } from "@/src/server/auth/require-role-api";
import {
  listStudents,
  listLessons,
  listAssignmentsForStudent,
  grantLesson,
  revokeLesson,
  setAssignmentsForStudent,
} from "@/src/server/repos/assignments.repo";
import { apiError } from "@/src/server/http/api-error";
export const runtime = "nodejs";

async function requireSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");

  if (!origin || !host) return false;

  try {
    const u = new URL(origin);
    return u.host === host;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    await requireRoleApi("admin");

    const url = new URL(req.url);
    const studentIdRaw = url.searchParams.get("studentId");
    const studentId = studentIdRaw === null ? NaN : Number(studentIdRaw);

    const students = await listStudents();
    const lessons = await listLessons();

    if (!Number.isFinite(studentId)) {
      return NextResponse.json({ ok: true, students, lessons, assignedLessonIds: [] });
    }

    const assignedLessonIds = await listAssignmentsForStudent(studentId);
    return NextResponse.json({ ok: true, students, lessons, assignedLessonIds });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireRoleApi("admin");

    if (!(await requireSameOrigin())) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({} as any));
    const studentId = Number((body as any).studentId);
    const lessonId = Number((body as any).lessonId);
    const action = String((body as any).action || "");

    if (!Number.isFinite(studentId) || !Number.isFinite(lessonId)) {
      return NextResponse.json(
        { ok: false, error: "studentId and lessonId required" },
        { status: 400 }
      );
    }

    if (action === "grant") {
      await grantLesson(studentId, lessonId);
      return NextResponse.json({ ok: true });
    }

    if (action === "revoke") {
      await revokeLesson(studentId, lessonId);
      return NextResponse.json({ ok: true });
    }

    const lessonIdsRaw = (body as any).lessonIds;

    if (action === "set") {
      if (!Array.isArray(lessonIdsRaw)) {
        return NextResponse.json({ ok: false, error: "lessonIds must be array" }, { status: 400 });
      }

      const lessonIds = lessonIdsRaw
        .map((x: any) => Number(x))
        .filter((x: number) => Number.isFinite(x) && x > 0);

      await setAssignmentsForStudent(studentId, lessonIds);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "action must be grant or revoke" },
      { status: 400 }
    );
  } catch (e) {
    return apiError(e);
  }
}
