require('dotenv').config();
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const db = require('../db');

function sessionMiddleware() {
  const ttlSeconds = Number(process.env.SESSION_TTL_SECONDS || 1209600);

  return session({
    store: new PgSession({
      pool: db.pool,
      tableName: 'session',
      createTableIfMissing: false,
      ttl: ttlSeconds,
      pruneSessionInterval: 60,
    }),
    name: process.env.SESSION_NAME || 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAMESITE || 'lax',
      maxAge: ttlSeconds * 1000,
    },
  });
}

module.exports = { sessionMiddleware };
