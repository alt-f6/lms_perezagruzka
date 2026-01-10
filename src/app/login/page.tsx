"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@lms.local");
  const [password, setPassword] = useState("admin12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await r.json();
      if (!r.ok || !data?.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      const me = await fetch("/api/auth/me").then((x) => x.json());
      const role = me?.user?.role;

      if (role === "admin") router.push("/admin");
      else if (role === "student") router.push("/student");
      else router.push("/");
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="badge">Перезагрузка</div>

        <div className="h1">Вход</div>
        <div className="h2">Введите почту и пароль</div>

        <div className="space" />

        <form onSubmit={onSubmit} className="form">
          <label>
            <span className="label">Email</span>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <label>
            <span className="label">Password</span>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </button>

          {error ? <div className="error">{error}</div> : null}

          <div style={{ marginTop: 10 }}>
            <Link href="/" className="linkMuted">
              На главную
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
