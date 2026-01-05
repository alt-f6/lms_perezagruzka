import crypto from "crypto";
import { pool } from "@/src/server/db/pool";

const COOKIE_NAME = process.env.COOKIE_NAME || "lms_session";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "";
const TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || "168");

function mustSecret() {
  if (!COOKIE_SECRET || COOKIE_SECRET.length < 32) {
    throw new Error("COOKIE_SECRET missing or too short (min 32 chars)");
  }
}

export function cookieName() {
  return COOKIE_NAME;
}

export function sign(token: string) {
  mustSecret();
  const sig = crypto.createHmac("sha256", COOKIE_SECRET).update(token).digest("hex");
  return `${token}.${sig}`;
}

export function verify(signed: string) {
  mustSecret();
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [token, sig] = parts;
  const expected = crypto.createHmac("sha256", COOKIE_SECRET).update(token).digest("hex");
  if (sig !== expected) return null;
  return token;
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);

  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1,$2,$3)",
    [token, userId, expiresAt]
  );

  return { token, expiresAt };
}

export async function getUserBySession(token: string) {
  const r = await pool.query(
    `SELECT u.id, u.email, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()
     LIMIT 1`,
    [token]
  );
  return r.rows[0] ?? null;
}

export async function deleteSession(token: string) {
  await pool.query("DELETE FROM sessions WHERE token=$1", [token]);
}
