"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/src/components/LogoutButton";

type Item = { href: string; label: string };

function NavLink({ href, label }: Item) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        textDecoration: "none",
        border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid transparent",
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}

export function TopNav({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <nav style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {items.map((x) => (
            <NavLink key={x.href} href={x.href} label={x.label} />
          ))}
        </nav>
      </div>

      <LogoutButton
        className="px-3 py-2 rounded-md border"
        redirectTo="/login"
      />
    </header>
  );
}
