function requireRole(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.user_id) {
      const nextUrl = encodeURIComponent(req.originalUrl || "/");
      return res.redirect(`/login?next=${nextUrl}`);
    }

    if (req.session.role !== role) {
      return res.status(403).send("Forbidden");
    }

    next();
  };
}

module.exports = { requireRole };
