"use client";

import Link from "next/link";

export default function StudentDashboard() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Student</h1>
      <p>Личный кабинет ученика</p>
      <p>
        <Link href="/student/lessons">Перейти к урокам</Link>
      </p>
    </main>
  );
}
