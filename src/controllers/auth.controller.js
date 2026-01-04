const authService = require('../services/auth.service');

function getLoginPage(req, res) {
  const nextUrl = req.query.next || '';
  res.render('auth/login', { error: null, nextUrl });
}

async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await authService.login({ email, password });

    req.session.user_id = user.id;
    req.session.role = user.role;

    const nextUrl = req.body.next || req.query.next || '';
    if (nextUrl) return res.redirect(nextUrl);

    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    return res.redirect('/student/dashboard');
  } catch (err) {
    if (req.accepts('html')) {
      const message = err.message === 'INVALID_CREDENTIALS'
        ? 'Wrong email or password'
        : 'Login failed';
      const nextUrl = req.body.next || req.query.next || '';
      return res.status(err.status || 400).render('auth/login', { error: message, nextUrl });
    }
    next(err);
  }
}

async function postLogout(req, res, next) {
  try {
    await authService.logout(req);
    res.clearCookie(process.env.SESSION_NAME || 'sid');
    res.redirect('/login');
  } catch (err) {
    next(err);
  }
}

async function postRegister(req, res, next) {
  try {
    const actorRole = req.session.role;
    const { email, password, role, name } = req.body;

    const created = await authService.registerUser({
      actorRole,
      email,
      password,
      role,
      name,
    });

    res.status(201).json({ user: created });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLoginPage,
  postLogin,
  postLogout,
  postRegister,
};