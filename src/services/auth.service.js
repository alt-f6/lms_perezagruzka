const bcrypt = require('bcrypt');
const userRepo = require('../repos/user.repo');

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const plainPassword = String(password || '');

  if (!normalizedEmail || !plainPassword) {
    const err = new Error('EMAIL_AND_PASSWORD_REQUIRED');
    err.status = 400;
    throw err;
  }

  const user = await userRepo.findByEmail(normalizedEmail);
  if (!user) {
    const err = new Error('INVALID_CREDENTIALS');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(plainPassword, user.password_hash);
  if (!ok) {
    const err = new Error('INVALID_CREDENTIALS');
    err.status = 401;
    throw err;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

async function registerUser({ actorRole, email, password, role = 'student', name = null }) {
  if (actorRole !== 'admin') {
    const err = new Error('FORBIDDEN');
    err.status = 403;
    throw err;
  }

  const normalizedEmail = normalizeEmail(email);
  const plainPassword = String(password || '');

  if (!normalizedEmail || plainPassword.length < 8) {
    const err = new Error('INVALID_INPUT');
    err.status = 400;
    throw err;
  }

  if (role !== 'student' && role !== 'admin') {
    const err = new Error('INVALID_ROLE');
    err.status = 400;
    throw err;
  }

  const existing = await userRepo.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('EMAIL_ALREADY_EXISTS');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

  const created = await userRepo.createUser({
    email: normalizedEmail,
    passwordHash,
    role,
    name,
  });

  return created;
}

async function logout(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  login,
  registerUser,
  logout,
};