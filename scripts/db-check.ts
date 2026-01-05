import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { pool } = await import("../src/server/db/pool");

  const r = await pool.query("SELECT 1 as ok");
  console.log("DB OK:", r.rows?.[0]?.ok === 1);

  await pool.end();
}

main().catch((e) => {
  console.error("DB CHECK FAILED:", e?.message ?? e);
  process.exit(1);
});
