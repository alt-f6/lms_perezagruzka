function redirectIfAuth(req, res, next) {
  if (req.session && req.session.user_id) return res.redirect("/dashboard");
  next();
}

module.exports = { redirectIfAuth };
