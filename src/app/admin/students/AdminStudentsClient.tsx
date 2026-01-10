"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Student = {
  id: number;
  email: string;
  role: "student";
  first_name: string;
  last_name: string;
};

export default function AdminStudentsClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyResetId, setBusyResetId] = useState<number | null>(null);


  async function load() {
    const r = await fetch("/api/admin/students", { cache: "no-store" });
    const j = await r.json();
    if (j.ok) setStudents(j.students ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const canCreate = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      !busy
    );
  }, [firstName, lastName, email, password, busy]);

  async function createStudent() {
    if (!canCreate) return;

    setBusy(true);
    try {
      const r = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });
      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j.ok) {
        const msg =
          j?.error === "email_exists"
            ? "Email уже существует"
            : j?.error === "weak_password"
            ? "Пароль минимум 8 символов"
            : j?.error === "bad_email"
            ? "Некорректный email"
            : j?.error === "bad_name"
            ? "Имя и фамилия обязательны"
            : "Ошибка создания";
        alert(msg);
        return;
      }

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteStudent(id: number, label: string) {
    const ok = confirm(`Удалить ученика ${label}? Это действие необратимо.`);
    if (!ok) return;

    setBusy(true);
    try {
      const r = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        alert("Не удалось удалить. Возможно, у ученика есть связанные данные (доступы/задания).");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

    async function resetPassword(studentId: number, label: string) {
      const p1 = window.prompt(`Задать новый пароль для: ${label}\n\nМинимум 8 символов.`);
      if (!p1) return;

      if (p1.length < 8) {
        alert("Пароль минимум 8 символов");
        return;
      }

      const p2 = window.prompt("Повторите новый пароль");
      if (p2 !== p1) {
        alert("Пароли не совпадают");
        return;
      }

      const ok = confirm("Сохранить новый пароль? Все активные сессии ученика будут сброшены.");
      if (!ok) return;

      setBusyResetId(studentId);
      try {
        const r = await fetch(`/api/admin/students/${studentId}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: p1, confirmPassword: p2 }),
        });

        const j = await r.json().catch(() => ({}));

        if (!r.ok || !j.ok) {
          const msg =
            j?.error === "password_too_short"
              ? "Пароль минимум 8 символов"
              : j?.error === "password_mismatch"
              ? "Пароли не совпадают"
              : j?.error === "not_found"
              ? "Ученик не найден"
              : "Ошибка смены пароля";
          alert(msg);
          return;
        }

        alert("Пароль обновлён. Все активные сессии ученика сброшены.");
      } finally {
        setBusyResetId(null);
      }
    }

  return (
    <main style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Ученики</h1>
          <div style={s.sub}>Клик по ученику откроет страницу доступов.</div>
        </div>
      </div>

      <div style={s.grid}>
        {/* Создание */}
        <section style={s.card}>
          <div style={s.cardTitle}>Создать аккаунт ученика</div>

          <div style={s.formGrid}>
            <div style={s.field}>
              <div style={s.label}>Имя</div>
              <input
                style={s.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Иван"
                autoComplete="off"
              />
            </div>

            <div style={s.field}>
              <div style={s.label}>Фамилия</div>
              <input
                style={s.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Иванов"
                autoComplete="off"
              />
            </div>

            <div style={s.fieldFull}>
              <div style={s.label}>Email</div>
              <input
                style={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                autoComplete="off"
              />
            </div>

            <div style={s.fieldFull}>
              <div style={s.label}>Временный пароль</div>
              <input
                style={s.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="минимум 8 символов"
                autoComplete="new-password"
              />
            </div>

            <button style={canCreate ? s.btn : s.btnDisabled} onClick={createStudent} disabled={!canCreate}>
              {busy ? "Создаю..." : "Создать ученика"}
            </button>

            <div style={s.hint}>
              Пароль сообщи ученику. Потом можно добавить смену пароля.
            </div>
          </div>
        </section>

        <section style={s.card}>
          <div style={s.cardTitleRow}>
            <div style={s.cardTitle}>Список</div>
            <button style={s.btnGhost} onClick={load} disabled={busy}>Обновить</button>
          </div>

          {students.length === 0 ? (
            <div style={s.empty}>Пока пусто</div>
          ) : (
            <div style={s.list}>
              {students.map((st) => {
                const full = `${st.first_name} ${st.last_name}`.trim();
                return (
                  <div key={st.id} style={s.row}>
                    <Link href={`/admin/assignments?studentId=${st.id}`} style={s.rowMain}>
                      <div style={s.badge}>#{st.id}</div>
                      <div style={s.name}>{full || "Без имени"}</div>
                      <div style={s.email}>{st.email}</div>
                    </Link>

                    <button
                      style={s.btnDanger}
                      onClick={() => deleteStudent(st.id, full || st.email)}
                      disabled={busy}
                    >
                      Удалить
                    </button>
                    <button
                      onClick={() => resetPassword(st.id, full || st.email)}
                      disabled={busyResetId === st.id}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.16)",
                        background: "rgba(255,255,255,0.03)",
                        color: "inherit",
                        cursor: busyResetId === st.id ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        fontWeight: 800,
                      }}
                    >
                      {busyResetId === st.id ? "Сохраняю..." : "Задать пароль"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 16 },
  h1: { margin: 0, fontSize: 32, fontWeight: 900 },
  sub: { marginTop: 6, opacity: 0.75 },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" },

  card: { border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16 },
  cardTitle: { fontWeight: 900, marginBottom: 10 },
  cardTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },

  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldFull: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, opacity: 0.75, fontWeight: 800 },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.18)",
    color: "inherit",
    outline: "none",
  },

  btn: {
    gridColumn: "1 / -1",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.20)",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnDisabled: {
    gridColumn: "1 / -1",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
    opacity: 0.5,
    fontWeight: 900,
    cursor: "not-allowed",
  },
  btnGhost: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,120,120,0.25)",
    background: "rgba(255,0,0,0.10)",
    color: "inherit",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  hint: { gridColumn: "1 / -1", opacity: 0.65, fontSize: 12, lineHeight: 1.4 },

  list: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.12)",
  },
  rowMain: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit", minWidth: 0, flex: 1 },
  badge: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    fontSize: 12,
    opacity: 0.9,
    whiteSpace: "nowrap",
  },
  name: { fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  email: { opacity: 0.7, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  empty: { opacity: 0.7 },
};
