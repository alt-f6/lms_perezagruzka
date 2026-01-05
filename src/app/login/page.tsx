"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            autoComplete="email"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #000",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error ? <p style={{ color: "red" }}>{error}</p> : null}
        <p style={{ opacity: 0.8, fontSize: 14 }}>
          Test: admin@lms.local / admin12345 или student@lms.local / student12345
        </p>
      </form>
    </main>
  );
}
