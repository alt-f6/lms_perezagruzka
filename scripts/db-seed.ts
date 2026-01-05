import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";

async function main() {
  const { pool } = await import("../src/server/db/pool");

  await pool.query("TRUNCATE assignments, sessions, lessons, users RESTART IDENTITY CASCADE");

  const adminHash = await bcrypt.hash("admin12345", 12);
  const studentHash = await bcrypt.hash("student12345", 12);

  const admin = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'admin') RETURNING id",
    ["admin@lms.local", adminHash]
  );

  const student = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'student') RETURNING id",
    ["student@lms.local", studentHash]
  );

  const l1 = await pool.query(
    `INSERT INTO lessons (title, description, content, is_published, "order")
     VALUES ($1,$2,$3,true,1) RETURNING id`,
    ["Intro", "Welcome lesson", "Hello"]
  );

  await pool.query(
    `INSERT INTO lessons (title, description, content, is_published, "order")
     VALUES ($1,$2,$3,true,2) RETURNING id`,
    ["Lesson 2", "Second lesson", "Content 2"]
  );

  await pool.query(
    "INSERT INTO assignments (student_id, lesson_id) VALUES ($1,$2)",
    [student.rows[0].id, l1.rows[0].id]
  );

  console.log("Seed done");
  console.log("Admin: admin@lms.local / admin12345");
  console.log("Student: student@lms.local / student12345");

  await pool.end();
}

main().catch((e) => {
  console.error("SEED FAILED:", e?.message ?? e);
  process.exit(1);
});
