const db = require('../db');

async function findByEmail(email) {
  const { rows } = await db.query(
    `select id, email, password_hash, role, name, created_at
     from users
     where email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(
    `select id, email, password_hash, role, name, created_at
     from users
     where id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser({ email, passwordHash, role = 'student', name = null }) {
  const { rows } = await db.query(
    `insert into users (email, password_hash, role, name)
     values ($1, $2, $3, $4)
     returning id, email, role, name, created_at`,
    [email, passwordHash, role, name]
  );
  return rows[0];
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};