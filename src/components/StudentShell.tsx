"use client";

import Link from "next/link";

export default function StudentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="h1">Student</div>
            <div className="h2">Личный кабинет</div>
          </div>

          <div className="row">
            <Link className="btn" href="/student">Дашборд</Link>
            <Link className="btn" href="/student/lessons">Уроки</Link>
            <Link className="btn" href="/">Главная</Link>
          </div>
        </div>

        <div className="space" />
        <hr />
        {children}
      </div>
    </div>
  );
}
