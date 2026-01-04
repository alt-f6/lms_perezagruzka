const db = require("../db");

function normalizeLimit(value, fallback = 20) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(100, Math.floor(n)));
}

function normalizePage(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

async function listUsers({ q, page, limit }) {
  const safeLimit = normalizeLimit(limit, 20);
  const safePage = normalizePage(page, 1);
  const offset = (safePage - 1) * safeLimit;

  const search = String(q || "").trim().toLowerCase();
  const hasSearch = search.length > 0;

  const whereSql = hasSearch ? `where lower(u.email) like $1` : ``;
  const paramsForWhere = hasSearch ? [`%${search}%`] : [];

  const countSql = `
    select count(*)::int as total
    from users u
    ${whereSql}
  `;

  const listSql = `
    select u.id, u.email, u.role, u.name, u.created_at
    from users u
    ${whereSql}
    order by u.created_at desc
    limit $${paramsForWhere.length + 1}
    offset $${paramsForWhere.length + 2}
  `;

  const countRes = await db.query(countSql, paramsForWhere);
  const total = countRes.rows[0]?.total || 0;

  const listParams = [...paramsForWhere, safeLimit, offset];
  const listRes = await db.query(listSql, listParams);

  return {
    total,
    page: safePage,
    limit: safeLimit,
    rows: listRes.rows,
  };
}

async function createStudent({ email, name, passwordHash }) {
  const sql = `
    insert into users (email, name, role, password_hash)
    values ($1, $2, 'student', $3)
    returning id, email, role, name, created_at
  `;
  const res = await db.query(sql, [email, name, passwordHash]);
  return res.rows[0];
}

module.exports = {
  listUsers,
  createStudent,
};
