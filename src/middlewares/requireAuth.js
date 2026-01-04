function requireAuth(req, res, next) {
  if (req.session && req.session.user_id) return next();

  const nextUrl = encodeURIComponent(req.originalUrl || "/");
  return res.redirect(`/login?next=${nextUrl}`);
}

module.exports = { requireAuth };
