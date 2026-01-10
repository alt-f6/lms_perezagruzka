import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieName, verify, getUserBySession } from "@/src/server/auth/session";

export async function requireRolePage(role: "admin" | "student") {
  const jar = await cookies();
  const raw = jar.get(cookieName())?.value;
  if (!raw) redirect("/login");

  const token = verify(raw);
  if (!token) redirect("/login");

  const user = await getUserBySession(token);
  if (!user) redirect("/login");

  if (user.role !== role) redirect("/login");

  return user;
}
