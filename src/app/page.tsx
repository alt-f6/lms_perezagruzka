import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container">
      <div className="card">
        <div className="h1">LMS работает</div>
        <div className="h2">Минимальный MVP</div>

        <div className="space" />

        <div className="row">
          <Link className="btn" href="/login">Войти</Link>
          <Link className="btn" href="/admin">Admin</Link>
          <Link className="btn" href="/student">Student</Link>
        </div>

        <div className="space" />
        <div className="small">
          Сейчас: Postgres, роли, assignments, уроки, открытие урока.
        </div>
      </div>
    </div>
  );
}
