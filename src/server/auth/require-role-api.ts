import { getSessionUser } from "@/src/server/auth/session";

export type AuthedUser = {
  id: number;
  email: string;
  role: "admin" | "student";
  token: string;
};

export async function requireRoleApi(role: "admin" | "student"): Promise<AuthedUser> {
  const user = await getSessionUser();

  if (!user) {
    const err = new Error("unauthorized");
    (err as any).status = 401;
    throw err;
  }

  if (user.role !== role) {
    const err = new Error("forbidden");
    (err as any).status = 403;
    throw err;
  }

  return user as AuthedUser;
}
