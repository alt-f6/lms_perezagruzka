import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container">
      <div className="card">
        <div className="badge">Перезагрузка</div>

        <div className="h1">Образовательная платформа</div>
        <div className="h2">Уроки, материалы и прогресс в одном месте</div>

        <div className="space" />

        <div className="row">
          <Link className="btn primary" href="/login">
            Войти
          </Link>
        </div>

        <div className="space" />

        <div className="small">
          Почта и пароль выдается администратором
        </div>
      </div>
    </div>
  );
}
