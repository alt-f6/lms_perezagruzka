"use client";

import Link from "next/link";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="h1">Admin</div>
            <div className="h2">Панель управления</div>
          </div>

          <div className="row">
            <Link className="btn" href="/admin/lessons">Уроки</Link>
            <Link className="btn" href="/admin/students">Ученики</Link>
            <Link className="btn" href="/admin/assignments">Доступы</Link>
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
